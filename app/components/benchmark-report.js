import Ember from 'ember';
import numeral from 'numeral';

var EMBER_PERF_VERSION = "0.9.2"; // TODO: get from package.json

export default Ember.Component.extend({
  mode: 'html',
  isHtmlMode: Ember.computed.equal('mode', 'html'),
  isTextMode: Ember.computed.equal('mode', 'text'),
  canSubmitStats: Ember.computed.equal('report.testGroupReports.length', 1),

  asciiTable: function() {
    var result = 'User Agent: ' + navigator.userAgent + "\n";

    var featureFlags = this.get('report.featureFlags');
    if (featureFlags && featureFlags.length) {
      result += 'Feature Flags: ' + featureFlags.join(', ') + "\n";
    }
    result += '\n';

    var table = new window.AsciiTable('Ember Performance Suite - Results');
    table.setHeading('Name', 'Speed', 'Error', 'Samples', 'Mean');

    this.get('report.testGroupReports').forEach(function(testGroupReport) {
      table.addRow(" -- Ember " + testGroupReport.emberVersion.name + " -- ");

      testGroupReport.results.forEach(function(result) {
        table.addRow(result.name,
                     numeral(result.hz).format("0.00") + " / sec",
                     "∓" + numeral(result.rme).format("0.00") + "%",
                     numeral(result.samples).format(),
                     numeral(result.mean).format("0.00") + " ms");
      });
    });

    return result + table.toString();
  }.property('report.testGroupReports.[]'),

  actions: {
    switchMode: function(mode) {
      this.set('mode', mode);
    },
    submitResults: function() {
      var controller = this;

      this.set('sending', true);
      this.set('error', false);

      var reportJson = this.get('report'); //TODO: GJ: fix this https://github.com/eviltrout/ember-performance/issues/69
      reportJson.emberPerfVersion = EMBER_PERF_VERSION;

      new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
          url: 'http://perflogger.eviltrout.com/api/results',
          type: 'POST',
          data: { results: JSON.stringify(reportJson) },
          success: function(result) {
            Ember.run(null, resolve, result);
          },
          error: function(result) {
            Ember.run(null, reject, result);
          }
        });
      }).then(function() {
        controller.set('sent', true);
      }).catch(function() {
        controller.set('error', true);
      }).finally(function() {
        controller.set('sending', false);
      });
    },
  }
});
