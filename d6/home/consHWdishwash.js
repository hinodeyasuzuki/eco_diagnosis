/*  2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWdishwash.js 
 * 
 * calculate consumption and measures related to dish wash
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2013/10/03 created as ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumptionb
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.consCRsum
D6.consHWdishwash = D6.object( D6.ConsBase );

D6.consHWdishwash.init = function() {
	this.reduceRateWashTank = 0.3;			//reduction rate wash with stored water
	this.reduceRateWashNotSummer = 0.5;		//reduction rate with cold water in summer
	this.reduceRateDishWasher = 0.2;		//reduction rate with wash machine

	//construction setting
	this.consName = "consHWdishwash";  	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "食器洗い";			//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "食器洗いの使い方について";
};
D6.consHWdishwash.init();


D6.consHWdishwash.calc = function() {
	var sumcValue = this.sumCons.value;

	this.copy( this.sumCons );
	this.multiply( this.sumCons.consHWdishwashRate );

};

D6.consHWdishwash.calcMeasure = function( ) {
	//mHWdishTank
	if ( this.sumCons.dishWashWater != 1 ) {
		this.measures[ "mHWdishTank" ].calcReduceRate( this.reduceRateWashTank );
	}
		
	//mHWdishWater
	if ( this.sumCons.dishWashWater != 1 ) {
		this.measures[ "mHWdishWater" ].calcReduceRate( this.reduceRateWashNotSummer );
	}
};
