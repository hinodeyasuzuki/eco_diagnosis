/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Main Class calc average functions
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2018/03/04 divided as average functions
 * 
 * calcAverage()				get avearage consumption
 * rankIn100()					get rank				
 * 
 */
 
//resolve D6
var D6 = D6||{};


// calcAverage()  get avearage consumption ------------------
//
// parameters
//		none
// return
//		none
//
// set D6.average.consList[]
//
D6.calcAverage = function(){
	D6.averageMode = true;			//not use input parameters
	this.calcCons();				//and calculate, then get average

	this.average.consList = {};
	for( var c in this.consShow ) {
		this.average.consList[c] = {};
		this.average.consList[c].co2 = this.consShow[c].co2;
		this.average.consList[c].cost = this.consShow[c].cost;
		this.average.consList[c].jules = this.consShow[c].jules;
		this.average.consList[c].title = this.consShow[c].title;
	}
	D6.averageMode = false;	
};

	

// rankIn100(ratio)  calculate rank by ratio to average ------------------
//
// parameters
//		ratio	ratio to average
// return
//		rank 	number 1-100 in 100 
//
D6.rankIn100 = function( ratio ){
	var ret;
	var lognum;

	var width = 0.5;		// set diffusion parameter

	if ( ratio <= 0 ) {
		//in case of minus
		ratio = 0.1;
	}
	lognum = Math.log( ratio );

	if ( lognum < -width ) {
		// rank 1-10
		ret = Math.max( 1, Math.round( ( lognum + 1 ) / width * 10 ) );
	} else if ( lognum < width ) {
		// rank 11-90
		ret = Math.round(( lognum + width ) / ( width * 2) * 80 + 10 );
	} else {
		// rank 91-100
		ret = Math.min( 100, Math.round( ( lognum - width ) / ( width * 2) * 10 ) + 90 );
	}
	return ret;
};

	
