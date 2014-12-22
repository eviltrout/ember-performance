/* global TestClient */
(function() {

  MicroTestClient.run({
    name: 'Baseline: Object Create',
    noEmber: true,

    test: function() {
      Object.create();
    }
  });

})();
