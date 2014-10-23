Perf.MyThingComponent = Ember.Component.extend({
  render: function(buffer){
    buffer.push(this.get("data"));
  }
});

Perf.MyThing = Ember.Object.extend({
  d: function(){
    return this.get("a") + this.get("b");
  }.property("a","b")
});

/**
  Profiles the rendering of a list with complex rows
**/
Perf.ComplexListProfiler = Perf.Profiler.extend({
  testCount: 40,
  name: 'Complex List',

  setup: function(){
    var listItems = [];
    for (var i=0; i<50; i++) {
      listItems.push(Perf.MyThing.create({
        a: "a" + i,
        b: "b" + i,
        c: "c" + i
      }));
    }

    this.set('listItems', listItems);
  },

  test: function() {
    var profiler = this;
    return new Ember.RSVP.Promise(function(resolve) {
      var result  = profiler.get('result');

      var listItemsView = profiler.renderToScratch('complexItems', {
        listItems: profiler.get('listItems')
      });

      // micro-task queue
      window.Promise.resolve().then(function() {
        // stop timing before we clean up
        result.stop();

        setTimeout(function() {
          resolve();
        }, 0);
      });
    });
  }
});
