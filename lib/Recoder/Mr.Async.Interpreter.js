define(function(require, exports){
	
	var parser = require('./parser');
	var recoder = require('./Mr.Recoder');

	if(parser == null || recoder == null) throw 'UglifyJS or Mr.Recoder required.';

	return { 
		recode : function(){
			var len = arguments.length, name, func;
			if(len > 2) {
				throw 'more than 2 arguments.';
			}else if(len == 2){
				name = arguments[0];
			}
			
			func = arguments[len - 1];
			
			if(typeof func != 'function')
				throw 'argument is not a function.';
			
			var code = [
				'(function(){',
					'var _ = this;',
					'return {',
						'start : function(){',
							'(' + String(func) + ').apply(_, arguments);',
						'}',
					'};',
				,'}).apply(this);'].join('');
				
			recoder.revisit(parser.parse(code), name);
			return recoder.getCode();
		}
	};
});