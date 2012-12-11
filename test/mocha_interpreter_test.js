require('seajs');

var Mr = require('../lib/Mr.Async');
var interpreter = require('../lib/Recoder/Mr.Async.Interpreter');
var assert = require('chai').assert;

describe('Mr.Async.Interpreter', function(){

	var originalTimeout = setTimeout;
	Mr.Async = interpreter;

	beforeEach(function () {
	  setTimeout = function(callback, timeout){
	  	originalTimeout(callback, 0);
	  };
	});

	afterEach(function () {
	  setTimeout = originalTimeout;
	});

	it('Object Exist', function(){
		assert.ok(Mr);
		assert.ok(Mr.Async, 'Mr.Async exists');
		assert.ok(Mr.Async.recode, 'Mr.Async.recode function');
	});

	it('normal statement : assignment ', function(){
		var code = Mr.Async.recode(function(){
			var a = 0, b = "1", c = { a : 1 }, d = [1,2,3], e = function(){};
			assert.equal(a, 0);
			assert.equal(b, "1");
			assert.equal(c.a, 1);
			assert.equal(d.length, 3);
			assert.equal(typeof e, 'function');
		});

		eval(code).start();
	});

	it('normal statement : assignment 2', function(){
		var code = Mr.Async.recode(function(){
			var a, b, c, d, e;
			a = 0, b = "1", c = { a : 1 }, d = [1,2,3], e = function(){};
			assert.equal(a, 0);
			assert.equal(b, "1");
			assert.equal(c.a, 1);
			assert.equal(d.length, 3);
			assert.equal(typeof e, 'function');
		});
		eval(code).start();
	});

	it('normal statement : property assignment', function(){
		var code = Mr.Async.recode(function(){
			var a = {};
			a.i = 1;
			assert.equal(a.i, 1);
		});
		eval(code).start();
	});

	it('normal statement : if-else', function(){
		var code = Mr.Async.recode(function(){
			var a = 1 + 1, ret;
			if(a >= 2){
				ret = true;
			}else ret = false;

			assert.equal(ret, true);
		});

		eval(code).start();
	});

	it('normal statement : function', function(){
		var code = Mr.Async.recode(function(){
			function innerMethod(){
				return Math.random() * 10;
			}

			var ret;
			if(innerMethod() > 10){
				ret = true;
			}else ret = false;

			assert.equal(ret, false);
		});

		eval(code).start();
	});

	it('normal statement : anonymous function', function(){
		var code = Mr.Async.recode(function(){
			var ret = (function(){
				return false;
			})();

			assert.equal(ret, false);
		});

		eval(code).start();
	});


	it('normal statement : function', function(){
		var code = Mr.Async.recode(function(){
			var ret = (function a(){
				return false;
			})();

			assert.equal(ret, false);
		});

		eval(code).start();
	});

	it('normal statement : for loop', function(){
		var code = Mr.Async.recode(function(){
			var ret = 0;
			for(var i = 0, len = 10; i <= len ; i++){
				ret += i;
			}

			assert.equal(ret, 55);
		});

		eval(code).start();
	});

	it('normal statement : for loop 2', function(){
		var code = Mr.Async.recode(function(){
			var ret = 0, i, len;
			for(i = 0, len = 10; i <= len ; i++){
				ret += i;
			}

			assert.equal(ret, 55);
		});

		eval(code).start();
	});

	it('normal statement : while loop', function(){
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 0;
			while(i++ < 10){
				ret += i;
			}

			assert.equal(ret, 55);
		});

		eval(code).start();
	});

	it('normal statement : do-while loop', function(){
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 0;
			do{
				ret += i;
			}while(i++ < 10);

			assert.equal(ret, 55);
		});

		eval(code).start();
	});

	it('normal statement : switch', function(){
		var code = Mr.Async.recode(function(){
			var i = 'love', ret;
			switch(i){
				case 'love':
					ret = true;
					break;
				case 'hate':
					ret = false;
					break;
				default :
					ret = false;
					break;
			}

			assert.equal(ret, true);
		});

		eval(code).start();
	});

	it('normal statement : try-catch-finally', function(){
		var code = Mr.Async.recode(function(){
			var i = 0;
			try{
				({})();
				i = 1;
			}catch(ex){
				i++;
			}finally{
				i++;
			}

			assert.equal(i, 2);
		});

		eval(code).start();
	});

	it('normal statement : new', function(){
		var code = Mr.Async.recode(function(){
			var obj = new Object;
			obj.a = 1;
			assert.ok(obj);
			assert.equal(obj.a, 1);
		});

		eval(code).start();
	});

	function delay(duration){
		var de = Mr.Deferred();
		setTimeout(function(){
			de.resolve(1);
		}, duration || 200);
		return de.promise();
	}

	it('$await', function(done){
		var code = Mr.Async.recode(function(){
			assert.ok(true, 'waiting for 1 second.');
			$await(delay());
			assert.ok(true, 'done.');
			done();
		});

		eval(code).start();
	});

	it('$await : assignment', function(done){
		var code = Mr.Async.recode(function(){
			assert.ok(true, 'waiting for 1 second.');
			var i = $await(delay());
			assert.ok(true, 'done.');
			assert.equal(i, 1);
			done();
		});

		eval(code).start();
	});

	it('$await : array assignment', function(done){
		var code = Mr.Async.recode(function(){
			assert.ok(true, 'waiting for 1 second.');
			var arr = $await(delay(), delay());
			assert.ok(true, 'done.');

			assert.equal(arr.length, 2);
			assert.equal(arr[0], 1);
			assert.equal(arr[1], 1);
			done();
		});

		eval(code).start();
	});

	it('$await : multiple assignment', function(done){
		var code = Mr.Async.recode(function(){
			var a = $await(delay()), b = $await(delay()), c = 1, d = $await(delay())			
			assert.equal(a, 1);
			assert.equal(b, 1);
			assert.equal(c, 1);
			assert.equal(d, 1);
			done();
		});
		eval(code).start();
	});

	it('$await : multiple assignment 2', function(done){
		var code = Mr.Async.recode(function(){
			var a, b, c, d;
			a = $await(delay());
			b = $await(delay());
			c = 1;
			d = $await(delay());
			assert.equal(a, 1);
			assert.equal(b, 1);
			assert.equal(c, 1);
			assert.equal(d, 1);
			done();
		});
		eval(code).start();
	});

	it('$await : if-else ', function(done){
		var code = Mr.Async.recode(function(){
			var i = 0, ret;
			if(i == 0){
				assert.ok(true, 'waiting for 1 second');
				ret = $await(delay());
				assert.ok(true, 'done.');
			}else{
				ret = -1;
			}
			assert.equal(ret, 1);
			done();
		});

		eval(code).start();
	});

	it('$await : if-else 2', function(done){
		var code = Mr.Async.recode(function(){
			var i = 1, ret;
			if(i == 0){
				ret = -1;
			}else{
				assert.ok(true, 'waiting for 1 second in else');
				ret = $await(delay());
				assert.ok(true, 'done.');
			}

			assert.equal(ret, 1);
			done();
		});

		eval(code).start();
	});

	it('$await : for loop', function(done){
		var code = Mr.Async.recode(function(){
			for(var i = 1; i <= 3; i++){
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done.');
			}
			done();
		});

		eval(code).start();
	});

	it('$await : for loop 2', function(done){
		var code = Mr.Async.recode(function(){
			var ret = 0;
			for(var i = 1; i <= 3; i++){
				assert.ok(true, 'waiting for 1 second.');
				var	a = $await(delay());
				assert.ok(true, 'done.');
				ret += a;
			}
			assert.equal(ret, 3);
			done();
		});

		eval(code).start();
	});

	it('$await : in for loop before statement ', function(done){
		var code = Mr.Async.recode(function(){
			for(var i = $await(delay()), len = 3; i < len ; i++);
			assert.equal(i, 3);
			done();
		});
		eval(code).start();
	});

	it('$await : in for loop for bubblesort', function(done){
	
		var array = [10, 6, 4, 22, 1];
	
		function swap(arr, i, ii){
			var de = Mr.Deferred();
			setTimeout(function(){
			
				var temp = arr[i];
				arr[i] = arr[ii];
				arr[ii] = temp;
			
				de.resolve();
			}, 100)
			return de.promise();
		}
	
		var code = Mr.Async.recode(function(arr){
			for(var i = 0, len = arr.length; i < len - 1; i++){
				for(var ii = i + 1; ii < len ; ii++){
					if(arr[i] > arr[ii]){
						$await(swap(arr, i, ii));
					}	
				}
			}

			assert.equal(arr[0], 1);
			assert.equal(arr[1], 4);
			assert.equal(arr[2], 6);
			assert.equal(arr[3], 10);
			assert.equal(arr[4], 22);
			done();
		});

		eval(code).start(array);
	});

	it('$await : while loop ', function(done){
		var code = Mr.Async.recode(function(){
			var i = 0;
			while(i++ < 3){
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done.');
			}
			done();
		});

		eval(code).start();
	});

	it('$await : while loop 2', function(done){
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 0;
			while(i++ < 3){
				assert.ok(true, 'waiting for 1 second.');
				var	a = $await(delay());
				assert.ok(true, 'done.');
				ret+= a;
			}
			assert.equal(ret, 3);
			done();
		});
		eval(code).start();
	});

	it('$await : do-while loop ', function(done){
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 1;
			do{
				assert.ok(true, 'waiting for 1 second.');
				var	a = $await(delay());
				assert.ok(true, 'done.');
				ret+= a;
			}while(i++ < 3);
			assert.equal(ret, 3);
			done();
		});
		eval(code).start();
	});

	it('$await : do-while loop 2', function(done){
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 1;
			do{
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done.');
				ret+= 1;
			}while(i++ < 3);
			assert.equal(ret, 3);
			done();
		});
		eval(code).start();
	});

	it('$await : switch 1', function(done){		
		var code = Mr.Async.recode(function(){
			var i = 0;
			switch(i){
				case 0 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done.');
					i = 1;				
				default :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 2
				case 1 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 3;
			}
			assert.equal(i, 3);
			done();
		});

		eval(code).start();
	});

	it('$await : switch 2', function(done){
		var code = Mr.Async.recode(function(){
			var i = 0;
			switch(i){
				case 0 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done.');
					i = 1;
				default : 
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 2;
				case 1 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 3;
					break;
			}
			assert.equal(i, 3);
			done();
		});

		eval(code).start();
	});

	it('$await : switch 3', function(done){
		var code = Mr.Async.recode(function(){
			var i = 0;
			switch(i){
				case 0 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done.');
					i = 1;
				default : 
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 2;				
					break;
				case 1 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 3;
					break;
			}
			assert.equal(i, 2);
			done();
		});

		eval(code).start();
	});

	it('$await : switch 4', function(done){
		var code = Mr.Async.recode(function(){
			var i = 3;
			switch(i){
				case 0 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done.');
					i = 1;
					break;
				default : 
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 2;				
					break;
				case 1 :
					assert.ok(true, 'waiting for 1 second.');
					$await(delay());
					assert.ok(true, 'done');
					i = 3;
					break;
			}
			assert.equal(i, 2);
			done();
		});

		eval(code).start();
	});


	it('$await : statment before async in try-catch-finally', function(done){
		var code = Mr.Async.recode(function(){
			try{
				({})();
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done');		
			}catch(ex){
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done');
			}finally{
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done');
				done();
			}
		});
		eval(code).start(); 
	});

/*
	it('$await : statment in async in try-catch-finally', function(){
		var code = Mr.Async.recode(function(){
			try{			
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done');
				({})();	
			}catch(ex){
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done');
			}finally{
				assert.ok(true, 'waiting for 1 second.');
				$await(delay());
				assert.ok(true, 'done');
			}
			start();
		});
		//eval(code).start();
	 
	});
*/

	it('$await : property assignment', function(done){
		var code = Mr.Async.recode(function(){
			var a = {};
			a.i = $await(delay());
			assert.equal(a.i, 1);
			done();
		});
	
		eval(code).start();
	});

	it('$await : property assignment 2', function(done){
		var code = Mr.Async.recode(function(){
			var a = { b : {}};
			a.b.i = $await(delay());
			assert.equal(a.b.i, 1);
			done();
		});
	
		eval(code).start();
	});

	it('$await : property assignment 3', function(done){
		var code = Mr.Async.recode(function(){
			var a = { b : {}};
			a.b.i = $await(delay(), delay());
			assert.equal(a.b.i[0], 1);
			assert.equal(a.b.i[1], 1);
			done();
		});
	
		eval(code).start();
	});

	it('$await : if-else scope', function(done){
		var code = Mr.Async.recode(function(){
			var i = 0;
			if(i == 1){
				var i = $await(delay());
				i += 1;
			}else{
				var i = $await(delay());
				i += 2;
			}
			assert.equal(i, 0);
			done();
		});

		eval(code).start();
	});

	it('$await : function', function(done){
		var code = Mr.Async.recode(function(){
			function d(){
				var de = Mr.Deferred();
				setTimeout(function(){
					de.resolve();
				}, 1000);
				return de;
			}

			var i = 0;
			if(i == 1){
				var i = $await(d());
				i = 1
			}else{
				var i = $await(d());
				i = 2;
			}
			assert.equal(i, 0);
			done();
		});

		eval(code).start();
	});

	it('$await : this', function(done){
		this.i = 1;
		var code = Mr.Async.recode(function(){
			assert.equal(this.i, 1);
			done();
		});

		eval(code).start();
	});

	it('$await : this 2', function(done){
		this.i = 1;
		var code = Mr.Async.recode(function(){
			var i = $await(delay());
			assert.equal(i, 1);
			assert.equal(this.i, 1);
			done();
		});
		eval(code).start(); 
	});

	it('$await : this 3', function(done){
		this.a = 2;
		this.b = 3;
		var code = Mr.Async.recode(function(){
			var a = $await(delay()), b = $await(delay());
			assert.equal(a, 1);
			assert.equal(this.a, 2);
			assert.equal(b, 1);
			assert.equal(this.b, 3);
			done();
		});
		eval(code).start();
	});

	it('$await : recode with arguments', function(done){

		var code = Mr.Async.recode(function(a, b){
			assert.equal(a, 1);
			assert.equal(b, 2);
			done();
		});
		eval(code).start(1, 2);
	});

	it('$await : recode $await with arguments', function(done){

		var code = Mr.Async.recode(function(a, b){
			var a1 = $await(delay()), b1 = $await(delay());
			assert.equal(a, 1);
			assert.equal(b, 2);
			assert.equal(a1, 1);
			assert.equal(b1, 1);
			done();
		});
		eval(code).start(1, 2);
	});
});