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

  var expected = this.swig.render(template, {locals:{i18n:{language: 'en'}}});

  test.expect(2);
  // This is totally wrong for some reason
  test.equal(expected, '10000.00');

  expected = this.swig.render(template, {locals:{i18n:{language: 'fr'}}});
  test.equal(expected, '0,00 1000');

  test.done();
};

