/* global TestClient */
(function() {

  var viewClass, view;

  // TODO: Make this load from .hbs files
  var template =
    "<table>" +
      "<tbody>" +
        "{{#each p in view.people}}" +
          "<td class='name'>{{p.name}}</td>" +
          "<td class='email'>{{p.email}}</td>" +
          "<td class='company'>{{p.company}}</td>" +
          "<td class='city'>{{p.city}}</td>" +
          "<td class='url'><a {{bind-attr href=p.url}}>Link</a></td>" +
        "{{/each}}" +
      "</tbody>" +
    "</table>";

  TestClient.run({
    name: 'Render List',

    setup: function() {
      viewClass = Ember.View.extend({
        template: Ember.Handlebars.compile(template)
      });
    },

    reset: function() {
      if (view) { view.remove(); }
      return new Ember.RSVP.Promise(function(resolve) {
        Ember.run.next(resolve);
      });
    },

    test: function() {
      return new Ember.RSVP.Promise(function(resolve) {
        view = viewClass.create({ people: TestClient.PEOPLE_JSON });
        view.on('didInsertElement', function() {
          resolve();
        });
        view.appendTo('#scratch');
      });
    }
  });

})();
