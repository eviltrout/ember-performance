/* global RenderTemplateTestClient */

(function() {
  var template = "{{link-to 'Howdy!' 'index'}}";

  RenderTemplateTestClient.run({
    name: 'Render link-to',

    setup: function() {
      this.setupTemplateTest(template);
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
