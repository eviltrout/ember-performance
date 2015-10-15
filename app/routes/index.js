import Ember from 'ember';
import config from 'ember-performance/config/environment';

const BENCHMARKS = config.BENCHMARKS;

const EMBER_VERSIONS = config.LOCAL_EMBER_VERSIONS.map(version => {
  return {
    name: version,
    path: `/ember/ember-${version}.prod.js`,
    compilerPath: `/ember/ember-${version}.template-compiler.js`,
    isEnabled: false,
    isCustom: false
  };
});

EMBER_VERSIONS[EMBER_VERSIONS.length-1].isEnabled = true;

const REMOTE_EMBER_VERSIONS = ['release', 'beta', 'canary'];

REMOTE_EMBER_VERSIONS.forEach(version => {
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
  model() {
    let session = window.TestSession.recover();

    let tests = BENCHMARKS.map(test => {
      if (session) {
        test.isEnabled = session.isTestEnabled(test);
      } else {
        test.isEnabled = true;
      }

      return test;
    });

    let emberVersions = EMBER_VERSIONS.map(emberVersion => {
      if (session) {
        emberVersion.isEnabled = session.isVersionEnabled(emberVersion);
      }

      if(emberVersion.isCustom) {
        emberVersion.path = localStorage.getItem('ember-perf-ember-url');
        emberVersion.compilerPath = localStorage.getItem('ember-perf-compiler-url');
      }

      return emberVersion;
    });

    return {
      tests,
      emberVersions,
      session
    };
  },

  setupController(controller, model) {
    let session = model.session;
    let report;

    if (session) {
      report = session.getReport();
    }

    let featureFlags = [];
    let flagsJson = localStorage.getItem('ember-perf-flags');

    if (flagsJson && flagsJson.length) {
      featureFlags = JSON.parse(flagsJson);
    }

    controller.setProperties({
      model: model.tests,
      session,
      report,
      emberVersions: model.emberVersions,
      featureFlags
    });
  }
});
