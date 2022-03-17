/* global TestClient */

MicroTestClient.run({
  name: 'Ember.set (primed)',

  setup: function() {
    const EmberObject = require("@ember/object").default;

    var obj = EmberObject.create({
      person: EmberObject.create({
        pet: EmberObject.create({ })
      })
    });

    obj.set('thingId', 1234);
    obj.set('person.name', 'Robin');
    obj.set('person.pet.name', 'Nibbler');
  },

  test: function() {
    obj.set('thingId', 1234);
    obj.set('person.name', 'Robin');
    obj.set('person.pet.name', 'Nibbler');
  }
});
