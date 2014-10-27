(function(Perf) {

  var _profilerDisplay;

  Perf.ProfilerDisplay = Ember.Object.extend({
    testsRun: Ember.computed.alias('currentProfiler.testsRun'),
    testCount: Ember.computed.alias('currentProfiler.testCount'),
    profiling: Ember.computed.alias('currentProfiler.profiling'),

    _initDisplay: function(){
      this.setProperties({ results: [], currentProfiler: null });
    }.on('init'),

    clearResults: function() {
      this.get('results').clear();
    },

    addResult: function(result){
      this.get('results').pushObject(result);
    }
  });

  Perf.ProfilerDisplay.reopenClass({
    instance: function() {
      if (!_profilerDisplay) { _profilerDisplay = Perf.ProfilerDisplay.create(); }
      return _profilerDisplay;
    }
  });

  Perf.Profiler = Ember.Object.extend({
    name:       Ember.required('You must set the name of each profile job.'),
    testCount:  Ember.required('You must override the number of runs for each profile job.'),

    setup:     Ember.K,
    test:      Ember.K,
    teardown:  Ember.K,

    init: function() {
      this.setProperties({
        testsRun: 0,
        profiling: false,
        display: Perf.ProfilerDisplay.instance()
      });
    },

    updateTestCount: function(){
      var display = this.get('display');

      this.set('testsRun', this.get('testsRun') + 1);
      display.set('restRun', this.get('testRun'));
    },

    profileMethod: function() {
      var self   = this,
          result = this.get('result');

      // Support promise profiles
      var complete = function() {
        result.stop();

        self.updateTestCount();
        if (self.get('testsRun') === self.get('testCount')) {
          self.get('display').addResult(result);
          self.get('display').set('currentProfiler', null);
          self.set('profiling', false);
          self.get('deferred').resolve();
        } else {
          // We delay between each run to allow the browser to clean up and stuff.
          Perf.scratchView.clear();
          Ember.run.later(self, 'profileMethod', 100);
        }
      };

      if(Perf.scratchView.get('length') > 0){
        // We delay between each run to allow the browser to clean up and stuff.
        Perf.scratchView.clear();
        Ember.run.later(self, 'profileMethod', 100);
        return;
      }

      result.start();
      var testResult = this.test();
      if (testResult && testResult.then) {
        testResult.then(complete);
      } else {
        complete();
      }
    },

    profile: function() {
      var self = this,
          deferred = Ember.RSVP.defer();

      self.setProperties({
        profiling: true,
        testsRun: 0,
        deferred: deferred
      });

      this.set('result', Perf.Result.create({name: this.get('name')}));
      this.get('display').set('currentProfiler', this);

      this.setup();
      Ember.run.next(function () {
        self.profileMethod();
      });

      return deferred.promise.then(function(){
        self.teardown();
      });
    },

    renderToScratch: function(template, args) {
      var viewArgs = {templateName: template};
      var view = Ember.View.create($.extend(viewArgs, args || {}));

      Perf.scratchView.pushObject(view);
      return view;
    }
  });

  Perf.Result = Ember.Object.extend({
    init: function() {
      this.set('times', []);
    },

    max: function() {
      return this.get('times').reduce(function (x,y) {
        return Math.max(x,y);
      });
    }.property('times.@each'),

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
    },

    runCount: function(){
      return this.get('times').length;
    }.property('times'),

    dump: function(){
      return this.getProperties('name', 'times', 'geometricMean', 'mean',
                                'standardDeviation', 'runCount');
    }.property('name', 'times', 'geometricMean', 'mean', 'standardDeviation', 'runCount')
  });

  Perf.Job = Ember.Object.extend({
    title: Ember.required('You must provide a title for each job.'),
  });
})(window.Perf);
