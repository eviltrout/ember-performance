(function() {
  var STORAGE_KEY = "ember-performance-session";

  // A TestItem represents a test we want to perform
  var TestItem = function() {};

  TestItem.build = function(testGroup, test) {
    var testItem = new TestItem();
    testItem.testGroup = testGroup;
    testItem.test = test;
    return testItem;
  };

  TestItem.prototype.serialize = function() {
    return {
      test: this.test,
      result: this.result
    };
  };

  TestItem.deserialize = function(testGroup, data) {
    var testItem = new TestItem();
    testItem.testGroup = testGroup;
    testItem.test = data.test;
    testItem.result = data.result;
    return testItem;
  };

  //A TestGroup represents a group of tests for a particular Ember version
  var TestGroup = function() {
    this.testItems = [];
    this.currentTestItemIndex = 0;
    this.compiledTemplates = {};
  };

  TestGroup.build = function(session, emberVersion, tests) {
    var testGroup = new TestGroup();
    testGroup.session = session;
    testGroup.emberVersion = emberVersion;

    tests.forEach(function(test) {
      testGroup.testItems.push(TestItem.build(testGroup, test));
    });

    return testGroup;
  };

  TestGroup.prototype.requiresTemplateCompilation = function() {
    return Object.keys(this.compiledTemplates).length === 0;
  };

  TestGroup.prototype.currentTestItem = function() {
    return this.testItems[this.currentTestItemIndex];
  };

  TestGroup.prototype.remainingTestCount = function() {
    return this.testItems.length - this.currentTestItemIndex;
  };

  TestGroup.prototype.isComplete = function() {
    return this.remainingTestCount() === 0;
  };

  TestGroup.prototype.progress = function() {
    this.currentTestItemIndex++;
  };

  TestGroup.prototype.getReport = function() {
    var results = [];
    this.testItems.forEach(function(testItem) {
      if (testItem.result) {
        results.push(testItem.result);
      }
    });
    return {
      emberVersion: this.emberVersion,
      results: results
    };
  };

  TestGroup.prototype.serialize = function() {
    return {
      emberVersion: this.emberVersion,
      currentTestItemIndex: this.currentTestItemIndex,
      testItems: this.testItems.map(function(testItem) {
        return testItem.serialize();
      }),
      compiledTemplates: this.compiledTemplates
    };
  };

  TestGroup.deserialize = function(session, data) {
    var self = this;
    var testGroup = new TestGroup();
    testGroup.session = session;
    testGroup.emberVersion = data.emberVersion;
    testGroup.currentTestItemIndex = data.currentTestItemIndex;
    testGroup.testItems = data.testItems.map(function(testItemData) {
      return TestItem.deserialize(self, testItemData);
    });

    testGroup.compiledTemplates = data.compiledTemplates;
    return testGroup;
  };

  // A TestSession is the way we can perist the work we need to do between browser reloads
  var TestSession = window.TestSession = function() {
    this.testGroups = [];
    this.currentTestGroupIndex = 0;
    this.enableProfile = false;
  };

  TestSession.prototype.serialize = function() {
    var result = {
      id: this.id || TestSession.generateUUID(),
      featureFlags: JSON.stringify(this.featureFlags),
      testGroups: this.testGroups.map(function(testGroup) {
        return testGroup.serialize();
      }),
      currentTestGroupIndex: this.currentTestGroupIndex,
      enableProfile: this.enableProfile
    };

    return result;
  };

  TestSession.deserialize = function(data) {
    var testSession = new TestSession();
    testSession.id = data.id;
    testSession.featureFlags = JSON.parse(data.featureFlags);

    if (data.testGroups) {
      var self = this;
      data.testGroups.forEach(function(testGroupData) {
        testSession.testGroups.push(TestGroup.deserialize(self, testGroupData));
      });
    }

    testSession.currentTestGroupIndex = data.currentTestGroupIndex;
    testSession.enableProfile = data.enableProfile;
    return testSession;
  };

  TestSession.persist = function(session) {
    var toStore = JSON.stringify(session.serialize());
    localStorage.setItem(STORAGE_KEY, toStore);
  };

  TestSession.recover = function() {
    var toRestore = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!toRestore) { return; }

    return TestSession.deserialize(toRestore);
  };

  TestSession.prototype.getReport = function() {
    var report = {
      id: this.id,
      featureFlags: this.featureFlags
    };
    report.testGroupReports = this.testGroups.map(function(testGroup) {
      return testGroup.getReport();
    });
    return report;
  };

  TestSession.prototype.setup = function(emberVersions, tests) {
    var self = this;
    this.testGroups = [];
    emberVersions.forEach(function(emberVersion) {
      self.testGroups.push(TestGroup.build(self, emberVersion, tests));
    });
  };

  TestSession.prototype.progress = function() {
    var testGroup = this.currentTestGroup();
    testGroup.progress();

    if(testGroup.isComplete()) {
      this.currentTestGroupIndex++;
    }

    this.save();
  };

  TestSession.prototype.save = function() {
    TestSession.persist(this);
  };

  TestSession.prototype.currentTestGroup = function() {
    return this.testGroups[this.currentTestGroupIndex];
  };

  TestSession.prototype.currentTestItem = function() {
    return this.currentTestGroup().currentTestItem();
  };

  TestSession.prototype.remainingTestCount = function() {
    var count = 0;

    this.testGroups.forEach(function(testGroup) {
      count += testGroup.remainingTestCount();
    });

    return count;
  };

  TestSession.prototype.isComplete = function() {
    return this.remainingTestCount() === 0;
  };

  TestSession.prototype.isTestEnabled = function(test) {
    var firstTestGroup = this.testGroups[0];

    if(firstTestGroup) {
      for (var i=0; i<firstTestGroup.testItems.length; i++) {
        var testItem = firstTestGroup.testItems[i];
        if(testItem.test.path === test.path) {
          return testItem.test.isEnabled;
        }
      }
      return false;
    } else {
      return true;
    }
  };

  TestSession.prototype.isVersionEnabled = function(emberVersion) {
    for (var i=0; i<this.testGroups.length; i++) {
      var testGroup = this.testGroups[i];
      if(testGroup.emberVersion.name === emberVersion.name) {
        return true;
      }
    }
    return false;
  };

  TestSession.prototype.getCompiledTemplate = function(templateName) {
    var compiled = this.currentTestGroup().compiledTemplates[templateName];
    if (!compiled) {
      throw "Missing template " + templateName;
    }
    return compiled;
  };

  TestSession.prototype.goToNextUrl = function() {
    if(this.isComplete()) {
      document.location.href = "/";
    } else {
      var testGroup = this.currentTestGroup();
      if(testGroup.requiresTemplateCompilation()) {
        document.location.href =  "/compile-templates/index.html";
      } else {
        document.location.href = "/benchmarks" + this.currentTestItem().test.path + "/index.html";
      }
    }
  };

  TestSession.generateUUID = function() { // thanks http://stackoverflow.com/a/873856
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    return s.join("");
  };
})();
