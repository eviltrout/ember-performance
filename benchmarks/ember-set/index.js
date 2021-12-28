/* global TestClient */
function assert(assertion, message) {
  if (assertion) return;

  throw new Error(message);
}

MicroTestClient.run({
  name: 'Ember.set',

  setup: function() {
    const EmberObject = require("@ember/object").default;

    var obj = EmberObject.create({
      person: EmberObject.create({
        pet: EmberObject.create({ })
      })
    });

    assert(obj.get('thingId')         === undefined, 'thingId should not be set');
    assert(obj.get('person.name')     === undefined, 'person.name should not be set');
    assert(obj.get('person.pet.name') === undefined, 'person.pet.name should be undefined');

  },

  test: function() {
    obj.set('thingId', 1234);
    obj.set('person.name', 'Robin');
    obj.set('person.pet.name', 'Nibbler');
  },

  teardown: function() {
    assert(obj.get('thingId'),         1234);
    assert(obj.get('person.name'),     'Robin');
    assert(obj.get('person.pet.name'), 'Nibbler');
  }
});
