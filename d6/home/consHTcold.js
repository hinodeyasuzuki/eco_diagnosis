/*  2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHTcold.js 
 * 
 * calculate consumption and measures related to heating in cold area
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 *								2016/06/09 divided from consHTsum
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consHTcold = D6.object( D6.ConsBase );

D6.consHTcold.init = function() {
	//construction setting
	this.consName = "consHTcold";    	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "寒冷地";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHTsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "寒冷地での暖房の使い方について";

};
D6.consHTcold.init();

D6.consHTcold.calc = function() {
	this.clear();
};

D6.consHTcold.calcMeasure = function() {
};




