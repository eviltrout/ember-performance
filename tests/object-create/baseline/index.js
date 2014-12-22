/* global TestClient */
(function() {

  MicroTestClient.run({
    name: 'Baseline: Object initialization',
    noEmber: true,

    setup: function() {
      function Klass() {

      }
    },

    test: function() {
      return new Klass();
    }
  });
})();
