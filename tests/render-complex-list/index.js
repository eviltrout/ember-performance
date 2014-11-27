/* global TestClient */
(function() {

  // TODO: Make these load from .hbs files
  var complexTemplate =
    "<ul>" +
      "{{#each view.listItems}}" +
        "<li>{{buffer-render data=a}} {{buffer-render data=b}} {{buffer-render data=c}} {{buffer-render data=d}}</li>" +
        "<li>{{buffer-render data=a}} {{buffer-render data=b}} {{buffer-render data=c}} {{buffer-render data=d}}</li>" +
        "<li>{{component-render a=a b=b c=c d=d}}</li>" +
        "<li>{{component-render a=a b=b c=c d=d}}</li>" +
      "{{/each}}" +
    "</ul>";

  var component =
    "a: {{a}}" +
    "b: {{b}}" +
    "c: {{c}}" +
    "d: {{d}}" +
    "{{nested-component a=a}}";

  var nestedComponent = "a: {{a}}";

  var ContainerView, ViewClass, view, listItems;
  TestClient.run({
    name: 'Render Complex List',

    setup: function() {
      var App = Ember.Application.create({ rootElement: '#scratch' });

      Ember.TEMPLATES['complexItems'] = Ember.Handlebars.compile(complexTemplate);
      Ember.TEMPLATES['components/component-render'] = Ember.Handlebars.compile(component);
      Ember.TEMPLATES['components/nested-component'] = Ember.Handlebars.compile(nestedComponent);

      ViewClass = Ember.View.extend({
        templateName: 'complexItems'
      });

      App.BufferRenderComponent = Ember.Component.extend({
        render: function(buffer) {
          buffer.push(this.get('data'));
        }
      });

      var MyThing = Ember.Object.extend({
        d: function() {
          return this.get("a") + this.get("b");
        }.property("a", "b")
      });

      listItems = [];
      for (var i=0; i<50; i++) {
        listItems.pushObject(MyThing.create({
          a: "a" + i,
          b: "b" + i,
          c: "c" + i
        }));
      }

      // We can start once the index is rendered
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
        view = ViewClass.create({ listItems: listItems });
        view.on('didInsertElement', resolve);
        ContainerView.addObject(view);
      });
    }
  });

})();
