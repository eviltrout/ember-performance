/* globals TestSession, AsciiTable */
(function() {

  // TODO: get from package.json
  var EMBER_PERF_VERSION = "0.9.1";

  // TODO: Populate this automatically from the test definitions
  var TEST_LIST = [
    { name: 'Baseline: Render List',     path: '/baseline-render-list'     },
    { name: 'Baseline: Handlebars List', path: '/baseline-handlebars-list' },

    { name: 'Ember.get',                 path: '/ember-get' },
    { name: 'Ember.set',                 path: '/ember-set' },
    { name: 'Ember.set (primed)',        path: '/ember-set/primed' },
    { name: 'Ember.get (primed)',        path: '/ember-get/primed' },

    { name: 'object-create/view',        path: '/object-create/view'   },
    { name: 'object-create/baseline',    path: '/object-create/baseline'   },
    { name: 'object-create/index',       path: '/object-create' },

    { name: 'Render List',               path: '/render-list'   },
    { name: 'Render List (Unbound)',     path: '/render-list-unbound' },
    { name: 'Render Complex List',       path: '/render-complex-list' }
  ];

  var HANDLEBARS_DEFAULT = "/ember/handlebars-v1.3.0.js";

  var EMBER_VERSIONS = [
    {name: '1.10.0-beta.1+canary', path: "/ember/1.10.0-beta.1.canary.js", handlebarsPath: '/ember/handlebars-v2.0.0.js'},
    {name: '1.9.0-beta.3', path: "/ember/1.9.0-beta.3.js", handlebarsPath: '/ember/handlebars-v2.0.0.js'},
    {name: '1.8.1', path: "/ember/1.8.1.js", handlebarsPath: HANDLEBARS_DEFAULT},
    {name: '1.7.1', path: "/ember/1.7.1.js", handlebarsPath: HANDLEBARS_DEFAULT}
  ];

  // This should probably be ember-cli, it just seemed so complicated to
  // include an entire ember-cli app within a custom broccoli app that
  // doesn't always use Ember.
  var App = Ember.Application.create();

  App.IndexController = Ember.ArrayController.extend({
    report: null,
    emberVersion: null,
    enabledTests: Ember.computed.filterBy('model', 'enabled', true),
    customEmber: false,
    showingHTML: true,
    sending: false,
    error: false,
    sent: false,
    featureFlags: null,
    newFlagName: null,

    addFeatureDisabled: Ember.computed.empty('newFlagName'),

    asciiTable: function() {
      var result = "Ember Version: " + this.get('report.emberVersion') + "\n";
      result += "User Agent: " + navigator.userAgent + "\n";

      var featureFlags = this.get('report.featureFlags');
      if (featureFlags && featureFlags.length) {
        result += "Feature Flags: " + featureFlags.join(', ') + "\n";
      }

      result += "\n";

      var table = new AsciiTable('Ember Performance Suite - Results');
      table.setHeading('Name', 'Speed', 'Error', 'Samples', 'Mean');
      this.get('report.results').forEach(function(r) {
        table.addRow(r.name,
                     roundedNumber(r.hz),
                     roundedNumber(r.rme),
                     roundedNumber(r.samples),
                     roundedNumber(r.mean));
      });

      return result + table.toString();
    }.property('report.results'),

    emberUrl: function() {
      if (this.get('customEmber')) {
        return this.get('customEmberUrl');
      } else {
        return this.get('emberVersion');
      }
    }.property('customEmber', 'emberVersion', 'customEmberUrl'),

    handlebarsUrl: function() {
      if (this.get('customEmber')) {
        return this.get('customHandlebarsUrl');
      } else {
        var v = EMBER_VERSIONS.findProperty('path', this.get('emberVersion'));
        if (v && v.handlebarsPath) {
          return v.handlebarsPath;
        }
      }
    }.property('customEmber', 'emberVersion', 'customHandlebarsUrl'),

    cantStart: function() {
      return (this.get('enabledTests.length') === 0) ||
              Ember.empty(this.get('emberUrl')) ||
              Ember.empty(this.get('handlebarsUrl'));
    }.property('emberUrl', 'handlebarsUrl', 'enabledTests.length'),

    actions: {
      submitResults: function() {

        var self = this;
        this.set('sending', true);
        this.set('error', false);

        var reportJson = this.get('report');
        reportJson.emberPerfVersion = EMBER_PERF_VERSION;
        new Ember.RSVP.Promise(function (resolve, reject) {
          Ember.$.ajax({
            url: "http://perflogger.eviltrout.com/api/results",
            type: "POST",
            data: { results: JSON.stringify(reportJson) },
            success: function(result) {
              Ember.run(null, resolve, result);
            },
            error: function(result) {
              Ember.run(null, reject, result);
            }
          });
        }).then(function() {
          self.set('sent', true);
        }).catch(function() {
          self.set('error', true);
        }).finally(function() {
          self.set('sending', false);
        });
      },

      toggleCustom: function() {
        this.toggleProperty('customEmber');
      },

      showHTML: function() {
        this.set('showingHTML', true);
        localStorage.setItem('ember-perf-mode', 'html');
      },

      showText: function() {
        this.set('showingHTML', false);
        localStorage.setItem('ember-perf-mode', 'text');
      },

      start: function() {
        var enabledTests = this.get('enabledTests');

        // Remember any custom urls we set for another run
        if (this.get('customEmber')) {
          localStorage.setItem('ember-perf-custom', 'true');
          localStorage.setItem('ember-perf-ember-url', this.get('emberUrl'));
          localStorage.setItem('ember-perf-handlebars-url', this.get('handlebarsUrl'));
        } else {
          localStorage.removeItem('ember-perf-custom');
          localStorage.removeItem('ember-perf-ember-url');
          localStorage.removeItem('ember-perf-handlebars-url');
        }

        localStorage.setItem('ember-perf-flags', JSON.stringify(this.get('featureFlags')));

        var testSession = new TestSession();
        testSession.emberUrl = this.get('emberUrl');
        testSession.handlebarsUrl = this.get('handlebarsUrl');
        testSession.featureFlags = this.get('featureFlags');

        testSession.enqueuePaths(enabledTests.map(function(t) {
          return t.get('path');
        }));

        TestSession.persist(testSession);
        var t = testSession.nextTest();
        if (t) {
          document.location.href = t.path;
        }
      },

      clear: function() {
        TestSession.eject();
        this.set('report', []);
      },

      selectNone: function() {
        this.get('model').forEach(function(t) {
          t.set('enabled', false);
        });
      },

      selectAll: function() {
        this.get('model').forEach(function(t) {
          t.set('enabled', true);
        });
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

  Ember.Handlebars.registerBoundHelper('fmt-number', function(num) {
    num = roundedNumber(num);
    return typeof num !== "undefined" ? num : new Ember.Handlebars.SafeString("&mdash;");
  });

  App.IndexRoute = Ember.Route.extend({
    model: function() {
      var session = TestSession.recover();

      var tests = TEST_LIST.map(function(t) {

        if (session) {
          t.enabled = !!session.findItem(t.path);
        } else {
          // By default all tests are enabled
          t.enabled = true;
        }

        return Ember.Object.create(t);
      });

      return { tests: tests, session: session };
    },

    setupController: function(controller, model) {
      var session = model.session,
          version = EMBER_VERSIONS[0].path;

      if (session) {
        var report = session.report();
        controller.set('report', report);
        if (report && report.emberUrl) {
          version = report.emberUrl;
        }
      }

      var featureFlags = [],
          flagsJson = localStorage.getItem('ember-perf-flags');

      if (flagsJson && flagsJson.length) {
        featureFlags = JSON.parse(flagsJson);
      }

      controller.setProperties({
        emberVersion: version,
        emberVersions: EMBER_VERSIONS,
        model: model.tests,
        featureFlags: featureFlags,
        showingHTML: localStorage.getItem('ember-perf-mode') !== 'text',
        customEmber: localStorage.getItem('ember-perf-custom') === 'true',
        customEmberUrl: localStorage.getItem('ember-perf-ember-url'),
        customHandlebarsUrl: localStorage.getItem('ember-perf-handlebars-url')
      });
    }
  });

  function roundedNumber(num) {
    if (num) {
      return Math.round(num * 100, 10) / 100.0;
    }
    return num;
  }

})();
