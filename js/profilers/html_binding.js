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
    var deferred = Ember.RSVP.defer(),
        htmlBindingsView = this.get('htmlBindingsView'),
        result           = this.get('result');

    htmlBindingsView.set('html', this.get('largeHtmlChunk'));
    Em.run.next(function() {
      result.stop();

      // clean up stuff
      htmlBindingsView.set('html', '');
      deferred.resolve();
    });

    return deferred.promise;
  },

  teardown: function(){
    this.get('htmlBindingsView').destroy();
  }
});
