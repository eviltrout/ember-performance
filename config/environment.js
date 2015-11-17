/* jshint node: true */
var fs = require('fs');
var naturalSort = require('javascript-natural-sort');

function emberVersions() {
  return fs.readdirSync('ember').map(function(file) {
    var matched = file.match(/^ember-(\d+\.\d+\.\d+)\.prod/);

    if (matched) { return matched[1]; }
  }).filter(Boolean).sort(naturalSort);
}

var walkSync = require('walk-sync');
var path = require('path');
var fs = require('fs');

function benchmarks() {
  return walkSync('benchmarks', ['**/bench.json']).map(function(bench) {
    var data = JSON.parse(fs.readFileSync('benchmarks' + '/' + bench));
    data.path = '/' + path.dirname(bench);
    return data;
  }).filter(function(data) {
    return data.disabled !== false
  });
}

module.exports = function(environment) {
  var ENV = {
    LOCAL_EMBER_VERSIONS: emberVersions(),
    BENCHMARKS: benchmarks(),
    modulePrefix: 'ember-performance',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
