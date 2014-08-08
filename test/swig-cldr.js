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
  test.equal(expected, '$1,000.00');

  expected = this.swig.render(template, {locals:{i18n:{language: 'fr', currency_code: "EUR"}}});
  test.equal(expected, '1 000,00 €');

  test.done();
};

exports["percentage"] = function(test){

  this.swig_cldr.init();
  var template = '{% percentage 123445 %}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'en'}}});

  test.expect(2);
  // This is totally wrong for some reason
  test.equal(expected, '123,445.00%');

  expected = this.swig.render(template, {locals:{i18n:{language: 'fr'}}});
  test.equal(expected, '123 445,00 %');

  test.done();
};

exports["dates"] = function(test) {
  this.swig_cldr.init();

  var template = '{% date "July 8th, 2007" %}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'en'}}});

  test.expect(2);
  test.equal(expected, '7/8/07, 12:00 AM');

  expected = this.swig.render(template, {locals:{i18n:{language: 'fr'}}});
  test.equal(expected, '08/07/2007 00:00');

  test.done();

  
};

