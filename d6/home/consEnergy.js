/*  2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consEnergy.js 
 * 
 * calculate consumption and measures related to total energy
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 *								2016/06/09 divided from consBase
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.consCRsum
D6.consEnergy = D6.object( D6.ConsBase );
DC = D6.consEnergy;

DC.init = function() {
	//construction setting
	this.consName = "consEnergy";    	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "全般エネルギー設定";	//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "0";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "家全体でのエネルギーの使い方や、1ヶ月あたりの光熱費について";

	// add instance combined to this class
	this.partConsName = [		
	];
};
DC.init();


DC.calc = function() {
	this.clear();
};

DC.calcMeasure = function() {
};




