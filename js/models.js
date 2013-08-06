Perf.Profiler = Ember.Object.extend({

  init: function() {
    this.setProperties({
      results: [],
      testsRun: 0,
      testCount: 0,
      profiling: false
    });
  },

  clearResults: function() {
    this.set('results', []);
  },


  profileMethod: function(result, test) {
    var self = this;

    // Support promise profiles
    var complete = function() {
      result.stop();

      self.set('testsRun', self.get('testsRun') + 1);
      if (self.get('testsRun') === self.get('testCount')) {
        self.get('results').pushObject(result);
        self.set('profiling', false);
        self.get('promise').resolve();
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
    var self = this,
        promise = Ember.Deferred.create();

    self.setProperties({
      profiling: true,
      testsRun: 0,
      testCount: testRuns,
      promise: promise
    });


    var result = Perf.Result.create({name: name});

    Em.run.next(function () {
      self.profileMethod(result, test);
    });

    return promise;
  }
});

Perf.Profiler.reopenClass({
  instance: function() {
    if (!this._profiler) { this._profiler = Perf.Profiler.create(); }
    return this._profiler;
  },

  profile: function() {
    var profiler = this.instance();
    return profiler.profile.apply(profiler, arguments);
  }
})


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
    return Math.sqrt(result / this.get('times.length'));
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