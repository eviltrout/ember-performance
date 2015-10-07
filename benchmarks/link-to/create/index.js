/* global TestClient */
MicroTestClient.run({
  name: 'Ember.LinkView.create',
  test: function() {
    var LinkView = Ember.LinkView || Ember.LinkComponent;
    LinkView.create();
  }
});
