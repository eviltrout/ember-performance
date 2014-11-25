(function(Perf) {
  //  Profiles the rendering of a list of many bound items.
  Perf.RenderListProfiler = Perf.Profiler.extend({
    testCount: 20,
    name: 'Render List',

    setup: function(){
      var listItems = [];
      for (var i=0; i<5000; i++) {
        listItems.push({number: i + 1, title: "Item " + (i + 1)});
      }

      this.set('listItems', listItems);
    },

    test: function() {
      var profiler = this;
      return new Ember.RSVP.Promise(function(resolve) {
        var result  = profiler.get('result');

        var listItemsView = profiler.renderToScratch('listItems', {
          listItems: profiler.get('listItems')
        });

        listItemsView.didInsertElement = function() {
          // stop timing before we clean up
          result.stop();

          setTimeout(function() {
            resolve();
          }, 0);
        };
      });
    }
  });
})(window.Perf);
