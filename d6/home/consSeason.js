/*  2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consLIsum.js 
 * 
 * calculate consumption and measures related to light
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/06/09 original JavaScript
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consSeason = D6.object( D6.ConsBase );

D6.consSeason.init = function() {
	this.titleList = ["","冬","春秋","夏"];	//season name

	//construction setting
	this.consName = "consSeason";   	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "";					//consumption title name
	this.orgCopyNum = 3;                //original copy number in case of countable consumption, other case set 0
	this.addable = "照明する部屋";		//add message
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment
	this.residueCalc = "sumup";			//calculate method	no/sumup/yes

    this.sumConsName = "";				//code name of consumption sum up include this
	this.sumCons2Name = "consTotal";	//code name of consumption related to this

	//guide message in input page
	this.inputDisp = "consTotal";		//question display group
	this.inputGuide = "季節ごとの1ヶ月あたりの光熱費について。おおよその値でご記入ください。";

	this.measureName = [
	];
	this.partConsName = [
	];
};
D6.consSeason.init();


D6.consSeason.calc = function() {
	this.clear();
};

D6.consSeason.calcMeasure = function() {
};




