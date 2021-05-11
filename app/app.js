import Ember from "ember";
import Resolver from "./resolver";
import loadInitializers from "ember-load-initializers";
import config from "./config/environment";

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

export let version;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  init() {
    this._super(...arguments);
    version = this.version;
  },
});

loadInitializers(App, config.modulePrefix);

export default App;
