require.config({
	baseUrl : '../../',
	packages : [
		{
			name : 'mr-recoder',
			location : 'lib/Recoder',
			main : 'main'
		}
	]
});

require([
	'./lib/Mr.Async', 
	'./lib/Recoder/Mr.Async.Interpreter', 
	'test.js', 
	'./lib/extention/web', 
	'./lib/extention/common'], function(mr, interpreter, test, webExt, commonExt){
	
	if(typeof console == 'undefined'){
		console = {
			log : alert
		}
	}
	
	// why use .js extention will be use the current location
	webExt(mr);
	commonExt(mr);
	
	eval(interpreter.recode('mr', function(){
		$await(mr.sleep(5000));
		console.log('after 5s');
	})).start();
	
	var button = document.getElementById('btn');
	
	eval(interpreter.recode('mr', function(){
		$await(mr.once(button, 'click'));
		console.log('click!');
	})).start();
	
	console.log(test);
	
	var async = function(){
		var dfd = mr.Deferred();
		setTimeout(function(){ 
			dfd.resolve(1);
		}, 1000);
		
		return dfd;
	}
	
	var code = interpreter.recode('mr', function(){
		var ret = $await(async());
		console.log(1);
	});
	
	var Mr = mr;
	var code2 = interpreter.recode(function(){
		var ret = $await(async());
		console.log(2);
	});
	
	eval(code).start();
	eval(code2).start();
});