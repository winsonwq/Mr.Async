define(function(require, exports, module){

	var version = '0.3.1'; 

	var parser = require('./parser');
	var recoder = require('./Mr.Recoder');

	if(parser == null || recoder == null) throw 'UglifyJS or Mr.Recoder required.';

	exports.recode = function(func){
		if(typeof func != 'function')
			throw 'argument is not a function.';

		recoder.reset();
		
		var codes = [
			'(function(){',
				'var _ = this;',
				'return {',
					'start : function(){',
						'(' + String(func) + ').apply(_, arguments);',
					'}',
				'};',
			,'}).apply(this);'].join('');
		var expressions = parser.parse(codes);
		recoder.visit(expressions);
		return recoder.getCode();
	}
	
});