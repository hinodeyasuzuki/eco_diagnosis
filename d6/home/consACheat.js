/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consACheat.js 
 * 
 * calculate consumption and measures related to heating in one room
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2016/04/12 devide file from consHEAT.js
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

// Inherited class of D6.consHTsum
D6.consACheat = D6.object( D6.consHTsum );

// initialize
D6.consACheat.init = function() {
	//construction setting
	this.consName = "consACheat"; 		//code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
    this.title = "部屋暖房";			//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "冷暖房する部屋";	//the name of object shown as add target
    this.sumConsName = "consHTsum";		//code name of consumption sum up include this
	this.sumCons2Name = "consAC";		//code name of consumption related to this
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "部屋目";			//how to point n-th equipment

	//guide message in input page
	this.inputGuide = "部屋ごとの暖房の使い方について";
};
D6.consACheat.init();

D6.consACheat.precalc = function() {
	this.clear();
	this.houseSize = 1;

	//link to consAC
	this.ac = D6.consListByName["consAC"][this.subID];
	this.consHeat = Object.getPrototypeOf(this);

	//parameters
	this.heatSpace = this.input( "i212" + this.subID, 13 );			//size of room (m2)
	this.heatEquip = this.input( "i231" + this.subID, this.consHeat.heatEquip );	//equipment for heating
	this.heatTime  = this.input( "i203" + this.subID, this.consHeat.heatTime );	//heating time ( hour/day )
	this.heatTemp  = this.input( "i204" + this.subID, this.consHeat.heatTemp );	//temprature setting( degree-C )
	this.windowArea = this.input( "i213" + this.subID, -1 );		//window size (m2)
	this.windowPerf = this.input( "i216" + this.subID, -1 );		//window insulation level
	
};

D6.consACheat.calc = function() {
	//calcurate heat load ( kcal/month in heating days )
	var heatKcal = this.calcHeatLoad();

	//calcurate annualy energy from heating season monthly one.
	heatKcal *= D6.area.seasonMonth.winter / 12;
	this.endEnergy = heatKcal;

	//guess heat equipment
	if ( this.heatEquip <= 0 ) {
		//use house total
		this.heatEquip = this.consHeat.heatEquip;
	}
	
	//guess main source
	if ( this.heatEquip == 1 || this.heatEquip == 2 ) {
		this.mainSource = "electricity";
	} else if ( this.heatEquip == 3 ) {
		this.mainSource = "gas";
	} else if ( this.heatEquip == 4 ) {
		this.mainSource = "kerosene";
	} else {
		//use house total
		this.mainSource = this.sumCons.mainSource;
	}

	//air conditioner consumption when which is used
	this.calcACkwh = heatKcal / this.ac.apf /D6.Unit.calorie.electricity;
	if ( this.mainSource == "electricity" && this.heatEquip != 2) {
		//set air conditioner value
		this[this.mainSource] =  this.calcACkwh;
	} else {
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	}

};

//calcuration after all consumptions are calcrated
D6.consACheat.calc2nd = function( ) {
	//calculate residue
	if ( this.subID == 0 ){
		this.copy( this.sumCons );
		var cons = D6.consListByName[this.consName];
		for( var i=1 ; i< cons.length ; i++ ){
			this.sub( cons[i] );
		}
	}
};

D6.consACheat.calcMeasure = function() {
	var mes;

	//mACFilter,mACchangeHeat
	if ( this.heatEquip == 1 ){
		//in case of airconditioner heater
		this.measures["mACfilter"].copy( this );
		this.measures["mACfilter"]["electricity"] = 
					this.electricity * ( 1 - this.reduceRateFilter ) 
					- D6.consShow["CO"].electricity * this.reduceRateFilterCool;

	} else {
		//mACchangeHeat
		this.measures["mACchangeHeat"].clear();
		this.measures["mACchangeHeat"].electricity =  this.endEnergy /this.ac.nowEquip.pf2 
								/D6.Unit.calorie.electricity;
		
		//mACFilter
		this.measures["mACfilter"].copy( this );
		this.measures["mACfilter"].electricity = this.electricity
				- D6.consShow["CO"].electricity * this.reduceRateFilterCool;
	}
	

	//mHTdanran
	if ( this.person >= 2 
		&& this.heatSpace > 0.3 
		&& this.houseSize > 40 
	) {
		this.measures["mHTdanran"].calcReduceRate( this.reduceRateDanran );
	}

	//mHTdouble
	if ( !this.sumCons.isSelected( "mHTdoubleAll" )
		&& !this.sumCons.isSelected( "mHTuchimadoAll" )
		&& !this.sumCons.isSelected( "mHTloweAll" )
		&& !this.sumCons.isSelected( "mHTuchimado" )
		&& !this.sumCons.isSelected( "mHTlowe" )
	){
		this.measures["mHTdouble"].calcReduceRate( this.reduceRateDouble );
	}

	//mHTuchimado
	if ( !this.sumCons.isSelected( "mHTuchimadoAll" )
		&& !this.sumCons.isSelected( "mHTloweAll" )
		&& !this.sumCons.isSelected( "mHTlowe" )
	){
		this.measures["mHTuchimado"].calcReduceRate( this.reduceRateUchimado );
	}

	//mHTlowe
	if ( !this.sumCons.isSelected( "mHTloweAll" ) ){
		this.measures["mHTlowe"].calcReduceRate( this.reduceRateLowe );
	}
	
	//mHTwindowSheet
	this.measures["mHTwindowSheet"].calcReduceRate( this.reduceRateInsulation );

	//mHTtemplature
	if ( this.heatTemp >= 21 ) {
		this.measures["mHTtemplature"].calcReduceRate( ( this.heatTemp - 20 ) / 10 );
	}
	
	//mHTtime
	if ( this.heatTime > 2 ) {
		this.measures["mHTtime"].calcReduceRate( 1 / ( this.heatTime - 1 ) );
	}

	//mHTuchimado
	this.measures["mHTuchimado"].calcReduceRate( 0.15 );
	
	//mHTceiling
	this.measures["mHTceiling"].calcReduceRate( 0.1 );

};


