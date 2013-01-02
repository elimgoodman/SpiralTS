var e = require('jsedn');
var f = require('fs');

var foo = function() {
    this.boo = "baz";
};

foo.prototype = {};

e.setTagAction(new e.Tag('spiral', 'Foo', 'Bar'), function(obj){
	console.log("here");
});

var p = f.readFileSync("./foo.spiral", 'utf-8');
var m = e.parse(p);
console.log(m);
