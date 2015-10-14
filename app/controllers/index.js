import Ember from 'ember';

const {
  computed: {
    filterBy,
    empty,
    reads,
    or
  }
} = Ember;

export default Ember.Controller.extend({
  init() {
    this._super(...arguments);

    this.report = null;
    this.sending = false;
    this.error = false;
    this.sent = false;
    this.featureFlags = null;
    this.newFlagName = null;
  },

  enabledTests: filterBy('model', 'isEnabled', true),
  enabledEmberVersions: filterBy('emberVersions', 'isEnabled', true),
  nonCustomEmberVersions: filterBy('emberVersions', 'isCustom', false),
  addFeatureDisabled: empty('newFlagName'),
  customEmberVersion: reads('emberVersions.lastObject'),
  hasNoEnabledTests: empty('enabledTests'),
  hasNoEnabledEmberVersions: empty('enabledEmberVersions'),
  cantStart: or('hasNoEnabledTests', 'hasNoEnabledEmberVersions'),

  run(options = {}) {
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
    profile() {
      this.run({ enableProfile: true });
    },

    start() {
      this.run();
    },

    selectAllTests() {
      this.get('model').setEach('isEnabled', true);
    },

    selectNoTests() {
      this.get('model').setEach('isEnabled', false);
    },

    selectAllVersions() {
      this.get('nonCustomEmberVersions').setEach('isEnabled', true);
    },

    selectNoVersions() {
      this.get('emberVersions').setEach('isEnabled', false);
    },

    addFeature() {
      var f = this.get('newFlagName');
      if (f && f.length) {
        this.get('featureFlags').addObject(this.get('newFlagName'));
        this.set('newFlagName', '');
      }
    },

    removeFeature(f) {
      this.get('featureFlags').removeObject(f);
    }
  }
});
