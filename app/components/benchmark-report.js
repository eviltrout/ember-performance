import Ember from 'ember';
import numeral from 'numeral';

export default Ember.Component.extend({
  ajax: Ember.inject.service(),
  mode: 'html',
  isHtmlMode: Ember.computed.equal('mode', 'html'),
  isTextMode: Ember.computed.equal('mode', 'text'),
  canSubmitStats: Ember.computed.gt('report.testGroupReports.length', 0),
  showGraph: Ember.computed.gt('report.testGroupReports.length', 1),

  groupedTests: function() {
    var tests = {};
    this.get('report.testGroupReports').forEach(function(testGroupReport) {
      testGroupReport.results.forEach(function(result) {
        var test = tests[result.name] || { name: result.name, data: [], chartData: [["Ember Version", "Time in ms (lower is better)"]] };
        test.data.push({
          emberVersion: testGroupReport.emberVersion,
          result: result
        });
        test.chartData.push([testGroupReport.emberVersion.name, result.mean]);

        tests[result.name] = test;
      });
    });

    return tests;
  }.property('report.testGroupReports.[]'),

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
                     numeral(result.hz).format("0,0.00") + " / sec",
                     "∓" + numeral(result.rme).format("0,0.00") + "%",
                     numeral(result.samples).format(),
                     numeral(result.mean).format("0,0.00") + " ms");
      });
    });

    return result + table.toString();
  }.property('report.testGroupReports.[]'),

  remoteReports: function() {
    var featureFlags = this.get('report.featureFlags');

    return this.get('report.testGroupReports').map(function(testGroupReport) {
      return {
        id: testGroupReport.id,
        emberUrl: testGroupReport.emberVersion.path,
        compilerUrl: testGroupReport.emberVersion.compilerPath,
        emberVersion: testGroupReport.emberVersion.name,
        featureFlags: featureFlags,
        results: testGroupReport.results,
        emberPerfVersion: window.EmberPerformance.version
      };
    });
  }.property('report.testGroupReports.[]'),

  actions: {
    switchMode: function(mode) {
      this.set('mode', mode);
    },
    submitResults: function() {
      var ajax = this.get('ajax');
      var self = this;

      this.setProperties({
        sending: true,
        error: false
      });

      var promises = this.get('remoteReports').map(function(remoteReport) {
        return ajax.request('http://perflogger.eviltrout.com/api/results', {
          type: 'POST',
          data: { results: JSON.stringify(remoteReport) }
        });
      })

      Ember.RSVP.all(promises).then(function() {
        self.set('sent', true);
      }).catch(function() {
        self.set('error', true);
      }).finally(function() {
        self.set('sending', false);
      });
    },
  }
});
