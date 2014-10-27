(function(exports) {
  var AsciiTable = exports.AsciiTable,
      roundedTime = exports.roundedTime,
      Perf = Ember.Application.create({});

  Perf.ScratchView = Ember.ContainerView.extend({
    didInsertElement: function(){
      Perf.scratchView = this;
    },
    classNames: ["scratch"]
  });

  Perf.ApplicationRoute = Ember.Route.extend({
    model: function() {
      return Perf.ProfilerDisplay.instance();
    }
  });

  Perf.ApplicationController = Ember.ObjectController.extend({
    version: Ember.VERSION,
    showAscii: false,
    selectedVersion: null,
    testVersion: null,
    versions: null,
    profileTypes: null,

    _appInit: function() {
      var versions = ["1.5.1", "1.5.1.min",
                      "1.6.1", "1.6.1.min",
                      "1.7.1", "1.7.1.min",
                      "1.8.0", "1.8.0.min", "1.8.0.patched",
                      "http://builds.emberjs.com/canary/ember.prod.js"];
      if(versions.indexOf(window.testVersion) === -1) {
        versions.push(window.testVersion);
      }

      var profileTypes = [];
      Ember.keys(Perf).forEach(function(k) {
        if (/[A-Za-z]+Profiler$/.test(k)) {
          var klass = Perf[k];
          profileTypes.push({ name: klass.create().get('name'), klass: klass });
        }
      });

      this.setProperties({
        testVersion: window.testVersion,
        versions: versions,
        selectedVersion: window.testVersion,
        profileTypes: profileTypes
      });
    }.on('init'),

    _selectedVersionChanged: function() {
      var version = this.get('selectedVersion');
      if (version !== this.get('testVersion')) {
        window.location.href = window.location.pathname + "?ember=" + this.get('selectedVersion');
      }
    }.observes('selectedVersion'),

    asciiTable: function() {
      var result = "Ember Version: " + this.get('version') + "\n";
      result += "User Agent: " + navigator.userAgent + "\n\n";

      var table = new AsciiTable('Ember Performance Suite - Results');
      table.setHeading('Name', '# Runs', 'Geo Mean', 'Mean', 'Std Dev', 'Max');
      this.get('results').forEach(function(r) {
        table.addRow(r.get('name'),
                     r.get('times.length'),
                     roundedTime(r.get('geometricMean')),
                     roundedTime(r.get('mean')),
                     roundedTime(r.get('standardDeviation')),
                     roundedTime(r.get('max')));
      });

      return result + table.toString();
    }.property('results.@each'),

    actions: {
      profile: function(klass) {
        klass.create().profile();
      },

      clearResults: function() {
        this.get('model').clearResults();
        this.set('showAscii', false);
      },

      showAscii: function() {
        this.toggleProperty('showAscii');
      }
    }
  });

  exports.Perf = Perf;
})(window);
