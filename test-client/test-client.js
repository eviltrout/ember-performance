/* global head, Benchmark, TestSession, RSVP */
(function() {

  var MACRO_MAX_TIME = 15000;
  var MACRO_MIN_TIME = 2000;
  var MACRO_STOP_RME = 3.0;
  var MIN_SAMPLES    = 5;

  /**
   * T-Distribution two-tailed critical values for 95% confidence
   * http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
   */
  var tTable = {
    '1':  12.706,'2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
    '7':  2.365, '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
    '13': 2.16,  '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
    '19': 2.093, '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
    '25': 2.06,  '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
    'infinity': 1.96
  };

  function K() { }

  function update(id, txt) {
    document.getElementById(id).innerText = txt;
  }

  // Use benchmark.js to run a microbenchmark
  function microBenchmark(test, complete) {
    update('status-text', "Running Micro Benchmark...");

    setTimeout(function() {
      var suite = new Benchmark.Suite();

      suite.add(test.name, test.test, {
        setup: test.setup,
        distribution: test.distribution
      });

      suite.on('cycle', function(evt) {
        test.reset();

        var r = evt.target;
        complete({
          name: r.name,
          hz: r.hz,
          rme: r.stats.rme,
          deviation: r.stats.deviation,
          mean: r.stats.mean,
          samples: r.stats.sample.length,
          emberVersion: r.emberVersion,
          createdAt: new Date()
        });
      });

      suite.on('error', function(evt) {
        var err = evt.target.error;
        update('status-text', "Error: " + err.message);
        throw err;
      });

      suite.run();
    }, 100);
  }

  // Run a macro benchmark until our error threshold is low or our
  // MACRO_MAX_TIME expires
  function macroBenchmark(t, testItem, complete) {
    update('status-text', "Running Benchmark...");

    var samples = [];
    var sum = 0;

    var resetPromise = t.reset();
    var result = { name: t.name };
    var startTime = new Date().getTime();

    var tester = function() {
      update('progress', '' + samples.length + ' samples taken.');

      var t1 = new Date().getTime(),
          promise = t.test();

      if (!promise || !promise.then) {
        promise = new RSVP.resolve();
      }

      promise.then(function() {
        var elapsed = new Date().getTime() - t1,
            nextPromise = t.reset();

        sum += elapsed;
        samples.push(elapsed);

        result.mean = (sum / samples.length);
        var squareSum = 0;
        for (var j=0; j<samples.length; j++) {
          var diff = samples[j] - result.mean;
          squareSum += (diff * diff);
        }
        result.deviation = (squareSum / samples.length);
        var standardErr = result.deviation / Math.sqrt(samples.length),
            critical = tTable[Math.round(result.samples - 1) || 1] || tTable.infinity;

        result.rme = ((standardErr * critical) / result.mean) * 100 || 0;
        result.samples = samples.length;
        result.hz = (1000.0 / result.mean);

        var totalEllapsed = (new Date().getTime() - startTime);

        var next = function() {
          // Loop until the min time is passed and the rme is low, or the max time ellapsed
          if ((samples.length < MIN_SAMPLES) || ((totalEllapsed < MACRO_MIN_TIME || result.rme > MACRO_STOP_RME) && (totalEllapsed < MACRO_MAX_TIME))) {
            setTimeout(tester, 10);
          } else {
            complete(result);
          }
        };

        if (nextPromise && nextPromise.then) {
          nextPromise.then(next);
        } else {
          next();
        }
      });
    };

    if (resetPromise && resetPromise.then) {
      resetPromise.then(function() {
        setTimeout(tester, 10);
      });
    } else {
      setTimeout(tester, 10);
    }
  }

  function TestClient(test) {
    this.name = test.name;
    this.options = test;

    this.setup = test.setup || function() { };
    this.reset = test.reset || function() { };
    this.test  = test.test  || function() { };

    this.noEmber = test.noEmber;
  }

  TestClient.run = function(test) {
    new this(test).start();
  };

  TestClient.prototype = {
    updateTitle: function() {
      document.title = this.name;
      update('test-title', this.name);
    },

    run: function(complete) {
      macroBenchmark(this, this.testItem, complete);
    },

    recoverSession: function() {
  // Recover our Test Session
      var session = this.session = TestSession.recover();

      if (session) {
        this.testItem = session.findItem(document.location.pathname);

        update('remaining-text', "" + session.remainingCount(this.testItem) + " test(s) remaining");

        this.handlebarsUrl = session.handlebarsUrl;
        this.emberUrl = session.emberUrl;
      } else {
        this.handlebarsUrl = "/ember/handlebars-v1.3.0.js";
        this.emberUrl = "/ember/1.8.1.js";
      }
    },

    start: function() {
      update('status-text', 'Loading...');

      this.recoverSession();

      var deps = [];

      if (!this.noEmber) {
        if (this.session && this.session.featureFlags && this.session.featureFlags.length) {
          var features = {};
          this.session.featureFlags.forEach(function(f) {
            features[f] = true;
          });
          window.EmberENV = {
            FEATURES: features
          };
        }

        deps = [
          '/ember/jquery-2.1.1.min.js',
          this.handlebarsUrl,
          this.emberUrl
        ];
      }

      var test  = this;

      // Once the test completes
      var complete = function(result) {
        var testItem = test.testItem;
        if (testItem) {
          result.name = test.name;
          testItem.addResult(result);
        } else {
          update('status-text', JSON.stringify(result));
        }

        update('status-text', JSON.stringify(result));

        var session = test.session;
        if (!session) { return; }
        var nextTest = session.nextTest();
        if (nextTest) {
          document.location.href = nextTest.path;
        } else {
          // When we're done go back to the root.
          document.location.href = "/";
        }
      };

      // What to run when our dependencies have loaded
      var runner = function() {
        // Record the ember version used
        if (test.session && !test.noEmber) {
          test.session.emberVersion = Ember.VERSION;
        }

        RSVP.Promise.resolve(test.setup()).then(function() {
          return test.run(complete);
        });
      };

      if (deps.length) {
        head.load(deps, runner);
      } else {
        runner();
      }
    }
  };

  window.TestClient = TestClient;

  function MicroTestClient(test) {
    TestClient.call(this, test);
  }

  MicroTestClient.run = TestClient.run;

  MicroTestClient.prototype = Object.create(TestClient.prototype);
  MicroTestClient.prototype.run = function(complete) {
    microBenchmark(this, complete);
  }

  window.MicroTestClient = MicroTestClient;

})();
