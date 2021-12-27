### Ember Performance Suite

The Ember Performance Suite is designed to help profile and diagnose
the performance of the Ember.js framework. The general strategy is:

- Browsers have a large variance in performance characteristics, so
  run each test in a new document, storing the results in localStorage.

- Use benchmark.js for micro benchmarks and a different strategy for
  macro benchmarks.

- Record Baseline performance so that we can compare Ember to the
  baseline performance of the platform it's run on.

### bench.json

* name: humanized name
* description: TL;DR of the benchmark, sometimes notes can be handy to display
* keywords: these are meant to label/categorize tests, allowing tooling and users to quickly group and differentiate
* disabled: allows for a test to be entirely disabled

### To run in development mode

1. `npm install`
2. `npm install -g bower`
3. `bower install`
4. `npm run server`
5. `bin/launch-chrome http://localhost:4200`

### To build for production mode

1. `npm install`
2. `npm install -g bower`
3. `npm run prod-server`

And open a browser to http://localhost:4200

### Adding a new Ember Version

To add a new ember version, you'll need to build a production bundle.
Navigate to an empty scratch directory outside of this project, install
ember-cli, then run:
```bash
VERSION=4.0.1
ember new myapp --yarn --skip-git --skip-bower --no-welcome
cd myapp
yarn add -D ember-source@$VERSION
```

Edit `ember-cli-build.js` to disable minification and sourcemaps:

```javascript
let app = new EmberApp(defaults, {
  'ember-cli-terser': { enabled: false },
  sourcemaps: { enabled: false },
});
```

```bash
yarn build --target production
mv dist/assets/vendor-*.js ../../ember-performance/ember/ember-$VERSION.prod.js
mv node_modules/ember-source/dist/ember-template-compiler.js ../../ember-performance/ember/ember-$VERSION.template-compiler.js
```

### License

MIT
