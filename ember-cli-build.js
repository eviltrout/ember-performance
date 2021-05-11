/* global require, module */
var EmberApp = require("ember-cli/lib/broccoli/ember-app");
var MergeTrees = require("broccoli-merge-trees");
var Concat = require("broccoli-concat");
var CopyIndex = require("./lib/copy-index");
var Funnel = require("broccoli-funnel");

var bowerTree = new Funnel("bower_components", {
  include: [
    "headjs/dist/1.0.0/head.js",
    "benchmark/benchmark.js",
    "rsvp/rsvp.js",
    "ascii-table/ascii-table.js",
    "lodash/lodash.js",
  ],
});

var clientTree = new MergeTrees(["test-client", bowerTree], {
  annotation: "test-client merge",
});

var testClient = new Concat(clientTree, {
  headerFiles: [
    "test-client.js",
    "test-session.js",
    "headjs/dist/1.0.0/head.js",
    "lodash/lodash.js",
    "benchmark/benchmark.js",
    "rsvp/rsvp.js",
    "ascii-table/ascii-table.js",
    "people.js",
  ],
  outputFile: "/assets/test-client.js",
});

var compileTemplatesTree = new Funnel("compile-templates", {
  include: ["index.{html,js}"],
  destDir: "compile-templates",
});

var benchmarksIndexJs = new Funnel("benchmarks", {
  include: ["**/*.js"],
  destDir: "benchmarks",
});

var benchmarksIndexHtml = new CopyIndex(benchmarksIndexJs, {
  annotation: "Copy index.html to benchmark",
});

var emberTree = new Funnel("ember", {
  include: ["**/*.js"],
  destDir: "ember",
});

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    "ember-bootstrap": {
      bootstrapVersion: 4,
      importBootstrapCSS: true,
    },
    fingerprint: {
      enabled: false,
    },
  });
  app.import("vendor/bootstrap.css");

  return new MergeTrees(
    [
      app.toTree(),
      testClient,
      compileTemplatesTree,
      benchmarksIndexJs,
      benchmarksIndexHtml,
      emberTree,
    ],
    {
      annotation: "final dist merge",
    }
  );
};
