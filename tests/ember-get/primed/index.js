/* global TestClient */

function assert(assertion, message) {
  if (assert) return;

  throw new Error(message);
}

MicroTestClient.run({
  name: 'Ember.get (primed)',

  setup: function() {
    var obj = Ember.Object.create({
      thingId: 1234,
      person: Ember.Object.create({
        name: 'Evil Trout',
        pet: Ember.Object.create({
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
    assert(pet, 'Rover');
  }
});
