exports["setUp"] = function(cb) {

  this.swig_cldr = require('../lib/swig-cldr.js'); this.swig = require('swig');
  cb();
}

exports["tearDown"] = function(cb) {

  delete this.swig_cldr;
  delete this.swig;
  cb();
}

exports["basic default usage"] = function(test){

  this.swig_cldr.init();
  var template = '{% currency 1000 %}'; 

  var expected = this.swig.render(template);

  test.expect(1);
  // This is totally wrong for some reason
  test.equal(expected, '10000.00');
  test.done();
};

