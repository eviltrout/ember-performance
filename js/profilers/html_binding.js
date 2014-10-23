/**
  Renders a view with a binding that contains a lot of HTML. The idea
  here is to check how the W3C Range API performs on large chunks of HTML
  nodes.
**/

Perf.HtmlBindingProfiler = Perf.Profiler.extend({
  testCount: 40,
  name: 'HTML Bindings',

  setup: function(){
    var largeHtmlChunk = "<ul>";
    for (var i=0; i<5000; i++) {
      largeHtmlChunk += "<li>Evil Trout</li>";
    }
    largeHtmlChunk += "</ul>";

    this.setProperties({
      'htmlBindingsView': this.renderToScratch('htmlBindings'),
      'largeHtmlChunk': largeHtmlChunk
    });
  },

  test: function(){
    var profiler = this;
    return new Ember.RSVP.Promise(function(resolve) {
      var htmlBindingsView = profiler.get('htmlBindingsView');
      var result           = profiler.get('result');

      htmlBindingsView.set('html', profiler.get('largeHtmlChunk'));

      // stop gathering statistics on the turn of the next micro-task queue
      window.Promise.resolve().then(function(){
        result.stop();

        // clean up stuff
        setTimeout(function() {
          Ember.run(htmlBindingsView, 'set', 'html' ,'');
          resolve();
        }, 0);
      });
    });
  },

  teardown: function(){
    this.get('htmlBindingsView').destroy();
  }
});
