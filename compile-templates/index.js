(function () {
  var templates = {
    base:
      "{{#if this.showContents}}{{benchmarked-component data=this.data}}{{/if}}",

    "render-list":
      "<table>" +
      "<tbody>" +
      "{{#each @data.people as |p|}}" +
      "<tr>" +
      "<td class='name'>{{p.name}}</td>" +
      "<td class='email'>{{p.email}}</td>" +
      "{{#let p.company as |company|}}" +
      "<td class='company'>{{p.company}}</td>" +
      "{{/let}}" +
      "{{#if p.city}}" +
      "<td class='city'>{{p.city}}</td>" +
      "<td class='url'><a href='{{p.url}}'>Link</a></td>" +
      "{{/if}}" +
      "</tr>" +
      "{{/each}}" +
      "</tbody>" +
      "</table>",

    "render-simple-ember-list":
      "<table>" +
      "<tbody>" +
      "{{#each @data.people as |p|}}" +
      "<tr>" +
      "<td class='name'>{{p.name}}</td>" +
      "<td class='email'>{{p.email}}</td>" +
      "</tr>" +
      "{{/each}}" +
      "</tbody>" +
      "</table>",

    "render-list-link-to":
      "<table>" +
      "<tbody>" +
      "{{#each @data.people as |p|}}" +
      "<tr>" +
      "<td class='name'>{{p.name}}</td>" +
      "<td class='email'>{{p.email}}</td>" +
      "<td class='email'>{{#link-to route='index'}}{{p.name}}{{/link-to}}</td>" +
      "</tr>" +
      "{{/each}}" +
      "</tbody>" +
      "</table>",

    "link-template": "{{#link-to route='index'}}Howdy!{{/link-to}}",

    "render-list-unbound":
      "<table>" +
      "<tbody>" +
      "{{#each @data.people as |p|}}" +
      "<td class='name'>{{unbound p.name}}</td>" +
      "<td class='email'>{{unbound p.email}}</td>" +
      "<td class='company'>{{unbound p.company}}</td>" +
      "<td class='city'>{{unbound p.city}}</td>" +
      "<td class='url'><a href='{{unbound p.url}}'>Link</a></td>" +
      "{{/each}}" +
      "</tbody>" +
      "</table>",

    "complex-list-main":
      "<ul>" +
      "{{#each @data.items as |item|}}" +
      "<li>{{buffer-render data=item.a}} {{buffer-render data=item.b}} {{buffer-render data=item.c}} {{buffer-render data=item.d}}</li>" +
      "<li>{{buffer-render data=item.a}} {{buffer-render data=item.b}} {{buffer-render data=item.c}} {{buffer-render data=item.d}}</li>" +
      "<li>{{component-render a=item.a b=item.b c=item.c d=item.d}}</li>" +
      "<li>{{component-render a=item.a b=item.b c=item.c d=item.d}}</li>" +
      "{{/each}}" +
      "</ul>",

    "complex-list-component":
      "a: {{@a}}" +
      "b: {{@b}}" +
      "c: {{@c}}" +
      "d: {{@d}}" +
      "{{nested-component a=@a}}",

    "complex-list-nested": "a: {{@a}}",

    "complex-list-data": "{{@data}}",
  };

  // Generate div-wrapped versions of each template
  // so that glimmer template-only tests can be compared fairly
  // with regular Ember components
  for (k in templates) {
    if (k === "base") continue;
    templates[k + "-wrapped"] = "<div>" + templates[k] + "</div>";
  }

  var testSession = TestSession.recover();
  var testGroup = testSession.currentTestGroup();

  if (testGroup.emberVersion.name === "3.8.3") {
    // This old version doesn't support kwargs in {{#link-to}}
    for (k in templates) {
      templates[k] = templates[k].replace("#link-to route=", "#link-to ");
    }
  }

  head.load("/ember/loader.js", function () {
    head.load(testGroup.emberVersion.compilerPath, function () {
      testGroup.compiledTemplates = {};

      let precompile;
      if (require.entries["ember-template-compiler/index"]) {
        precompile = require("ember-template-compiler/index").precompile;
      } else {
        precompile = Ember.Handlebars.precompile;
      }
      Object.keys(templates).forEach(function (key) {
        testGroup.compiledTemplates[key] = precompile(templates[key], false);
      });
      testSession.save();

      testSession.goToNextUrl();
    });
  });
})();
