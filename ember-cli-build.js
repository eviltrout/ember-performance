/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var find = require('broccoli-stew').find;
var mergeTrees = require('broccoli-merge-trees');
var concat = require('broccoli-concat');
var findBowerTrees = require('broccoli-bower');
var copyIndex = require('./lib/copy-index');
var Funnel = require('broccoli-funnel');

var compileTemplatesTree = find('compile-templates');
var emberTree = find('ember/**/*.js');

var clientTree = mergeTrees([
  'test-client',
  mergeTrees(findBowerTrees(), { overwrite: true })
]);

var testClient = concat(clientTree, {
  inputFiles: [
    'test-client.js',
    'test-session.js',
    'head.min.js',
    'benchmark.js',
    'rsvp.js',
    'people.js',
    'ascii-table.js'
  ],
  outputFile: '/assets/test-client.js'
});


var benchmarksTree = find('benchmarks');
var benchmarksTreeJS = copyIndex('benchmarks', { extensions: ['js'] });
benchmarksTreeJS = new Funnel(benchmarksTreeJS, { destDir: 'benchmarks' });

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  return mergeTrees([
    app.toTree(),
    testClient,
    compileTemplatesTree,
    benchmarksTree,
    benchmarksTreeJS,
    emberTree
  ]);
};
