/* global RenderTemplateTestClient */

(function () {
  var nestedComponentTemplate = "a: {{a}}";

  RenderTemplateTestClient.run({
    name: "Render Complex List (HTML)",

    setup() {
      const MyThing = Ember.Object.extend({
        d: Ember.computed("a", "b", function () {
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
    },

    reset() {
      this.hideComponent();
    },

    test() {
      this.showComponent();
    },
  });
})();
