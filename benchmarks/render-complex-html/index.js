/* global RenderTemplateTestClient */

(function () {
  RenderTemplateTestClient.run({
    name: "Render Complex List (HTML)",

    setup() {
      const EmberObject = require("@ember/object").default;
      const Component = require("@ember/component").default;
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

      this.setupTemplateTest("complex-list-main", { items: listItems });

      this.registry.register(
        "template:components/component-render",
        this.template("complex-list-component")
      );
      this.registry.register(
        "template:components/nested-component",
        this.template("complex-list-nested")
      );
      this.registry.register(
        "template:components/buffer-render",
        this.template("complex-list-data")
      );

      // Default for template-only components is Glimmer
      // We want to use classic components for this benchmark
      this.registry.register(
        "component:component-render",
        Component.extend({})
      );
      this.registry.register(
        "component:nested-component",
        Component.extend({})
      );
      this.registry.register("component:buffer-render", Component.extend({}));
    },

    reset() {
      this.hideComponent();
    },

    test() {
      this.showComponent();
    },
  });
})();
