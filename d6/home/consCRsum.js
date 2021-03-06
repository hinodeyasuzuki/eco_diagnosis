﻿/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCRsum.js 
 * 
 * calculate consumption and measures related to car total
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * s
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/14 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.consCRsum
D6.consCRsum = D6.object( D6.ConsBase );

D6.consCRsum.init = function () {
	this.performanceNow = 10;			//now performance km/L
	this.performanceNew = 25;			//good performance car km/L 
	this.performanceElec = 8;			//electric car performance(km/kWh)
	this.publicRate = 0.6;				//available rate to change public traffic
	this.walkRate = 0.2;				//available rate to change walk/bicycle

	this.reduceRateEcoDrive = 0.15;		//reduce rate by eco driving
	this.reduceRatePublic = 0.7;		//reduce rate by bus 

	//construction setting
	this.consName = "consCRsum";    	//code name of this consumption 
	this.consCode = "CR";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "vehicle";					//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "8";					//number code in items
	this.color = "#ee82ee";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use cars, automobile";
};
D6.consCRsum.init();


D6.consCRsum.precalc = function() {
	this.clear();

	this.priceCar = D6.consShow["TO"].priceCar;		//car charge
	this.carNum = this.input( "i901", -1 );			//number of cars
	this.car =  this.priceCar /D6.Unit.price.car;	//monthly gasoline　L/month
};


D6.consCRsum.calc = function() {
};


D6.consCRsum.calcMeasure = function( ){
	//mCRecoDrive
	this.measures["mCRecoDrive"].calcReduceRate( this.reduceRateEcoDrive );

};

