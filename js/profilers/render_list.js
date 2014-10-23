/**
  Profiles the rendering of a list of many bound items.
**/
Perf.RenderListProfiler = Perf.Profiler.extend({
  testCount: 20,
  name: 'Render List',

  setup: function(){
    var listItems = [];
    for (var i=0; i<5000; i++) {
      listItems.push("Item " + (i + 1));
    }

    this.set('listItems', listItems);
  },

  test: function() {
    var deferred = Ember.RSVP.defer(),
        result  = this.get('result');

    var listItemsView = this.renderToScratch('listItems', {
      listItems: this.get('listItems')
    });

    window.Promise.resolve().then(function() {
      // stop timing before we clean up
      result.stop();

      setTimeout(function() {
        // clean up stuff
        listItemsView.destroy();
        deferred.resolve();
      }, 0);
    });

    return deferred.promise;
  }
});
