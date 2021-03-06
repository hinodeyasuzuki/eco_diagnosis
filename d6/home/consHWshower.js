﻿/* 2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWshower.js 
 * 
 * calculate consumption and measures related to shower
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2013/10/03 original ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/15 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consHWshower = D6.object( D6.ConsBase );

D6.consHWshower.init = function() {
	//construction setting
	this.consName = "consHWshower";    	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "shower";					//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use shower";
};	
D6.consHWshower.init();


//calculate consumption
D6.consHWshower.calc = function( ) {
	//rate of shower 
	this.copy( this.sumCons );
	this.multiply( this.sumCons.consHWshowerRate );
};

D6.consHWshower.calcMeasure = function( ) {
	//mHWshowerHead
	if ( this.sumCons.savingShower != 1 ){
		this.measures[ "mHWshowerHead" ].calcReduceRate(  this.sumCons.reduceRateShowerHead );
	}
	
	//mHWshowerTime
	if ( this.sumCons.showerMinutes / this.sumCons.person >= 5 
		&& !this.isSelected( "mHWshowerTime30" )
	){
		this.measures[ "mHWshowerTime" ].calcReduceRate(  this.sumCons.reduceRateShowerTime );
	}

	//mHWshowerTime30
	this.measures[ "mHWshowerTime30" ].calcReduceRate(  0.3 );	
};

