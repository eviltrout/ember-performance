Perf = Ember.Application.create();

Ember.Handlebars.helper('time', function(value, options) {
  if (typeof value === "undefined" || value === 0) { return new Handlebars.SafeString("&mdash;"); }

  var rounded = Math.floor(value * 100) / 100;
  return new Handlebars.SafeString(rounded + 'ms');
});

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
    this.get('times').pushObject(new Date().getTime() - this.get('timeStart'));
  }
});

Perf.ApplicationController = Ember.ArrayController.extend({

  clear: function() {
    this.get('model').clear();
  },

  profObjectCreate: function() {
    this.profile("Object.create()", 50, function() {
      for (var i=0; i<10000; i++) {
        var instance = Ember.Object.create({});
      }
    });
  },

  profileMethod: function(result, test, moreTries) {
    result.start();
    test();
    result.stop();

    if (moreTries === 1) {
      this.pushObject(result);
      this.set('profiling', false);
    } else {
      // We delay between each run to allow the browser to clean up and stuff.
      Em.run.later(this, 'profileMethod', result, test, moreTries - 1, 10);
    }
  },

  profile: function(name, testRuns, test) {
    var self = this;

    self.set('profiling', true);
    var result = Perf.Result.create({name: name});

    Em.run.next(function () {
      self.profileMethod(result, test, testRuns);
    });
  }

});