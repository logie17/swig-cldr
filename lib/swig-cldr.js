var _           = require('underscore');
var swig        = require('swig');
var TwitterCldr = require('twitter_cldr');

var global_config = {
  default_language: 'en',
  debug: 0
};

exports.init = function (config, next) {
  config = _.extend(global_config, config);
  var Cldr = function(ctx) {
    var language = config.language;
    if (ctx && ctx.i18n && ctx.i18n.language){
      language = ctx.i18n.language;
    }
    _cldr = TwitterCldr.load(language);
    return _cldr;
  };

  var generateOutput = function(compiler, args, content, parents, options, blockName) {
    var parsed_thing = args.shift();
    var output = '_output += (function() {\n' 
        + 'var _output = "", parsed_thing = ' + parsed_thing + ";\n" 
        + compiler(content, parents, options, blockName)
        + 'var percentage_result = _ext.' + this.var_ext + '(_ctx, parsed_thing, _output);\n'
        + 'return percentage_result;})();';
    return output;
  };

  var generateOutputCode = function (token) {
    var match = token.match;
    this.out.push(match);
  }

  swig.setExtension('currency', function(ctx, currency ) {
    var cldr = Cldr(ctx);

    if (!currency && ctx && ctx.i18n && ctx.i18n.currency_code){
      currency = ctx.i18n.currency_code;
    }

    var fmt = new cldr.CurrencyFormatter();
    return fmt.format(currency);
  });

  swig.setExtension('percentage', function(ctx, percentage) {
    var cldr = Cldr(ctx);

    if (!percentage && ctx && ctx.i18n && ctx.i18n.percentage){
      percentage = ctx.i18n.percentage;
    }
    var fmt = new cldr.PercentFormatter();
    return fmt.format(percentage, {precision:2});
  });
  
  swig.setTag('currency', function(str, line, parser, types) {
    parser.on(types.NUMBER, generateOutputCode);
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  }, 
  function() {
    this.var_ext = 'currency'; 
    return generateOutput.apply(this,arguments);
  }, false, true);

  swig.setTag('percentage', function(str, line, parser, types) {
    parser.on(types.NUMBER, generateOutputCode);
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  },function(){
    this.var_ext = 'percentage'; 
    return generateOutput.apply(this,arguments);
  },
  false, true);


}

