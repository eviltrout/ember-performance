/* global require, module */
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var concat = require('broccoli-concat');
var findBowerTrees = require('broccoli-bower');
var compileSass = require('broccoli-sass');
var uglifyJavaScript = require('broccoli-uglify-js');
var cleanCSS = require('broccoli-clean-css');
var copyIndex = require('./lib/copy-index');
var env = require('broccoli-env').getEnv();
var stew = require('broccoli-stew');
var find = stew.find;
var rename = stew.rename;
var env = stew.env;

var appAndDependencies = rename(find('app/*.html'), 'app/', '');
var emberTree = find('ember/**/*.js');

appAndDependencies = mergeTrees([
  appAndDependencies,
  'tests'
]);

var clientTree = mergeTrees([
  'test-client', mergeTrees(findBowerTrees())
]);

var testClient = concat(clientTree, {
  inputFiles: [
    'test-client.js',
    'test-session.js',
    'head.min.js',
    'benchmark.js',
    'rsvp.js',
    'people.js'
  ],
  outputFile: '/assets/test-client.js'
});

var testTree = copyIndex('tests', { extensions: ['js'] });

var vendorJs = concat(mergeTrees(findBowerTrees()), {
  inputFiles: ['jquery.js', 'numeral.js'],
  outputFile: '/assets/vendor.js'
});

var appJs = concat(mergeTrees([
  'app',
  'ember',
  'test-client',
  mergeTrees(findBowerTrees())]), {
    inputFiles: [
      'jquery-2.1.1.min.js',
      'handlebars-v1.3.0.js',
      'ember-1.8.1.prod.js',
      'ascii-table.js',
      'app.js',
      'test-session.js'
    ],
    outputFile: '/assets/app.js'
});

var appCss = compileSass(['app/styles'], 'app.scss', 'assets/app.css');

var vendorCss = concat(mergeTrees(findBowerTrees()), {
  inputFiles: ['bootstrap.css'],
  outputFile: '/assets/vendor.css'
});

env('production', function() {
  vendorJs = uglifyJavaScript(vendorJs);
  testClient = uglifyJavaScript(testClient);
  vendorCss = cleanCSS(vendorCss);
  appCss = cleanCSS(appCss);
});

module.exports = mergeTrees([
  appAndDependencies,
  appJs,
  appCss,
  vendorJs,
  vendorCss,
  testClient,
  testTree,
  emberTree
]);
