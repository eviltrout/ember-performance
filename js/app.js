Perf = Ember.Application.create();

Ember.Handlebars.helper('time', function(value, options) {
  if (typeof value === "undefined" || value === 0) { return new Handlebars.SafeString("&mdash;"); }
  var rounded = Math.floor(value * 100) / 100;
  return new Handlebars.SafeString(rounded + 'ms');
});

Perf.ListItemsView = Ember.View.extend({ templateName: 'listItems' });

Perf.Result = Ember.Object.extend({
  init: function() {
    this.set('times', []);
  },

  geometricMean: function() {
    var result = 1;
    this.get('times').forEach(function (t) {
      result *= t;
    });
    return Math.pow(result, 1 / this.get('times.length'));
  }.property('times.@each'),

  mean: function() {
    var result = 0;
    this.get('times').forEach(function (t) {
      result += t;
    });
    return result / this.get('times.length');
  }.property('times.@each'),

  standardDeviation: function() {
    var result = 0,
         mean = this.get('mean');

    this.get('times').forEach(function (t) {
      result += Math.pow(t - mean, 2);
    });
    return result / this.get('times.length');
  }.property('mean'),

  start: function() {
    this.set('timeStart', new Date().getTime());
  },

  stop: function() {

    var timeStart = this.get('timeStart');
    if (timeStart) {
      this.get('times').pushObject(new Date().getTime() - timeStart);
      this.set('timeStart', null);
    }
  }
});

Perf.ApplicationController = Ember.ArrayController.extend({
  testsRun: 0,
  testCount: 0,

  clear: function() {
    this.get('model').clear();
  },

  profRenderList: function() {
    var self = this;

    var listItems = [];
    for (var i=0; i<1000; i++) {
      listItems.push("Item " + (i + 1));
    }

    this.profile("Render List", 20, function(result) {
      var promise = Ember.Deferred.create();

      self.set('listItems', listItems);
      Em.run.next(function() {
        // stop timing before we clean up
        result.stop();

        // clean up stuff
        self.set('listItems', null);
        promise.resolve();
      });

      return promise;
    });

  },

  profObjectCreate: function() {
    this.profile("Object.create()", 50, function() {
      for (var i=0; i<10000; i++) {
        var instance = Ember.Object.create({});
      }
    });
  },

  profileMethod: function(result, test) {
    var self = this;

    // Support promise profiles
    var complete = function() {
      result.stop();

      self.set('testsRun', self.get('testsRun') + 1);
      if (self.get('testsRun') === self.get('testCount')) {
        self.pushObject(result);
        self.set('profiling', false);
      } else {
        // We delay between each run to allow the browser to clean up and stuff.
        Em.run.later(self, 'profileMethod', result, test, 100);
      }
    }

    result.start();
    var testResult = test(result);
    if (testResult && testResult.then) {
      testResult.then(complete);
    } else {
      complete();
    }

  },

  profile: function(name, testRuns, test) {
    var self = this;

    self.setProperties({
      profiling: true,
      testsRun: 0,
      testCount: testRuns
    });

    var result = Perf.Result.create({name: name});

    Em.run.next(function () {
      self.profileMethod(result, test);
    });
  }

});