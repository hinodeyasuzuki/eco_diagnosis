/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * evaluateaxis.js 
 * 
 * evaluate multi dimension Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2017/11/06 original ActionScript3
 */


//resolve D6
var D6 = D6||{};

// evaluateAxisPoint()
//
// parameters
// 		target : dummy
//		inpListDefCode: evaluate target Input List
// return
//		 [0-2][point, max, min ]
//
// value base is  D6.doc.data[inName]
// weight is defined in D6.scenario.defInput[inName]
//
D6.evaluateAxisPoint = function( target,inpListDefCode ) {
	//calc environmental load, performance, action points
	var retall = {};
	retall[0] = [0,"",""];
	retall[1] = [0,"",""];
	retall[2] = [0,"",""];

	var def = [];
	for( var d in D6.scenario.defEasyQues ) {
		if ( D6.scenario.defEasyQues[d].cname == inpListDefCode ) {
			def = D6.scenario.defEasyQues[d].ques;
			break;
		}
	}
	if ( def == "" ) return retall;

	//calculate point of 3 axis
	for ( var i=0 ; i<3 ; i++ ) {
		var pointfull = 0;
		var point = 0;
		var maxpoint = 0;
		var maxname = "";
		var minpoint = 0;
		var minname = "";
		var tmax = 0;
		var defaultvalue = 0;
		var thispoint = 0;

		for( var incode in def ) {
			//incode : input code
			var weight = D6.scenario.defInput[def[incode]];
			var ans = D6.doc.data[def[incode]];
			var weightone = weight["d"+(i+1)+"w"];
			if ( weightone == "" ) continue;

			defaultvalue = weight["d"+(i+1)+"d"] * weightone ;

			//no answer
			if ( ans == weight.defaultValue || ans === undefined ) {
				//point += defaultvalue;
				continue;
			}

			//evaluate total point
			pointfull += weightone * 2;

			//point
			if ( ans >= weight["d"+(i+1)+"1t"] ) {
				thispoint = weight["d"+(i+1)+"1p"] * weightone;

			} else if( weight["d"+(i+1)+"2t"] != ""  && ans >= weight["d"+(i+1)+"2t"] ) {
				thispoint = weight["d"+(i+1)+"2p"] * weightone;

			} else if( weight["d"+(i+1)+"3t"] != ""  && ans >= weight["d"+(i+1)+"3t"] ) {
				thispoint = weight["d"+(i+1)+"3p"] * weightone;

			} else {
				thispoint = 0;
			}
			
			if ( maxpoint <thispoint ) {
				maxpoint = thispoint;
				maxname = weight.title;
			}
			if ( minpoint > thispoint - weightone * 2 ) {
				minpoint = thispoint - weightone * 2;
				minname = weight.title;
			}
			point += thispoint;
		}
		retall[i][0] = point / (pointfull==0 ? 1 :pointfull) * 100;
		retall[i][1] = maxname;
		retall[i][2] = minname;
	}
	return retall;
};

