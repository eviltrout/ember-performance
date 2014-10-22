/**
  Renders a list of items, then changes them all.
**/
Perf.TemplateBindingProfiler = Perf.Profiler.extend({
  testCount: 40,
  name: 'Template Bindings',
  lastAge: 1,

  setup: function(){
    var people = [];

    for (var i=0; i<500; i++) {
      people.push(Em.Object.create({name: "Person " + i, age: this.nextAge()}));
    }

    var templateBindingsView = this.renderToScratch('templateBindings', {people: people});

    this.set('people', people);
    this.set('templateBindingsView', templateBindingsView);
  },

  test: function() {
    var promise              = Ember.RSVP.defer(),
        people               = this.get('people'),
        result               = this.get('result'),
        templateBindingsView = this.get('templateBindingsView');

    for (var i=0; i<people.length; i++) {
      people[i].set('age', this.nextAge());
    }

    Em.run.next(function() {
      result.stop();

      // clean up stuff
      promise.resolve();
    });

    return promise;
  },

  teardown: function(){
    this.get('templateBindingsView').destroy();
  },

  nextAge: function() {
    this.incrementProperty('lastAge');
    if (this.get('lastAge') > 99) { this.set('lastAge', 1); }

    return this.get('lastAge');
  }

});
