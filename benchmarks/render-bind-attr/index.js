/* global TestClient */
(function() {

  var ContainerView, ViewClass, view;

  // TODO: Make this load from .hbs files
  var template =
    "<div {{bind-attr data-color='green'}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<div {{bind-attr data-color=color}}></div>" +
    "<input type='checkbox' {{bind-attr value='baz'}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>" +
    "<input type='checkbox' {{bind-attr value=value}}>";

  TestClient.run({
    name: 'Render bind-attr',

    setup: function() {
      var App = Ember.Application.create({ rootElement: '#scratch' });

      ViewClass = Ember.View.extend({
        controller: {
          color: 'blue',
          value: 'one hundred'
        },
        template: Ember.Handlebars.compile(template)
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
        view = ViewClass.create();
        view.on('didInsertElement', resolve);
        ContainerView.addObject(view);
      });
    }
  });

})();
