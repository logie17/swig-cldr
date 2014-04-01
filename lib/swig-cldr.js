var _           = require('underscore');
var swig        = require('swig');
var TwitterCldr = require('twitter_cldr');

exports.init = function (currency_formatters, next) {
  swig.setExtension('currency', function(ctx, currency, amt) {

    var language = 'en';
    if (ctx && ctx.i18n && ctx.i18n.language){
      language = ctx.i18n.language;
    }
    var cldr = TwitterCldr.load(language);
    if (!currency && ctx && ctx.i18n && ctx.i18n.currency){
      currency = ctx.i18n.currency;
    }
    var fmt = new cldr.CurrencyFormatter();
    return fmt.format(amt, {currency:currency});
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

}

