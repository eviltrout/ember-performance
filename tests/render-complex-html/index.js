/* global RenderTemplateTestClient */

(function() {
  var nestedComponentTemplate = "a: {{a}}";

  RenderTemplateTestClient.run({
    name: 'Render Complex List (HTML)',

    setup: function() {
      var MyThing = Ember.Object.extend({
        d: function() {
          return this.get("a") + this.get("b");
        }.property("a", "b")
      });

      var listItems = [];
      for (var i=0; i<50; i++) {
        listItems.pushObject(MyThing.create({
          a: "a" + i,
          b: "b" + i,
          c: "c" + i
        }));
      }

      this.setupTemplateTest('complex-list-main', { items: listItems });

      this.registry.register('template:components/component-render', this.template('complex-list-component'));
      this.registry.register('template:components/nested-component', this.template('complex-list-nested'));
      this.registry.register('template:components/buffer-render', this.template("complex-list-data"));
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
