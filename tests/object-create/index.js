/* global TestClient */
(function() {

  TestClient.run({
    name: 'Ember.Object.create',
    microBench: true,

    test: function() {
      TestClient.PEOPLE_JSON.forEach(function(p) {
        Ember.Object.create(p);
      });
    }
  });

})();
