/* global RenderTemplateTestClient */

(function() {
  var template =
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
    "</table>";

  RenderTemplateTestClient.run({
    name: 'Render List',

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
