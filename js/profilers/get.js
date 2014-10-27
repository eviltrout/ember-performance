(function(Perf) {
  Perf.GetProfiler = Perf.Profiler.extend({
    testCount: 50,
    name: 'Ember.Get',

    setup: function() {
      this._object = Ember.Object.create({foo: 1});
      this._object.set("child", Ember.Object.create({bar: 1}));
      this._object.set("child.grandChild", Ember.Object.create({baz: 1}));
    },

    test: function() {
      for (var i=0; i<10000; i++) {
        Ember.get(this._object, 'child.grandChild.baz');
        Ember.get(this._object, 'child.bar');
      }
    }
  });
})(window.Perf);
