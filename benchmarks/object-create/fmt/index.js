/* global TestClient */

MicroTestClient.run({
  name: 'Ember.Component.fmt',
  setup: function() {
    var Component = Ember.Component.extend({
      name: null,
      age: null,
      greeting: Ember.computed('name', 'age', function() {
        return "hi %@, you are %@".fmt(this.get('name'), this.get('age'));
      }),
      // greeting2: Ember.computed('name', 'age', function() {
      //   return 'hi ' + this.get('name') + ', you are ' + this.get('age');
      // })
    });
  },

  test: function() {
    var c = Component.create({ name: 'Gavin', age: 38 });
    var greeting = c.get('greeting');
  }
});
