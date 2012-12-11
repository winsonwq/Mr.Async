require('seajs');

var Mr = require('../lib/Mr.Async');
var assert = require('chai').assert;

describe('Mr.Async Core', function(){

	var originalTimeout = setTimeout;

	beforeEach(function () {
	  setTimeout = function(callback, timeout){
	  	originalTimeout(callback, 0);
	  };
	});

	afterEach(function () {
	  setTimeout = originalTimeout;
	});

	it('Mr.range functionality (0,10)', function(){
		var range = Mr.range('(0,10)');
		assert.ok(range.next, 'contains next method.');
		var i = 1;
		do{
			assert.equal(i, range.next(), 'value equal');
			i++;
		}while(i < 10);
		assert.throw(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	it('Mr.range functionality (0,1)', function(){
		var range = Mr.range('(0,1)');
		assert.ok(range.next, 'contains next method.');
		assert.throw(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	it('Mr.range functionality [0,10]', function(){
		var range = Mr.range('[0,10]');
		assert.ok(range.next, 'contains next method.');
		var i = 0;
		do{
			assert.equal(i, range.next(), 'value equal');
			i++;
		}while(i <= 10);
		assert.throw(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	it('Mr.range functionality (0,10]', function(){
		var range = Mr.range('(0,10]');
		assert.ok(range.next, 'contains next method.');
		var i = 1;
		do{
			assert.equal(i, range.next(), 'value equal');
			i++;
		}while(i <= 10);
		assert.throw(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	it('Mr.range functionality [0,10)', function(){
		var range = Mr.range('[0,10)');
		assert.ok(range.next, 'contains next method.');
		var i = 0;
		do{
			assert.equal(i, range.next(), 'value equal');
			i++;
		}while(i < 10);
		assert.throw(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	it('Mr.infinite functionality', function(){
		var infinite = Mr.infinite();
		assert.ok(infinite.next, 'contains next method.');
		var i = 0;
		do{
			infinite.next();
			i++;
		}while(i < 1000);
		assert.ok(infinite.next(), 'after 1000 next method calling, the coming next method will not throw exception.');
		assert.equal(infinite.next(), 1002);
	});

	it('Mr.asynEach functionality [1,2,3,4,5]', function(){
	
		var arr = [1,2,3,4,5];
		Mr.asynEach(arr, function(val, idx){
			assert.equal(arr[idx], val);
			this.next();
		}).start();
	});

	it('asyncTest Mr.asynEach functionality [1,2,3,4,5]', function(){
	
		var arr = [1,2,3,4,5];
		Mr.asynEach(arr, function(val, idx){
			var _ = this;
			setTimeout(function(){
				assert.equal(arr[idx], val);			
				_.next();
			}, 30);
		}).start();
	});

	it('Mr.asynIterator', function(){
		assert.throw(function(){
			Mr.asynIterator(null, function(){});
		}, 'Invalid type.');
		assert.throw(function(){
			Mr.asynIterator(undefined, function(){});
		}, 'Invalid type');
		assert.throw(function(){
			Mr.asynIterator({}, function(){});
		}, 'Invalid type');
		assert.throw(function(){
			Mr.asynIterator([], function(){});
		}, 'Invalid type');
		assert.throw(function(){
			Mr.asynIterator('', function(){});
		}, 'Invalid type');
		assert.throw(function(){
			Mr.asynIterator(1, function(){});
		}, 'Invalid type');
		assert.throw(function(){
			Mr.asynIterator('abcd', function(){});
		}, 'Invalid type');
		assert.throw(function(){
			Mr.asynIterator([], 'string');
		}, 'Invalid callback type');
		assert.throw(function(){
			Mr.asynIterator([], function(){}, 'string');
		}, 'Invalid callback type after iteration.');
		assert.throw(function(){
			Mr.asynIterator(Mr.range('(0,1)'), function(){}).start();
		}, 'Invalid range arguments, have no element.');
	
		assert.ok(
			Mr.asynIterator(Mr.range('(0, 2)'), function(){}), 
			'valid range type'
		);
		assert.ok(
			Mr.asynIterator(Mr.range('(0, 2)'), function(){}, function(){}), 
			'valid range type'
		);
		assert.ok(
			Mr.asynIterator(Mr.infinite(), function(){}), 
			'valid range type'
		);
		assert.ok(
			Mr.asynIterator(Mr.infinite(), function(){}, function(){}), 
			'valid range type'
		);
		assert.ok(
			Mr.asynIterator({ _i : 0, next : function(){ return this._i++;}}, function(){}, function(){}), 
			'valid custom type'
		);
	});

	it('Mr.asynIterator funcionality with Mr.range("(0, 5)")', function(){
	
		var arr = [1, 2, 3, 4];
		Mr.asynIterator(Mr.range('(0, 5)'), function(val, idx){
			assert.equal(arr[idx], val);
			this.next();
		}).start();
	});

	it('Mr.asynIterator funcionality with Mr.range("[0, 5)")', function(){
	
		var arr = [0, 1, 2, 3, 4];
		Mr.asynIterator(Mr.range('[0, 5)'), function(val, idx){
			assert.equal(arr[idx], val);
			this.next();
		}).start();
	});

	it('asyncTest Mr.asynIterator funcionality with Mr.range("[0, 5)")', function(){
		
		var arr = [0, 1, 2, 3, 4];
		Mr.asynIterator(Mr.range('[0, 5)'), function(val, idx){
			var _ = this;
			setTimeout(function(){
				assert.equal(arr[idx], val);
				_.next();
			}, 13);
		}).start();
	});

	it('Mr.asynIterator nesting', function(){
		var expectResult = [
				[0, 1],
				[0, 2],
				[1, 1],
				[1, 2],
				[2, 1],
				[2, 2]	
			];
		var idx = 0;
		Mr.asynIterator(Mr.range('[0, 3)'), function(val, i){
			var _ = this;
			Mr.asynIterator(Mr.range('(0, 3)'), function(val2, ii){
				assert.equal(expectResult[idx][0], val);
				assert.equal(expectResult[idx][1], val2);
				idx++;
				this.next();
			}, this.callback()).start();
		}).start();
	});

	it('asyncTest Mr.asynIterator nesting', function(){
		var expectResult = [
				[0, 1],
				[0, 2],
				[1, 1],
				[1, 2],
				[2, 1],
				[2, 2]
			];
		var idx = 0;
		Mr.asynIterator(Mr.range('[0, 3)'), function(val, i){
			var _ = this;
			Mr.asynIterator(Mr.range('(0, 3)'), function(val2, ii){
				var __ = this;
				setTimeout(function(){
					assert.equal(expectResult[idx][0], val);
					assert.equal(expectResult[idx][1], val2);
					idx++;
					__.next();
				}, 20);
			}).start();
		}).start();
	});

	it('Mr.asynIterator nesting', function(){
		var expectResult = [
				[0, 1],
				[0, 2],
				[1, 1],
				[1, 2],
				[2, 1],
				[2, 2]	
			];
		var idx = 0;
		Mr.asynEach([0, 1, 2], function(val, i){
			var _ = this;
			Mr.asynEach([1,2], function(val2, ii){
				assert.equal(expectResult[idx][0], val);
				assert.equal(expectResult[idx][1], val2);
				idx++;
				this.next();
			}, this.callback()).start();
		}).start();
	});

	it('asyncTest Mr.asynEach nesting', function(){
		var expectResult = [
				[0, 1],
				[0, 2],
				[1, 1],
				[1, 2],
				[2, 1],
				[2, 2]
			];
		var idx = 0;
		Mr.asynEach([0, 1, 2], function(val, i){
			var _ = this;
			Mr.asynEach([1,2], function(val2, ii){
				var __ = this;
				setTimeout(function(){
					assert.equal(expectResult[idx][0], val);
					assert.equal(expectResult[idx][1], val2);
					idx++;
					__.next();
				}, 20);
			}, this.callback()).start();
		}).start();
	});

	it('exception of Mr.asynEach', function(){

		Mr.asynEach([0], function(val, i){
			this.next(true);
		}, function(){
			assert.ok(true, 'outer function have been executed.');
		}).start();
	});

	it('exception of Mr.asynIterator', function(){
	
		Mr.asynIterator(Mr.range('(0, 2)'), function(){
			this.next(true);
		}, function(){
			assert.ok(true, 'outer function have been executed.');
		}).start();
	});

	it('if iterator break, statement after iteration will be run', function(){
	
	});

	it('Mr.Deferred', function(){
		assert.ok(Mr.Deferred(), 'ok');
	});

	it('Mr.Deferred promise', function(){
		var promise = Mr.Deferred().promise();
		assert.equal(promise.resolve, undefined);
		assert.equal(promise.reject, undefined);
	});

	it('Mr.Deferred functionality', function(){

		function asyncGreatThan(a, b){
			var de = Mr.Deferred();
			setTimeout(function(){
				if(a > b)
					de.resolve(true);
				else
					de.reject(false);
			}, 13);
		
			return de.promise();
		}
	
		asyncGreatThan(2, 1).done(function(ret){
			assert.equal(ret, true);
		});
	
		asyncGreatThan(1, 2).fail(function(ret){
			assert.equal(ret, false);
		});
		
		asyncGreatThan(2, 1).then(
			function(ret){
				assert.equal(ret, true);
			}, 
			function(ret){
				throw '1 must be less than 2.';
			}).always(function(ret){
				assert.equal(typeof(ret), 'object');
				assert.equal(ret.isResolved(), true);
			});
	});

	it('Mr.when functionality', function(){
		function asyncFunc1(){
			var de = Mr.Deferred();
			setTimeout(function(){
				de.resolve(1);
			}, 1000);
			return de.promise();
		}
	
		function asyncFunc2(){
			var de = Mr.Deferred();
			setTimeout(function(){
				de.resolve(2);
			}, 1000);
			return de.promise();
		}
	
		// fail one
		function asyncFunc3(){
			var de = Mr.Deferred();
			setTimeout(function(){
				de.reject(3);
			}, 1000);
			return de.promise();
		}

		// for 1 and 2
		Mr.when(asyncFunc1(), asyncFunc2())
			.done(function(val1, val2){
				assert.equal(val1, 1);
				assert.equal(val2, 2);
			})
			.fail(function(){
				throw '1 and 2 must be done.';
			})
			.always(function(obj1, obj2){
				assert.equal(obj1.isResolved(), true);
				assert.equal(obj2.isResolved(), true);
			})
			.then(function(val1, val2){
				assert.equal(val1, 1);
				assert.equal(val2, 2);
			}, function(){
				throw '1 and 2 must be done.';
			});
		// for 1 and 3
		Mr.when(asyncFunc1(), asyncFunc3())
			.done(function(val1, val2){
				throw '(1) : true, (3) : false, so the result is false';
			})
			.fail(function(val1, val2){
				assert.equal(val1, null);
				assert.equal(val2, 3);
			})
			.always(function(obj1, obj2){
				assert.equal(obj1.isResolved(), true);
				assert.equal(obj2.isRejected(), true);
			})
			.then(function(){
				throw '(1) : true, (3) : false, so the result is false';
			}, function(val1, val2){
				assert.equal(val1, null);
				assert.equal(val2, 3);
			});
	});
});