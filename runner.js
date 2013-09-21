var args = phantom.args;
if (args.length < 1 || args.length > 2) {
    console.log("Usage: " + phantom.scriptName + " <URL> <timeout>");
      phantom.exit(1);
}

var fs   = require('fs'),
    page = require('webpage').create();

page.open(args[0], function(status) {
  if (status !== 'success') {
    console.error("Unable to access page.");
    phantom.exit(1);
  } 
});

page.onLoadFinished = function() {
  var promise = page.evaluate(runPerformanceTests),
      timeout = parseInt(args[1] || 60000, 10),
      start   = Date.now();

  var interval = setInterval(function() {
    if (Date.now() > start + timeout) {
      console.error("Timed out");
      phantom.exit(124);
    } else {
      var results = page.evaluate(function(){
        return window.performanceResults;
      });

      if (results) {
        clearInterval(interval);
        fs.write('results.json', JSON.stringify(results));
        phantom.exit();
      }
    }
  }, 500);
}

function runPerformanceTests(){
  var promise = Ember.RSVP.resolve(true);

  return promise
    .then(function(){ return Perf.ObjectCreateProfiler.create().profile(); })
    .then(function(){ return Perf.TemplateBindingProfiler.create().profile(); })
    .then(function(){ return Perf.HtmlBindingProfiler.create().profile(); })

    .then(function(){
      var display = Perf.ProfilerDisplay.instance();
      window.performanceResults = display.get('results').mapBy('dump');

      return true;
    });
};
