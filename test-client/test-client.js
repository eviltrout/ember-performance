/* global head, Benchmark, TestSession */
(function() {

  function update(id, txt) {
    document.getElementById(id).innerText = txt;
  }

  var TestClient = {
    run: function(t) {
      document.title = t.name;
      update('test-title', t.name);
      update('status-text', 'Loading...');

      // Recover our Test Session
      var session = TestSession.recover(),
          testItem = session.findItem(document.location.pathname),
          remaining = session.remainingCount(testItem);

      update('remaining-text', "" + remaining + " test(s) remaining");

      var deps = [];
      if (!t.noEmber) {
        deps =["/ember/jquery-2.1.1.min.js", "/ember/handlebars-v1.3.0.js", "/ember/1.8.1.js"];
      }
      var runner = function() {
        update('status-text', "Profiling...");

        setTimeout(function() {
          var suite = new Benchmark.Suite();
          suite.add(t.name, t.test);
          suite.on('cycle', function(evt) {
            if (t.reset) { t.reset(); }

            if (testItem) {
              var result = evt.target;
              result.name = t.name;
              if (!t.noEmber) {
                result.emberVersion = Ember.VERSION;
              }
              testItem.addResult(result);

              var nextTest = session.nextTest();
              if (nextTest) {
                document.location.href = nextTest.path;
              } else {
                // When we're done go back to the root.
                document.location.href = "/";
              }
            } else {
              update('status-text', String(evt.target));
            }
          });
          suite.on('error', function(evt) {
            var err = evt.target.error;
            update('status-text', "Error: " + err.message);
            throw err;
          });
          suite.run();
        }, 100);
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
