/* global TestClient */
(function() {

  TestClient.run({
    name: 'Ember.Object.create',
    microBench: true,

    test: function() {
      Ember.Object.create();
    }
  });

})();
