var _           = require('underscore');
require('datejs');
var swig        = require('swig');
var TwitterCldr = require('twitter_cldr');

var global_config = {
  default_language: 'en',
  debug: 0,
  currency: {
    precision: 2
  }
};

exports.init = function (config) {
  config = _.extend(global_config, config);
  
  /* Gives us a Cldr object based on language locale */
  var buildCldr = function(ctx) {
    var language = config.language;
    if (ctx && ctx.i18n && ctx.i18n.language){
      language = ctx.i18n.language;
    }
    var _cldr = TwitterCldr.load(language);
    return _cldr;
  };

  /* Does the swiggy code generation */
  var generateSwiggyOutput = function(compiler, args, content, parents, options, blockName) {
    var output = '_output += (function() {\n' +
        'var _output = "", _parsedThing = ' + args.shift() + ";\n" +
        compiler(content, parents, options, blockName) +
        'var result = _ext.' + this.varExt + '(_ctx, _parsedThing, _output);\n' +
        'return result;})();';
    return output;
  };

  var parseToken = function (token) {
    var match = token.match;
    this.out.push(match);
  };

  swig.setExtension('currency', function(ctx, currency ) {
    var cldr = buildCldr(ctx);

    if (!currency && ctx && ctx.i18n && ctx.i18n.currency_code){
      currency = ctx.i18n.currency_code;
    }

    var fmt = new cldr.CurrencyFormatter();
    return fmt.format(currency);
  });

  swig.setExtension('percentage', function(ctx, percentage) {
    var cldr = buildCldr(ctx);

    if (!percentage && ctx && ctx.i18n && ctx.i18n.percentage){
      percentage = ctx.i18n.percentage;
    }
    var fmt = new cldr.PercentFormatter();
    return fmt.format(percentage, {precision:config.currency.precision});
  });

  swig.setExtension('date', function(ctx, dateStr) {
    var cldr = buildCldr(ctx);
    var dateParsed = Date.parse(dateStr);
    var fmt = new cldr.DateTimeFormatter();
    return fmt.format(new Date(dateParsed), {"type": "short"});
  });
  
  swig.setTag('currency', function(str, line, parser, types) {
    parser.on(types.NUMBER, parseToken);
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  },
  function() {
    this.varExt = 'currency';
    return generateSwiggyOutput.apply(this,arguments);
  }, false, true);

  swig.setTag('percentage', function(str, line, parser, types) {
    parser.on(types.NUMBER, parseToken);
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  },function(){
    this.varExt = 'percentage';
    return generateSwiggyOutput.apply(this,arguments);
  },
  false, true);

  swig.setTag('date', function(str, line, parser, types) {
    parser.on(types.NUMBER, parseToken);
    parser.on(types.STRING, parseToken);
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  },function(){
    this.varExt = 'date';
    return generateSwiggyOutput.apply(this,arguments);
  },
  false, true);
};

