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
		for(var i = 0, len = 10; i < len ; i++){
			ret += i;
		}

		equal(ret, 9);
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

		equal(ret, 10);
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

		equal(ret, 10);
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