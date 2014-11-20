/* global require, module */
var Filter = require('broccoli-filter'),
    fs = require('fs');

// Builds the index files for tests
var _indexTemplate;
function CopyIndex(inputTree, options) {
  if (!(this instanceof CopyIndex)) {
    return new CopyIndex(inputTree, options);
  }
  this.inputTree = inputTree;
  this.extensions = options.extensions;
}

CopyIndex.prototype = Object.create(Filter.prototype);
CopyIndex.prototype.constructor = CopyIndex;
CopyIndex.prototype.targetExtension = 'html';
CopyIndex.prototype.processString = function () {
  _indexTemplate = _indexTemplate || fs.readFileSync('./test-client/index-template.html', "utf8");
  return _indexTemplate;
};


module.exports = CopyIndex;
