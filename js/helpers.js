window.roundedTime = function(ms) {
  if (typeof ms === "undefined" || ms === 0) { return undefined; }
  var rounded = Math.floor(ms * 100) / 100;
  return rounded.toString() + 'ms';
};

Ember.Handlebars.helper('time', function(value, options) {
  return new Handlebars.SafeString(roundedTime(value) || "&mdash;");
});
