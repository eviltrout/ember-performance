/* global TestClient */
MicroTestClient.run({
  name: 'DS.Model._create',
  setup: function() {
    var Model = DS.Model.extend({});
  },

  test: function() {
    Model._create();
  }
});
