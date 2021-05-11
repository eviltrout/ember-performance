import Ember from "ember";
import numeral from "numeral";
import { version } from "ember-performance/app";

const {
  computed,
  computed: { equal, gt },
} = Ember;

export default Ember.Component.extend({
  ajax: Ember.inject.service(),
  mode: "html",
  isHtmlMode: equal("mode", "html"),
  isTextMode: equal("mode", "text"),
  showGraph: gt("report.testGroupReports.length", 1),

  groupedTests: computed("report.testGroupReports.[]", function () {
    var tests = {};
    this.get("report.testGroupReports").forEach((testGroupReport) => {
      testGroupReport.results.forEach((result) => {
        var test = tests[result.name] || {
          name: result.name,
          data: [],
          chartData: [["Ember Version", "Time in ms (lower is better)"]],
        };
        test.data.push({
          emberVersion: testGroupReport.emberVersion,
          result: result,
        });
        test.chartData.push([testGroupReport.emberVersion.name, result.mean]);

        tests[result.name] = test;
      });
    });

    return tests;
  }),

  asciiTable: computed("report.testGroupReports.[]", function () {
    var result = "User Agent: " + navigator.userAgent + "\n";

    var featureFlags = this.get("report.featureFlags");
    if (featureFlags && featureFlags.length) {
      result += "Feature Flags: " + featureFlags.join(", ") + "\n";
    }
    result += "\n";

    var table = new window.AsciiTable("Ember Performance Suite - Results");

    table.setHeading("Name", "Speed", "Error", "Samples", "Mean");

    this.get("report.testGroupReports").forEach((testGroupReport) => {
      table.addRow(" -- Ember " + testGroupReport.emberVersion.name + " -- ");

      testGroupReport.results.forEach((result) => {
        table.addRow(
          result.name,
          numeral(result.hz).format("0,0.00") + " / sec",
          "∓" + numeral(result.rme).format("0,0.00") + "%",
          numeral(result.samples).format(),
          numeral(result.mean).format("0,0.00") + " ms"
        );
      });
    });

    return result + table.toString();
  }),

  actions: {
    switchMode(mode) {
      this.set("mode", mode);
    },
  },
});
