(function() {

  var STORAGE_KEY = "ember-perf-session";

  // A TestItem represents a test we want to perform
  var TestItem = function(session, path) {
    this.session = session;
    this.path = path;
  };

  TestItem.prototype.addResult = function(r) {
    this.result = r;
    TestSession.persist(this.session);
  };

  TestItem.prototype.toJSON = function() {
    var ret = {path: this.path};
    if (this.result) { ret.result = this.result; }
    return ret;
  };

  // A TestSession is the way we can perist the work we need to do
  // between browser reloads
  var TestSession = function() {
    this._queue = [];
  };

  TestSession.prototype.toJSON = function() {
    var result = {
      emberUrl: this.emberUrl,
      compilerUrl: this.compilerUrl,
      emberVersion: this.emberVersion,
      featureFlags: JSON.stringify(this.featureFlags),
      queue: this._queue.map(function(it) {
        return it.toJSON();
      })
    };

    if (!result.id) {
      // thanks http://stackoverflow.com/a/873856
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      result.id = s.join("");
    }
    return result;
  };

  TestSession.prototype.fromJSON = function(json) {
    this.emberUrl = json.emberUrl;
    this.compilerUrl = json.compilerUrl;
    this.emberVersion = json.emberVersion;
    this.featureFlags = JSON.parse(json.featureFlags);
    this.id = json.id;
    if (json.queue) {
      var self = this;
      json.queue.forEach(function(itJson) {
        var it = new TestItem(self, itJson.path);
        if (itJson.result) {
          it.result = itJson.result;
        }
        self._queue.push(it);
      });
    }
  };

  TestSession.eject = function() {
    localStorage.removeItem(STORAGE_KEY);
  };

  TestSession.persist = function(session) {
    var toStore = JSON.stringify(session.toJSON());
    localStorage.setItem(STORAGE_KEY, toStore);
  };

  TestSession.recover = function() {
    var toRestore = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!toRestore) { return; }

    var session = new TestSession();
    session.fromJSON(toRestore);
    return session;
  };

  TestSession.prototype.report = function() {
    var res = [];
    this._queue.forEach(function(it) {
      if (it.result) {
        res.push(it.result);
      }
    });
    return { id: this.id,
             emberUrl: this.emberUrl,
             compilerUrl: this.compilerUrl,
             emberVersion: this.emberVersion,
             featureFlags: this.featureFlags,
             results: res };
  };

  TestSession.prototype.enqueuePaths = function(paths) {
    var self = this;
    paths.forEach(function(p) {
      self._queue.push(new TestItem(self, p));
    });
  };

  TestSession.prototype.remainingCount = function(except) {
    var count = 0;
    this._queue.forEach(function(it) {
      if (it !== except && !it.result) { count++; }
    });
    return count;
  };

  TestSession.prototype.findItem = function(path) {
    path = path.replace(/\/$/, '');
    for (var i=0; i<this._queue.length; i++) {
      var it = this._queue[i];
      if (it.path === path) { return it; }
    }
  };

  TestSession.prototype.nextTest = function() {
    // Return the first test without a result
    for (var i=0; i<this._queue.length; i++) {
      var it = this._queue[i];
      if (!it.result) { return it; }
    }
  };

  window.TestSession = TestSession;

})();
