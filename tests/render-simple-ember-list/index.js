/* global TestClient */
(function() {

  var containerView, ViewClass, view;

  // TODO: Make this load from .hbs files
  var template =
    "<table>" +
      "<tbody>" +
        "{{#each p in view.people}}" +
          "<tr>" +
            "<td class='name'>{{p.name}}</td>" +
            "<td class='email'>{{p.email}}</td>" +
          "</tr>" +
        "{{/each}}" +
      "</tbody>" +
    "</table>";

  TestClient.run({
    name: 'Render Simple Ember List',

    setup: function() {
      var App = Ember.Application.create({ rootElement: '#scratch' });

      ViewClass = Ember.View.extend({
        template: this.compile(template)
      });

      return new Ember.RSVP.Promise(function(resolve) {
        App.IndexView = Ember.ContainerView.extend({
          _triggerStart: function() {
            containerView = this;
            resolve();
          }.on('didInsertElement')
        });
      });
    },

    reset: function() {
      if (view) { containerView.removeObject(view); }

      return new Ember.RSVP.Promise(function(resolve) {
        Ember.run.next(resolve);
      });
    },

    test: function() {
      return new Ember.RSVP.Promise(function(resolve) {
        Ember.run(function(){
          view = ViewClass.create({ people: TestClient.PEOPLE_JSON });
          view.on('didInsertElement', resolve);
          containerView.addObject(view);
        });
      });
    }
  });

})();
