/* global TestClient */
MicroTestClient.run({
  name: 'link-to get(\'active\')',

  setup: function() {
    var Router = Ember.Router.extend();

    Router.map(function() {
      this.route('foo');
    });

    var link = Ember.LinkView.create({
      router: Router.create(),
      params: ['foo','bar', 'baz']
    });

    window.link = link; // hack
  },

  test: function() {
    link.get('active');
  }
});
