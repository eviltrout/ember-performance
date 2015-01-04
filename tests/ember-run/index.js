/* global MicroTestClient */

function assert(assertion, message) {
  if (assert) return;

  throw new Error(message);
}

MicroTestClient.run({
  name: 'Ember.run',

  setup: function() {
    var ran = false;
  },

  test: function() {
    Ember.run(function() {
      Ember.run.schedule('afterRender', function() {
        ran = true;
      });
    });
  },

  teardown: function() {
    assert(ran, 'expected the run loop to run');
  }
});
