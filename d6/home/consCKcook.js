/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCKcook.js 
 * 
 * calculate consumption and measures related to cooking
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.ConsBase
D6.consCKcook = D6.object( D6.ConsBase );

//initialize
D6.consCKcook.init = function() {
	this.consEnergyStat = 840000;		//statistical cooking energy (kcal/year) EDMC Japan
	this.efficentEL = 2;				//coefficient of IH compare to heat type

	//construction setting
	this.consName = "consCKcook";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "調理";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "台目";			//how to point n-th equipment

    this.sumConsName = "consCKsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "コンロを中心とした調理の使い方について";
};
D6.consCKcook.init();

D6.consCKcook.precalc = function() {
	this.clear();

	//prepare input value
	this.equipHW = this.input( "i101", 2 );			//energy source of bath
	this.equipCK = this.input( "i801", -1 );		//energy source of cooking
	this.person = this.input( "i001", 3 );			//member of family
};

D6.consCKcook.calc = function() {
	this.priceGas = D6.consShow["TO"].priceGas;		//gas fee

	//calc cooking energy by number of person
	this.consEnergy = this.consEnergyStat * this.person / 3;

	if ( this.equipCK == -1 ) {
		//cocking energy source estimate by hotwater source
		if ( this.equipHW == 5 
			|| this.equipHW == 6 
			|| this.priceGas == 0 
		) {
			//2:electricity
			this.equipCK = 2;
		} else {
			//1:gas
			this.equipCK = 1;
		}
	}
	if ( this.equipCK == 2) {
		//use electricity for cooking (kWh/month)
		this.electricity = this.consEnergy / 12 / this.efficentEL 
											/ D6.Unit.calorie.electricity;
	} else {
		//use gas for cooking (m3/month)
		this.gas = this.consEnergy / 12 / D6.Unit.calorie.gas;
	}
};

D6.consCKcook.calcMeasure = function() {
};


