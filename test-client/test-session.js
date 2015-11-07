(function() {
  const STORAGE_KEY = 'ember-performance-session';

  class TestItem {
    static build(testGroup, test) {
      let testItem = new TestItem();
      testItem.testGroup = testGroup;
      testItem.test = test;
      return testItem;
    }

    static deserialize(testGroup, data) {
      let testItem = new TestItem();
      testItem.testGroup = testGroup;
      testItem.test = data.test;
      testItem.result = data.result;
      return testItem;
    }

    serialize() {
      return {
        test: this.test,
        result: this.result
      };
    }
  }

  class TestGroup {
    constructor(options = {}) {
      this.testItems = [];
      this.currentTestItemIndex = 0;
      this.compiledTemplates = {};

      this.emberVersion = options.emberVersion;
      this.emberDataVersion = options.emberDataVersion;
      this.session = options.session;
    }

    static build(session, emberVersion, emberDataVersion, tests) {
      let testGroup = new TestGroup({
        session,
        emberVersion,
        emberDataVersion
      });

      tests.forEach(test => {
        testGroup.testItems.push(TestItem.build(testGroup, test));
      });

      return testGroup;
    }

    requiresTemplateCompilation() {
      return Object.keys(this.compiledTemplates).length === 0;
    }

    currentTestItem() {
      return this.testItems[this.currentTestItemIndex];
    }

    remainingTestCount() {
      return this.testItems.length - this.currentTestItemIndex;
    }

    isComplete() {
      return this.remainingTestCount() === 0;
    }

    progress() {
      this.currentTestItemIndex++;
    }

    getReport() {
      let results = [];
      this.testItems.forEach(testItem => {
        if (testItem.result) {
          results.push(testItem.result);
        }
      });
      return {
        id: this.id,
        emberVersion: this.emberVersion,
        emberDataVersion: this.emberDataVersion,
        results: results
      };
    }

    serialize() {
      return {
        id: this.id || TestGroup.generateUUID(),
        emberVersion: this.emberVersion,
        emberDataVersion: this.emberDataVersion,
        currentTestItemIndex: this.currentTestItemIndex,
        testItems: this.testItems.map(testItem => testItem.serialize()),
        compiledTemplates: this.compiledTemplates
      };
    };

    static deserialize(session, data) {
      let testGroup = new TestGroup();
      testGroup.id = data.id;
      testGroup.session = session;
      testGroup.emberVersion = data.emberVersion;
      testGroup.emberDataVersion = data.emberDataVersion;
      testGroup.currentTestItemIndex = data.currentTestItemIndex;
      testGroup.testItems = data.testItems.map(testItemData => {
        return TestItem.deserialize(this, testItemData);
      });

      testGroup.compiledTemplates = data.compiledTemplates;
      return testGroup;
    }

    static generateUUID() { // thanks http://stackoverflow.com/a/873856
      let s = [];
      let hexDigits = '0123456789abcdef';
      for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      return s.join("");
    }
  }

  class TestSession {
    constructor() {
      this.testGroups = [];
      this.currentTestGroupIndex = 0;
      this.enableProfile = false;
    }

    // A TestSession is the way we can perist the work we need to do between browser reloads
    serialize() {
      return {
        featureFlags: JSON.stringify(this.featureFlags),
        testGroups: this.testGroups.map(testGroup => testGroup.serialize()),
        currentTestGroupIndex: this.currentTestGroupIndex,
        enableProfile: this.enableProfile
      };
    }

    static deserialize(data) {
      let testSession = new this();
      // TODO: provide as part of the constructorth
      testSession.featureFlags = JSON.parse(data.featureFlags);

      if (data.testGroups) {
        data.testGroups.forEach(testGroupData => {
          testSession.testGroups.push(TestGroup.deserialize(this, testGroupData));
        });
      }

      testSession.currentTestGroupIndex = data.currentTestGroupIndex;
      testSession.enableProfile = data.enableProfile;
      return testSession;
    }

    static persist(session) {
      let toStore = JSON.stringify(session.serialize());
      localStorage.setItem(STORAGE_KEY, toStore);
    }

    static recover() {
      let toRestore = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!toRestore) { return; }

      return this.deserialize(toRestore);
    }

    getReport() {
      return {
        id: this.id,
        featureFlags: this.featureFlags,
        testGroupReports: this.testGroups.map(testGroup => testGroup.getReport())
      };
    }

    setup(emberVersions, emberDataVersions, tests) {
      this.testGroups = [];

      emberVersions.forEach(emberVersion => {
        if (emberDataVersions.length === 0) {
          this.testGroups.push(TestGroup.build(this, emberVersion, undefined, tests));
        } else {
          emberDataVersions.forEach(emberDataVersion => {
            this.testGroups.push(TestGroup.build(this, emberVersion, emberDataVersion, tests));
          });
        }
      });
    }

    progress() {
      let testGroup = this.currentTestGroup();
      testGroup.progress();

      if (testGroup.isComplete()) {
        this.currentTestGroupIndex++;
      }

      this.save();
    }

    save() {
      this.constructor.persist(this);
    }

    currentTestGroup() {
      return this.testGroups[this.currentTestGroupIndex];
    }

    currentTestItem() {
      return this.currentTestGroup().currentTestItem();
    }

    remainingTestCount() {
      return this.testGroups.reduce((sum, testGroup) => {
        return sum += testGroup.remainingTestCount();
      }, 0);
    }

    isComplete() {
      return this.remainingTestCount() === 0;
    }

    isTestEnabled(test) {
      let firstTestGroup = this.testGroups[0];

      if (firstTestGroup) {
        for (let i=0; i<firstTestGroup.testItems.length; i++) {
          let testItem = firstTestGroup.testItems[i];
          if (testItem.test.path === test.path) {
            return testItem.test.isEnabled;
          }
        }
        return false;
      } else {
        return true;
      }
    }

    isVersionEnabled(emberVersion) {
      for (let i=0; i<this.testGroups.length; i++) {
        let testGroup = this.testGroups[i];
        if (testGroup.emberVersion.name === emberVersion.name) {
          return true;
        }
      }
      return false;
    }

    getCompiledTemplate(templateName) {
      let compiled = this.currentTestGroup().compiledTemplates[templateName];
      if (!compiled) {
        throw 'Missing template ' + templateName;
      }
      return compiled;
    }

    goToNextUrl() {
      if (this.isComplete()) {
        document.location.href = '/';
      } else {
        var testGroup = this.currentTestGroup();
        if (testGroup.requiresTemplateCompilation()) {
          document.location.href =  '/compile-templates/index.html';
        } else {
          document.location.href = '/benchmarks' + this.currentTestItem().test.path + '/index.html';
        }
      }
    };
  }

  window.TestSession = TestSession;
})();
