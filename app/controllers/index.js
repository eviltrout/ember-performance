import Ember from 'ember';

function roundedNumber(num) {
  if (num) {
    return Math.round(num * 100, 10) / 100.0;
  }
  return num;
}

var EMBER_PERF_VERSION = "0.9.2"; // TODO: get from package.json

export default Ember.Controller.extend({
  init: function() {
    this._super.apply(this, arguments);

    this.report = null;
    this.sending = false;
    this.error = false;
    this.sent = false;
    this.featureFlags = null;
    this.newFlagName = null;
  },

  enabledTests: Ember.computed.filterBy('model', 'isEnabled', true),
  enabledEmberVersions: Ember.computed.filterBy('emberVersions', 'isEnabled', true),
  addFeatureDisabled: Ember.computed.empty('newFlagName'),
  customEmberVersion: Ember.computed.reads('emberVersions.lastObject'),
  canSubmitStats: Ember.computed.equal('report.testGroupReports.length', 1),
  hasNoEnabledTests: Ember.computed.empty('enabledTests'),
  hasNoEnabledEmberVersions: Ember.computed.empty('enabledEmberVersions'),
  cantStart: Ember.computed.or('hasNoEnabledTests', 'hasNoEnabledEmberVersions'),

  asciiTable: function() {
    var result = 'User Agent: ' + navigator.userAgent + "\n";

    var featureFlags = this.get('report.featureFlags');
    if (featureFlags && featureFlags.length) {
      result += 'Feature Flags: ' + featureFlags.join(', ') + "\n";
    }
    result += '\n';

    var table = new window.AsciiTable('Ember Performance Suite - Results');
    table.setHeading('Name', 'Speed', 'Error', 'Samples', 'Mean');

    this.get('report.testGroupReports').forEach(function(testGroupReport) {
      testGroupReport.results.forEach(function(result) {
        table.addRow(result.name + " (" + testGroupReport.emberVersion.name + ")",
                     roundedNumber(result.hz),
                     "∓" + roundedNumber(result.rme) + "%",
                     roundedNumber(result.samples),
                     roundedNumber(result.mean));
      });
    });

    return result + table.toString();
  }.property('report.testGroupReports.[]'),

  run: function(options) {
    options = options || {};
    var enabledEmberVersions = this.get('enabledEmberVersions');
    var enabledTests = this.get('enabledTests');

    // Remember any custom urls we set for another run
    var customEmberVersion = this.get('customEmberVersion');
    if (customEmberVersion.isEnabled) {
      localStorage.setItem('ember-perf-ember-url', customEmberVersion.path);
      localStorage.setItem('ember-perf-compiler-url', customEmberVersion.compilerPath);
    } else {
      localStorage.removeItem('ember-perf-ember-url');
      localStorage.removeItem('ember-perf-compiler-url');
    }

    localStorage.setItem('ember-perf-flags', JSON.stringify(this.get('featureFlags')));

    var testSession = new window.TestSession();
    testSession.setup(enabledEmberVersions, enabledTests);
    testSession.featureFlags = this.get('featureFlags');
    testSession.enableProfile = options.enableProfile || false;
    testSession.save();

    document.location.href = "/next-url/index.html";
  },

  actions: {
    submitResults: function() {
      var controller = this;

      this.set('sending', true);
      this.set('error', false);

      var reportJson = this.get('report');
      reportJson.emberPerfVersion = EMBER_PERF_VERSION;

      new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
          url: 'http://perflogger.eviltrout.com/api/results',
          type: 'POST',
          data: { results: JSON.stringify(reportJson) },
          success: function(result) {
            Ember.run(null, resolve, result);
          },
          error: function(result) {
            Ember.run(null, reject, result);
          }
        });
      }).then(function() {
        controller.set('sent', true);
      }).catch(function() {
        controller.set('error', true);
      }).finally(function() {
        controller.set('sending', false);
      });
    },

    profile: function() {
      this.run({ enableProfile: true });
    },

    start: function() {
      this.run();
    },

    selectNone: function() {
      this.get('model').setEach('isEnabled', false);
    },

    selectAll: function() {
      this.get('model').setEach('isEnabled', true);
    },

    addFeature: function() {
      var f = this.get('newFlagName');
      if (f && f.length) {
        this.get('featureFlags').addObject(this.get('newFlagName'));
        this.set('newFlagName', '');
      }
    },

    removeFeature: function(f) {
      this.get('featureFlags').removeObject(f);
    }
  }
});
