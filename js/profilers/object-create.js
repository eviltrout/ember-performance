(function(Perf) {

  // Profiles the creation of Ember.Objects.
  Perf.ObjectCreateProfiler = Perf.Profiler.extend({
    testCount: 50,
    name: 'Object.create()',

    test: function() {
      for (var i=0; i<10000; i++) {
        Ember.Object.create();
      }
    }
  });

})(window.Perf);
