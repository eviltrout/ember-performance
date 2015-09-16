/* global RenderTemplateTestClient */

(function() {
  var template =
    "<ul>" +
      "{{#each data.items as |item|}}" +
        "<li>{{buffer-render data=item.a}} {{buffer-render data=item.b}} {{buffer-render data=item.c}} {{buffer-render data=item.d}}</li>" +
        "<li>{{buffer-render data=item.a}} {{buffer-render data=item.b}} {{buffer-render data=item.c}} {{buffer-render data=item.d}}</li>" +
        "<li>{{component-render a=item.a b=item.b c=item.c d=item.d}}</li>" +
        "<li>{{component-render a=item.a b=item.b c=item.c d=item.d}}</li>" +
      "{{/each}}" +
    "</ul>";

  var componentTemplate =
      "a: {{a}}" +
      "b: {{b}}" +
      "c: {{c}}" +
      "d: {{d}}" +
      "{{nested-component a=a}}";

  var nestedComponentTemplate = "a: {{a}}";

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

      this.setupTemplateTest(template, { items: listItems });

      this.registry.register('template:components/component-render', this.compile(componentTemplate));
      this.registry.register('template:components/nested-component', this.compile(nestedComponentTemplate));
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
