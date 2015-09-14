/* global RenderTemplateTestClient */

(function() {
  var template =
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
    "</table>";

  RenderTemplateTestClient.run({
    name: 'Render List (Unbound)',

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
