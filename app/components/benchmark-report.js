import Ember from 'ember';
import numeral from 'numeral';

const {
  computed,
  computed: { equal, gt }
} = Ember;

export default Ember.Component.extend({
  ajax: Ember.inject.service(),
  mode: 'html',
  isHtmlMode: equal('mode', 'html'),
  isTextMode: equal('mode', 'text'),
  canSubmitStats: gt('report.testGroupReports.length', 0),
  showGraph: gt('report.testGroupReports.length', 1),

  groupedTests: computed('report.testGroupReports.[]', function() {
    var tests = {};
    this.get('report.testGroupReports').forEach((testGroupReport) => {
      testGroupReport.results.forEach((result) => {
        var test = tests[result.name] || {
          name: result.name,
          data: [],
          chartData: [["Ember Version", "Time in ms (lower is better)"]]
        };
        test.data.push({
          emberVersion: testGroupReport.emberVersion,
          result: result
        });
        test.chartData.push([testGroupReport.emberVersion.name, result.mean]);

        tests[result.name] = test;
      });
    });

    return tests;
  }),

  asciiTable: computed('report.testGroupReports.[]', function() {
    var result = 'User Agent: ' + navigator.userAgent + '\n';

    var featureFlags = this.get('report.featureFlags');
    if (featureFlags && featureFlags.length) {
      result += 'Feature Flags: ' + featureFlags.join(', ') + '\n';
    }
    result += '\n';

    var table = new window.AsciiTable('Ember Performance Suite - Results');

    table.setHeading('Name', 'Speed', 'Error', 'Samples', 'Mean');

    this.get('report.testGroupReports').forEach(testGroupReport => {
      table.addRow(' -- Ember ' + testGroupReport.emberVersion.name + ' -- ');

      testGroupReport.results.forEach(result => {
        table.addRow(result.name,
                     numeral(result.hz).format('0,0.00') + ' / sec',
                     '∓' + numeral(result.rme).format('0,0.00') + '%',
                     numeral(result.samples).format(),
                     numeral(result.mean).format('0,0.00') + ' ms');
      });
    });

    return result + table.toString();
  }),

  remoteReports: computed('report.testGroupReports.[]', function() {
    var featureFlags = this.get('report.featureFlags');

    return this.get('report.testGroupReports').map(testGroupReport => {
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
  }),

  actions: {
    switchMode(mode) {
      this.set('mode', mode);
    },

    submitResults() {
      var ajax = this.get('ajax');

      this.setProperties({
        sending: true,
        error: false
      });

      var reports = this.get('remoteReports').map(remoteReport => {
        return ajax.request('http://perflogger.eviltrout.com/api/results', {
          type: 'POST',
          data: { results: JSON.stringify(remoteReport) }
        });
      });

      Ember.RSVP.Promise.all(reports).
        then(() => this.set('sent', true)).
        catch(() => this.set('error', true)).
        finally(() => this.set('sending', false));
    },
  }
});
