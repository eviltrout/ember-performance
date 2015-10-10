import Ember from 'ember';

var TEST_LIST = [ // TODO: Populate this automatically from the test definitions
  { name: 'Baseline: Render List',     path: '/baseline-render-list'     },
  { name: 'Baseline: Handlebars List', path: '/baseline-handlebars-list' },

  { name: 'Ember.get',                 path: '/ember-get' },
  { name: 'Ember.set',                 path: '/ember-set' },
  { name: 'Ember.set (primed)',        path: '/ember-set/primed' },
  { name: 'Ember.get (primed)',        path: '/ember-get/primed' },
  { name: 'Ember.run',                 path: '/ember-run' },

  // this test is broken in 1.11 beta
  // { name: 'link-to get(\'active\')',   path: '/link-to/active' },

  { name: 'link-to get(\'create\')',   path: '/link-to/create' },

  { name: 'object-create/component',   path: '/object-create/component'   },
  { name: 'object-create/baseline',    path: '/object-create/baseline'   },
  { name: 'object-create/index',       path: '/object-create' },

  // Basically, browisers (v8 included have mega slow defineProp ...)
  // - https://code.google.com/p/v8/issues/detail?id=3649
  // - there is a FF ticket I opened, but couldn't find it quickly :P
  // - Jakob is working on it from the v8 side.
  { name: 'object-create/without-non-enumerable-safety', path: '/object-create/without-non-enumerable-safety' },
  { name: 'object-create/without-non-enumerable-safety-same-class', path: '/object-create/without-non-enumerable-safety-same-class' },

  { name: 'Render List',               path: '/render-list'   },
  { name: 'Render List (Unbound)',     path: '/render-list-unbound' },
  { name: 'Render Complex List',       path: '/render-complex-list' },
  { name: 'Render Complex List (HTML)',path: '/render-complex-html' },

  { name: 'Render Simple Ember List',  path: '/render-simple-ember-list' },
  { name: 'Render List with link-to',  path: '/render-list-with-link-to' },
  { name: 'Render link-to',            path: '/render-link-to' }
];

var LOCAL_EMBER_VERSIONS = [
  '1.11.3',
  '1.12.0',
  '1.13.3',
  '1.13.9',
  '1.13.10',
  '2.0.2',
  '2.1.0'
];

var EMBER_VERSIONS = [];

LOCAL_EMBER_VERSIONS.forEach(function(version) {
  EMBER_VERSIONS.push({
    name: version,
    path: `/ember/ember-${version}.prod.js`,
    compilerPath: `/ember/ember-${version}.template-compiler.js`,
    isEnabled: false,
    isCustom: false
  });
});

EMBER_VERSIONS[EMBER_VERSIONS.length-1].isEnabled = true;

var REMOVE_EMBER_VERSIONS = ['release', 'beta', 'canary'];
REMOVE_EMBER_VERSIONS.forEach(function(version) {
  EMBER_VERSIONS.push({
    name: `latest ${version}`,
    path: `http://builds.emberjs.com/${version}/ember.prod.js`,
    compilerPath: `http://builds.emberjs.com/${version}/ember-template-compiler.js`,
    isEnabled: false,
    isCustom: false
  });
});

EMBER_VERSIONS.push({
  name: 'custom version',
  path: '',
  compilerPath: '',
  isEnabled: false,
  isCustom: true
});

export default Ember.Route.extend({
  model: function() {
    var session = window.TestSession.recover();

    var tests = TEST_LIST.map(function(test) {
      if (session) {
        test.isEnabled = session.isTestEnabled(test);
      } else {
        test.isEnabled = true;
      }

      return Ember.Object.create(test);
    });

    var emberVersions = EMBER_VERSIONS.map(function(emberVersion) {
      if (session) {
        emberVersion.isEnabled = session.isVersionEnabled(emberVersion);
      }

      if(emberVersion.isCustom) {
        emberVersion.path = localStorage.getItem('ember-perf-ember-url');
        emberVersion.compilerPath = localStorage.getItem('ember-perf-compiler-url');
      }

      return Ember.Object.create(emberVersion);
    });

    return { tests: tests, emberVersions: emberVersions, session: session };
  },

  setupController: function(controller, model) {
    var session = model.session;
    var report;

    if (session) {
      report = session.getReport();
    }

    var featureFlags = [];
    var flagsJson = localStorage.getItem('ember-perf-flags');

    if (flagsJson && flagsJson.length) {
      featureFlags = JSON.parse(flagsJson);
    }

    controller.setProperties({
      model: model.tests,
      session: session,
      report: report,
      emberVersions: model.emberVersions,
      featureFlags: featureFlags
    });
  }
});
