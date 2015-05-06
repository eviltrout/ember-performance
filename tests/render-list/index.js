/* global TestClient */
(function() {

  var ContainerView, ViewClass, view;

  // TODO: Make this load from .hbs files
  var template =
    "<table>" +
      "<tbody>" +
        "{{#each p in view.people}}" +
          "<tr>" +
            "<td class='name'>{{p.name}}</td>" +
            "<td class='email'>{{p.email}}</td>" +
            "{{#with p.company as company}}" +
              "<td class='company'>{{p.company}}</td>" +
            "{{/with}}" +
            "{{#if p.city}}" +
              "<td class='city'>{{p.city}}</td>" +
              "<td class='url'><a {{bind-attr href=p.url}}>Link</a></td>" +
            "{{/if}}" +
          "</tr>" +
        "{{/each}}" +
      "</tbody>" +
    "</table>";

  TestClient.run({
    name: 'Render List',

    setup: function() {
      var App = Ember.Application.create({ rootElement: '#scratch' });

      ViewClass = Ember.View.extend({
        template: this.compile(template)
      });

      return new Ember.RSVP.Promise(function(resolve) {
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

      return new Ember.RSVP.Promise(function(resolve) {
        Ember.run.next(resolve);
      });
    },

    test: function() {
      return new Ember.RSVP.Promise(function(resolve) {
        view = ViewClass.create({ people: TestClient.PEOPLE_JSON });
        view.on('didInsertElement', resolve);
        ContainerView.addObject(view);
      });
    }
  });

})();
