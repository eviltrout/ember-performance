/* global require, module */
var pickFiles = require('broccoli-static-compiler'),
    mergeTrees = require('broccoli-merge-trees'),
    concat = require('broccoli-concat'),
    findBowerTrees = require('broccoli-bower'),
    compileSass = require('broccoli-sass'),
    uglifyJavaScript = require('broccoli-uglify-js'),
    cleanCSS = require('broccoli-clean-css'),
    copyIndex = require('./lib/copy-index'),
    env = require('broccoli-env').getEnv();


var appAndDependencies = pickFiles('app', {
  srcDir: '/',
  destDir: '/',
  files: ['*.html'],
});

appAndDependencies = mergeTrees([appAndDependencies, 'tests']);

var clientTree = mergeTrees(['test-client', mergeTrees(findBowerTrees())]);
var testClient = concat(clientTree, {
  inputFiles: ['test-client.js', 'benchmark.js', 'people.js'],
  outputFile: '/assets/test-client.js'
});

var testTree = copyIndex('tests', { extensions: ['js'] });

var vendorJs = concat(mergeTrees(findBowerTrees()), {
  inputFiles: ['jquery.js'],
  outputFile: '/assets/vendor.js'
});

var appCss = compileSass(['app/styles'], 'app.scss', 'assets/app.css');

var vendorCss = concat(mergeTrees(findBowerTrees()), {
  inputFiles: ['bootstrap.css'],
  outputFile: '/assets/vendor.css'
});

if (env === 'production') {
  vendorJs = uglifyJavaScript(vendorJs);
  testClient = uglifyJavaScript(testClient);
  vendorCss = cleanCSS(vendorCss);
  appCss = cleanCSS(appCss);
}

module.exports = mergeTrees([appAndDependencies, appCss, vendorJs, vendorCss, testClient, testTree]);
