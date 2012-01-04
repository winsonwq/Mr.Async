(function(){

	var version = '0.1.1';
	var root;
	var EV;

	if(typeof require !== 'undefined'){
		EV = require('./ExpressionVisitor.js');
	}else if(this.EV != null){
		EV = this.EV;
	}

	if(EV == null){
		throw 'need ExpressionVisitor.js';
	}

	if (typeof exports !== 'undefined') {
	    if (typeof module !== 'undefined' && module.exports) {
	    	root = exports = module.exports;
	    }
    	root = exports;
	} else if (typeof define === 'function' && define.amd) {
		define('Mr.Recoder', function() {
			return root;
		});
	} else {
		if(this.Mr == null) this.Mr = {};
		this.Mr.Recoder = root = {};
	}

	var ev = EV.extend({
		visitForLoop : function(expression, base){
			var cnt = this._needToRecode(expression);
			if(cnt){
				this._recodeLoop(expression[2], expression[4], expression[1], expression[3], expression[5]);
				return expression;
			}
			return base(expression);
		},
		visitDoWhileLoop : function(expression, base){
			var cnt = this._needToRecode(expression);
			if(cnt){
				this._recodeLoop(expression[1], expression[2], expression[2]);
				return expression;
			}
			return base(expression);
		},
		visitWhileLoop : function(expression, base){
			var cnt = this._needToRecode(expression);
			if(cnt){
				this._recodeLoop(expression[1], expression[2], null, null, expression[3]);
				return expression;
			}
			return base(expression);
		},
		visitStatement : function(expression, base){
			if(this._needToRecode(expression)){
				var key = expression[0];
				switch(key){
					case 'break':
						this._append('return "____BREAK";');
						return expression;
					case 'continue':
						this._append('return "____CONTINUE";');
						return expression;
				}
			}
			return base(expression);
		},
		visitVariable : function(expression, base){
			
			var normal = [];
			var awaits = [];

			for(var i = 0, len = expression[1].length ; i < len ; i++){
				var item = expression[1][i];
				if(item.length > 1 && item[1][0] == 'call' && item[1][1][1] == '$await'){
					awaits.push(item);
				}else{
					normal.push(item);
				}
			}

			if(normal.length > 0){
				this._append('var ');
				for(var i = 0, len = normal.length ; i < len ; i++){
					this.visitVariableAssignment(normal[i]);
					if(i != len - 1){
						this._append(',');
					}
				}
				this.onLineEnd();
			}
			
			var blocks, lastOne = expression[expression.length - 1];
			if(lastOne != null && lastOne[0] == 'block'){
				blocks = lastOne[1];
			}

			if(awaits.length > 1){
				var tempBlock = [['var', []]];
				for(var i = 1, len = awaits.length ; i < len; i++){
					tempBlock[0][1].push(awaits[i]);
					if((i == len - 1) && blocks != null){
						tempBlock = tempBlock.concat(blocks);
					}
				}

				this._visitAwait(awaits[0], tempBlock);
			}else if(awaits.length == 1){
				this._visitAwait(awaits[0], blocks);
			}

			return expression;
		},
		visitMultipleLine : function(expression, base){
			for(var i = 0 ; i < expression.length ; i++){
				var item = expression[i];
				if(this._dispatchAwait(item, expression, i)){
					break;
				}else{
					this.visit(item);
				} 
			}
			return expression;
		},
		_dispatchAwait : function(item, expression, i){
			var K = item[0];
			if(this._needToRecode(item)){
				var afterStatSameLevel = expression.slice(i + 1);
				// generate new function after
				var funcName = '__f$' + new Date().getTime();
				var newFunc = __newDefFunction(funcName, [], afterStatSameLevel);
				var callFunc = __callFunction(funcName, []);

				if(item[item.length - 1] != '$true'){
					switch(K){
						case 'var':
							var methodCall = item[1][0][1];
							if(methodCall[0] != 'call' || methodCall[1][1] != '$await'){
								break;
							}

							item[item.length] = ['block', afterStatSameLevel];
							this.visitVariable(item);
							return true;
						case 'stat':
							var statName = item[1][0];
							if(statName == 'assign' || (statName == 'call' && item[1][1][1] == '$await')){
								this._visitAwait(item[1], afterStatSameLevel);
								return true;
							}
							break;
						case 'for':
							var executeExpression, awaits, normals;
							var before = item[1];

							if(this._needToRecode(before)){
								if(before[0] == 'seq'){
									break;
								}

								var vars = __analyseVariable(before);
								
								awaits = vars.awaits;
								normals = vars.normals;

								item[1] = normals;
								executeExpression = [awaits].concat([item]).concat(afterStatSameLevel);
							}

							if(this._needToRecode(item)){
								item[item.length] = ['block', afterStatSameLevel];
								expression.splice(i + 1, expression.length - i - 1);
							}

							if(executeExpression){
								this.visitMultipleLine(executeExpression);
								return true;
							}
							break;
						case 'do':
							var before = item[2];
							item = this._doWhileToFor(item);
							item[item.length] = ['block', afterStatSameLevel];
							expression.splice(i + 1, expression.length - i - 1);
							this.visitMultipleLine(before[1].concat([item]));
							return true;
						case 'while':
							item[item.length] = ['block', afterStatSameLevel];
							expression.splice(i + 1, expression.length - i - 1);
							this.visitWhileLoop(item);
							return true;
						case 'if':
							var elseBlock = item[3] == null ? ['block', []] : item[3];
							item[3] = elseBlock;

							// add method call in if and else block;
							item[2][1].push(callFunc);
							item[3][1].push(callFunc);

							expression.splice(i + 1, expression.length - i - 1);
							expression.push(newFunc);
							
							// if-else is ok
							item[item.length] = '$true';

							this.visitMultipleLine([item].concat([newFunc]));
							return true;
						case 'try':
							var tryBlock = item[1];
							var catchBlock = item[2];
							var finalBlock = item[3] == null ? [] : item[3];

							// get catch function
							var catchName = '__f$catch' + new Date().getTime();
							var catchFunc = __newDefFunction(catchName, [], catchBlock[1]);
							var callCatchFunc = __callFunction(catchName, []);

							// get finally function
							var finalName = '__f$final' + new Date().getTime();
							var finalFunc = __newDefFunction(finalName, [], finalBlock);
							var callFinalFunc = __callFunction(finalName, []);
								
							// add after-try-statement call in try-catch block
							finalFunc[3].push(callFunc);						
							tryBlock.push(callFinalFunc);
							catchFunc[3].push(callFinalFunc);

							catchBlock[1] = [callCatchFunc];
							item[3] = null;

							expression.splice(i + 1, expression.length - i - 1);
							expression.push(catchFunc);
							expression.push(finalFunc);
							expression.push(newFunc);
							break;
					}	
				}
			}
			return false;
		},
		_doWhileToFor : function(doExpression){
			var forExp = [];
			forExp[0] = 'for';
			forExp[1] = null;
			forExp[2] = doExpression[1];
			forExp[3] = null;
			forExp[4] = __cloneArr(doExpression[2]);
			return forExp;
		},
		_visitAwait : function(expression, blockExpression){
			var justMethodCall = expression[0] == 'call';
			var assignStatement = justMethodCall | expression[0] == 'assign';
			var variableName = justMethodCall ? null : assignStatement ? expression[2][1] : expression[0];
			var parameters = justMethodCall ? expression[2] : assignStatement ? expression[3][2] : expression[1][2];
			
			if(parameters.length == 0){
				throw 'no parameter in $await method.';
			}

			var scope = '_$cope';
			this._append('var ' + scope + ' = this;');
			this._append('Mr.when(');
			for(var i = 0, len = parameters.length; i < len ; i++){
				this.visit(parameters[i]);
				if(i != len - 1){
					this._append(',');
				}
			}
			this._append(').done(function(');

			if(!justMethodCall){
				if(!assignStatement && parameters.length == 1){
					this._append(variableName);
					this._append('){');
				}else{
					this._append('){');
					if(!assignStatement){
						this._append('var ');
					}
					this._append(variableName + '=');
					if(parameters.length == 1){
						this._append('arguments[0];');
					}else{
						this._append('[].slice.call(arguments);');
					}	
				}							
			}else this._append('){');

			var paramStr = variableName || '';
			if(blockExpression != null){
				this._append('(function(' + paramStr + '){');
				this.visitMultipleLine(blockExpression);
				this._append('}).call(' + scope + ( paramStr == '' ? '' : ', ') + paramStr + ');');
			}

			this._append('});');

			return expression;
		},
		_needToRecode : function(expression){
			if(Object.prototype.toString.call(expression) != '[object Array]') return 0;

			var cnt = 0;
			for(var i = 0, len = expression.length ; i < len ; i++){
				if(expression[i] == '$await')
					cnt++;
				cnt += this._needToRecode(expression[i]);
			}
			return cnt;
		},
		_recodeLoop : function(condition, block, outerBefore, after, afterIteration){
			if(condition == null || block == null) 
				throw 'condition or block is null';

			if(outerBefore != null){
				this.visit(outerBefore);
			}

			this._append('Mr.asynIterator(Mr.infinite(), function(cnt){');
			this._append('var _ = this;');
			
			if(after != null){
				this._append('if(cnt != 1){');
				this.visit(after);
				this._append(';');
				this._append('}');
			}

			this._append('if(');
			var conditional = this.visit(condition);
			this._append('){');

			block[1].push(['stat', ['call', [ 'dot', ['name', '_'], 'next'],[]]])
			var block = this.visit(block);

			this._append('}else{');
			this._append('return Mr.BREAK;');
			this._append('}');
			this._append('}');

			if(afterIteration != null && afterIteration[1]!= null && afterIteration[1].length > 0){
				this._append(', function(){');
				this.visit(afterIteration);
				this._append('})');
			}else{
				this._append(')');
			}

			this._append('.start();');
		}		
	});

	function __isArray(arr){
		if(arr == null) return false;
		return Object.prototype.toString.call(arr) === '[object Array]';
	}

	function __cloneArr(arr){
		if(!__isArray(arr)) return arr;
		var clone = [];
		for(var i = 0, len = arr.length ; i < len ; i++){
			clone[clone.length] = __cloneArr(arr[i]);
		}
		return clone;
	}

	function __analyseVariable(varStat){
		var awaits = [];
		var normal = [];
		var vars = varStat[1];

		for(var i = 0, len = vars.length ; i < len ; i++){
			var item = vars[i];
			if(item.length > 1 && item[1][0] == 'call' && item[1][1][1] == '$await'){
				awaits.push(item);
				normal.push([item[0], ['name', item[0]]]);
			}else{
				normal.push(item);
			}
		}
		return { awaits : ['var', awaits], normals : ['var', normal] };		
	}

	function __newDefFunction(defName, parameters, statement){
		return ['defun', defName, parameters, statement];
	}

	function __callFunction(funcName, parameters){
		return ['stat', ['call', ['name', funcName], parameters]];
	}

	var ext = ['getCode', 'visit', 'reset', 'revisit'];
	var __bind = function(exp, from, name){
		exp[name] = function(){
			return from[name].apply(from, arguments);
		}
	};

	for(var i = 0, len = ext.length ; i < len ; i++){
		__bind(root, ev, ext[i]);
	}

})();