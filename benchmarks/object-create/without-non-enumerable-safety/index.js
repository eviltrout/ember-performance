/* global TestClient */
MicroTestClient.run({
  name: 'Ember.Object.create (without non-enumerable safety)',

  setup: function() {
    var Subclass = Ember.Object.extend({
      __defineNonEnumerable: function(property) {
        this[property.name] = property.descriptor.value;
      }
    });
  },

  test: function() {
    Subclass.create();
  }
});
