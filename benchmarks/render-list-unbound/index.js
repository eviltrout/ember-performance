/* global RenderTemplateTestClient */

(function() {

  RenderTemplateTestClient.run({
    name: 'Render List (Unbound)',

    setup: function() {
      this.setupTemplateTest('render-list-unbound', { people: TestClient.PEOPLE_JSON });
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
