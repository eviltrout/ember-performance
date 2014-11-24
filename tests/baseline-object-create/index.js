/* global TestClient */
(function() {

  TestClient.run({
    name: 'Baseline: Object Create',
    microBench: true,
    noEmber: true,

    test: function() {
      TestClient.PEOPLE_JSON.forEach(function(p) {
        Object.create(p);
      });
    }
  });

})();
