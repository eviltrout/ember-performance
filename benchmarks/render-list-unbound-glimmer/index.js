/* global RenderTemplateTestClient */

(function () {
  RenderTemplateTestClient.run({
    name: "Render List (Unbound) (Glimmer Template-Only)",

    setup: function () {
      this.setupTemplateTest(
        "render-list-unbound-wrapped",
        {
          people: TestClient.PEOPLE_JSON,
        },
        { componentMode: "glimmer-template-only" }
      );
    },

    reset: function () {
      this.hideComponent();
    },

    test: function () {
      this.showComponent();
    },
  });
})();
