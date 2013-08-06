Perf = Ember.Application.create();

Perf.ApplicationRoute = Em.Route.extend({

  model: function() {
    return Perf.Profiler.instance();
  },

  events: {

    profObjectCreate: function() {
      Perf.Profiler.profile("Object.create()", 50, function() {
        for (var i=0; i<10000; i++) {
          var instance = Ember.Object.create({});
        }
      });
    },

    profRenderList: function () {
      var listItems = [];
      for (var i=0; i<1500; i++) {
        listItems.push("Item " + (i + 1));
      }

      Perf.Profiler.profile("Render List", 20, function(result) {
        var promise = Ember.Deferred.create();

        var listItemsView = Ember.View.create({
          classNames: ['hidden'],
          templateName: 'listItems',
          listItems: listItems
        });

        listItemsView.appendTo('#scratch');
        Em.run.next(function() {
          // stop timing before we clean up
          result.stop();

          // clean up stuff
          listItemsView.destroy();
          promise.resolve();
        });

        return promise;
      });
    },

    profTemplateBindings: function() {
      var people = [],
          lastAge = 1;

      var nextAge = function() {
        lastAge++;
        if (lastAge > 99) { lastAge = 1; }
        return lastAge;
      }

      for (var i=0; i<500; i++) {
        people.push(Em.Object.create({name: "Person " + i, age: nextAge()}));
      }

      var templateBindingsView = Ember.View.create({
        classNames: ['hidden'],
        templateName: 'templateBindings',
        people: people
      });
      templateBindingsView.appendTo('#scratch');

      Perf.Profiler.profile("Template Bindings", 40, function(result) {
        var promise = Ember.Deferred.create();
        for (var i=0; i<people.length; i++) {
          people[i].set('age', nextAge());
        }

        Em.run.next(function() {
          result.stop();

          // clean up stuff
          promise.resolve();
        });

        return promise;

      }).then(function () {
        templateBindingsView.destroy();
      });
    },
  }

});


Perf.ApplicationController = Ember.ObjectController.extend({

  clearResults: function() {
    this.get('model').clearResults();
  },

});