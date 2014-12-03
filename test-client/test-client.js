/* global head, Benchmark, TestSession, RSVP */
(function() {

  var MACRO_MAX_TIME = 15000,
      MACRO_MIN_TIME = 2000,
      MACRO_STOP_RME = 3.0,
      MIN_SAMPLES = 5;

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
  function microBenchmark(t, testItem, complete) {
    update('status-text', "Running Micro Benchmark...");

    setTimeout(function() {
      var suite = new Benchmark.Suite();
      suite.add(t.name, t.test);
      suite.on('cycle', function(evt) {
        t.reset();
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

    var samples = [],
        sum = 0;

    var resetPromise = t.reset(),
        result = { name: t.name },
        startTime = new Date().getTime();

    var tester = function() {
      update('progress', "" + samples.length + " samples taken.");

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

  var TestClient = {
    run: function(t) {
      document.title = t.name;
      update('test-title', t.name);
      update('status-text', 'Loading...');

      // Recover our Test Session
      var session = TestSession.recover(),
          testItem,
          handlebarsUrl = "/ember/handlebars-v1.3.0.js",
          emberUrl = "/ember/1.8.1.js";

      if (session) {
        testItem = session.findItem(document.location.pathname);
        update('remaining-text', "" + session.remainingCount(testItem) + " test(s) remaining");
        handlebarsUrl = session.handlebarsUrl;
        emberUrl = session.emberUrl;
      }

      if (!t.reset) { t.reset = K; }

      var deps = [];
      if (!t.noEmber) {

        if (session && session.featureFlags && session.featureFlags.length) {
          var features = {};
          session.featureFlags.forEach(function(f) { features[f] = true; });
          window.EmberENV = { FEATURES: features };
        }
        deps = ["/ember/jquery-2.1.1.min.js", handlebarsUrl, emberUrl];
      }

      // Once the test completes
      var complete = function(result) {
        if (testItem) {
          result.name = t.name;
          testItem.addResult(result);
        } else {
          update('status-text', JSON.stringify(result));
        }

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
        if (session && !t.noEmber) {
          session.emberVersion = Ember.VERSION;
        }

        var promise;
        if (t.setup) {
          promise = t.setup();
        }
        if (!promise || !promise.then) {
          promise = RSVP.resolve();
        }

        promise.then(function() {
          if (t.microBench) {
            microBenchmark(t, testItem, complete);
          } else {
            macroBenchmark(t, testItem, complete);
          }
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
})();
