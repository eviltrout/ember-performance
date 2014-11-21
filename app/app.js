/* globals TestSession */
(function() {

  // TODO: Populate this automatically from the test definitions
  var tests = [
    {name: 'Baseline: Object Create', path: '/baseline-object-create'},
    {name: 'Baseline: Render List', path: '/baseline-render-list'},
    {name: 'Ember.Object.Create', path: '/object-create'},
  ];

  // This should probably be ember-cli, it just seemed so complicated to
  // include an entire ember-cli app within a custom broccoli app that
  // doesn't always use Ember.
  var App = Ember.Application.create();

  App.IndexController = Ember.ArrayController.extend({
    report: null,
    enabledTests: Ember.computed.filterBy('model', 'enabled', true),
    cantStart: Ember.computed.equal('enabledTests.length', 0),

    actions: {
      start: function() {
        var enabledTests = this.get('enabledTests');

        var testSession = new TestSession();
        testSession.enqueuePaths(enabledTests.map(function(t) {
          return t.get('path');
        }));

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
      return tests.map(function(t) {

        // By default all tests are enabled
        t.enabled = true;

        return Ember.Object.create(t);
      });
    },

    setupController: function(controller, model) {
      var session = TestSession.recover();
      if (session) {
        controller.set('report', session.report());
      }
      controller.set('model', model);
    }
  });

})();
