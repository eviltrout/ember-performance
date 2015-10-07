(function() {
  var templates = {
    "base": '{{#if showContents}}{{benchmarked-component data=data}}{{/if}}',

    "render-list":
      "<table>" +
        "<tbody>" +
          "{{#each data.people as |p|}}" +
            "<tr>" +
              "<td class='name'>{{p.name}}</td>" +
              "<td class='email'>{{p.email}}</td>" +
              "{{#with p.company as |company|}}" +
                "<td class='company'>{{p.company}}</td>" +
              "{{/with}}" +
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
          "{{#each data.people as |p|}}" +
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
          "{{#each data.people as |p|}}" +
            "<tr>" +
              "<td class='name'>{{p.name}}</td>" +
              "<td class='email'>{{p.email}}</td>" +
              "<td class='email'>{{link-to p.name 'index'}}</td>" +
            "</tr>" +
          "{{/each}}" +
        "</tbody>" +
      "</table>",

    "link-template":
      "{{link-to 'Howdy!' 'index'}}",

    "render-list-unbound":
      "<table>" +
        "<tbody>" +
          "{{#each data.people as |p|}}" +
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
        "{{#each data.items as |item|}}" +
          "<li>{{buffer-render data=item.a}} {{buffer-render data=item.b}} {{buffer-render data=item.c}} {{buffer-render data=item.d}}</li>" +
          "<li>{{buffer-render data=item.a}} {{buffer-render data=item.b}} {{buffer-render data=item.c}} {{buffer-render data=item.d}}</li>" +
          "<li>{{component-render a=item.a b=item.b c=item.c d=item.d}}</li>" +
          "<li>{{component-render a=item.a b=item.b c=item.c d=item.d}}</li>" +
        "{{/each}}" +
      "</ul>",

    "complex-list-component":
      "a: {{a}}" +
      "b: {{b}}" +
      "c: {{c}}" +
      "d: {{d}}" +
      "{{nested-component a=a}}",

    "complex-list-nested":
      "a: {{a}}",

    "complex-list-data":
      "{{data}}"
  };

  var testSession = TestSession.recover();
  var testGroup = testSession.currentTestGroup();

  head.load(testGroup.emberVersion.compilerPath, function() {
    testGroup.compiledTemplates = {};

    Object.keys(templates).forEach(function(key) {
      testGroup.compiledTemplates[key] = Ember.Handlebars.precompile(templates[key], false);
    });
    testSession.save();

    document.location.href =  "/next-url";
  });
})();
