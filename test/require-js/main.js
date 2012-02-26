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

require(['./lib/Mr.Async', 'mr-recoder', 'test.js'], function(Mr, interpreter, test){
	// why use .js extention will be use the current location
	console.log(test);
	
	var async = function(){
		var dfd = Mr.Deferred();
		setTimeout(function(){ 
			dfd.resolve(1);
		}, 1000);
		
		return dfd;
	}
	
	var code = interpreter.recode(function(){
		var ret = $await(async());
		console.log(1);
	});
	
	eval(code).start();
	
});