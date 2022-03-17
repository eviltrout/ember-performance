/* global RenderTemplateTestClient */

(function () {
  RenderTemplateTestClient.run({
    name: "Render Complex List (Glimmer Template-Only)",

    setup() {
      const EmberObject = require("@ember/object").default;
      const computed = require("@ember/object").computed;

      const MyThing = EmberObject.extend({
        d: computed("a", "b", function () {
          return this.get("a") + this.get("b");
        }),
      });

      let listItems = [];
      for (var i = 0; i < 50; i++) {
        listItems.pushObject(
          MyThing.create({
            a: "a" + i,
            b: "b" + i,
            c: "c" + i,
          })
        );
      }

      this.setupTemplateTest(
        "complex-list-main-wrapped",
        { items: listItems },
        { componentMode: "glimmer-template-only" }
      );

      this.registry.register(
        "template:components/component-render",
        this.template("complex-list-component-wrapped")
      );
      this.registry.register(
        "template:components/nested-component",
        this.template("complex-list-nested-wrapped")
      );
      this.registry.register(
        "template:components/buffer-render",
        this.template("complex-list-data-wrapped")
      );
    },

    reset() {
      this.hideComponent();
    },

    test() {
      this.showComponent();
    },
  });
})();
