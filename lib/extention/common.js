/*
	1. sleep
*/

if(typeof define !== 'function'){
	define = require('amdefine');
}

define(function(require, exports, module){
	
	var Mr = require('../Mr.Async');
	
	return function(obj){
		
		obj.sleep = function(duration){
			if(typeof duration !== 'number'){
				throw 'duration is not a number.';
			}
			var dfd = Mr.Deferred();
			setTimeout(function(){
				dfd.resolve();
			}, duration);
			
			return dfd;
		};
		
	}
});