/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * base64.js 
 * 
 * define atob , btoa
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/04/12 original to JavaScript
 */

// atob, btoa is defined in windows. it doesn't work in web worker 
if ( typeof ( atob) =="undefined" ) {
	atob = function(str){
		return str;
	};
	btoa = function(str){
		return str;
	};
};
