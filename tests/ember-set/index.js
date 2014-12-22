/* global TestClient */
(function() {

  MicroTestClient.run({
    name: 'Ember.set',

    setup: function() {
      var obj = Ember.Object.create({
        person: Ember.Object.create({
          pet: Ember.Object.create({ })
        })
      });
    },

    test: function() {
      obj.set('thingId', 1234);
      obj.set('person.name', 'Robin');
      obj.set('person.pet.name', 'Nibbler');
    }
  });

})();
