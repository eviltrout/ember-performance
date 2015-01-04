/* global TestClient */
(function() {

  var ContainerView, ViewClass, view;

  // TODO: Make this load from .hbs files
  var template =
    "{{link-to 'Howdy!' 'index'}}";

  TestClient.run({
    name: 'Render link-to',

    setup: function() {
      var App = Ember.Application.create({ rootElement: '#scratch' });

      ViewClass = Ember.View.extend({
        template: Ember.Handlebars.compile(template)
      });

      return new RSVP.Promise(function(resolve) {
        App.IndexView = Ember.ContainerView.extend({
          _triggerStart: function() {
            ContainerView = this;
            resolve();
          }.on('didInsertElement')
        });
      });
    },

    reset: function() {
      if (view) { ContainerView.removeObject(view); }

      return new RSVP.Promise(function(resolve) {
        Ember.run.next(resolve);
      });
    },

    test: function() {
      return new RSVP.Promise(function(resolve) {
        Ember.run(function(){
          view = ViewClass.create();
          view.on('didInsertElement', resolve);
          ContainerView.addObject(view);
        });
      });
    }
  });

})();
