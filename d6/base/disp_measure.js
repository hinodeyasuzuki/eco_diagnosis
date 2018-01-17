/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * disp_measure.js 
 * 
 * measure comment display data create add to D6.disp class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/11/23 divided from disp.js
 *
 * getMeasureDetail()
 * tableMeasuresDetail()	for debug
 * tableMeasuresSimple()
 * getMeasureTable()
 */

// getMeasureDetail(mesid) ---------------------------------------
//		detail data about measures
// parameters
//		mesid : measure sequence id
// return
//		ret: subset of measureBase class
D6.disp.getMeasureDetail= function( mesid ) {
	var ret = [];
	var mes = D6.measureList[mesid];
		
	ret.title = mes.title;
	ret.titleShort = mes.titleShort;
	ret.measureName = mes.measureName;
	ret.mesID = mes.mesID;
	ret.groupID = mes.groupID;
	ret.consName = mes.cons.consName;
	ret.figNum = mes.figNum;
	ret.advice = mes.advice;
	ret.joyfull = mes.joyfull;
	ret.total = mes.cons.total;
	ret.co2Total = D6.consShow["TO"].co2Original;
	ret.selected = mes.selected;

	ret.co2 = mes.co2;
	ret.co2Change = mes.co2Change;
	ret.co2ChangeOriginal = mes.co2ChangeOriginal;

	ret.jules = mes.jules;

	ret.cost = mes.cost;
	ret.costChange = mes.costChange;
	ret.costChangeOriginal = mes.costChangeOriginal;
	ret.costTotalChange = mes.costTotalChange;
	ret.costTotalChangeOriginal = mes.costTotalChangeOriginal;
	ret.costUnique = mes.costUnique;
	ret.priceOrg = mes.priceOrg;
	ret.priceNew = mes.priceNew;
	ret.payBackYear = mes.payBackYear;
	ret.lifeTime = mes.lifeTime;

	ret.electricity = mes.electricity;
	ret.gas = mes.gas;
	ret.coal = mes.coal;
	ret.hotwater = mes.hotwater;
	ret.car = mes.car;
	ret.kerosene = mes.kerosene;
	ret.water = mes.water;

	return ret;
};

// tableMeasuresDetail( mes ) ---------------------------------------------
//		detail number result of measure, easy text output for test
// parameters
//		mes: measure list
// return
//		ret: text output
D6.disp.tableMeasuresDetail = function( mes )
{
	var ret = "";
	for ( var i=0 ; i<mes.length ; i++ ) {
		ret +=  ( mes[i].titleShort +  "　　　　　　"  ).substr( 0, 8 )
			+ "\t E:" + ( "   " + Math.round(mes[i].energy[Code.electricity]
								+mes[i].energy[Code.electricity2]) ).substr(-4) 
			+ " G:" + ( "   " + Math.round(mes[i].energy[Code.gas]) ).substr(-4) 
			+ " K:" + ( "   " +  Math.round(mes[i].energy[Code.kerosene])  ).substr(-4) 
			+ " C:" + ( "   " +  Math.round(mes[i].energy[Code.car])  ).substr(-4) 
			+ " CO2:" + ( "   " +  Math.round(mes[i].co2) ).substr(-4)
			+ " CO2C:" + ( "   " +  Math.round(mes[i].co2Change) ).substr(-4)  + "\n";
	}
	return ret;
};

// tableMeasuresSimple( mes ) ----------------------------------------------
//			simple list of measures
D6.disp.tableMeasuresSimple = function( mes )
{
	var ret = "";
	var mesList;

	for ( var i=0 ; i<mes.length ; i++ ) {
		mesList = D6.measureList[mes[i].mesID];
		if ( !isNaN( mesList.co2Change ) ) {
			ret +=  ( mes[i].mesID + " " + mesList.title +  "　　　　　　　　　　　　　　　　"  ).substr( 0, 20 )
				+  ( "   " + (-Math.round(mesList.co2Change * 12)) ).substr(-4)  + "kg削減 "
				+ "\n";
		}
	}
	return ret;
};
		

//table of Measures data
// consName
// maxPrice		not show over than this price
// notSelected 	1:only not select
D6.disp.getMeasureTable = function( consName, maxPrice, notSelected )
{
	//cannot set default in function for IE
	if(typeof maxPrice === 'undefined') maxPrice = 100000000;
	if(typeof notSelected === 'undefined') notSelected = 0;

	var ret = [];
	var i=0;
	var mes;
	var count = 0;
	var mesidArray = [];
	for ( var cid in D6.measureList ) {
		mesidArray.push( D6.measureList[cid] );
	}
	D6.ObjArraySort( mesidArray, D6.sortTarget );

	for ( var mid in mesidArray ) {
		cid = mesidArray[mid].mesID;
		mes = D6.measureList[cid];
			
		// not to show defined in EXCEL
		if ( mes.title == "" || mes.title.substr(0,1)=="#" ) continue;
			
		var partc = D6.consListByName[consName][0].partCons;
		var relation = false;
		for( var pc in partc ){
			if ( mes[partc[pc].consName] ) relation = true;
		}

		// directly defined in partCons
		if ( mes[consName] ) relation = true;

		// skip
		if ( mes.selected && notSelected == 1 ) continue;
		if ( mes.priceNew > maxPrice ) continue;

		ret[i] = [];
		ret[i].mesID = mes.mesID;
		ret[i].title = mes.title;
		ret[i].selected = mes.selected;
		ret[i].consName = consName;
		ret[i].groupID = mes.groupID;
		ret[i].measureName = mes.measureName;
		ret[i].consconsName = mes.cons.consName;
		ret[i].conssumConsName = mes.cons.sumConsName;
		ret[i].conssumCons2Name = mes.cons.sumCons2Name;
		ret[i].co2Change = mes.co2Change;
		ret[i].co2ChangeOriginal = mes.co2ChangeOriginal;
		ret[i].costChangeOriginal = mes.costChangeOriginal;
		ret[i].conssubID = mes.cons.subID;
		ret[i].consmesTitlePrefix = mes.cons.mesTitlePrefix;
		ret[i].relation = relation;
		ret[i].payBackYear = mes.payBackYear;
		ret[i].lifeTime = mes.lifeTime;
		if ( mes.cons.color || mes.cons.consName=="consTOTAL"){
			ret[i].color = mes.cons.color;
		} else {
			ret[i].color = mes.cons.sumCons.color;
		}
			
		i++;
	}

	return ret;
};
	
