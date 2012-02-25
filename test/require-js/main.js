require.config({
	baseUrl : '../../',
	packages : [
		{
			name : 'mr-recoder',
			location : 'Recoder',
			main : 'main'
		}
	]
});

require(['./lib/Mr.Async', 'mr-recoder'], function(Mr, interpreter){
	
	var async = function(){
		var dfd = Mr.Deferred();
		setTimeout(function(){ 
			dfd.resolve(1);
		}, 1000);
		
		return dfd;
	}
	
	var code = interpreter.recode(function(){
		var ret = $await(async());
		alert(1);
	});
	
	eval(code).start();
	
});