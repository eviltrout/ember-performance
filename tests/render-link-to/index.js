/* global RenderTemplateTestClient */

(function() {
  RenderTemplateTestClient.run({
    name: 'Render link-to',

    setup: function() {
      this.setupTemplateTest('link-template');
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
