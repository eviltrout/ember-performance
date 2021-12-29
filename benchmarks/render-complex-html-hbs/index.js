/* global TestClient */
(function () {
  var compiled;

  var templates = {
    "complex-list-main":
      "<div>" +
      "<ul>" +
      "{{#each items}}" +
      "<li>{{{raw 'complex-list-data' data=a}}} {{{raw 'complex-list-data' data=b}}} {{{raw 'complex-list-data' data=c}}} {{{raw 'complex-list-data' data=d}}}</li>" +
      "<li>{{{raw 'complex-list-data' data=a}}} {{{raw 'complex-list-data' data=b}}} {{{raw 'complex-list-data' data=c}}} {{{raw 'complex-list-data' data=d}}}</li>" +
      "<li>{{{raw 'complex-list-component' a=a b=b c=c d=d}}}</li>" +
      "<li>{{{raw 'complex-list-component' a=a b=b c=c d=d}}}</li>" +
      "{{/each}}" +
      "</ul>" +
      "</div>",

    "complex-list-component":
      "<div>" +
      "a: {{a}}" +
      "b: {{b}}" +
      "c: {{c}}" +
      "d: {{d}}" +
      "{{{raw 'complex-list-nested' a=a}}}" +
      "</div>",

    "complex-list-nested": "<div>a: {{a}}</div>",

    "complex-list-data": "<div>{{data}}</div>",
  };

  var compiledTemplates = {};

  var listItems = [];

  TestClient.run({
    name: "Render Complex List (Raw HBS)",

    setup: function () {
      const EmberObject = require("@ember/object").default;
      const computed = require("@ember/object").computed;

      const MyThing = EmberObject.extend({
        d: computed("a", "b", function () {
          return this.get("a") + this.get("b");
        }),
      });

      for (var i = 0; i < 50; i++) {
        listItems.pushObject(
          MyThing.create({
            a: "a" + i,
            b: "b" + i,
            c: "c" + i,
          })
        );
      }

      return $.getScript("/ember/handlebars.js").then(function () {
        Handlebars.registerHelper("raw", function (templateName, helper) {
          return compiledTemplates[templateName](helper.hash);
        });
        for (const templateName in templates) {
          compiledTemplates[templateName] = Handlebars.compile(
            templates[templateName]
          );
        }
      });
    },

    reset: function () {
      document.getElementById("scratch").innerHTML = "";
    },

    test: function () {
      document.getElementById("scratch").innerHTML = compiledTemplates[
        "complex-list-main"
      ]({
        items: listItems,
      });
    },
  });
})();
