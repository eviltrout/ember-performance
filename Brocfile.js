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

var emberTree = pickFiles('ember', {
  srcDir: '/',
  destDir: '/ember',
  files: ['*.js'],
});

appAndDependencies = mergeTrees([appAndDependencies, 'tests']);

var clientTree = mergeTrees(['test-client', mergeTrees(findBowerTrees())]);
var testClient = concat(clientTree, {
  inputFiles: ['test-client.js', 'test-session.js', 'head.min.js', 'benchmark.js', 'rsvp.js', 'people.js'],
  outputFile: '/assets/test-client.js'
});

var testTree = copyIndex('tests', { extensions: ['js'] });

var vendorJs = concat(mergeTrees(findBowerTrees()), {
  inputFiles: ['jquery.js'],
  outputFile: '/assets/vendor.js'
});

var appJs = concat(mergeTrees(['app', 'ember', 'test-client', mergeTrees(findBowerTrees())]), {
  inputFiles: ['jquery-2.1.1.min.js', 'handlebars-v1.3.0.js', '1.8.1.js', 'ascii-table.js', 'app.js', 'test-session.js'],
  outputFile: '/assets/app.js'
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

module.exports = mergeTrees([appAndDependencies, appJs, appCss, vendorJs, vendorCss, testClient, testTree, emberTree]);
