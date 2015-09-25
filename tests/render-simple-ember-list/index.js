/* global RenderTemplateTestClient */

(function() {
  RenderTemplateTestClient.run({
    name: 'Render Simple Ember List',

    setup: function() {
      this.setupTemplateTest('render-simple-ember-list', { people: TestClient.PEOPLE_JSON });
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
