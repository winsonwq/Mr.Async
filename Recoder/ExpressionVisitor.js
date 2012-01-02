(function(){
	
	var root;

	var version = '0.1.1';

	if (typeof exports !== 'undefined') {
	    if (typeof module !== 'undefined' && module.exports) {
	      root = exports = module.exports;
	    }
    	root = exports;
	} else if (typeof define === 'function' && define.amd) {
		define('ExpressionVisitor', function() {
			return root;
		});
	} else {
		this['EV'] = root = {};
	}

	function ExpressionVisitor(){
		this.codes = [];
	}

	ExpressionVisitor.prototype = {
		visit : function(expression){
			if(expression == null) return null;
			var K = expression[0];
			switch(K){
				case 'toplevel' :
					this.visitTopLevel(expression[1]);
					break;
				case 'num':
				case 'string':
				case 'regexp':
				case 'atom':
					this.visitConstant(expression);
					break;
				case 'name':
					this.visitName(expression);
					break;
				case 'binary':
					this.visitBinary(expression);
					break;
				case 'stat':
				case 'break':
				case 'continue':
				case 'return':
					this.visitStatement(expression);
					break;
				case 'defun':
				case 'function':
					this.visitFunction(expression);
					break;
				case 'var':
					this.visitVariable(expression);
					break;
				case 'object':
					this.visitObject(expression);
					break;
				case 'for':
					this.visitForLoop(expression);
					break;
				case 'for-in':
					this.visitForInLoop(expression);
					break;
				case 'while':
					this.visitWhileLoop(expression);
					break;
				case 'do':
					this.visitDoWhileLoop(expression);
					break;
				case 'unary-postfix':
				case 'unary-prefix':
					this.visitUnary(expression);
					break;
				case 'block':
					this.visitBlock(expression);
					break;
				case 'new':
					this.visitNew(expression);
					break;
				case 'call':
					this.visitMethodCall(expression);
					break;
				case 'dot':
					this.visitMemberAccess(expression);
					break;
				case 'assign':
					this.visitAssignment(expression);
					break;
				case 'if':
					this.visitIf(expression);
					break;
				case 'sub':
					this.visitSub(expression);
					break;
				case 'conditional' : 
					this.visitTernary(expression);
					break;
				case 'array':
					this.visitArray(expression);
					break;
				case 'switch':
					this.visitSwitch(expression);
				    break;
				case 'try':
					this.visitTry(expression);
					break;
				case 'throw':
					this.visitThrow(expression);
					break;
				case 'seq' : 
					this.visitSeq(expression);
					break;
				default :
					throw K + ' error';
					break;
			}
			return expression;
		},
		revisit : function(expression){
			this.codes = [];
			return this.visit(expression);
		},
		visitTopLevel : function(expression){
			this.visitMultipleLine(expression);
			this.onVisitEnd();
			return expression;
		},
		visitBinary : function(expression){
			this._append('(');
			var left = this.visit(expression[2]);
			this._append(expression[1]);
			var right = this.visit(expression[3]);
			this._append(')');
			return expression;
		},
		visitUnary : function(expression){
			var prefix = expression[0] == 'unary-prefix', instead = '';
		
			if(prefix){
				switch(expression[1]){
					case 'delete' :
					case 'typeof' :
					case 'void' :
						instead = ' ';
						break;
				}
			}

			this._append(prefix ? (expression[1] + instead) : '');
			this.visit(expression[2]);
			this._append(!prefix ? (expression[1] + instead) : '');
			return expression;
		},
		visitConstant : function(expression){
			switch(expression[0]){
				case 'num':
				case 'atom':
					this._append(expression[1]);
					break;
				case 'string':
					this._append("\"" + expression[1] + "\"");
					break;
				case 'regexp':
					this._append("/" + expression[1] + '/');
					break;
			}
			return expression;
		},
		visitMemberAccess : function(expression){
			var exp = expression[1];
			var anonymous = exp[0] == 'function' && exp[1] == null;
			if(anonymous) this._append('(');
			this.visit(exp);
			if(anonymous) this._append(')');

			this._append('.');
			this._append(expression[2]);
			return expression;
		},
		visitMethodCall : function(expression){
			var anonymous = expression[1][0] == 'function' || expression[1][0] == 'object';

			if(anonymous) this._append('(');

			this.visit(expression[1]);

			if(anonymous) this._append(')');
			// arguments
			this._append('(');
			for(var i = 0, len = expression[2].length ; i < len ; i++ ){
				this.visit(expression[2][i]);
				if(i != len - 1) this._append(',');
			}
			this._append(')');
			return expression;
		},
		visitAssignment : function(expression){
			this.visit(expression[2]);
			var symbol = (expression[1] == true ? '' : expression[1]) + '=';
			this._append(symbol);
			this.visit(expression[3]);
			return expression;
		},
		visitNew : function(expression){
			this._append('new ');
			this.visitMethodCall(expression);
			return expression;
		},
		visitSub : function(expression){
			this.visit(expression[1]);
			this._append('[');
			this.visit(expression[2]);
			this._append(']');
			return expression;
		},
		visitVariable : function(expression){
			this._append('var ');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visitVariableAssignment(expression[1][i]);
				if(i != len - 1){
					this._append(',');
				}
			}
			this.onLineEnd();
			return expression;
		},
		visitSeq : function(expression){
			for(var i = 1, len = expression.length ; i < len ; i++){
				this.visit(expression[i]);
				if(i != len - 1){
					this._append(',');
				}
			}
			return expression;
		},
		visitVariableAssignment : function(expression){
			this._append(expression[0]);
			if(expression[1] != null){
				this._append('=');
			}
			this.visit(expression[1]); // value
			return expression;
		},
		visitFunction : function(expression){
			this._append('function');
			if(expression[1] != null){
				this._append(' ' + expression[1]);
			}
			this._append('(');
			for(var i = 0, len = expression[2].length; i < len ; i++ ){
				this.visitParameter(expression[2][i]);
				if(i != len - 1){
					this._append(',');
				}
			}
			this._append(')');
			this._append('{');
			this.visitMultipleLine(expression[3]);
			this._append('}');
			return expression;
		},
		visitParameter : function(expression){
			this._append(expression);
			return expression;
		},
		visitName : function(expression){
			this._append(expression[1]);
			return expression;
		},
		visitStatement : function(expression){
			switch(expression[0]){
				case 'continue' :
				case 'break' :
					this._append(expression[0]);
					break;
				case 'return':
					this._append(expression[0] + ' ');
					break;
			}
			this.visit(expression[1]);
			this.onLineEnd();
			return expression;
		},
		visitForLoop : function(expression){
			this._append('for(');
			var before = this.visit(expression[1]);
			if(before == null || before[0] == 'seq'){
				this._append(';');
			}
			var conditional = this.visitConditional(expression[2]);
			this._append(';');
			var afterStatement = this.visit(expression[3]);
			this._append('){');
			var block = this.visit(expression[4]);
			this._append('}');
			return expression;
		},
		visitForInLoop : function(expression){
			this._append('for(');
			if(expression[1][0] == 'var'){
				this._visitVarInForInLoop(expression[1]);
			}else this.visit(expression[1]);
			// var name = this.visit(expression[2]);
			this._append(' in ');
			var target = this.visit(expression[3]);
			this._append('){');
			var block = this.visit(expression[4]);
			this._append('}');
			return expression;
		},
		_visitVarInForInLoop : function(expression){
			this._append('var ');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visitVariableAssignment(expression[1][i]);
				if(i != len - 1){
					this._append(',');
				}
			}
			return expression;
		},
		visitDoWhileLoop : function(expression){
			this._append('do{');
			var block = this.visit(expression[2]);
			this._append('}while(');
			var conditional = this.visitConditional(expression[1]);
			this._append(');');
			return expression;
		},
		visitWhileLoop : function(expression){
			this._append('while(');
			var conditional = this.visitConditional(expression[1]);
			this._append('){');
			var block = this.visit(expression[2]);
			this._append('}');
			return expression;
		},
		visitBlock : function(expression){
			if(expression[1] != null)
				this.visitMultipleLine(expression[1]);
			return expression;
		},
		visitMultipleLine : function(expression){
			for(var i = 0, len = expression.length; i < len ; i++){
				this.visit(expression[i]);
			}
			return expression;
		},
		visitIf : function(expression){
			this._append('if(');
			var conditional = this.visitConditional(expression[1]);
			this._append('){');
			var block = this.visit(expression[2]);
			this._append('}');
			if(expression[3] != null){
				this._append('else{');
				this.visit(expression[3]);
				this._append('}');
			}
			return expression;
		},
		visitConditional : function(expression){
			this.visit(expression);
			return expression;
		},
		visitTernary : function(expression){
			var conditional = this.visit(expression[1]);
			this._append('?');
			var yes = this.visit(expression[2]);
			this._append(':');
			var no = this.visit(expression[3]);
			return expression;
		},
		visitArray : function(expression){
			this._append('[');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visit(expression[1][i]);
				if(i != len - 1)
					this._append(',');
			}
			this._append(']');
			return expression;
		},
		visitObject : function(expression){
			this._append('{');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visitKeyValue(expression[1][i]);
				if(i != len - 1){
					this._append(',');
				}
			}
			this._append('}');
			return expression;
		},
		visitKeyValue : function(expression){
			this._append(expression[0]);
			this._append(':');
			this.visit(expression[1]);
			return expression;
		},
		visitSwitch : function(expression){
			this._append('switch(');
			this.visit(expression[1]);
			this._append('){');
			
			for(var i = 0, len = expression[2].length; i < len ; i++){
				this.visitCase(expression[2][i]);
			}

			this._append('}');

			return expression;
		},
		visitCase : function(expression){
			if(expression[0] != null){
				this._append('case ');
				this.visit(expression[0]);
				this._append(':');
			}else{
				this._append('default:');
			}

			for(var i = 0, len = expression[1].length; i < len ; i++){
				this.visit(expression[1][i]);
			}

			return expression;
		},
		visitTry : function(expression){
			this._append('try{');
			this.visitMultipleLine(expression[1]);
			this._append('}');

			this.visitCatch(expression[2]);
			if(expression[3] != null){
				this.visitFinally(expression[3]);
			}
			return expression;
		},
		visitCatch : function(expression){
			this._append('catch(');
			this._append(expression[0]);
			this._append('){');

			this.visitMultipleLine(expression[1]);

			this._append('}');
			return expression;
		},
		visitFinally : function(expression){
			this._append('finally{');
			this.visitMultipleLine(expression);
			this._append('}');
			return expression;
		},
		visitThrow : function(expression){
			this._append('throw ');
			this.visit(expression[1]);
			this.onLineEnd();
			return expression;
		},
		_append : function(str){
			this.codes.push(str);
		},
		getCode : function(){
			return this.codes.join('');
		},
		reset : function(){
			this.codes = [];
			return this;	
		},
		onLineEnd : function(){
			this._append(';');
		},
		onVisitEnd : function(){
			
		}
	};

	var __extend = function(child, parent){
		// static method
		for(var key in parent){
			if(parent.hasOwnProperty(key)){
				child[key] = parent[key];
			}
		}
		//
		function ctor(){};
		ctor.prototype = parent.prototype;
		//
		child.prototype = new ctor();
		child.__super = parent.prototype;
	}

	var __bind = function(child, ext, key){
		// if super have this method, inherit;
		if(child.__super[key] != null){
			child.prototype[key] = function(){
				var args = [].slice.call(arguments);
				var _ = this;
				args.push(function(){
					child.__super[key].apply(_, arguments);
				});
				ext[key].apply(this, args);
			};
		}else{
			// if not, just extend it;
			child.prototype[key] = ext[key];
		}
	}

	root.extend = function(ext){
		function EV_Child(){
			ExpressionVisitor.apply(this, arguments);
		};
		__extend(EV_Child, ExpressionVisitor);

		if(ext != null){
			for(var key in ext){
				if(ext.hasOwnProperty(key)){
					__bind(EV_Child, ext, key);
				}
			}
		}

		return new EV_Child();
	};
})();