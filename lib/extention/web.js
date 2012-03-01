/*

contains 
	1. event $await
	2. 
*/

if(typeof define !== 'function'){
	define = require('amdefine');
}

define(function(require, exports, module){
	
	var Mr = require('../Mr.Async');
	
	function bind(dom, eventName, handler){
		if(dom.addEventListener){
			dom.addEventListener(eventName, function(evt){
				if(typeof handler == 'function')
					handleEvent(evt, handler.call(dom, evt));
			}, false);
			return true;
		}else if(dom.attachEvent){
			var funcName = eventName + handler;
			dom[funcName] = function(evt){
				if(typeof handler == 'function')
					handleEvent(evt, handler.call(dom, evt));
			};
			dom.attachEvent('on' + eventName, dom[funcName]);
			return true;
		}
		return false;
	}
	
	function handleEvent(evt, ret){
		if(ret === false){
			if(evt.stopPropagation){
				evt.stopPropagation();
			}else{
				evt.cancelBubble = true;
			}
		}
	}
	
	function unbind(dom, eventName, handler){
		if(dom.removeEventListener){
			dom.removeEventListener(eventName, handler, false);
			return true;
		}else if(dom.detachEvent){
			var funcName = eventName + handler;
			dom.detachEvent('on' + eventName, dom[funcName]);
			return true;
		}
		return false;
	}
	
	return function(obj){
		
		obj.once = function(dom, eventName){
			var dfd = Mr.Deferred();
			
			var handler = function(evt){
				unbind(dom, eventName, handler);
				dfd.resolve();
			};
			console.log(eventName);
			bind(dom, eventName, handler);
			return dfd;
		};
		
	}
});