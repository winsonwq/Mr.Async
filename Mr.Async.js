(function(Mr){
	
	var version = '0.1.1';
	var Mr;

	if (typeof exports !== 'undefined') {
	    if (typeof module !== 'undefined' && module.exports) {
	    	Mr = exports = module.exports;
	    }
    	Mr = exports;
	} else if (typeof define === 'function' && define.amd) {
		define('Mr.Async', function() {
			return Mr;
		});
	} else {
		this.Mr = Mr = {};
	}
	
	Mr.BREAK = '____BREAK';
	Mr.CONTINUE = '____CONTINUE';
	
	function AsynIterator(iterator, callback, exceptionHandler) {
        if (iterator == null) {
            throw 'iterator is null.';
        }

        if (typeof (callback) != 'function') {
            throw 'callback is not a function';
        }

        if (iterator.next == null || typeof (iterator.next) != 'function') {
            throw 'argument is not a iterator.';
        }

        if (exceptionHandler != null && typeof (exceptionHandler) != 'function') {
            throw 'exceptionHandler is not a function.';
        }

        this._callback = callback;
        this._iterator = iterator;
        this._exceptionHandler = exceptionHandler;
        this._cnt = 0;
        this._stoped = false;
    }
	
	AsynIterator.prototype = {
		'callback': function (arg0, arg1) {
            var _this = this;
            return function (result) {
                var type = typeof (arg0);
                var catchException = false;
                if (type == 'function') {
                    arg0(result);
                    if (typeof (arg1) == 'boolean') {
                        catchException = arg1;
                    }
                } else if (type == 'boolean') {
                    catchException = arg0;
                }
                _this.next(catchException);
            }
        },
        next : function (catchException) {
			var ret, nextVal;
            try {
                if (!this._stoped) {
                    nextVal = this._iterator.next();
                    ret = this._callback(nextVal, this._cnt++);
                }
            } catch (ex) {
                if (this._exceptionHandler != null) {
                    ret = this._exceptionHandler();
                }else if (catchException === true) {
                    throw 'no more element.';
                }
            } finally {
				if (ret == Mr.CONTINUE) {
					this.next(catchException);
				} else if (ret == Mr.BREAK) {
					if (this._exceptionHandler != null)
                    	ret = this._exceptionHandler();
					return;
				}
			}
        },
        stop : function () {
            this._stoped = true;
        },
        start : function(){
        	this.next(true);
        }	
	};
	
	function AsynFor(obj) {
        if (typeof (obj) == 'object' && isArray(obj)) {
            this._obj = obj;
            this._idx = 0;
        } else {
            throw 'obj is not a array.';
        }
    }

	AsynFor.prototype = {
		'next': function () {
            var retVal = this._obj[this._idx++];
            if (retVal === undefined) {
                throw 'retVal is undefined.';
            }
            return retVal;
        }		
	};
	
	function Range(minAndMax) {
        if (typeof (minAndMax) != 'string') {
            throw 'argument is not string.';
        }

        var regex = /^([\(|\[])\s*(\d+)\s*\,\s*(\d+)\s*([\)|\]])$/;
        var _this = this;
		var validFormat = false;
        minAndMax.replace(regex, function (itself, ls, min, max, rs) {
            if (min == undefined || min == null || typeof (parseInt(min)) != 'number') {
                throw 'min is undefined or null or is not a number';
            }

            // why 
            // '0' > '27' : false ?
            // '1' > '27' : false ?
            // '2' > '27' : false ?
            // '3' > '27' : true ?!!!!
            // '10' > '27' : false ?
            if (parseInt(min) > parseInt(max)) {
                throw 'min is larger than max.';
            }

            _this._ls = ls;
            _this._rs = rs;
            _this._min = min;
            _this._max = max;

            if (_this._ls == '(') {
                _this._min++;
            }
			validFormat = true;
        });
		
		if(!validFormat){
			throw 'Invalid string format.';
		}
    }
	
	Range.prototype = {
		'next': function () {
            var retVal = this._min++;
            if (this._rs == ')' && retVal < this._max || this._rs == ']' && retVal <= this._max) {
                return retVal;
            } else {
                throw 'no more element.';
            }
        }
	};
	
	function Infinite() { this._count = 1; }
	Infinite.prototype = {
        'next': function () {
            return this._count++;
        }		
	};	
	
	var extObj = {
	    asynEach: function (array, callback, exceptionHandler) {
            var iterator = new AsynIterator(new AsynFor(array), callback, exceptionHandler)
            return iterator;
        },
        asynIterator: function (iterator, callback, exceptionHandler) {
            var iterator = new AsynIterator(iterator, callback, exceptionHandler)
            return iterator;
        },
        range: function (minAndMax) {
            return new Range(minAndMax);
        },
        infinite: function () {
            return new Infinite();
        }
	}
	
	for(var func in extObj){
		Mr[func] = extObj[func];
	}

	function isFunc(fn){
		return typeof(fn) == 'function';
	}
	
	function isArray(obj){
		return Object.prototype.toString.call(obj) == '[object Array]';
	}
	
	function executeDeferredFunc(funcs, args){
		var execLen = funcs.length;
		for(var i = 0 ; i < execLen ; i++){
			funcs[i].apply(this, args);
		}
	}
	
	function args2arr(args){
		return [].slice.call(args, 0, args.length);
	}
	
	function Deferred(){
		this._doneFns = [];
		this._failFns = [];
		this._alwaysFns = [];
		this._isRejected = false;
		this._isResolved = false;
	
		this._done_args = [];
		this._fail_args = [];
		
		this._finished = false;
		
		this.resolve = function(){
			if(this._finished) return;
			this._done_args = args2arr(arguments);
			this._executeDone(this._done_args);
			this._executeAlways([this]);
			
			this._finished = true;
			return this;
		};
		
		this.reject = function(){
			if(this._finished) return;
			this._fail_args = args2arr(arguments);
			this._executeFail(this._fail_args);
			this._executeAlways([this]);
			
			this._finished = true;
			return this;
		};
	}
	
	function MergedDeferred(args){
		if(args.length == 0){
			throw 'arguments can not be null';
		}
		
		this._doneFns = [];
		this._failFns = [];
		this._alwaysFns = [];
		this._isRejected = false;
		this._isResolved = false;
		
		var dfds = [];
		var argLen = args.length;
		
		var _this = this;
		
		var done_dfds = [];
		var fail_dfds = [];
		
		var executeAll = function(isDone){
			var allArgs, allLen = dfds.length;
			for(var i = 0; i < allLen; i++){
				var toBeAdd = isDone ? dfds[i]._done_args : dfds[i]._fail_args;
				allArgs = (allArgs || []).concat(toBeAdd.length > 0 ? toBeAdd : [null]);
			}
			
			isDone ? _this._executeDone(allArgs) : _this._executeFail(allArgs);
			_this._executeAlways(dfds);
		};
		
		var completeCallback = function(){			
			if(this.isResolved()){
				done_dfds.push(this);	
			}else {
				fail_dfds.push(this);
			}

			if(done_dfds.length + fail_dfds.length == dfds.length){
				executeAll(fail_dfds.length == 0);
			}
		};
		
		for(var i = 0; i < argLen ; i++){
			dfds.push(args[i].always(completeCallback));
		}
	}
	
	var deferredPrototype = {
		always : function(fn){
			if(isFunc(fn))
				this._alwaysFns.push(fn);
			return this;
		},
		done : function(fn){
			if(isFunc(fn))
				this._doneFns.push(fn);
			return this;
		},
		fail : function(fn){
			if(isFunc(fn))
				this._failFns.push(fn);
			return this;
		},
		then : function(fn, ffn){
			if(isFunc(fn))
				this._doneFns.push(fn);
			if(isFunc(ffn))
				this._failFns.push(ffn);
				
			return this;
		},
		isRejected : function(){
			return this._isRejected;
		},
		isResolved : function(){
			return this._isResolved;
		},
		_executeDone : function(args){
			if(this.isResolved() === true) return;
			executeDeferredFunc.call(this, this._doneFns, args);
			this._isRejected = false;
			this._isResolved = true;
		},
		_executeFail : function(args){
			if(this.isRejected() === true) return;
			executeDeferredFunc.call(this, this._failFns, args);
			this._isRejected = true;
			this._isResolved = false;
		},
		_executeAlways : function(args){
			executeDeferredFunc.call(this, this._alwaysFns, args);
		}
	};
	
	Deferred.prototype = deferredPrototype;
	MergedDeferred.prototype = deferredPrototype;
	
	Mr.when = function(){
		if(arguments.length == 0){
			throw 'arguments is empty.';
		}
		return new MergedDeferred(args2arr(arguments));
	};
	
	Mr.Deferred = function(){ return new Deferred(); };
	
})();

