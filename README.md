### Ember Performance Suite

The Ember Performance Suite is designed to help profile and diagnose
the performance of the Ember.js framework. The general strategy is:

- Browsers have a large variance in performance characteristics, so
  run each test in a new document, storing the results in localStorage.

- Use benchmark.js for micro benchmarks and a different strategy for
  macro benchmarks.

- Record Baseline performance so that we can compare Ember to the
  baseline performance of the platform it's run on.

### To run in development mode

1. `npm install`
2. `bower install`
3. `broccoli serve`

And open a browser to http://localhost:4200

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

