/* global RenderTemplateTestClient */

(function() {
  RenderTemplateTestClient.run({
    name: 'Render Complex List',

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
      this.registry.register('component:buffer-render', Ember.Component.extend({
        render: function(buffer) {
          buffer.push(this.get('data'));
        }
      }));
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
