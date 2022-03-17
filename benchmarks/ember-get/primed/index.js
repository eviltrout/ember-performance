/* global TestClient */

function assert(assertion, message) {
  if (assert) return;

  throw new Error(message);
}

MicroTestClient.run({
  name: 'Ember.get (primed)',

  setup: function() {
    const EmberObject = require("@ember/object").default;

    var obj = EmberObject.create({
      thingId: 1234,
      person: EmberObject.create({
        name: 'Evil Trout',
        pet: EmberObject.create({
          name: 'Rover'
        })
      })
    });

    obj.get('thingId');
    obj.get('person.name');
    obj.get('person.pet.name');
  },

  test: function() {
    var thingId  = obj.get('thingId');
    var personName = obj.get('person.name');
    var petName = obj.get('person.pet.name');
  },

  teardown: function() {
    assert(thingId, 1234);
    assert(personName, 'Evil Trout');
    assert(petName, 'Rover');
  }
});
