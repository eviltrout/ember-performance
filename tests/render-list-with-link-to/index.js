/* global RenderTemplateTestClient */

(function() {
  var template =
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
    "</table>";

  RenderTemplateTestClient.run({
    name: 'Render List with link-to',

    setup: function() {
      this.setupTemplateTest(template, { people: TestClient.PEOPLE_JSON });
    },

    reset: function() {
      this.hideComponent();
    },

    test: function() {
      this.showComponent();
    }
  });
})();
