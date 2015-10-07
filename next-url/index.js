(function() {
  var testSession = TestSession.recover();

  if(testSession.isComplete()) {
    document.location.href = "/";
  } else {
    var testGroup = testSession.currentTestGroup();
    if(testGroup.requiresTemplateCompilation()) {
      document.location.href =  "/compile-templates/index.html";
    } else {
      document.location.href = "/benchmarks" + testSession.currentTestItem().test.path + "/index.html";
    }
  }
})();
