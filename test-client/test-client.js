/* global Benchmark */
(function() {
  window.TestClient = {
    run: function(t) {

      document.title = t.name;
      document.getElementById('test-title').innerText = t.name;
      document.getElementById('status-text').innerText = "Profiling...";

      setTimeout(function() {
        var suite = new Benchmark.Suite();
        suite.add(t.name, t.test);
        suite.on('cycle', function(event) {
          if (t.reset) { t.reset(); }
          document.getElementById('status-text').innerText = String(event.target);
        });
        suite.run();
      }, 100);
    }
  };
})();
