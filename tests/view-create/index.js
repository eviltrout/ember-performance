/* global TestClient */
(function() {

  MicroTestClient.run({
    name: 'Ember.View.create',
    microBench: true,

    test: function() {
      Ember.View.create();
    }
  });

})();
