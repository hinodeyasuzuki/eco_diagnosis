/*  2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWtoilet.js 
 * 
 * calculate consumption and measures related to toilet hot seat
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2013/10/03 original ActionScript3
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
D6.consHWtoilet = D6.object( D6.ConsBase );

D6.consHWtoilet.init = function() {
	this.warmerElec_kWh_y = 200;		//hot seat of toilet electricity kWh/year
	this.resudeRateGoodSheat = 0.5;		//reduce rate by saving type 
	this.resudeRateTemplature= 0.2;		//reduce rate by temperature set 
	this.resudeRateCover= 0.1;			//reduce rate by use cover 
	this.water_m3_d = 0.1;				//flush water use in toilet m3/day/person

	//construction setting
	this.consName = "consHWtoilet";    	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "トイレ";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "トイレの水や保温の使い方について";


};
D6.consHWtoilet.init();

D6.consHWtoilet.precalc = function() {
	this.clear();

	this.person =this.input( "i001", 3 );			//person
	this.keepSeason =this.input( "i131", 2 );		//use heating 1:everyday - 4 don't use
	this.savingToilet = this.input( "i133", 2 );	//use demand heat type
};

D6.consHWtoilet.calc = function() {	
	this.electricity = this.warmerElec_kWh_y / 12 * (4-this.keepSeason)/3;
	this.water = this.water_m3_d * this.person *30;
};

D6.consHWtoilet.calcMeasure = function() {		
	var mes;
	
	//mHWreplaceToilet5
	this.measures[ "mHWreplaceToilet5" ].copy( this );
	this.measures[ "mHWreplaceToilet5" ].water = this.water_m3_d * this.person *30 / 2;

	//mHWreplaceToilet
	if ( this.savingToilet != 1) {
		this.measures[ "mHWreplaceToilet" ].calcReduceRate( this.resudeRateGoodSheat );
	}
		
	//mHWtemplatureToilet
	if ( !this.isSelected( "mHWreplaceToilet" ) || this.savingToilet != 1 ) {
		this.measures[ "mHWtemplatureToilet" ].calcReduceRate( this.resudeRateTemplature );
	}

	//mHWcoverTilet
	if ( !this.isSelected( "mHWreplaceToilet" )|| this.savingToilet != 1 ) {
		this.measures[ "mHWcoverTilet" ].calcReduceRate( this.resudeRateCover );
	}

};


