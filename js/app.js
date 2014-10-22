Perf = Ember.Application.create();

Perf.ApplicationRoute = Em.Route.extend({

  model: function() {
    return Perf.ProfilerDisplay.instance();
  },

  actions: {

    profObjectCreate: function() {
      Perf.ObjectCreateProfiler.create().profile();
    },

    profRenderList: function () {
      Perf.RenderListProfiler.create().profile();
    },

    profTemplateBindings: function() {
      Perf.TemplateBindingProfiler.create().profile();
    },

    profHtmlBindings: function() {
      Perf.HtmlBindingProfiler.create().profile();
    }

  }

});


Perf.ApplicationController = Ember.ObjectController.extend({

  clearResults: function() {
    this.get('model').clearResults();
  },

});
