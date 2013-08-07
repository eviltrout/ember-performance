Perf = Ember.Application.create();

var renderToScratch = function(template, args) {
  var viewArgs = {templateName: template}
  var view = Ember.View.create(jQuery.extend(viewArgs, args || {}));
  view.appendTo('#scratch');
  return view;
}

Perf.ApplicationRoute = Em.Route.extend({

  model: function() {
    return Perf.Profiler.instance();
  },

  events: {

    /**
      Profiles the creation of Ember.Objects.
    **/
    profObjectCreate: function() {
      Perf.Profiler.profile("Object.create()", 50, function() {
        for (var i=0; i<10000; i++) {
          var instance = Ember.Object.create({});
        }
      });
    },

    /**
      Profiles the rendering of a list of many bound items.
    **/
    profRenderList: function () {
      var listItems = [];
      for (var i=0; i<5000; i++) {
        listItems.push("Item " + (i + 1));
      }

      Perf.Profiler.profile("Render List", 20, function(result) {
        var promise = Ember.Deferred.create();

        var listItemsView = renderToScratch('listItems', {listItems: listItems});
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

    /**
      Renders a list of items, then changes them all.
    **/
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

      var templateBindingsView = renderToScratch('templateBindings', {people: people});
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

    /**
      Renders a view with a binding that contains a lot of HTML. The idea
      here is to check how the W3C Range API performs on large chunks of HTML
      nodes.
    **/
    profHtmlBindings: function() {
      var largeHtmlChunk = "<ul>";
      for (var i=0; i<5000; i++) {
        largeHtmlChunk += "<li>Evil Trout</li>";
      }
      largeHtmlChunk += "</ul>";

      var htmlBindingsView = renderToScratch('htmlBindings');
      Perf.Profiler.profile("HTML Bindings", 40, function(result) {
        var promise = Ember.Deferred.create();

        htmlBindingsView.set('html', largeHtmlChunk)
        Em.run.next(function() {
          result.stop();

          // clean up stuff
          htmlBindingsView.set('html', '');
          promise.resolve();
        });
        return promise;
      });
    }

  }

});


Perf.ApplicationController = Ember.ObjectController.extend({

  clearResults: function() {
    this.get('model').clearResults();
  },

});