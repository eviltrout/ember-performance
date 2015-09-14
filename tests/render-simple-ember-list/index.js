/* global RenderTemplateTestClient */

(function() {
  var template =
    "<table>" +
      "<tbody>" +
        "{{#each data.people as |p|}}" +
          "<tr>" +
            "<td class='name'>{{p.name}}</td>" +
            "<td class='email'>{{p.email}}</td>" +
          "</tr>" +
        "{{/each}}" +
      "</tbody>" +
    "</table>";

  RenderTemplateTestClient.run({
    name: 'Render Simple Ember List',

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
