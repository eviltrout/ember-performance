/* globals TestSession */
(function() {

  // TODO: Populate this automatically from the test definitions
  var TEST_LIST = [
    {name: 'Baseline: Object Create', path: '/baseline-object-create'},
    {name: 'Baseline: Render List', path: '/baseline-render-list'},
    {name: 'Ember.Object.Create', path: '/object-create'},
  ];

  var HANDLEBARS_DEFAULT = "/ember/handlebars-v1.3.0.js";

  var EMBER_VERSIONS = [
    {name: '1.9.0-beta.3',
     path: "http://builds.emberjs.com/tags/v1.9.0-beta.3/ember.js",
     handlebarsPath: '/ember/handlebars-v2.0.0.js'},
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
    handlebarsVersion: null,
    enabledTests: Ember.computed.filterBy('model', 'enabled', true),
    cantStart: Ember.computed.equal('enabledTests.length', 0),

    emberVersionChanged: function() {
      var v = EMBER_VERSIONS.findProperty('path', this.get('emberVersion'));
      if (v && v.handlebarsPath) {
        this.set('handlebarsVersion', v.handlebarsPath);
      }
    }.observes('emberVersion'),

    actions: {
      start: function() {
        var enabledTests = this.get('enabledTests');

        var testSession = new TestSession();
        testSession.emberUrl = this.get('emberVersion');
        testSession.handlebarsUrl = this.get('handlebarsVersion') || HANDLEBARS_DEFAULT;

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

      toggleAll: function() {
        this.get('model').forEach(function(t) {
          t.toggleProperty('enabled');
        });
      }
    }
  });

  Ember.Handlebars.registerBoundHelper('fmt-number', function(num) {
    if (num) {
      return Math.round(num * 100, 10) / 100.0;
    } else {
      return new Ember.Handlebars.SafeString("&mdash;");
    }
  });

  App.IndexRoute = Ember.Route.extend({
    model: function() {
      return TEST_LIST.map(function(t) {

        // By default all tests are enabled
        t.enabled = true;

        return Ember.Object.create(t);
      });
    },

    setupController: function(controller, model) {
      var session = TestSession.recover(),
          version = EMBER_VERSIONS[0].path;

      if (session) {
        var report = session.report();
        controller.set('report', report);
        if (report && report.emberUrl) {
          version = report.emberUrl;
        }
      }
      controller.set('emberVersion', version);
      controller.set('emberVersions', EMBER_VERSIONS);
      controller.set('model', model);
    }
  });

})();
