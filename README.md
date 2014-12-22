### Ember Performance Suite

The Ember Performance Suite is designed to help profile and diagnose
the performance of the Ember.js framework. The general strategy is:

- Browsers have a large variance in performance characteristics, so
  run each test in a new document, storing the results in localStorage.

- Use benchmark.js for micro benchmarks and a different strategy for
  macro benchmarks.

- Record Baseline performance so that we can compare Ember to the
  baseline performance of the platform it's run on.

### Is your custom build crashing Safari during rendering tests?

There is a [known bug](https://bugs.webkit.org/show_bug.cgi?id=138038) with
Safari and `use strict`. Some versions of Ember (1.8.1 and greater)
have stripped out `use strict` to prevent it. Unfortunately, that fix
causes the Ember performance suite to crash after running repeatedly.

In particular the lack of `use strict` shortly after defining `ember-metal/mixin`
causes the crash. It has been added back in the builds of ember that
ship with the performance suite, but you might encounter it if you are
using a custom build.

### To run in development mode

1. `npm install`
2. `npm start`

And open a browser to http://localhost:4200

### To build for production mode

1. `npm install`
2. `bower install`
3. `broccoli build dist`

The compiled version will be in your `dist` folder

### To add a new test

Create a new directory under `tests`, for example `tests/my-test`
and define an `index.js` file that calls `TestClient.run`.

Example:

```javascript
TestClient.run({
  name: 'Ember.Object.create',
  microBench: true,

  test: function() {
    TestClient.PEOPLE_JSON.forEach(function(p) {
      Ember.Object.create(p);
    });
  }
});
```

(Please see the other tests for more examples.)

After you've created the test, add it to the manifest of tests in
`app/app.js`

### License

MIT

