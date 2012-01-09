# Mr.Async

## Iterator

* **asynEach** : function (array, callback, outerFunc)
* **asynIterator** : function (iterator, callback, outerFunc)
* **range** : function (minAndMax)
* **infinite** : function ()

Firstly, thanks to Jscex library created by Jeffrey Zhao. I realized what the Jscex solve, how Jscex can improve javascript asynchronism. After reading his blog, I have a try my own solution, AsynIterator.

Suppose there is a array which contains 5 numbers( 1 - 5 ), user want to traverse this array and print the current value each 1 second. DO NOT tell me you will write like below:

```javascript
var arr = [1, 2, 3, 4, 5];
var len = arr.length;
for(var i = 0 ; i < len ; i++){
    window.setTimeout(function(){
        console.log(i);
    }, 1000);
}

// output
// 5
// 5
// 5
// 5
// 5
// it's wrong. !
```

OR

```javascript
var arr = [1, 2, 3, 4, 5];
for(var i = 0 ; i < arr.length ; i++){
    print(arr[i]);
}

function print(i){
    window.setTimeout(function(){
        console.log(i);
    }, 1000);
}

//output
// 1
// 2
// 3
// 4
// 5
// value is correct, but these values was printed immediately. so it's wrong too.
```

And how to make it right, mostly of us will write code like below:

```javascript
var arr = [1, 2, 3, 4, 5];
var len = arr.length;
(function traverse(arr, idx){
    idx = idx || 0;
    if(idx < len){
        console.log(arr[idx++]);
        setTimeout(function(){  
            traverse(arr, idx);
        }, 1000);
    }
})(arr);

// output
// 1
// 2
// 3
// 4
// 5
// it's correct, but not easy to understand.  
```

The code is too complicated to understand, the problem is how to make code structure like for loop, and how to make the logic clear. Right now, we have Mr.asynIterator function. Example:

```javascript
var arr = [1, 2, 3, 4, 5];
Mr.asynEach(arr, function(i){
    console.log(i);
    window.setTimeout(this.callback(), 1000);
});
// output
// 1
// 2
// 3
// 4
// 5
// it's absolutely correct. And code structure seems good.
```

This just a simple demo for solving asynchronization problem. In addition, if you want to traverse other kinds of object, not a array. you can use Mr.asynIterator function. Mr.range will makes a range with number in a special format, such as "[1, 10]" means number 1 to 10. "(1, 10]" means 2 to 10. Mr.infinite will make a infinite range which means 1 to ∞. Example:

```javascript
Mr.asynIterator(Mr.range('[1, 5]'), function(num){
    if(num == 4){
        return Mr.CONTINUE;
    }
    console.log(num);
    window.setTimeout(this.callback(), 1000);
});
// output
// 1
// 2
// 3
// 5
```

Of course, user can create his own object to be iterated if the object have next function to return the next value. Example:

```javascript
var infinite = {
    _cnt : 0,
    next : function(){
        return this._cnt++;
    }
};
        
Mr.asynIterator(infinite, function(num){
    console.log(num);
    window.setTimeout(this.callback(), 1000);
});
// output
// 0
// 1
// 2
// 3
// 4
// ...
```

At this moment, we can well deal with the asyn problem, but how about nesting iteration. Don't worry, you can follow as below:

```javascript
// default
for(var i = 0 ; i < 3 ; i++){
    for(var ii = 0 ; ii < 3 ; ii++){
        console.log(i + ',' + ii);
        // all numbers will be shown at a moment.
    }
}

// but now, using Mr.asynIterator
Mr.asynIterator(Mr.range('[0, 3)'), function(i){
    Mr.asynIterator(Mr.range('[0, 3)'), function(ii){
        console.log(i + ',' + ii);
        window.setTimeout(this.callback(), 1000); // print each second.
    }, this.callback());
});
// output
// 0, 0
// 0, 1
// 0, 2
// 1, 0
// 1, 1
// 1, 2
// 2, 0
// 2, 1
// 2, 2
```

The second one seems a little more complicated than the first, but it perform Asynchronously, the first one can nenver do this. AsynIterator object have two member functions call callback and next. In these demo codes, you will find many callback methods have been invoked, the example below show how callback method works. Example:

```javascript
Mr.asynEach([1, 2, 3], function(num){
    console.log(num);
    setTimeout(this.callback(), 1000);
});

Mr.asynEach([1, 2, 3], function(num){
    console.log(num);
    var outer = this;
    setTimeout(function(){ outer.next(); }, 1000);
});

// the two methods are same.
```

This example we can see callback is a wrapper of next, and two method are trying to deal with the next value from iterated object. In addition, callback handler have a function argument which contains the result of asynchronization method.

```javascript
function caculate(num, callback){
    var timespan = Math.random(1) * 1000;
    setTimeout(function(){
        callback(num * num);
    }, timespan);
}

Mr.asynEach([2, 3, 4], function(num){
    caculate(num, this.callback(function(result){
        console.log(result);
    }));
});
// output
// 4
// 9
// 16
```

caculate method is a simple asyn method which is usually have a callback argument. By using Mr.asynEach, we can easily get the result of caculation regardless of the caculation time. It's cool. You can visit a advanced demo Selection Sort. (Please choose a browser which support SVG).

## Mr.Deferred
**_Mr.Deferred : function ()_**

According to CommonJS Promise/A, Mr.Deferred function will return a Deferred object. And a Deferred object always contains these methods:

  * always : function (alwaysHandler), add always handler.
  * done : function (doneHandler), add done handler.
  * fail : function (failureHandler), add failure handler.
  * then : function (doneHandler, failureHandler), add done handler and failer handler.
  * isRejected : function (), check if rejected.
  * isResolved : function (), check if resolved.

Example:

```javascript
function asynFn(){
    var dfd = Mr.Deferred();
    setTimeout(function(){
        dfd.resolve(1, 1, 1, 1, 1);
    }, Math.random(1) * 2000);
    setTimeout(function(){
        dfd.reject(2, 2, 2, 2, 2);
    }, Math.random(1) * 2500);
    return dfd;
}

asynFn()
    .done(function(){
        console.log('done');
        console.log(arguments);
    })
    .fail(function(){
        console.log('fail');
        console.log(arguments);
    })
    .then(
        function(){
            console.log('then->done');
            console.log(arguments);
        }, 
        function(){
            console.log('then->fail');
            console.log(arguments);
        })
    .always(function(){
        console.log('always');
        console.log(arguments);
    })
    .then(
        function(){
            console.log('then2->done');
            console.log(arguments);
        }, 
        function(){
            console.log('then2->fail');
            console.log(arguments);
        });

// if succeed, output:
// done
// [1, 1, 1, 1, 1]
// then->done
// [1, 1, 1, 1, 1]
// then2->done
// [1, 1, 1, 1, 1]
// always
// [Object { _doneFns=, more...}] // the deferred object in firebug console.

// if failure, output:
// fail
// [2, 2, 2, 2, 2]
// then->fail
// [2, 2, 2, 2, 2]
// then2->fail
// [2, 2, 2, 2, 2]
// always
// [Object { _doneFns=, more...}] // the deferred object in firebug console. 
```

## Mr.when
_**Mr.when : function(deferredObj1[, deferredObj2, [deferredObj3, ...]])**_

We can use Mr.when function to deal with multiple Deferred objects. 

Example:

```javascript
function asynFn(){
    var dfd = Mr.Deferred();
    setTimeout(function(){
        dfd.resolve(1, 1, 1, 1, 1);
    }, Math.random(1) * 2000);
    setTimeout(function(){
        dfd.reject(2, 2, 2, 2, 2);
    }, Math.random(1) * 2500);
    return dfd;
}

function asynFn2(){
    var dfd = Mr.Deferred();
    setTimeout(function(){
        dfd.resolve(33, 33, 33);
    }, Math.random(1) * 3000);
    return dfd;
}

Mr.when( asynFn(), asynFn2() )
    .done(function(){
        console.log('when:done');
        console.log(arguments);
    })
    .fail(function(){
        console.log('when:fail');
        console.log(arguments);
    })
    .always(function(){
        console.log('when:always');
        console.log(arguments);
    })
    .then(
        function(){
            console.log('when:then->done');
            console.log(arguments);
        },
        function(){
            console.log('when:then->fail');
            console.log(arguments);
        }
    );

// if succeed, output:
// when:done
// [1, 1, 1, 1, 1, 33, 33, 33]
// when:then->done
// [1, 1, 1, 1, 1, 33, 33, 33]
// when:always
// [Object { _doneFns=, more...}, Object { _doneFns=, more...}] // the two deferred objects in firebug.
```

## Test

Tested by QUnit, see _/Mr.js/Mr.Async/test/qunit/index.html_ when you clone this library.