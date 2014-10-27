(function(exports) {
  var AsciiTable = exports.AsciiTable,
      roundedTime = exports.roundedTime,
      Perf = Ember.Application.create({});

  Perf.ScratchView = Ember.ContainerView.extend({
    didInsertElement: function(){
      window.Perf.scratchView = this;
    },
    classNames: ["scratch"]
  });

  Perf.ApplicationRoute = Ember.Route.extend({
    model: function() {
      return Perf.ProfilerDisplay.instance();
    },

    actions: {
      profObjectCreate: function() {
        Perf.ObjectCreateProfiler.create().profile();
      },

      profGet: function() {
        Perf.GetProfiler.create().profile();
      },

      profRenderList: function () {
        Perf.RenderListProfiler.create().profile();
      },

      profTemplateBindings: function() {
        Perf.TemplateBindingProfiler.create().profile();
      },

      profHtmlBindings: function() {
        Perf.HtmlBindingProfiler.create().profile();
      },

      profComplexList: function() {
        Perf.ComplexListProfiler.create().profile();
      }
    }
  });

  Perf.ApplicationController = Ember.ObjectController.extend({
    version: Ember.VERSION,
    showAscii: false,

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
