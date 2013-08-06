Ember.Handlebars.helper('time', function(value, options) {
  if (typeof value === "undefined" || value === 0) { return new Handlebars.SafeString("&mdash;"); }
  var rounded = Math.floor(value * 100) / 100;
  return new Handlebars.SafeString(rounded + 'ms');
});
