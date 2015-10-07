/* global RenderTemplateTestClient */

(function() {
  RenderTemplateTestClient.run({
    name: 'Render List',

    setup: function() {
      this.setupTemplateTest('render-list', { people: TestClient.PEOPLE_JSON });
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
