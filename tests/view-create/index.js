/* global TestClient */
(function() {

  TestClient.run({
    name: 'Ember.View.create',
    microBench: true,

    test: function() {
      TestClient.PEOPLE_JSON.forEach(function(p) {
        Ember.View.create();
      });
    }
  });

})();
