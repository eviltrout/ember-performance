/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var MergeTrees = require('broccoli-merge-trees');
var Concat = require('broccoli-sourcemap-concat');
var findBowerTrees = require('broccoli-bower');
var CopyIndex = require('./lib/copy-index');
var Funnel = require('broccoli-funnel');
var uglify = require('broccoli-uglify-js');

var bowerTree = new MergeTrees(findBowerTrees(), {
  annotation: 'bower trees merge',
  overwrite: true
});
var clientBowerTree = new Funnel(bowerTree, {
  include: [
    'head.min.js',
    'benchmark.js',
    'rsvp.js',
    'ascii-table.js'
  ]
});
var clientTree = new MergeTrees([
  'test-client',
  clientBowerTree
], {
  annotation: 'test-client merge'
});
var testClient = new Concat(clientTree, {
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

var compileTemplatesTree = new Funnel('compile-templates', {
  include: [ 'index.{html,js}' ],
  destDir: 'compile-templates'
});

var benchmarksIndexJs = new Funnel('benchmarks', {
  include: [ '**/*.js' ],
  destDir: 'benchmarks'
});

var benchmarksIndexHtml = new CopyIndex(benchmarksIndexJs, {
  annotation: 'Copy index.html to benchmark'
});

var emberTree = new Funnel('ember', {
  include: [ '**/*.js' ],
  destDir: 'ember'
});

if (EmberApp.env() === 'production') {
  emberTree = uglify(emberTree);
}

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
  });
  return new MergeTrees([
    app.toTree(),
    testClient,
    compileTemplatesTree,
    benchmarksIndexJs,
    benchmarksIndexHtml,
    emberTree
  ], {
    annotation: 'final dist merge'
  });
};
