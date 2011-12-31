(function(){

	var version = '0.1.1';

	var parser;
	var recoder;

	var root;

	if(typeof exports !== 'undefined'){
		if (typeof module !== 'undefined' && module.exports) {
	      root = exports = module.exports;
	    }
    	root = exports;
	}else{
		if(this.Mr == null) this.Mr = {};
		this.Mr.Async = root = {};
	}

	var path = './Recoder/';
	if(typeof require !== 'undefined'){
		parser = require(path + 'parser.js');
		recoder = require(path + 'Mr.Recoder.js');
	}else{
		if(this.UglifyJS != null){
			parser = this.UglifyJS;
		}
		if(this.Mr.Recoder != null){
			recoder = this.Mr.Recoder;
		}
	}

	if(parser == null || recoder == null) throw 'UglifyJS or Mr.Recoder required.';

	root.recode = function(func){
		if(typeof func != 'function')
			throw 'argument is not a function.';
		
		var methodName = 'func$$' + new Date().getTime();
		var codes = 'var ' + methodName + '=' + String(func) + ';' + methodName + '.apply(this, arguments);';
		var expressions = parser.parse(codes);
		recoder.reset();
		recoder.visit(expressions);
		return recoder.getCode();
	}
})();