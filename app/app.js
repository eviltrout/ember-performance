/* globals TestSession, AsciiTable, jQuery */
(function() {
  var EMBER_PERF_VERSION = "0.9.2"; // TODO: get from package.json

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
    '2.0.2'
  ];

  var EMBER_VERSIONS = [];

  LOCAL_EMBER_VERSIONS.forEach(function(version) {
    EMBER_VERSIONS.push({
      name: version,
      path: '/ember/ember-%@.prod.js'.fmt(version),
      compilerPath: '/ember/ember-%@.template-compiler.js'.fmt(version),
      isEnabled: false,
      isCustom: false
    });
  });

  EMBER_VERSIONS[EMBER_VERSIONS.length-1].isEnabled = true;

  var REMOVE_EMBER_VERSIONS = ['release', 'beta', 'canary'];
  REMOVE_EMBER_VERSIONS.forEach(function(version) {
    EMBER_VERSIONS.push({
      name: 'latest ' + version,
      path: 'http://builds.emberjs.com/' + version + '/ember.prod.js',
      compilerPath: 'http://builds.emberjs.com/' + version + '/ember-template-compiler.js',
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

  // This should probably be ember-cli, it just seemed so complicated to
  // include an entire ember-cli app within a custom broccoli app that
  // doesn't always use Ember.
  var App = Ember.Application.create();

  App.IndexController = Ember.ArrayController.extend({
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
      result = 'User Agent: ' + navigator.userAgent + "\n";

      var featureFlags = this.get('report.featureFlags');
      if (featureFlags && featureFlags.length) {
        result += 'Feature Flags: ' + featureFlags.join(', ') + "\n";
      }
      result += '\n';

      var table = new AsciiTable('Ember Performance Suite - Results');
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

      var testSession = new TestSession();
      testSession.setup(enabledEmberVersions, enabledTests);
      testSession.featureFlags = this.get('featureFlags');
      testSession.enableProfile = options.enableProfile || false;
      testSession.save();

      document.location.href = "/next-url";
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

  App.IndexRoute = Ember.Route.extend({
    model: function() {
      var session = TestSession.recover();

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

  Ember.Handlebars.registerBoundHelper('fmt-number', function(num) {
    return window.numeral(num).format('0,0.00');
  });

  function roundedNumber(num) {
    if (num) {
      return Math.round(num * 100, 10) / 100.0;
    }
    return num;
  }
})();
