/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * objectcreate.js 
 * 
 *  Object Create
 *		reference to http://blog.tojiru.net/article/199670885.html by Hiraku NAKANO
 *
 *	usage var newOBJ = D6.object(oldOBJ);
 */

//resolve D6
var D6 = D6||{};

D6.object = function(obj) {
	var func = D6.object.func;
	func.prototype = obj;
	var newo = new func;
	var len=arguments.length;
	for (var i=1; i<len; ++i) {
		for (var prop in arguments[i]) {
			newo[prop] = arguments[i][prop];
		}
	}
	return newo;
};
D6.object.func = function(){};


D6.patch = function( target, fix ) {
	for ( var v in fix ) {
		target[v] = fix[v];
	}
	return target;
};




