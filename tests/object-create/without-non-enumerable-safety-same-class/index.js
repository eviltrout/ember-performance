/* global TestClient */
var S;
function makeS() {
  if (S) { return S;}
  S = Ember.Object.extend({
    __defineNonEnumerable: function(property) {
      this[property.name] = property.descriptor.value;
    }
  });

  S.create();
  return S;
}

MicroTestClient.run({
  name: 'Ember.Object.create (without non-enumerable safety but same class)[Common Case]',

  setup: function() {
    var Subclass = makeS();
  },

  test: function() {
    Subclass.create();
  }
});
