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

  function hide(id){
    document.getElementById(id).style.display = 'none';
  }

  function show(id) {
    document.getElementById(id).style.display = 'block';
  }

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Use benchmark.js to run a microbenchmark
  function microBenchmark(test) {
    return new RSVP.Promise(function(resolve) {
      update('status-text', "Running Micro Benchmark...");

      setTimeout(function() {
        var suite = new Benchmark.Suite();

        suite.add(test.name, test.test, {
          setup: test.setup,
          distribution: test.distribution,
          teardown: test.teardown
        });

        suite.on('cycle', function(evt) {
          test.reset();

          var r = evt.target;
          resolve({
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
    });
  }

  // Run a macro benchmark until our error threshold is low or our
  // MACRO_MAX_TIME expires
  function macroBenchmark(t) {
    return new RSVP.Promise(function(resolve) {
      update('status-text', "Running Benchmark...");

      var samples = [];
      var sum = 0;

      var resetPromise = t.reset();
      var result = { name: t.name };
      var startTime = new Date().getTime();

      var tester = function() {
        update('progress', '' + samples.length + ' samples taken.');

        var t1 = new Date().getTime();

        RSVP.Promise.resolve(t.test()).then(function() {
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
            if ((samples.length < MIN_SAMPLES) ||
                ((totalEllapsed < MACRO_MIN_TIME || result.rme > MACRO_STOP_RME) &&
                 (totalEllapsed < MACRO_MAX_TIME))) {
              setTimeout(tester, 10);
            } else {
              resolve(result);
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
    });
  }

  class TestClient {
    constructor(test) {
      this.name = test.name;
      this.options = test;

      this.setup = test.setup || K;
      this.reset = test.reset || K; // remove this in-favour of teardown
      this.test  = test.test  || K;
      this.teardown = test.teardown || function() { };

      this.noEmber = test.noEmber;
    }

    static run(test) {
      let  session = TestSession.recover();
      if (session.enableProfile) {
        buildProfileClient(this, test).start();
      } else {
        new this(test).start();
      }
    }

    template(templateName) {
      let compiled = this.session.getCompiledTemplate(templateName);
      return Ember.Handlebars.template(eval(compiled));
    }

    updateTitle() {
      document.title = this.name;
      update('test-title', this.name);
    }

    run() {
      return macroBenchmark(this, this.testItem);
    }

    profile() {
      return new RSVP.Promise((resolve) => {
        // Why on earth do we reset before we run?, must be a mistake?
        let resetPromise = this.reset();

        let tester =() => {
          let result = this.test();

          if (typeof result === 'object' && typeof result.then === 'function') {
            // we should chain these promises correctly
            RSVP.Promise.resolve(result).then(() => {
              console.profileEnd();
              resolve({ skipRedirect: true });
            });
          } else {
            console.profile(test.name);
            resolve({ skipRedirect: true });
          }
        };

        if (resetPromise && resetPromise.then) {
          resetPromise.then(() => {
            setTimeout(tester, 10);
          });
        } else {
          setTimeout(tester, 10);
        }
      });
    }

    recoverSession() {
      let session = this.session = TestSession.recover();
      let testGroup = session.currentTestGroup();

      if (session) {
        this.testItem = session.currentTestItem();

        update('remaining-text', session.remainingTestCount() + " test(s) remaining");
        this.emberUrl = testGroup.emberVersion.path;
        this.emberDataUrl = testGroup.emberDataVersion && testGroup.emberDataVersion.path;
        update('ember-version', testGroup.emberVersion.name);
        var emberData =testGroup.emberDataVersion;
        if (emberData) {
          show('ember-data-version-container');
          update('ember-data-version', emberData.name);
        } else {
          hide('ember-data-version-container');
        }
      } else {
        hide('ember-data-version-container');
        this.emberUrl = "/ember/1.8.1.js";
      }
    }

    start() {
      update('status-text', 'Loading...');
      this.recoverSession();

      let deps = [];

      if (!this.noEmber) {
        if (this.session && this.session.featureFlags && this.session.featureFlags.length) {
          let features = {};
          this.session.featureFlags.forEach(f => features[f] = true);
          window.EmberENV = {
            FEATURES: features
          };
        }

        deps = [
          '/ember/jquery-2.1.1.min.js',
          this.emberUrl,
          this.emberDataUrl
        ].filter(Boolean);
      }

      // Once the test completes
      let complete = (result) => {
        this.testItem.result = result;
        this.session.progress();
        this.session.goToNextUrl();
      };

      // What to run when our dependencies have loaded
      let runner = () => {
        RSVP.Promise.resolve(this.setup()).
          then(() => this.run()).
          then(complete).
          catch(error => console.error(error));
      };

      if (deps.length) {
        head.load(deps, runner);
      } else {
        runner();
      }
    }
  }

  window.TestClient = TestClient;

  class MicroTestClient extends TestClient {
    run() {
      return microBenchmark(this);
    }

    profile() {
      let setup = functionToString(this.setup);
      let test = functionToString(this.test);
      let teardown = functionToString(this.teardown);

      let functionSpec = '' +
        setup + '\n' +
        'console.profile("' + this.name + '");\n' +
        test + '\n' +
        'console.profileEnd();\n' +
        teardown +  '\n';

      let run = new Function(functionSpec);

      return new RSVP.Promise((resolve) => {
        setTimeout(() => {
          run();
          resolve({
            skipRedirect: true
          });
        }, 10);
      });
    }
  }

  window.MicroTestClient = MicroTestClient;

  function buildProfileClient(Klass, test) {
    var runner = new Klass(test);
    runner.run = runner.profile;
    return runner;
  }

  function functionToString(fn) {
    var string = fn.toString();
    string = (/^[^{]+\{([\s\S]*)}\s*$/.exec(string) || 0)[1];
      string = (string || '').replace(/^\s+|\s+$/g, '');
      return string;
    }

    class RenderTemplateTestClient extends TestClient {
      setupTemplateTest(templateName, data) {
        this.app = Ember.Application.create({ rootElement: '#scratch' });
        this.app.deferReadiness();

        this.registry = this.app.__registry__ || this.app.registry;

        this.registry.register('controller:index', Ember.Controller.extend());
        this.registry.register('template:index', this.template('base'));
        this.registry.register('template:components/benchmarked-component', this.template(templateName));

        Ember.run(this.app, 'advanceReadiness');

        this.controller = this.app.__container__.lookup('controller:index');
        this.controller.set('data', data);
      }

      hideComponent() {
        Ember.run(() => this.controller.set('showContents', false));
      }

      showComponent() {
        Ember.run(() => this.controller.set('showContents', true));
      }
    }

    window.RenderTemplateTestClient = RenderTemplateTestClient;
  })();
