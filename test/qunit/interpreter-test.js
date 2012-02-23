require.config({
	baseUrl : '../../lib/'
});

require(['./Mr.Async', './Recoder/Mr.Async.Interpreter'], function(Mr, interpreter){

	Mr.Async = interpreter;

	module('Mr.Async.Interpreter');

	test('Object Exist', function(){
		ok(Mr);
		ok(Mr.Async, 'Mr.Async exists');
		ok(Mr.Async.recode, 'Mr.Async.recode function');
	});

	test('normal statement : assignment ', function(){
		expect(5);
		var code = Mr.Async.recode(function(){
			var a = 0, b = "1", c = { a : 1 }, d = [1,2,3], e = function(){};
			equal(a, 0);
			equal(b, "1");
			equal(c.a, 1);
			equal(d.length, 3);
			equal(typeof e, 'function');
		});

		eval(code).start();
	});

	test('normal statement : assignment 2', function(){
		expect(5);
		var code = Mr.Async.recode(function(){
			var a, b, c, d, e;
			a = 0, b = "1", c = { a : 1 }, d = [1,2,3], e = function(){};
			equal(a, 0);
			equal(b, "1");
			equal(c.a, 1);
			equal(d.length, 3);
			equal(typeof e, 'function');
		});
		eval(code).start();
	});

	test('normal statement : property assignment', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var a = {};
			a.i = 1;
			equal(a.i, 1);
		});
		eval(code).start();
	});

	test('normal statement : if-else', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var a = 1 + 1, ret;
			if(a >= 2){
				ret = true;
			}else ret = false;

			equal(ret, true);
		});

		eval(code).start();
	});

	test('normal statement : function', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			function innerMethod(){
				return Math.random() * 10;
			}

			var ret;
			if(innerMethod() > 10){
				ret = true;
			}else ret = false;

			equal(ret, false);
		});

		eval(code).start();
	});

	test('normal statement : anonymous function', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var ret = (function(){
				return false;
			})();

			equal(ret, false);
		});

		eval(code).start();
	});


	test('normal statement : function', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var ret = (function a(){
				return false;
			})();

			equal(ret, false);
		});

		eval(code).start();
	});

	test('normal statement : for loop', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var ret = 0;
			for(var i = 0, len = 10; i <= len ; i++){
				ret += i;
			}

			equal(ret, 55);
		});

		eval(code).start();
	});

	test('normal statement : for loop 2', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var ret = 0, i, len;
			for(i = 0, len = 10; i <= len ; i++){
				ret += i;
			}

			equal(ret, 55);
		});

		eval(code).start();
	});

	test('normal statement : while loop', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 0;
			while(i++ < 10){
				ret += i;
			}

			equal(ret, 55);
		});

		eval(code).start();
	});

	test('normal statement : do-while loop', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 0;
			do{
				ret += i;
			}while(i++ < 10);

			equal(ret, 55);
		});

		eval(code).start();
	});

	test('normal statement : switch', function(){
		expect(1);
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

			equal(ret, true);
		});

		eval(code).start();
	});

	test('normal statement : try-catch-finally', function(){
		expect(1);
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

			equal(i, 2);
		});

		eval(code).start();
	});

	test('normal statement : new', function(){
		expect(2);
		var code = Mr.Async.recode(function(){
			var obj = new Object;
			obj.a = 1;
			ok(obj);
			equal(obj.a, 1);
		});

		eval(code).start();
	});

	function delay(duration){
		var de = Mr.Deferred();
		setTimeout(function(){
			de.resolve(1);
		}, duration || 200);

		return de;
	}

	test('$await', function(){
		expect(2);
		var code = Mr.Async.recode(function(){
			ok(true, 'waiting for 1 second.');
			$await(delay());
			start();
			ok(true, 'done.');
		});

		eval(code).start();
		stop();
	});

	test('$await : assignment', function(){
		expect(3);
		var code = Mr.Async.recode(function(){
			ok(true, 'waiting for 1 second.');
			var i = $await(delay());
			start();
			ok(true, 'done.');
			equal(i, 1);
		});

		eval(code).start();
		stop();
	});

	test('$await : array assignment ', function(){
		expect(5);
		var code = Mr.Async.recode(function(){
			ok(true, 'waiting for 1 second.');
			var arr = $await(delay(), delay());
			start();
			ok(true, 'done.');

			equal(arr.length, 2);
			equal(arr[0], 1);
			equal(arr[1], 1);
		});

		eval(code).start();
		stop();
	});

	test('$await : multiple assignment', function(){
		expect(4);
		var code = Mr.Async.recode(function(){
			var a = $await(delay()), b = $await(delay()), c = 1, d = $await(delay());
			equal(a, 1);
			equal(b, 1);
			equal(c, 1);
			equal(d, 1);
			start();
		});
		eval(code).start();
		stop();
	});

	test('$await : multiple assignment 2', function(){
		expect(4);
		var code = Mr.Async.recode(function(){
			var a, b, c, d;
			a = $await(delay());
			b = $await(delay());
			c = 1;
			d = $await(delay());
			equal(a, 1);
			equal(b, 1);
			equal(c, 1);
			equal(d, 1);
			start();
		});
		eval(code).start();
		stop();
	});

	test('$await : if-else ', function(){
		expect(3);
		var code = Mr.Async.recode(function(){
			var i = 0, ret;
			if(i == 0){
				ok(true, 'waiting for 1 second');
				ret = $await(delay());
				start();
				ok(true, 'done.');
			}else{
				ret = -1;
			}
			equal(ret, 1);
		});

		eval(code).start();
		stop();
	});

	test('$await : if-else 2', function(){
		expect(3);
		var code = Mr.Async.recode(function(){
			var i = 1, ret;
			if(i == 0){
				ret = -1;
			}else{
				ok(true, 'waiting for 1 second in else');
				ret = $await(delay());
				start();
				ok(true, 'done.');
			}

			equal(ret, 1);
		});

		eval(code).start();
		stop();
	});

	test('$await : for loop', function(){
		expect(6);
		var code = Mr.Async.recode(function(){
			for(var i = 1; i <= 3; i++){
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done.');
			}
			start();
		});

		eval(code).start();
		stop();

	});

	test('$await : for loop 2', function(){
		expect(7);
		var code = Mr.Async.recode(function(){
			var ret = 0;
			for(var i = 1; i <= 3; i++){
				ok(true, 'waiting for 1 second.');
				var	a = $await(delay());
				ok(true, 'done.');
				ret += a;
			}
			start();
			equal(ret, 3);
		});

		eval(code).start();
		stop();
	});

	test('$await : in for loop before statement ', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			for(var i = $await(delay()), len = 3; i < len ; i++);
			equal(i, 3);
			start();
		});
		eval(code).start();
		stop();
	});

	test('$await : in for loop for bubblesort', function(){
		expect(5);
	
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

			equal(arr[0], 1);
			equal(arr[1], 4);
			equal(arr[2], 6);
			equal(arr[3], 10);
			equal(arr[4], 22);
		
			start();
		});

		eval(code).start(array);
		stop();
	});

	test('$await : while loop ', function(){
		expect(6);
		var code = Mr.Async.recode(function(){
			var i = 0;
			while(i++ < 3){
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done.');
			}
			start();
		});

		eval(code).start();
		stop();
	});

	test('$await : while loop 2', function(){
		expect(7);
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 0;
			while(i++ < 3){
				ok(true, 'waiting for 1 second.');
				var	a = $await(delay());
				ok(true, 'done.');
				ret+= a;
			}

			start();
			equal(ret, 3);
		});
		eval(code).start();
		stop();
	});

	test('$await : do-while loop ', function(){
		expect(7);
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 1;
			do{
				ok(true, 'waiting for 1 second.');
				var	a = $await(delay());
				ok(true, 'done.');
				ret+= a;
			}while(i++ < 3);
			start();
			equal(ret, 3);
		});
		eval(code).start();
		stop();
	});

	test('$await : do-while loop 2', function(){
		expect(7);
		var code = Mr.Async.recode(function(){
			var ret = 0, i = 1;
			do{
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done.');
				ret+= 1;
			}while(i++ < 3);
			start();
			equal(ret, 3);
		});
		eval(code).start();
		stop();
	});

	test('$await : switch 1', function(){
		expect(7)
		var code = Mr.Async.recode(function(){
			var i = 0;
			switch(i){
				case 0 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done.');
					i = 1;				
				default :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 2
				case 1 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 3;
			}
			equal(i, 3);
			start();
		});

		eval(code).start();
		stop();
	});

	test('$await : switch 2', function(){
		expect(7);
		var code = Mr.Async.recode(function(){
			var i = 0;
			switch(i){
				case 0 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done.');
					i = 1;
				default : 
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 2;
				case 1 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 3;
					break;
			}
			equal(i, 3);
			start();
		});

		eval(code).start();
		stop();
	});

	test('$await : switch 3', function(){
		expect(5);
		var code = Mr.Async.recode(function(){
			var i = 0;
			switch(i){
				case 0 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done.');
					i = 1;
				default : 
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 2;				
					break;
				case 1 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 3;
					break;
			}
			equal(i, 2);
			start();
		});

		eval(code).start();
		stop();
	});

	test('$await : switch 4', function(){
		expect(3);
		var code = Mr.Async.recode(function(){
			var i = 3;
			switch(i){
				case 0 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done.');
					i = 1;
					break;
				default : 
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 2;				
					break;
				case 1 :
					ok(true, 'waiting for 1 second.');
					$await(delay());
					ok(true, 'done');
					i = 3;
					break;
			}
			equal(i, 2);
			start();
		});

		eval(code).start();
		stop();
	});


	test('$await : statment before async in try-catch-finally', function(){
		expect(4);
		var code = Mr.Async.recode(function(){
			try{
				({})();
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done');		
			}catch(ex){
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done');
			}finally{
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done');
			}
			start();
		});
		eval(code).start();
		stop(); 
	});

/*
	test('$await : statment in async in try-catch-finally', function(){
		expect(6);
		var code = Mr.Async.recode(function(){
			try{			
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done');
				({})();	
			}catch(ex){
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done');
			}finally{
				ok(true, 'waiting for 1 second.');
				$await(delay());
				ok(true, 'done');
			}
			start();
		});
		//eval(code).start();
		//stop(); 
	});
*/

	test('$await : property assignment', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var a = {};
			a.i = $await(delay());
			equal(a.i, 1);
			start();
		});
	
		eval(code).start();
		stop();
	});

	test('$await : property assignment 2', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var a = { b : {}};
			a.b.i = $await(delay());
			equal(a.b.i, 1);
			start();
		});
	
		eval(code).start();
		stop();
	});

	test('$await : property assignment 3', function(){
		expect(2);
		var code = Mr.Async.recode(function(){
			var a = { b : {}};
			a.b.i = $await(delay(), delay());
			equal(a.b.i[0], 1);
			equal(a.b.i[1], 1);
			start();
		});
	
		eval(code).start();
		stop();
	});

	test('$await : if-else scope', function(){
		expect(1);
		var code = Mr.Async.recode(function(){
			var i = 0;
			if(i == 1){
				var i = $await(delay());
				i += 1;
			}else{
				var i = $await(delay());
				i += 2;
			}
			equal(i, 0);
			start();
		});

		eval(code).start();
		stop();
	});

	test('$await : function', function(){
		expect(1);
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
			equal(i, 0);
			start();
		});

		eval(code).start();
		stop();
	});

	test('$await : this', function(){
		expect(1);
		this.i = 1;
		var code = Mr.Async.recode(function(){
			equal(this.i, 1);
		});

		eval(code).start();
	});

	test('$await : this 2', function(){
		expect(2);
		this.i = 1;
		var code = Mr.Async.recode(function(){
			var i = $await(delay());
			equal(i, 1);
			equal(this.i, 1);
			start();
		});
		eval(code).start();
		stop();
	});

	test('$await : this 3', function(){
		expect(4);
		this.a = 2;
		this.b = 3;
		var code = Mr.Async.recode(function(){
			var a = $await(delay()), b = $await(delay());
			equal(a, 1);
			equal(this.a, 2);
			equal(b, 1);
			equal(this.b, 3);
			start();
		});
		eval(code).start();
		stop();
	});

	test('$await : recode with arguments', function(){

		var code = Mr.Async.recode(function(a, b){
			equal(a, 1);
			equal(b, 2);
		});
		eval(code).start(1, 2);
	});

	test('$await : recode $await with arguments', function(){

		var code = Mr.Async.recode(function(a, b){
			var a1 = $await(delay()), b1 = $await(delay());
			equal(a, 1);
			equal(b, 2);
			equal(a1, 1);
			equal(b1, 1);
			start();
		});
		eval(code).start(1, 2);
		stop();
	});
});