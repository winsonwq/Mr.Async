require(['../../Mr.Async'], function(Mr){
	
	module('Mr.Async.js');

	test('methods of Mr.async.js', function(){
		// public methods
		ok(Mr.asynIterator, 'Iterator method.');
		ok(Mr.asynEach, 'Asyn each method.');
		ok(Mr.range, 'method to get range object.');
		ok(Mr.infinite, 'method to get a infinite object.');
	});

	test('Mr.range', function(){	
		raises(function(){
			Mr.range('a');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range(null);
		}, 'Invalid type.');
		raises(function(){
			Mr.range(undefined);
		}, 'Invalid type.');
		raises(function(){
			Mr.range(1);
		}, 'Invalid type.');
		raises(function(){
			Mr.range(0);
		}, 'Invalid type.');
		raises(function(){
			Mr.range('(1,2')
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('(0)')
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('[1,2');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('1,2)');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('1,2]');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('(1;2]');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('(1-2]');
		}, 'Invalid string format.');
		raises(function(){
			Mr.range('[1.11111,2]');
		}, 'Integer only');
		raises(function(){
			Mr.range('[1.1.1.11.,2]');
		}, 'Invalid string format.');
	
		ok(Mr.range('(1,2]'), 'Valid string format.');
		ok(Mr.range('[1,2)'), 'Valid string format.');
		ok(Mr.range('[1,2]'), 'Valid string format.');
		ok(Mr.range('(1,2)'), 'Valid string format.');
		ok(Mr.range('(1, 2)'), 'Valid string format.');
		ok(Mr.range('( 1 , 2 )'), 'Valid string format.');
	});

	test('Mr.range functionality (0,10)', function(){
		var range = Mr.range('(0,10)');
		ok(range.next, 'contains next method.');
		var i = 1;
		do{
			equal(i, range.next(), 'value equal');
			i++;
		}while(i < 10);
		raises(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	test('Mr.range functionality (0,1)', function(){
		var range = Mr.range('(0,1)');
		ok(range.next, 'contains next method.');
		raises(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	test('Mr.range functionality [0,10]', function(){
		var range = Mr.range('[0,10]');
		ok(range.next, 'contains next method.');
		var i = 0;
		do{
			equal(i, range.next(), 'value equal');
			i++;
		}while(i <= 10);
		raises(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	test('Mr.range functionality (0,10]', function(){
		var range = Mr.range('(0,10]');
		ok(range.next, 'contains next method.');
		var i = 1;
		do{
			equal(i, range.next(), 'value equal');
			i++;
		}while(i <= 10);
		raises(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	test('Mr.range functionality [0,10)', function(){
		var range = Mr.range('[0,10)');
		ok(range.next, 'contains next method.');
		var i = 0;
		do{
			equal(i, range.next(), 'value equal');
			i++;
		}while(i < 10);
		raises(function(){
			range.next();
		}, 'after iteration, the coming next method throw exception.');
	});

	test('Mr.infinite functionality', function(){
		var infinite = Mr.infinite();
		ok(infinite.next, 'contains next method.');
		var i = 0;
		do{
			infinite.next();
			i++;
		}while(i < 1000);
		ok(infinite.next(), 'after 1000 next method calling, the coming next method will not throw exception.');
		equal(infinite.next(), 1002);
	});

	test('Mr.asynEach', function(){
		raises(function(){
			Mr.asynEach(null, function(){});
		}, 'Invalid type.');
		raises(function(){
			Mr.asynEach(undefined, function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynEach({}, function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynEach('', function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynEach(1, function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynEach('abcd', function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynEach([], 'string');
		}, 'Invalid callback type');
		raises(function(){
			Mr.asynEach([], function(){}, 'string');
		}, 'Invalid callback type after iteration.');
	
		ok(Mr.asynEach([1,2], function(){}, function(){}), 'valid type');
		ok(Mr.asynEach([{}, {}], function(){}, function(){}), 'valid type');
		ok(Mr.asynEach([], function(){}, function(){}), 'valid type');
		ok(Mr.asynEach([{}, 1], function(){}, function(){}), 'valid type');
	});

	test('Mr.asynEach functionality [1,2,3,4,5]', function(){
		expect(5);
	
		var arr = [1,2,3,4,5];
		Mr.asynEach(arr, function(val, idx){
			equal(arr[idx], val);
			this.next();
		}).start();
	});

	test('asyncTest Mr.asynEach functionality [1,2,3,4,5]', function(){
		expect(5);
	
		var arr = [1,2,3,4,5];
		Mr.asynEach(arr, function(val, idx){
			var _ = this;
			setTimeout(function(){
				start();
				equal(arr[idx], val);			
				_.next();
			}, 30);
			stop();
		}).start();
	});

	test('Mr.asynIterator', function(){
		raises(function(){
			Mr.asynIterator(null, function(){});
		}, 'Invalid type.');
		raises(function(){
			Mr.asynIterator(undefined, function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynIterator({}, function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynIterator([], function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynIterator('', function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynIterator(1, function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynIterator('abcd', function(){});
		}, 'Invalid type');
		raises(function(){
			Mr.asynIterator([], 'string');
		}, 'Invalid callback type');
		raises(function(){
			Mr.asynIterator([], function(){}, 'string');
		}, 'Invalid callback type after iteration.');
		raises(function(){
			Mr.asynIterator(Mr.range('(0,1)'), function(){}).start();
		}, 'Invalid range arguments, have no element.');
	
		ok(
			Mr.asynIterator(Mr.range('(0, 2)'), function(){}), 
			'valid range type'
		);
		ok(
			Mr.asynIterator(Mr.range('(0, 2)'), function(){}, function(){}), 
			'valid range type'
		);
		ok(
			Mr.asynIterator(Mr.infinite(), function(){}), 
			'valid range type'
		);
		ok(
			Mr.asynIterator(Mr.infinite(), function(){}, function(){}), 
			'valid range type'
		);
		ok(
			Mr.asynIterator({ _i : 0, next : function(){ return this._i++;}}, function(){}, function(){}), 
			'valid custom type'
		);
	});

	test('Mr.asynIterator funcionality with Mr.range("(0, 5)")', function(){
		expect(4);
	
		var arr = [1, 2, 3, 4];
		Mr.asynIterator(Mr.range('(0, 5)'), function(val, idx){
			equal(arr[idx], val);
			this.next();
		}).start();
	});

	test('Mr.asynIterator funcionality with Mr.range("[0, 5)")', function(){
		expect(5);
	
		var arr = [0, 1, 2, 3, 4];
		Mr.asynIterator(Mr.range('[0, 5)'), function(val, idx){
			equal(arr[idx], val);
			this.next();
		}).start();
	});

	test('asyncTest Mr.asynIterator funcionality with Mr.range("[0, 5)")', function(){
		expect(5);
	
		var arr = [0, 1, 2, 3, 4];
		Mr.asynIterator(Mr.range('[0, 5)'), function(val, idx){
			var _ = this;
			setTimeout(function(){
				start();
				equal(arr[idx], val);
				_.next();
			}, 13);
			stop();
		}).start();
	});

	test('Mr.asynIterator nesting', function(){
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
				equal(expectResult[idx][0], val);
				equal(expectResult[idx][1], val2);
				idx++;
				this.next();
			}, this.callback()).start();
		}).start();
	});

	test('asyncTest Mr.asynIterator nesting', function(){
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
					equal(expectResult[idx][0], val);
					equal(expectResult[idx][1], val2);
					idx++;
					__.next();
					start();
				}, 20);
				stop();
			}, this.callback(function(){
				start();
			})).start();
			stop();
		}).start();
	});

	test('Mr.asynIterator nesting', function(){
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
				equal(expectResult[idx][0], val);
				equal(expectResult[idx][1], val2);
				idx++;
				this.next();
			}, this.callback()).start();
		}).start();
	});

	test('asyncTest Mr.asynEach nesting', function(){
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
					equal(expectResult[idx][0], val);
					equal(expectResult[idx][1], val2);
					idx++;
					__.next();
					start();
				}, 20);
				stop();
			}, this.callback(function(){
				start();
			})).start();
			stop();
		}).start();
	});

	test('exception of Mr.asynEach', function(){
		expect(1);

		Mr.asynEach([0], function(val, i){
			this.next(true);
		}, function(){
			ok(true, 'outer function have been executed.');
		}).start();
	});

	test('exception of Mr.asynIterator', function(){
		expect(1);
	
		Mr.asynIterator(Mr.range('(0, 2)'), function(){
			this.next(true);
		}, function(){
			ok(true, 'outer function have been executed.');
		}).start();
	});

	test('if iterator break, statement after iteration will be run', function(){
	
	});

	test('Mr.Deferred', function(){
		ok(Mr.Deferred(), 'ok');
	});

	test('Mr.Deferred promise', function(){
		expect(2);
	
		var promise = Mr.Deferred().promise();
		equal(promise.resolve, undefined);
		equal(promise.reject, undefined);
	});

	test('Mr.Deferred functionality', function(){
		expect(5);

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
			equal(ret, true);
			start();
		});
		stop();
	
		asyncGreatThan(1, 2).fail(function(ret){
			equal(ret, false);
			start()
		});
		stop();
		asyncGreatThan(2, 1).then(
			function(ret){
				equal(ret, true);
			}, 
			function(ret){
				throw '1 must be less than 2.';
			}).always(function(ret){
				equal(typeof(ret), 'object');
				equal(ret.isResolved(), true);
				start();
			});
		stop();
	});

	test('Mr.when functionality', function(){
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
				equal(val1, 1);
				equal(val2, 2);
			})
			.fail(function(){
				throw '1 and 2 must be done.';
			})
			.always(function(obj1, obj2){
				equal(obj1.isResolved(), true);
				equal(obj2.isResolved(), true);
				start();
			})
			.then(function(val1, val2){
				equal(val1, 1);
				equal(val2, 2);
			}, function(){
				throw '1 and 2 must be done.';
			});
		stop();
		// for 1 and 3
		Mr.when(asyncFunc1(), asyncFunc3())
			.done(function(val1, val2){
				throw '(1) : true, (3) : false, so the result is false';
			})
			.fail(function(val1, val2){
				equal(val1, null);
				equal(val2, 3);
			})
			.always(function(obj1, obj2){
				equal(obj1.isResolved(), true);
				equal(obj2.isRejected(), true);
				start();
			})
			.then(function(){
				throw '(1) : true, (3) : false, so the result is false';
			}, function(val1, val2){
				equal(val1, null);
				equal(val2, 3);
			});
		stop();
	});
});







