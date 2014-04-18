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
    var generate_output_code = function (token) {
      var match = token.match;
      this.out.push(match);
    }

    parser.on(types.NUMBER, generate_output_code);
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  }, 
  function(compiler, args, content, parents, options, blockName) {
    var currency = args.shift();
    var output = '_output += (function() {\n' 
        + 'var _output = "", currency = ' + currency + ";\n" 
        + compiler(content, parents, options, blockName)
        + 'var currency_result = _ext.currency(_ctx, currency, _output);\n'
        + 'return currency_result;})();';
    return output;
  }, false, true);

  swig.setTag('percentage', function(str, line, parser, types) {
    var generate_output_code = function (token) {
      var match = token.match;
      this.out.push(match);
    }

    parser.on(types.NUMBER, generate_output_code);
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
    return true;
  }, 
  function(compiler, args, content, parents, options, blockName) {
    var percentage = args.shift();
    var output = '_output += (function() {\n' 
        + 'var _output = "", percentage = ' + percentage + ";\n" 
        + compiler(content, parents, options, blockName)
        + 'var percentage_result = _ext.percentage(_ctx, percentage, _output);\n'
        + 'return percentage_result;})();';
    return output;
  }, false, true);

}

