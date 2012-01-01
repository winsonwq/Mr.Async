module('Mr.Async.Interpreter');

test('Object Exist', function(){
	ok(UglifyJS, 'parser exists.');
	ok(UglifyJS.parse, 'UglifyJS.parse exists.');
	ok(EV, 'Expression exists.');
	ok(EV.extend, 'EV.extend exists.');
	ok(Mr.Recoder, 'Recoder exists');
	ok(Mr.Recoder.visit, 'Mr.Recoder.visit exists');
	ok(Mr.Recoder.reset, 'Mr.Recoder.reset exists');
	ok(Mr.Recoder.getCode, 'Mr.Recoder.getCode exists');
	ok(Mr.Async, 'Mr.Async exists');
	ok(Mr.Async.recode, 'Mr.Async.recode function');
});

test('normal statement', function(){
	expect(5);
	var code = Mr.Async.recode(function(){
		var a = 0, b = "1", c = { a : 1 }, d = [1,2,3], e = function(){};
		equal(a, 0);
		equal(b, "1");
		equal(c.a, 1);
		equal(d.length, 3);
		equal(typeof e, 'function');
	});

	eval(code);
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

	eval(code);
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

	eval(code);
});

test('normal statement : anonymous function', function(){
	expect(1);
	var code = Mr.Async.recode(function(){
		var ret = (function(){
			return false;
		})();

		equal(ret, false);
	});

	eval(code);
});


test('normal statement : function', function(){
	expect(1);
	var code = Mr.Async.recode(function(){
		var ret = (function a(){
			return false;
		})();

		equal(ret, false);
	});

	eval(code);
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

	eval(code);
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

	eval(code);
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

	eval(code);
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

	eval(code);
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

	eval(code);
});

test('normal statement : new', function(){
	expect(2);
	var code = Mr.Async.recode(function(){
		var obj = new Object;
		obj.a = 1;
		ok(obj);
		equal(obj.a, 1);
	});

	eval(code);
});

function delay(duration){
	var de = Mr.Deferred();
	setTimeout(function(){
		de.resolve(1);
	}, duration || 200);

	return de;
}

test('normal $await', function(){
	expect(2);
	var code = Mr.Async.recode(function(){
		ok(true, 'waiting for 1 second.');
		$await(delay());
		start();
		ok(true, 'done.');
	});

	eval(code);
	stop();
});

test('normal $await : assignment', function(){
	expect(3);
	var code = Mr.Async.recode(function(){
		ok(true, 'waiting for 1 second.');
		var i = $await(delay());
		start();
		ok(true, 'done.');
		equal(i, 1);
	});
	eval(code);
	stop();
});

test('normal $await : array assignment ', function(){
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

	eval(code);
	stop();
});

test('normal $await : if-else ', function(){
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

	eval(code);
	stop();
});

test('normal $await : if-else ', function(){
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

	eval(code);
	stop();
});

test('normal $await : for loop ', function(){
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
	eval(code);
	stop();
});

test('normal $await : while loop ', function(){
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

	eval(code);
	stop();
});

test('normal $await : do-while loop ', function(){
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
	eval(code);
	stop();
});
