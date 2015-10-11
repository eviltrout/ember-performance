import Ember from 'ember';

export default Ember.Controller.extend({
  init: function() {
    this._super.apply(this, arguments);

    this.report = null;
    this.sending = false;
    this.error = false;
    this.sent = false;
    this.featureFlags = null;
    this.newFlagName = null;
  },

  enabledTests: Ember.computed.filterBy('model', 'isEnabled', true),
  enabledEmberVersions: Ember.computed.filterBy('emberVersions', 'isEnabled', true),
  nonCustomEmberVersions: Ember.computed.filterBy('emberVersions', 'isCustom', false),
  addFeatureDisabled: Ember.computed.empty('newFlagName'),
  customEmberVersion: Ember.computed.reads('emberVersions.lastObject'),
  hasNoEnabledTests: Ember.computed.empty('enabledTests'),
  hasNoEnabledEmberVersions: Ember.computed.empty('enabledEmberVersions'),
  cantStart: Ember.computed.or('hasNoEnabledTests', 'hasNoEnabledEmberVersions'),

  run: function(options) {
    options = options || {};
    var enabledEmberVersions = this.get('enabledEmberVersions');
    var enabledTests = this.get('enabledTests');

    // Remember any custom urls we set for another run
    var customEmberVersion = this.get('customEmberVersion');
    if (customEmberVersion.isEnabled) {
      localStorage.setItem('ember-perf-ember-url', customEmberVersion.path);
      localStorage.setItem('ember-perf-compiler-url', customEmberVersion.compilerPath);
    } else {
      localStorage.removeItem('ember-perf-ember-url');
      localStorage.removeItem('ember-perf-compiler-url');
    }

    localStorage.setItem('ember-perf-flags', JSON.stringify(this.get('featureFlags')));

    var testSession = new window.TestSession();
    testSession.setup(enabledEmberVersions, enabledTests);
    testSession.featureFlags = this.get('featureFlags');
    testSession.enableProfile = options.enableProfile || false;
    testSession.save();

    testSession.goToNextUrl();
  },

  actions: {
    profile: function() {
      this.run({ enableProfile: true });
    },

    start: function() {
      this.run();
    },

    selectAllTests: function() {
      this.get('model').setEach('isEnabled', true);
    },

    selectNoTests: function() {
      this.get('model').setEach('isEnabled', false);
    },

    selectAllVersions: function() {
      this.get('nonCustomEmberVersions').setEach('isEnabled', true);
    },

    selectNoVersions: function() {
      this.get('emberVersions').setEach('isEnabled', false);
    },

    addFeature: function() {
      var f = this.get('newFlagName');
      if (f && f.length) {
        this.get('featureFlags').addObject(this.get('newFlagName'));
        this.set('newFlagName', '');
      }
    },

    removeFeature: function(f) {
      this.get('featureFlags').removeObject(f);
    }
  }
});
