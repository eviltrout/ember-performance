/* global TestClient */
(function() {

  TestClient.run({
    name: 'Ember.Object.create',

    test: function() {
      TestClient.PEOPLE_JSON.forEach(function(p) {
        Ember.Object.create(p);
      });
    }
  });

})();
