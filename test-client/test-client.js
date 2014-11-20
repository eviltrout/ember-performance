/* global head, Benchmark */
(function() {

  function updateStatus(txt) {
    document.getElementById('status-text').innerText = txt;
  }

  window.TestClient = {
    run: function(t) {
      document.title = t.name;
      document.getElementById('test-title').innerText = t.name;
      updateStatus('Loading...');

      var deps = [];
      if (!t.noEmber) {
        deps =["/ember/jquery-2.1.1.min.js", "/ember/handlebars-v1.3.0.js", "/ember/1.8.1.js"];
      }
      var runner = function() {
        updateStatus("Profiling...");

        setTimeout(function() {
          var suite = new Benchmark.Suite();
          suite.add(t.name, t.test);
          suite.on('cycle', function(evt) {
            if (t.reset) { t.reset(); }
            updateStatus(String(evt.target));
          });
          suite.on('error', function(evt) {
            var err = evt.target.error;
            updateStatus("Error: " + err.message);
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
})();
