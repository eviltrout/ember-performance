(function() {
  var testSession = TestSession.recover();

  if(testSession.isComplete()) {
    document.location.href = "/";
  } else {
    var testGroup = testSession.currentTestGroup();
    if(testGroup.requiresTemplateCompilation()) {
      document.location.href =  "/compile-templates";
    } else {
      document.location.href = testSession.currentTestItem().test.path;
    }
  }
})();
