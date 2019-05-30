/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * acadd.js 
 * 
 * AreaParameters acadd: additional heat load cannot supply with  air conditioner
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

//resolve D6
var D6 = D6||{};

D6.acadd = {
/* getArray(param)  return paramArray
//		param: prefecture(original)
//
//  return acadd[time_slot_index][heat_month_index]
//
//		time_slot_index:
//				0:morning
//				1:noon
//				2:evening
//				3:night
//		heat_month_index
//				0:use heat for a half month
//				1:use heat for one month
//				2:use heat for 2 months
//				3:use heat for 3 months
//				4:use heat for 4 months
//				5:use heat for 6 months
//				6:use heat for 8 months
//
// this data is transformed by AMEDAS ( meteorological data ) in Japan
//
// factorPrefTimeMonth[Prefecture Code][Time Code][Month Code]
//
// used in Unit.setArea() function and set Unit.plusHeatFactor_mon
//
 */

	//sample
	factorPrefTimeMonth : [
		[ [ 0, 0, 0, 0, 0, 0, 0],   //kobe
			[ 0, 0, 0, 0, 0, 0, 0], 
			[ 0, 0, 0, 0, 0, 0, 0], 
			[ 0, 0, 0, 0, 0, 0, 0] ], 

		[ [ 0.17, 0.16, 0.14, 0.12, 0.09, 0.06, 0.05],   //sapporo
			[ 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.01], 
			[ 0.09, 0.09, 0.07, 0.06, 0.04, 0.03, 0.02], 
			[ 0.16, 0.15, 0.13, 0.11, 0.09, 0.06, 0.04] ]
	],


	getArray : function( prefParam ) {
		var ret;
		var pref = prefParam;
		if ( pref>47 || pref <0 ) {
			pref = 0;
		}
		ret = this.factorPrefTimeMonth[parseInt(pref)];

		return ret;
	}

};

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * accons.js 
 * 
 * AreaParameters  accons: electricity consumption rate of air conditioner used as heater
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

//resolve D6
var D6 = D6||{};

D6.accons = {
/*
// getArray(param)  return paramArray
//		param: prefecture(original)
//
//  return accons[time_slot_index][heat_month_index]
//
//		time_slot_index:
//				0:morning
//				1:noon
//				2:evening
//				3:night
//		heat_month_index
//				0:use heat for a half month
//				1:use heat for one month
//				2:use heat for 2 months
//				3:use heat for 3 months
//				4:use heat for 4 months
//				5:use heat for 6 months
//				6:use heat for 8 months
//
 */

	factorPrefTimeMonth: [
		[ [ 0.69, 0.65, 0.6, 0.56, 0.5, 0.42, 0.38, 0.34, 0.33, 0.28, 0.23, 0.18],   //kobe
			[ 0.45, 0.42, 0.39, 0.36, 0.32, 0.28, 0.27, 0.65, 0.63, 0.55, 0.48, 0.39], 
			[ 0.53, 0.5, 0.46, 0.43, 0.38, 0.32, 0.31, 0.46, 0.44, 0.4, 0.34, 0.28], 
			[ 0.68, 0.63, 0.59, 0.55, 0.5, 0.41, 0.37, 0.29, 0.28, 0.24, 0.2, 0.16] ], 

		[ [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.94, 0.77, 0.06, 0.05, 0.03, 0.02, 0.02],   //sapporo
			[ 1.14, 1.13, 1.1, 1.05, 0.98, 0.8, 0.67, 0.2, 0.17, 0.13, 0.1, 0.08], 
			[ 1.2, 1.19, 1.16, 1.13, 1.06, 0.88, 0.72, 0.1, 0.08, 0.05, 0.04, 0.03], 
			[ 1.24, 1.22, 1.21, 1.18, 1.13, 0.95, 0.79, 0.03, 0.02, 0.01, 0.01, 0.01] ] ], 
  
	getArray : function( prefParam ) {
		var ret;
		var pref = prefParam;
		if ( pref>47 || pref <0 ) {
			pref = 0;
		}
		ret = this.factorPrefTimeMonth[pref];

		return ret;
	}

};

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * accons.js 
 * 
 * AreaParameters  acload: heat load of house 
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */
 
//resolve D6
var D6 = D6||{};

D6.acload = {
/*
// getArray(param)  return paramArray
//		param: prefecture(original)
//
//  return acloat[time_slot_index][heat_month_index]
//
//		time_slot_index:
//				0:morning
//				1:noon
//				2:evening
//				3:night
//		heat_month_index
//				0:use heat for a half month
//				1:use heat for one month
//				2:use heat for 2 months
//				3:use heat for 3 months
//				4:use heat for 4 months
//				5:use heat for 6 months
//				6:use heat for 8 months
//
//
 */
	//sample
	factorPrefTimeMonth: [
		[ [ 0.66, 0.63, 0.6, 0.57, 0.52, 0.52, 0.44, 0.48, 0.48, 0.39, 0.33, 0.26],   //kobe
			[ 0.5, 0.47, 0.44, 0.41, 0.36, 0.31, 0.31, 0.78, 0.76, 0.69, 0.61, 0.51], 
			[ 0.56, 0.53, 0.5, 0.47, 0.42, 0.36, 0.34, 0.62, 0.6, 0.54, 0.47, 0.38], 
			[ 0.65, 0.62, 0.59, 0.56, 0.52, 0.43, 0.39, 0.41, 0.4, 0.34, 0.29, 0.22] ], 

		[ [ 1.06, 1.05, 1.03, 1, 0.95, 0.95, 0.82, 0.09, 0.09, 0.05, 0.03, 0.02],   //sapporo
			[ 0.93, 0.92, 0.9, 0.87, 0.83, 0.7, 0.59, 0.27, 0.23, 0.18, 0.14, 0.11], 
			[ 0.99, 0.98, 0.96, 0.93, 0.88, 0.76, 0.64, 0.14, 0.11, 0.07, 0.05, 0.04], 
			[ 1.05, 1.04, 1.02, 0.99, 0.95, 0.83, 0.7, 0.04, 0.03, 0.02, 0.01, 0.01] ], ],
  
	getArray : function( prefParam ) {
		var ret;
		var pref = prefParam;
		if ( pref>47 || pref <0 ) {
			pref = 0;
		}
		ret = this.factorPrefTimeMonth[pref];

		return ret;
	}

};

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * area.js 
 * 
 * AreaParameters area: parameters by prefecture for home
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

D6.area = {

	//name of prefecture
	//	prefName[prefecture]
	//
	prefName : [ 
		"hyogo",
		"hokkaido",	//1
	],

	prefDefault : 0,	//not selected


	// heat category with prefecture
	//	prefHeatingLevel[prefecture]
	//
	//	return code
	//		1:cold area in Japan(Hokkaido)
	//			.
	//			.
	//		6:hot area in Japan(Okinawa)
	//
	prefHeatingLevel : [ 4,
		1, 2, 2, 3, 2, 2, 3,
		3, 3, 3, 4, 4, 4, 4,
		3, 3, 3, 4, 4, 3, 4, 4, 4,
		4, 4, 4, 4, 4, 4, 4,
		4, 4, 4, 4, 4, 4, 4, 4, 5,
		4, 4, 4, 4, 4, 5, 5, 6 ],

								
	// CO2 emittion factor
	//	co2ElectCompanyUnit[elec_company]
	//
	//	elec_company
	//		1:hokkaido electric power company.
	//			.
	//			.
	//		9:okinawa electric power company.
	//
	co2ElectCompanyUnit : [ 0.55, 0.55, 0.55, 0.55, 0.55, 0.55
		, 0.55, 0.55, 0.55, 0.55, 0.55 ],

	//	electricity company code by prefecture
	//
	//	prefToEleArea[prefecture]
	//
	// 0:hokkaido、1:tohoku 2:tokyo 3:chubu 4:hokuritu 5:kansai
	// 6:tyugoku 7:shikoku 8:kyusyu 9:okinawa
	prefToEleArea : [ 5,
		0, 1, 1, 1, 1, 1, 1,
		2, 2, 2, 2, 2, 2, 2,
		1, 4, 4, 4, 2, 3, 3, 3, 3,
		3, 5, 5, 5, 5, 5, 5,
		6, 6, 6, 6, 6, 7, 7, 7, 7,
		8, 8, 8, 8, 8, 8, 8, 9 ],

	//electricity supply company price ratio
	electCompanyPrice : [
		1.2,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1.2
	],

	//	electricity charge unit table
	//
	//	elecPrice[electicity_type][calc_type]
	//
	//	electicity_type
	//		1:depend on consumption type A
	//		2:depend on consumption type B
	//		3:demand pricing 
	//		4:low voltage 
	//		5:integrated low voltage 
	//		6:high voltage 
	//	calc_type
	//		1:peak time unit
	//		2:average unit
	//		3:price down unit
	//		4:cut off
	//		5:base charge to contract kW
	//
	//	
	elecPrice : {
		1: [ 33.32, 33.32, 33.32, -1500, 0 ],
		2: [ 33.32, 33.32, 33.32, -1500, 280 ],
		3: [ 38.89, 27.32, 13.10, 2160, 0 ],
		4: [ 17.98, 16.53, 16.53, 0, 1054 ],
		5: [ 20.22, 18.56, 18.56, 64800, 0 ],
		6: [ 22.58, 17.36, 13.08, 0, 1733 ]
	},


	// meteorological annal average templature C
	//
	//		prefTemplature( prefecture )
	//
	//
	// in Unit.setArea() copy this to averageTemplature
	//
	prefTemplature : [

		17.4	,	//hyogo
		9.4	,	//hokkaido
	],

	// solar factor
	//
	//		prefPVElectricity( prefecture ) generation kWH/year per 3kW of solar panel
	//
	prefPVElectricity : [

		4.04	,	//hyogo
		3.95	,	//hokkaido
	],

	
	// convert energy name to energy_type id
	//
	//	energyCode2id[energy_name]	: get energy code
	//		
	//
	energyCode2id : {
		"electricity" : 0,
		"gas" : 1,
		"kerosene" : 2,
		"car" : 3 
	},

	//convert season name to season id.
	//
	//	seasonCode2id[season_name]	: get season code
	//
	seasonCode2id : {
		"winter" : 0,
		"spring" : 1,
		"summer" : 2
	},

	// months include to each season
	//	seasonMonth[seasonName]
	//	
	//	seasonName
	//		winter/spring/summer  , autumn include to spring
	//
	seasonMonth : { winter:4, spring:5, summer:3 },

	
	// heat load factore table get from acload/accons/acadd
	//
	// accons factor copy from D6.accons
	airconFactor_mon :
		[ [ 0.66, 0.62, 0.59, 0.55, 0.50, 0.41, 0.37, 0.39, 0.36, 0.31, 0.26, 0.20 ],
			[ 0.43, 0.39, 0.37, 0.34, 0.30, 0.27, 0.26, 0.79, 0.75, 0.67, 0.59, 0.49 ],
			[ 0.47, 0.45, 0.42, 0.39, 0.35, 0.30, 0.29, 0.57, 0.55, 0.49, 0.43, 0.35 ],
			[ 0.62, 0.58, 0.55, 0.51, 0.47, 0.39, 0.35, 0.34, 0.32, 0.27, 0.23, 0.18 ] ],
	// heat factor copy from D6.heatcons
	heatFactor_mon:
		[ [ 0.64, 0.61, 0.60, 0.57, 0.53, 0.53, 0.44, 0.54, 0.54, 0.43, 0.36, 0.28 ],
			[ 0.48, 0.45, 0.42, 0.39, 0.34, 0.30, 0.30, 0.88, 0.85, 0.78, 0.70, 0.59 ],
			[ 0.52, 0.49, 0.47, 0.43, 0.39, 0.33, 0.32, 0.72, 0.70, 0.64, 0.56, 0.46 ],
			[ 0.62, 0.59, 0.57, 0.54, 0.50, 0.42, 0.38, 0.48, 0.45, 0.39, 0.32, 0.25 ] ],
	// addac factor copy from D6.addac
	plusHeatFactor_mon:  
		[ [ 0, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0, 0, 0, 0 ] ],


	// get electric power company from prefecture
	getElectCompany : function( pref ) {
		return this.prefToEleArea[pref];
	},

	// get average templature from prefecture
	getTemplature : function( pref ) {
		return this.prefTemplature[pref];
	},

	// get average solar generation
	getPVElectricity : function( pref ) {
		return this.prefPVElectricity[pref];
	},

	// get heat category
	getHeatingLevel : function( pref ) {
		return this.prefHeatingLevel[pref];
	},

	// get electricity CO2 emission factor
	getCo2Unit : function( electCompany ) {
		return this.co2ElectCompanyUnit[electCompany];
	},

	// get avearge fee depend on person,prefecture,urban/ural
	// 	ret[energy_name]
	//
	//	energy_name: electricity,gas,kerosene,car
	//
	getAverageCostEnergy: function( num, pref, urban ) {
		var ret;
		ret = {};

		var id;
		for ( var i in this.energyCode2id) {
			id = this.energyCode2id[i];
			ret[i] = this.prefKakeiEnergy[pref][id] 
					* this.kakeiNumCoefficent[( num>6 ? 6 : num )-1][id]
					* this.urbanCostCoefficient[id][urban] / this.urbanCostCoefficient[id][0];
		}

		return ret;
	},


	// get average tap water templature
	getWaterTemplature: function()
	{
		var temp = Math.max( 5, Math.min( 23, 0.9137 * this.averageTemplature + 1.303 ) );
		return temp;
	},

	// get heat load 
	//
	//	getHeatFactor( month, hour )
	//		month:	heat month ( 0.5-12 )
	//		hour:	heat hour per day ( 0.5-24 )
	//
	//	return factor[code]
	//
	//	code:
	//		0: air conditioner heat factor
	//		1: heat factor
	//		2: additional heat factor
	//
	getHeatFactor : function( month, hour )
	{
		var mIndex;
		var sum = [ 0, 0, 0];
		var factor = [ 0, 0, 0];
		var count = 0;

		if ( month <= 0.7 ) {
			mIndex = 0;
		} else if ( month <= 1.5 ) {
			mIndex = 1;
		} else if ( month <= 2.5 ) {
			mIndex = 2;
		} else if ( month <= 3.5 ) {
			mIndex = 3;
		} else if ( month <= 5 ) {
			mIndex = 4;
		} else if ( month <= 7 ) {
			mIndex = 5;
		} else {
			mIndex = 6;
		}

		//estimate use timezone
		if ( hour >= 0 ) {
			//evening
			sum[0] += this.airconFactor_mon[2][mIndex];
			sum[1] += this.heatFactor_mon[2][mIndex];
			sum[2] += this.plusHeatFactor_mon[2][mIndex];
			count++;
		}
		if ( hour > 6 ) {
			//morning
			sum[0] += this.airconFactor_mon[0][mIndex];
			sum[1] += this.heatFactor_mon[0][mIndex];
			sum[2] += this.plusHeatFactor_mon[0][mIndex];
			count++;
		}
		if ( hour > 10 ) {
			//noon
			sum[0] += this.airconFactor_mon[1][mIndex];
			sum[1] += this.heatFactor_mon[1][mIndex];
			sum[2] += this.plusHeatFactor_mon[1][mIndex];
			count++;
		}
		if ( hour > 16 ) {
			//night
			sum[0] += this.airconFactor_mon[3][mIndex];
			sum[1] += this.heatFactor_mon[3][mIndex];
			sum[2] += this.plusHeatFactor_mon[3][mIndex];
			count++;
		}

		factor[0] = sum[0] / count;
		factor[1] = sum[1] / count;
		factor[2] = sum[2] / count;

		return factor;
	},

	// get cooling load 
	//
	//	getCoolFactor( month, hour )
	//		month:	heat month ( 0.5-12 )
	//		hour:	heat hour per day ( 0.5-24 )
	//
	//	return factor
	//
	getCoolFactor : function( month, hour )
	{
		var mIndex;
		var sum = [ 0, 0, 0];
		var factor = [ 0, 0, 0];
		var count = 0;

		if ( month <= 0.7 ) {
			mIndex = 7;
		} else if ( month <= 1.5 ) {
			mIndex = 8;
		} else if ( month <= 2.5 ) {
			mIndex = 9;
		} else if ( month <= 3.5 ) {
			mIndex = 10;
		} else {
			mIndex = 11;
		}

		//estimate timezone
		if ( hour >= 0 ) {
			//evening
			sum[0] += this.airconFactor_mon[2][mIndex];
			sum[1] += this.heatFactor_mon[2][mIndex];
			count++;
		}
		if ( hour > 6 ) {
			//noon
			sum[0] += this.airconFactor_mon[1][mIndex];
			sum[1] += this.heatFactor_mon[1][mIndex];
			count++;
		}
		if ( hour > 12 ) {
			//night
			sum[0] += this.airconFactor_mon[3][mIndex];
			sum[1] += this.heatFactor_mon[3][mIndex];
			count++;
		}
		if ( hour > 18 ) {
			//morning
			sum[0] += this.airconFactor_mon[0][mIndex];
			sum[1] += this.heatFactor_mon[0][mIndex];
			count++;
		}

		factor[0] = sum[0] / count;
		factor[1] = sum[1] / count;
		factor[2] = sum[2] / count;

		return factor;
	},



	// home original function/data set ==================================

	// average energy fee per month
	//		prefKakeiEnergy[prefecture][energy_type]
	//
	//		prefecture(0-47 in Japan)
	//		energy_type
	//			0:electicity
	//			1:gas
	//			2:kerosene
	//			3:gasoline
	//
	prefKakeiEnergy : [ 
		[ 7959, 5661, 313, 2647],	//hyogo
		[ 7568, 5400, 3772, 3984],  //hokkaido
	],

	// seasonal energy fee factor to average
	//
	//	prefSeasonFactorArray[prefecture][season][energy_type]
	//
	//	prefecture:
	//	season:
	//		0:wihter
	//		1:spring
	//		2:summer
	//	energy_type
	//		0:electicity
	//		1:gas
	//		2:kerosene
	//		3:gasoline
	//
	//季節別負荷係数
	prefSeasonFactorArray : [

		[ [ 1.1084, 1.3537, 2.5436, 0.9465 ], [ 0.8664, 0.9165, 0.3546, 0.9764 ], [ 1.0782, 0.6675, 0.0175, 1.1107 ] ],   //hyogo
		[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //hokkaido

	],

	// get season month
	getSeasonFactor : function( area )
	{
		return this.prefSeasonFactorArray[area];
	},

	// get seasonal fee factor table
	//
	//	ret[energy_name][season]
	//
	//	energy_name: electricity, gas, kerosene
	//  season: 
	//		0:winter
	//		1:spring
	//		2:summer
	//
	getSeasonParam : function( pref ) {
		var param = this.getSeasonFactor(pref);
		
		var ret = Array();
		ret["electricity"] = [ param[0][0], param[1][0], param[2][0] ];
		ret["gas"] = [ param[0][1], param[1][1], param[2][1] ];
		ret["kerosene"] = [ param[0][2], param[1][2], param[2][2] ];

		return ret;
	},


	//	factor to average fee
	//		kakeiNumCoefficent[person_in_home][energy_type]
	//
	//		pserson_in_home
	//			0: single home
	//			1: 2 person in home
	//			2: 3 person in home
	//			3: 4 person in home
	//			4: 5 person in home
	//			5: more than 6 person in home
	//		energy_type
	//			0:electicity
	//			1:gas
	//			2:kerosene
	//			3:gasoline
	//
	kakeiNumCoefficent:
		[ [ 0.47, 0.52,  0.37, 0.45 ],
			[ 0.86, 0.83,  0.90, 0.79 ],
			[ 0.99, 1.00,  0.90, 0.98 ],
			[ 1.07, 1.10,  0.85, 1.16 ],
			[ 1.24, 1.17,  1.10, 1.26 ],
			[ 1.55, 1.19,  1.67, 1.33 ]],


	//	urban / ural area fee per month
	//		urbanCostCoefficient[energy_type][area_type]
	//
	//		energy_type
	//			0:electicity
	//			1:gas
	//			2:kerosene
	//			3:gasoline
	//		area_type
	//			0:urban
	//			1:ural
	//
	urbanCostCoefficient :
		[ [ 8762, 9618 ],
			[ 6100, 5133 ],
			[ 828,  1898 ],
			[ 3415, 6228 ]],

	// calc parameters depend on person and area 
	//
	//	setPersonArea( numPerson, areaId, urbanId  )
	//		numPerson: 	person in home
	//		areaId:		prefecture
	//		urbanId:	urban/ural
	//
	setPersonArea : function( numPerson, areaId, urbanId  )
	{
		if ( urbanId == 1 || urbanId == 2  ) {
			this.urban = 1;
		} else {
			this.urban = 0;
		}

		if ( areaId < 0 ) {
			areaId = this.prefDefault;
		}

		//set this.area(prefecture)
		this.area = Math.round(areaId ? areaId : 0);	

		//electricity supply company
		this.electCompany = this.getElectCompany(this.area);

		//electricity price unit by supplyer
		D6.Unit.price.electricity = D6.Unit.defaultPriceElectricity * this.electCompanyPrice[this.electCompany];

		//electricity CO2 emisstion unit by supplyer
		D6.Unit.co2.electricity = this.getCo2Unit( this.electCompany );
		D6.Unit.co2.nightelectricity = D6.Unit.co2.electricity;
		D6.Unit.co2.sellelectricity = D6.Unit.co2.electricity;
		
		
		//set air conditioner load
		this.airconFactor_mon = D6.accons.getArray( this.area );
		this.heatFactor_mon = D6.acload.getArray( this.area );
		this.plusHeatFactor_mon = D6.acadd.getArray( this.area );
		
		//templature
		this.averageTemplature = this.getTemplature( this.area );
		
		//solar generation rate kWh/kW
		this.unitPVElectricity = 1000 * this.getPVElectricity( this.area ) / 3.6;

		//heat area level
		this.heatingLevel = this.getHeatingLevel( this.area );

		//month of heating / cooling
		switch( this.heatingLevel ) {
		case 1:
			this.seasonMonth = { winter:8, spring:3, summer:1 };
			break;
		case 2:
			this.seasonMonth = { winter:6, spring:4, summer:2 };
			break;
		case 3:
			this.seasonMonth = { winter:5, spring:5, summer:2 };
			break;
		case 5:
			this.seasonMonth = { winter:3, spring:5, summer:4 };
			break;
		case 6:
			this.seasonMonth = { winter:2, spring:5, summer:5 };
			break;
		case 4:
		default:
			this.seasonMonth = { winter:4, spring:5, summer:3 };
			break;
		}
		
		//calculate average cost
		this.averageCostEnergy = this.getAverageCostEnergy( 
			( numPerson<=0 ? 3 : numPerson ) ,
			Math.floor(this.area), 
			this.urban );
		
		//calculate average CO2
		this.averageCO2Energy = {};
		for( var i in this.averageCostEnergy ) {
			this.averageCO2Energy[i] = 
						D6.Unit.costToCons( this.averageCostEnergy[i] , i )
						* D6.Unit.co2[i];
		}
	},
	
	// get seasonal average consumption
	//
	//	getAverageCons( energy_name)
	//
	//	ret[season_name]
	//		season_name: winter,spring,summer
	//
	//	case energy_name == electricity : kWh/one month
	//	case energy_name == gas : L/one month
	//	case energy_name == kerosene : L/one month
	//	case energy_name == car : L/one month
	//
	//
	getAverageCons : function( energy_name )
	{
		var ret = [0, 0, 0];
		var eid = this.energyCode2id(energy_name) ;

		//get average
		var avCost = this.averageCostEnergy[energy_name];
		var seasonArray = this.getSeasonFactor( this.area );

		// calc consumption by fee
		ret["winter"] = this.Unit.costToCons( avCost * seasonArray[0][eid], energy_name );
		ret["spring"] = this.Unit.costToCons( avCost * seasonArray[1][eid], energy_name );
		ret["summer"] = this.Unit.costToCons( avCost * seasonArray[2][eid], energy_name );

		return ret;
	},

	// get seasonal average fee
	//
	//	getAverageCostSeason( energy_name, season_name )
	//
	//
	getAverageCostSeason : function( energy_name, season_name )
	{
		var eid = this.energyCode2id(energy_name) ;
		var avCost = this.averageCostEnergy[energy_name];
		var seasonArray = this.getSeasonFactor( this.area );

		return avCost * seasonArray[this.seasonCode2id(season_name)][eid];
	}
	
};



/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * unit.js 
 * 
 * any kind of unit related to energy type is defined here
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

//resolve D6
var D6 = D6||{};

D6.Unit = {
	
	// co2 emission factor  kg-CO2/each unit
	co2 : {
		electricity:0.55,
		nightelectricity:0.55,
		sellelectricity:0.55,
		nagas:2.23,
		lpgas:5.98,
		kerosene:2.49,
		gasoline:2.32,
		lightoil:2.62,
		heavyoil:3,
		coal:6,
		biomass:0,
		hotwater:0.06,
		waste:0,
		water:0,
		gas:2.23,
		car:2.32
	},

	defaultPriceElectricity : 27,

	// unit price   yen(in Japan)/each unit
	price : {
		electricity:27,				// override in D6.area.setPersonArea by supplier
		nightelectricity:10,
		sellelectricity:30,
		nagas:150,
		lpgas:500,
		kerosene:80,
		gasoline:130,
		lightoil:100,
		heavyoil:80,
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:120,
		car:130
	},

	// intercept price when consumption is zero 	yen(in Japan)
	priceBase : {
		electricity:0,
		nightelectricity:2100,
		sellelectricity:0,
		nagas:1000,
		lpgas:1000,
		kerosene:0,
		gasoline:0,
		lightoil:0,
		heavyoil:0,
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:800,
		car:0
	},
	
	// names
	name : {
		electricity:"electricity",
		nightelectricity:"night electricity",
		sellelectricity:"sell electricity",
		nagas:"natural gas",
		lpgas:"LP gas",
		kerosene:"kerosene",
		gasoline:"gas",
		lightoil:"light oil",
		heavyoil:"heavy oil",
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:"natural gas",
		car:"gas"
	},
	
	// unit discription text
	unitChar : {
		electricity:"kWh",
		nightelectricity:"kWh",
		sellelectricity:"kWh",
		nagas:"m3",
		lpgas:"m3",
		kerosene:"L",
		gasoline:"L",
		lightoil:"L",
		heavyoil:"L",
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:"m3",
		car:"L"
	},
	
	// second energy(end-use)  kcal/each unit
	calorie : {
		electricity:860,
		nightelectricity:860,
		sellelectricity:860,
		nagas:11000,
		lpgas:36000,
		kerosene:8759,
		gasoline:8258,
		lightoil:9117,
		heavyoil:9000,
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:11000,
		car:8258
	},

	// primary energy  MJ/each unit
	jules : {
		electricity:9.6,
		nightelectricity:9.6,
		sellelectricity:9.6,
		nagas:46,
		lpgas:60,
		kerosene:38,
		gasoline:38,
		lightoil:38,
		heavyoil:38,
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:45,
		car:38
	},
	
	
	// costToCons( cost, energy_name, elecType, kw ) -----------------------------
	//		estimate consumption from cost, per month
	// parameters
	//		cost: energy fee/cost per month
	//		energy_name: energy code
	//		elecType: type of electricity supply
	//		kw:	contract demand
	// return
	//		cons: energy consumption per month
	costToCons : function( cost, energy_name, elecType, kw )
	{
		if(typeof kw === "undefined") kw = 0;
		var ret;
		if ( cost == -1 || cost == "" ) {
			ret = "";
		}
		if (energy_name != "electricity" || typeof(D6.area.elecPrice) == undefined ) {
			// not electricity or no regional parameters
			if ( cost < D6.Unit.priceBase[energy_name] * 2 ) {
				// estimation in case of nealy intercept price
				ret = cost / D6.Unit.price[energy_name] / 2;
			} else {
				// ordinal estimation
				ret = ( cost - D6.Unit.priceBase[energy_name] ) / D6.Unit.price[energy_name];
			}

		} else {
			//regional electricity
			if ( elecType < 0 || !elecType ) {
				if ( D6.consShow["TO"].allDenka ) {
					elecType = 3;
				} else {
					elecType = 1;
				}
			}
			var def = D6.area.elecPrice[elecType];
			ret = ( cost - kw * def[4] - def[3] ) / (( def[1] + def[2] ) / 2);
		}
		return ret;
	},
	
	
	//consToCost( cons, energy_name, elecType, kw ) -----------------------
	//		estimate cost from energy consumption
	// parameters
	//		cons: energy consumption per month
	//		energy_name: energy code
	//		elecType: type of electricity supply
	//		kw:	contract demand
	// return
	//		cost: energy fee/cost per month, not include intercept price
	consToCost : function( cons, energy_name, elecType, kw )
	{
		var ret;

		if ( cons == -1 || cons == "" ) {
			ret = "";
		}
		if ( energy_name != "electricity" || typeof(D6.area.elecPrice) == undefined  ) {
			// this is rough method, multify only unit price
			// it will better to fix regionally
			ret = cons * D6.Unit.price[energy_name];

		} else {
			// electricity
			if ( elecType < 0 || !elecType ) {
				if ( D6.consShow["TO"].allDenka ) {
					elecType = 3;
				} else {
					elecType = 1;
				}
			}
			var def = D6.area.elecPrice[elecType];
			ret  = kw * def[4] + cons * ( def[1] + def[2] ) / 2;
			if( ret > def[3] * 2 ) {
				ret -= def[3];
			} else {
				ret /= 2;
			}
		}
		return ret;
	},
	
	// consToEnergy( cons, energy_name ) --------------------------------
	//		calculate energy from energy consumption 
	// parameters
	//		cons: energy consumption per month
	//		energy_name: energy code
	// return
	//		ret: energy MJ per month
	consToEnergy : function( cons, energy_name )
	{
		var ret;

		if ( cons == -1 || cons == "" ) {
			ret = "";
		}
		ret = cons * D6.Unit.jules[energy_name]/1000000;

		return ret;
	},
};


/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * objectcreate.js 
 * 
 *  Object Create
 *		reference to http://blog.tojiru.net/article/199670885.html by Hiraku NAKANO
 *
 *	usage var newOBJ = D6.object(oldOBJ);
 */

//resolve D6
var D6 = D6||{};

D6.object = function(obj) {
	var func = D6.object.func;
	func.prototype = obj;
	var newo = new func;
	var len=arguments.length;
	for (var i=1; i<len; ++i) {
		for (var prop in arguments[i]) {
			newo[prop] = arguments[i][prop];
		}
	}
	return newo;
};
D6.object.func = function(){};


D6.patch = function( target, fix ) {
	for ( var v in fix ) {
		target[v] = fix[v];
	}
	return target;
};





/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * Energy.js 
 * 
 * Energy calculate base Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/08/23 original ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

//resolve D6
var D6 = D6||{};

D6.Energy = {
	//value of each energy type
	electricity:0,
	nightelectricity:0,
	sellelectricity:0,
	nagas:0,
	lpgas:0,
	kerosene:0,
	gasoline:0,
	lightoil:0,
	heavyoil:0,
	coal:0,
	biomass:0,
	hotwater:0,
	waste:0,
	water:0,
	gas:0,
	car:0,

	//calculated values
	co2:0,
	jules:0,
	cost:0,

	//clear() --------------------------------------------
	//		clear values
	clear: function() {
		for (var i in D6.Unit.co2 ) {
			this[i]= 0;
		}
		this.co2 = 0;
		this.jules = 0;
		this.cost = 0;
		
		//for consbase objects
		if ( typeof(this.subID) !== undefined && this.subID != 0 ){
			if ( D6.viewparam.countfix_pre_after == 1 ) {
				this.mesTitlePrefix = this.countCall + this.subID;
			} else {
				this.mesTitlePrefix = this.subID + this.countCall;
			}
		}
	},

	//calcCO2() ------------------------------------------
	//		calculate total co2
	calcCO2: function() {
		this.co2 = 0;
		for (var i in D6.Unit.co2 ) {
			this.co2 += this[i] * D6.Unit.co2[i];
		}
	},

	//calcJules() ----------------------------------------
	//		calculate total energy
	calcJules: function() {
		this.jules = 0;
		for (var i in D6.Unit.co2 ) {
			this.jules += this[i] * D6.Unit.jules[i];
		}
	},

	calcHeat: function(apf) {
		var kcal = 0;
		for (var i in D6.Unit.co2 ) {
			if ( i=="electricity") {
				kcal += this[i] * D6.Unit.calorie[i] / apf;
			} else {
				kcal += this[i] * D6.Unit.calorie[i];
			}
		}
		return kcal;
	},

	//calcCost() ----------------------------------------
	//		calculate total cost
	calcCost: function() {
		this.cost = 0;
		for (var i in D6.Unit.co2 ) {
			this.cost += this[i] * D6.Unit.price[i];
		}
	},

	//multiply( rate) -------------------------------------
	//		multiply rate to each energy
	multiply :function( rate ) {
		for (var i in D6.Unit.co2 ) {
			this[i] *= rate;
		}
		this.co2 *= rate;
		this.jules *= rate;
		this.cost *= rate;
	},

	//multiplyArray( marray) -------------------------------------
	//		multiply as array to each energy
	multiplyArray :function( marray ) {
		for (var i in D6.Unit.co2 ) {
			this[i] *= marray[i];
		}
		this.calcCO2();
		this.calcJules();
		this.calcCost();
	},


	//copy( source ) --------------------------------------------
	//		copy souce data to this instance
	copy :function( source ) {
		for (var i in D6.Unit.co2 ) {
			this[i] = source[i];
		}
		this.co2 = source.co2;
		this.jules = source.jules;
		this.cost = source.cost;
		//this.endEnergy = ( source.endEnergy ? source.endEnergy : 0 );
		// 190327 calc by energy consumption in each consumption class 
	},

	//sub( target ) ---------------------------------------------
	//		calculate this minus target
	sub :function( target ) {
		for (var i in D6.Unit.co2 ) {
			this[i] -= target[i];
		}
		this.co2 -= target.co2;
		this.jules -= target.jules;
		this.cost -= target.cost;
		//this.endEnergy -= ( target.endEnergy ? target.endEnergy : 0 );
	},

	//add( target ) ---------------------------------------------
	//		add target cons to this cons
	add :function( target ) {
		for (var i in D6.Unit.co2 ) {
			this[i] += target[i];
		}
		this.co2 += target.co2;
		this.jules += target.jules;
		this.cost += target.cost;
		//this.endEnergy += ( target.endEnergy ? target.endEnergy : 0 );
	},
	
	//isSame(target) -------------------------------------------
	//		compare to target
	// return
	//		true : same, false : different
	isSame :function( target ) {
		var same = true;
		for (var i in D6.Unit.co2 ) {
			if( this[i] != target[i] ) {
				same = false;
				break;
			}
		}
		return same;
	}

};






/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * ConsBase.js 
 * 
 * base class of each consumption
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.Energy
D6.ConsBase = D6.object(D6.Energy); //base class is energy

D6.ConsBase.init = function() {
	//----------- declare instanses ---------------------------

	this.measures = []; //related instanses of measure
	// name of related measures is declared in each consumption definition
	//names, codes
	this.title = ""; //caption of this consumption
	this.consName = "consXX"; //name of consumption "cons" +  2 charactors
	this.consCode = ""; //code of consumption written in 2 charactors
	this.subID = 0; //id in same kind of consumtion, rooms or equipments
	this.groupID = 0; //consumption group id
	this.inputGuide = ""; //guide message for input

	//structure
	this.consShow = []; //other main consumption instances list
	this.sumCons = ""; //sum side consumption instance
	this.sumCons2 = ""; //sum related side of consumption
	this.sumConsName = ""; //sum side consumption name
	this.sumCons2Name = ""; //sum related side of consumption name
	this.partCons = []; //part side consumption instances
	this.partCons2 = []; //part related side consumption instance
	this.partConsName = ""; //part side name
	this.partCons2Name = ""; //part related side name
	this.residueCalc = "yes"; //calc residue in this brother consumption ( yes or not)

	//calclation parameters
	this.performance = ""; //performance factor
	this.mainSource = ""; //main energy source
	this.co2Original = ""; //CO2 in case of no measures are selected
	this.costOriginal = ""; //cost in case of no measures are selected
	this.julesOriginal = ""; //energy consumption in case of no measures are selected

	//display
	this.color = ""; //fill color in graph

	//type of calclation
	this.total = false; //in case of reprezent all of related consumption
	// for example, tv consumption not each equipments but total.
	this.orgCopyNum = 0; //count of same consumption
	this.addable = ""; //in case of add consumption set this postfix

	//--------- calclation of consumption ---------------------------------
	// pre calculation
	this.precalc = function() {
		this.clear();
	};

	// calculation
	this.calc = function() {
		this.clear();
	};

	//dummy definition, main routine is defined in each consumption class
	this.calc2nd = function() {};

	//calculation adjust
	this.calcAdjust = function(energyAdj) {
		this.multiplyArray(energyAdj); //main adjust

		//add adjust for some calculation
		this.calcAdjustStrategy(energyAdj);
	};

	//dummy definition, add adjust
	this.calcAdjustStrategy = function(energyAdj) {};

	// in case of monthly calculation
	this.consSumMonth = function(source, month) {
		for (var i in D6.Unit.co2) {
			this[i] += source[i] * month;
		}
		this.co2 += source.co2 * month;
		this.cost += source.cost * month;
	};

	//--------- calculation of each measures ---------------------------------

	//main calculation of measures , defined in each classes
	this.calcMeasure = function() {};

	//measures initialize, fit to consumption
	this.calcMeasureInit = function() {
		for (var mes in this.measures) {
			//set reduction zero
			this.measures[mes].setzero();
		}
	};

	// when select measure, reduce consumption with related consumption link
	//		called by addReduction in measures files
	//		originalConsName: consumption name of original in chain
	//		sourceConsName: consumption name called by
	this.addReductionMargin = function(margin, originalConsName, sourceConsName) {
		var ccons;
		var pcons;
		var fromPart;

		//execute reduction of consumption
		this.add(margin);
		this.calcCO2(); //calculate CO2, cost and energy
		this.calcCost();
		this.calcJules();

		//reduction chain in use of relation
		if (sourceConsName == "") {
			sourceConsName = originalConsName;
		}

		//sum side of reduction
		if (
			this.sumConsName != sourceConsName &&
			this.sumConsName != originalConsName
		) {
			// if the direction is not called by
			ccons = this.sumCons;
			if (ccons) {
				if (ccons[this.subID]) {
					ccons[this.subID].addReductionMargin(
						margin,
						originalConsName,
						this.consName
					);
				} else {
					ccons.addReductionMargin(margin, originalConsName, this.consName);
				}
			}
		}

		//sum related side of reduction
		if (
			this.sumCons2Name != "" &&
			this.sumCons2Name != sourceConsName &&
			this.sumCons2Name != originalConsName
		) {
			// if the direction is not called by
			ccons = this.sumCons2;
			if (ccons) {
				if (ccons[this.subID]) {
					ccons[this.subID].addReductionMargin(
						margin,
						originalConsName,
						this.consName
					);
				} else {
					ccons.addReductionMargin(margin, originalConsName, this.consName);
				}
			}
		}

		//part side reduction
		if (this.consCode != "TO") {
			// total consumption is excluded

			//part side
			fromPart = false;
			for (pcons in this.partCons) {
				if (
					this.partCons[pcons].consName == sourceConsName ||
					this.partCons[pcons].consName == originalConsName
				) {
					//in case of looped
					fromPart = true;
				}
			}
			if (!fromPart && this.partCons.length > 0) {
				// step to detail sub part calclation
				this.addReductionMargin2Part(
					this.partCons,
					margin,
					originalConsName,
					this.consName
				);
			}

			//part related side
			fromPart = false;
			for (pcons in this.partCons2) {
				if (
					this.partCons2[pcons].consName == sourceConsName ||
					this.partCons2[pcons].consName == originalConsName
				) {
					fromPart = true;
				}
			}
			if (!fromPart && this.partCons2.length > 0) {
				// step to detail sub part calclation
				this.addReductionMargin2Part(
					this.partCons2,
					margin,
					originalConsName,
					this.consName
				);
			}
		}
	};

	//calclate to sub part reduction, take rate of each sub consumption for consern
	this.addReductionMargin2Part = function(
		pconsList,
		margin,
		originalConsName,
		sourceConsName
	) {
		var submargin = D6.object(D6.Energy);
		var pcons;

		if (pconsList.length > 1) {
			//sum of part side consumptions
			var sumCo2 = 0;
			for (pcons in pconsList) {
				if (!isNaN(pconsList[pcons].co2)) {
					sumCo2 += pconsList[pcons].co2;
				}
			}

			//chech if objects not matrix
			if (
				pconsList[0].orgCopyNum >= 1 &&
				pconsList[0].subID != pconsList[1].subID
			) {
				//in case of matrix,  devide reduction acrding to consumption amount
				for (pcons in pconsList) {
					if (pconsList[pcons].co2 > 0) {
						submargin.copy(margin);
						submargin.multiply(pconsList[pcons].co2 / sumCo2);

						//calc next relation
						pconsList[pcons].addReductionMargin(
							submargin,
							originalConsName,
							this.consName
						);
					}
				}
			} else {
				//in case of objects
				//	親のmeasuresについて、pconsListにリストされているconsNameが存在する場合
				//	分割側の消費量を、対策の消費量とする（もう一度親を計算する） consAC
				//		例： mes["consACCool"] = ***; を 消費クラスで定義
				//親のIDがある場合にはそのsubIDを用いる（冷暖房部屋など）
				for (pcons in pconsList) {
					if (pconsList[pcons].co2 > 0) {
						if (pconsList[pcons].consAddSet) {
							//devide method is defined in consAddSet
							for (var pmes in this.measures) {
								var mes = this.measures[pmes];
								if (mes.selected && mes[pconsList[pcons].consName]) {
									submargin.copy(mes[pconsList[pcons].consName]);
									submargin.sub(pconsList[pcons]);
									pconsList[pcons].addReductionMargin(
										submargin,
										originalConsName,
										this.consName
									);
								}
							}
						} else {
							// not defined
							submargin.copy(margin);
							submargin.multiply(pconsList[pcons].co2 / sumCo2);
							pconsList[pcons].addReductionMargin(
								submargin,
								originalConsName,
								this.consName
							);
						}
					}
				}
			}
		}
	};

	//set input data
	this.input = function(InDataCode, defaultData) {
		var ret;
		//return only average if average mode
		if (
			D6.averageMode &&
			!(
				InDataCode == "i021" ||
				InDataCode == "i022" ||
				InDataCode == "i023" ||
				InDataCode == "i024" ||
				InDataCode == "i001"
			)
		) {
			if (D6.scenario.defCalcAverage.indexOf(InDataCode) == -1) {
				return defaultData;
			}
		}

		var InData = D6.doc.data[InDataCode];
		if (typeof InData === "undefined" || InData == -1 || InData === "") {
			//in  InData compare, user  === instead of ==
			ret = defaultData;
		} else {
			ret = InData;
			if (D6.scenario.defInput[InDataCode.substr(0, 4)].varType == "Number") {
				//convert to number
				ret = parseFloat(ret);
			}
		}
		return ret;
	};

	//set 2seasons input data
	this.input2seasons = function(InDataCode1, InDataCode2, defaultData) {
		var ret = [];
		var r0 = this.input(InDataCode1, -1);
		var r1 = this.input(InDataCode2, r0);
		if (r0 == -1) {
			if (r1 == -1) {
				r0 = r1 = defaultData;
			} else {
				r0 = r1;
			}
		}
		ret[0] = r0;
		ret[1] = r1;
		return ret;
	};

	//get equip parameters
	this.getEquipParameters = function(year, size, sizeThreshold, defEquip) {
		var ret = {};

		//get definisiton by size
		var sizeCode = sizeThreshold[0];
		for (var sizeTmp in sizeThreshold) {
			if (size > sizeThreshold[sizeTmp] * 1.001) {
				continue;
			} else {
				sizeCode = sizeThreshold[sizeTmp];
				break;
			}
		}
		var defs = defEquip[sizeCode];

		// get parameters by year
		var justbefore = -9999;
		var justafter = 99999;
		for (var defone in defs) {
			if (year <= defone) {
				if (defone < justafter) justafter = defone;
			} else {
				if (defone > justbefore) justbefore = defone;
			}
		}
		for (var parameters in defs[justbefore]) {
			ret[parameters] =
				((justafter - year) * defs[justbefore][parameters] +
					(year - justbefore) * defs[justafter][parameters]) /
				(justafter - justbefore);
		}
		return ret;
	};

	//room/equip id
	this.setsubID = function(num) {
		this.subID = num;
		if (this.titleList) {
			this.title = this.titleList[num];
		}
	};

	//is this measure selected?
	this.isSelected = function(mName) {
		if (!this.measures[mName]) {
			return false;
		} else {
			return this.measures[mName].selected;
		}
	};

	//get size rank
	//	val : value, thresholdList: list of value to get rank
	this.getIndex = function(val, thresholdList) {
		for (var i = 0; i < thresholdList.length; i++) {
			if (val < thresholdList[i]) {
				return i;
			}
		}
		return thresholdList.length;
	};
};

D6.ConsBase.init();

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * measurebase.js  
 * 
 *  MeasureBase Class, effect and detail of measures
 * 
 * calculation code is written in cons class not in this measure class
 * selection of measure is dealed in this class and send to cons class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/08/23 designed as ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * init()
 * Constructor()			copy definition
 * 
 * clearMeasure()			clear
 * setzero()				initialize to no effect
 * 
 * calcSave()				calculate co2 and cost reduction of each measure
 * calcReduceRate()			calculate reduction by reduce rate
 * calcReduceRateOne()
 * calcReduceRateWithParts()
 * 
 * addReduction()			select and add one measure
 * 
 * calc()					in case want to calculate only one measure
 * measureSumMonth()		sum 12 month
 */

//resolve D6
var D6 = D6||{};

//Inherited class of D6.Energy
D6.MeasureBase = D6.object(D6.Energy);		//measure class include energy 

D6.MeasureBase.init = function() {
	//------declare of member value---------------------------
	this.mesID = 0;					//measure ID (serial number)
	this.mesdefID = 0;				//measure ID (defined number)
	this.subID = 0;					//equip/room ID
	this.groupID = 0;				//related group ID
	this.measureName = "";			//measure Name Code

	//related consumption
	this.cons = "";					//related consumption class instance
	
	//status
	this.selected = false;			//is selected
	this.available = false;			//is available to calculate

	//reduction rate (common)
	this.reduceRate = 0;

	//abstract of parameters
	this.title = "";				//detail name
	this.titleShort = "";			//short name to use in graph, max 10 charactors
	this.priceNew = 0;				//price of new low energy equipment, yen
	this.priceOrg = 0;				//price of new ordinal equipment, yen
	this.lifeTime = 0;				//lifetime of equipment ,year
	this.lifestyle = 2;				//is lifestyle measure? 1:lifestyle , 2 not lifestyle need to buy

	this.def = "";					//definition
	
	//priority to use as cost , not use common method
	this.costUnique;

	//merit through this measure, in variable situation 
	this.co2Change = 0;				//CO2 emission change, minus is saving kg/year
	this.co2ChangeW1 = 0;			//weighted value include CO2 and easiness  
	this.co2ChangeW2 = 0;			//weighted value 2 include CO2 and easiness  
	this.costOtherChange = 0;		//price of base charge change
	this.costChange = 0;			//cost change include base charge yen/year
	this.costTotalChange = 0;		//cost change include base charge and install cost
	this.payBackYear = 0;			//pay back year of install cost
	this.easyness = 0;				//easyness 1-5
	
	//merit through this measure, in default no selected situation
	this.co2ChangeOriginal = 0;			//CO2 emission change, minus is saving kg/year
	this.costOriginal = 0;				//cost related to this measure yen/year 
	this.costChangeOriginal = 0;		//cost change include base charge yen/year
	this.costTotalChangeOriginal = 0;	//cost change include base charge and install cost yen/year

	//merit through this measure, in select situation, in order to sum total reduction 
	this.co2ChangeSumup = 0;		//CO2 emission change, minus is saving kg/year
	this.costSumup = 0;				//cost related to this measure yen/year 
	this.costChangeSumup = 0;		//cost change include base charge yen/year
	this.costTotalChangeSumup = 0;	//cost change include base charge and install cost yen/year
	
	//advice message
	this.advice = "";				//advice messeage
	this.joyfull = "";				//advice message of easy way
	this.figNum = 0;				//picture number

	//subsidy informataion
	this.hojoGov = 0;				//national subsidy
	this.genzeiGov = 0;				//national tax reduction
	this.hojoInfo = "";				//text to describe subsidy and tax reduction
};
D6.MeasureBase.init();


//constructor, copy definition from scenarioset.js
D6.MeasureBase.Constructor = function( consInstance, mdef, mesIDP ) {
	this.def = mdef;
	this.measureName = mdef["name"];			//measure class name
	this.cons = consInstance;					//related consumption class
	this.mesID = mesIDP;
	this.mesdefID =  mdef["mid"];

	this.title = mdef["title"];
	this.titleShort = mdef["titleShort"];
	this.lifeTime = mdef["lifeTime"];
	this.priceOrg = mdef["price"];
	this.groupID = this.cons.groupID;
	this.subID = this.cons.subID;
	this.lifestyle = mdef["lifestyle"];
	this.advice = mdef["advice"];
	this.joyfull = mdef["joyfull"];
	this.figNum = mdef["figNum"];
	this.priceNew = mdef["price"];
	this.priceOrg = mdef["price"];
	this.easyness = mdef["easyness"];
	this.relation = mdef["relation"];
};


//clear and initialize
D6.MeasureBase.clearMeasure = function() {
	this.priceNew = 0;
	this.lifeTime = 0;
	this.co2Change = 0;
	this.co2ChangeW1 = 0;
	this.co2ChangeW2 = 0;
	this.costChange = 0;
	this.payBackYear = 0;
	this.costOtherChange = 0;
	this.costTotalChange = 0;
	this.co2ChangeSumup = 0;
	this.costChangeSumup = 0;
	this.costTotalChangeSumup = 0;
	this.available = false;
	this.costUnique = 0;
	this.priceOrg = 0;
	this.price = 0;
		
	this.clear();
};

//calculate save cost and CO2 by each energy change, called by D6.calcMeasureOne()
D6.MeasureBase.calcSave = function() {
	//calculate CO2
	this.calcCO2();

	this.co2Change = this.co2 - this.cons.co2;
		
	//weighted value include CO2 and easiness  
	this.co2ChangeW1 = this.co2Change * this.def.easyness
						* ( this.def.lifestyle == 1 ? 2 : 1 );
	this.co2ChangeW2 = this.co2Change 
						* this.def.easyness * this.def.easyness
						* ( this.def.lifestyle == 1 ? 3 : 1 );

	//calculate cost
	if ( this.costUnique != 0 && !isNaN(this.costUnique) ) {
		this.cost = this.costUnique;
	} else {
		this.calcCost();
	}
	this.costChange = ( this.cost == 0 ? 0 : this.cost - this.cons.cost );

	//do not display measures
	if ( this.def.easyness < 0 ) {
		this.co2Change = 0;
		this.costChange = 0;
	}

	//save as original value if no measure is selected
	if ( D6.isOriginal ) {
		this.co2Original = this.co2;
		this.costOriginal = this.cost;
		this.co2ChangeOriginal = this.co2Change;
		this.costChangeOriginal = this.costChange;
		this.co2ChangeW1Original = this.co2ChangeW1;
		this.co2ChangeW2Original = this.co2ChangeW2;
	}	

	//calculate total cost include install cost
	if ( this.priceNew == 0 ) this.priceNew = this.priceOrg;
	if ( this.priceNew >= 0 && this.lifeTime > 0 )
	{
		this.costTotalChange = this.costChange + this.priceNew / this.lifeTime / 12;

		//payback year
		if ( this.costChange > 0 ) {
			this.payBackYear = 999;
		} else {
			this.payBackYear = Math.min( Math.round( -this.priceNew / this.costChangeOriginal / 12 ), 999 );
		}
	} else {
		this.costTotalChange = this.costChange;
	}

	if ( D6.isOriginal ) {
		this.costTotalChangeOriginal = this.costTotalChange;
	}	

};


//set reduction zero, or initialize by copy consumption data
D6.MeasureBase.setzero = function() {
	this.copy( this.cons );
};

//calculate saving amount by reduction rate
D6.MeasureBase.calcReduceRate = function( reduceRate ) {
	this.copy( this.cons );
	this.multiply( 1 - reduceRate );
};

//calculate saving amount of selected energy by reduction rate
D6.MeasureBase.calcReduceRateOne =  function( target, reduceRate ) {
	this.copy( this.cons );
	this[target] = this.cons[target] * ( 1- reduceRate);
};

//expand reduction rate to sub category
D6.MeasureBase.calcReduceRateWithParts = function( reduceRate, partCons ){
	this.calcReduceRate( reduceRate );
	for( var c in partCons ){
		this[partCons[c].consName] = D6.object( D6.Energy );
		this[partCons[c].consName].copy( partCons[c] );
		this[partCons[c].consName].multiply( 1 - reduceRate );
	}
};
	
//select and add this measure, and set reduction value
D6.MeasureBase.addReduction = function() {
	var margin = D6.object(D6.Energy);

	margin.copy( this );
	margin.sub( this.cons );

	//expand difference to related consumption
	this.cons.addReductionMargin( margin, this.cons.consName );
};

//calculation of measure, in case want to calculate one measure 
//
//	in standard process, D6.calcMeasures() directly call cons.calcMeasure in consumption class. 
//
D6.MeasureBase.calc = function() {
	this.clearMeasure();					//clear data
	this.calcMeasure( this.measureName );	//call consumption class 
	this.calcSave();						//calc saving CO2 and cost
};

//sum up 12 months, in case of calculate by month
D6.MeasureBase.measureSumMonth = function( source, month ) {
	for (var i in this.Unit.co2 ) {
		this[i] += source[i] * month;
	}
	this.co2 += source.co2 * month;
	this.co2Change += source.co2Change * month;
	this.co2ChangeOriginal += source.co2ChangeOriginal * month;
	this.cost += source.cost * month;
	this.costChange += source.costChange * month;
	this.costTotalChange += source.costTotalChange * month;
	this.costOriginal += source.costOriginal * month;
	this.costChangeOriginal += source.costChangeOriginal * month;
	this.costTotalChangeOriginal += source.costTotalChangeOriginal * month;
};

//room/equip name set
//部屋や機器が複数ある場合には何番目かを示す。
D6.MeasureBase.setRoomTitle = function( subname ){
	this.title = subname + "の" + this.title;
	this.titleShort = this.titleShort + "(" + subname + ")";

};
	





/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * doc.js 
 * 
 * document main Class, store, stock
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 *								2011/06/15 designed as document class
 *								2011/08/23 save as dynamic value
 * 								2016/04/12 ported to JavaScript
 * 
 * clear()
 * loadDataSet()
 */
var D6 = D6 || {};

D6.doc =
{
	//define variables
	data : [],								//input values
	equip : [],								//equiment price

	// clear values
	//		dialog:false not to show dialog
	clear : function( dialog ) {
		var answer;
		var AreaOrgBackup;

		//show dialog
		if ( dialog ){
			if ( answer == "CANCEL" ) {
				return;
			}
		}

		//backup no need to clear
		AreaOrgBackup = this.data["AreaOrg"];

		//clear
		this.data = new Array();

		//restore area setting
		this.data["AreaOrg"] = AreaOrgBackup;
		this.data["Area"] = AreaOrgBackup;
	},

	
	// serialize prepare for saving
	//
	serialize :  function() {
		var saveData = "";
		var temp = "";
		var tempg = "";
		var tempi = "";
		var prop = 0;
		var i = 0;
		var Input = this.data;

		for ( prop in Input )
		{
			if (D6.scenario.defInput[prop.substr(0,4)].defaultValue == Input[prop] ) continue;
			temp = "" + Input[prop];

			//in case of string
			if ( typeof( Input[prop] ) == "string" ) {
				// double width to single width charactor
				while ( temp.indexOf( " " ) != -1)
				{
					i = temp.indexOf( " " );
					temp = temp.substring( 0, i - 1 ) + "_" + temp.substring( i + 1, 2000);
				}
				// change ',' to '~'
				while ( temp.indexOf( "," ) != -1 )
				{
					i = temp.indexOf( "," );
					temp = temp.substring( 0, i - 1 ) + "~" + temp.substring( i + 1, 2000);
				}
			}
			saveData = saveData + prop + "=" + temp + ",";
		}

		//save room/equipment number
		for ( prop in D6.logicList )
		{
			if ( D6.logicList[prop].orgCopyNum >= 1 ) {
				saveData += prop + "=" + D6.logicList[prop].orgCopyNum + ",";
			}
		}

		//serialize(mesSelId=00x00x0xx0xx...)
		var sel = "";
		for ( i=0 ; i < D6.measureList.length ; i++ )
		{
			if ( D6.measureList[i].selected ) {
				//code 5number 3 mesid + 2 groupid
				temp = "000" + D6.measureList[i].mesdefID;
				tempg = "00" + D6.measureList[i].subID;
				sel += temp.substr( -3 ) + tempg.substr( -2 );
				//initialcost 8num
				tempi = "00000000" + D6.measureList[i].priceNew;
				sel += tempi.substr( -8 );
				//annual cost [ 8 up/ 9 down ] + 7num
				if (  D6.measureList[i]. costChangeOriginal > 0 ){
					sel += "9";					
				} else {
					sel += "8";
				}
				temp = "0000000" + Math.abs(Math.round(D6.measureList[i].costChangeOriginal));
				sel += temp.substr( -7 );
				//annual co2 [ 8 up/ 9 down ] + 5num
				if (  D6.measureList[i]. co2ChangeOriginal > 0 ){
					sel += "9";					
				} else {
					sel += "8";
				}
				temp = "00000" + Math.abs(Math.round(D6.measureList[i].co2ChangeOriginal));
				sel += temp.substr( -5 );
			}
		}

		saveData += "mesSelId=" + sel;

		return saveData;
	},
	

	//loadDataSet()  set data from file
	//
	// parameters
	// 		loadData: stored data to set
	// 		addflag: not used  flag
	// result
	//		mesSel: selected list of measure id  
	//
	loadDataSet : function ( loadData, addflag ) {
		var param;
		var paramOne;
		var val;
		var vname;
		var vnameDef;
		var i;
		var j;
		var prop;	//temporary value
		var mesSel;	//selected measures temporary stock
		var Input = this.data;
		var indef = D6.scenario.defInput;
		var mesid = 0;
		var subid = 0;

		//expanded to values 
		param = loadData.split(",");
		for ( i=0 ; i<param.length ; i++ )
		{
			if ( param[i] ) {
				paramOne = param[i].split("=");
				vname = paramOne[0];				//ID
				vnameDef = vname.substr( 0,4 );
				val = paramOne[1];					//value
			} else {
				vname = "dummy";
			}

			if ( D6.logicList[vname] ) {
				if ( parseInt(val) && parseInt(val) < 100 ) {
					if ( !addflag ) {
						D6.logicList[vname].orgCopyNum = parseInt(val);
					}
				}
			} else if ( indef[vnameDef] ) {
				//in case of defined in valuable list
				switch (  indef[vnameDef].varType ) {
				case "Number":
					Input[vname] = parseFloat( val );
					break;

				case "String":
					// convert '_' to ' '
					j = val.indexOf( "_" );
					while ( j != -1 )
					{
						val = val.substring( 0, j ) + " " + val.substring( j + 1, 200);
						j = val.indexOf( "_" );
					}
					// convert '~' to ','
					j = val.indexOf( "~" );
					while ( j != -1 )
					{
						val = val.substring( 0, j ) + "," + val.substring( j + 1, 200);
						j = val.indexOf( "~" );
					}
					// remove """
					j = val.indexOf( "\"" );
					while ( j != -1 )
					{
						val = val.substring( 0, j ) + val.substring( j + 1, 200);
						j = val.indexOf( "\"" );
					}
					//save to valuable
					Input[vname] = val;
					break;

				default:
					//boolian, nodata
					if ( vname == "mesSelId" ) {
						mesSel = val;
						for ( j=0 ; j<mesSel.length ; j+=27 ) {
							mesid = parseInt(mesSel.substr( j, 3 ));
							subid = parseInt(mesSel.substr( j+3, 2 ));
							for ( var k=0 ; k < D6.measureList.length ; k++ ) {
								if (D6.measureList[k].mesID == mesid && D6.measureList[k].subID == subid) {
									D6.measureList[k].seleted = true;
									break;
								}
							}
						}
					} else {
						if ( val == "true" ) {
							Input[vname] = true;
						} else if ( val == "false" ) {
							Input[vname] = false;
						}
					}
				}
			}
		}
		return mesSel;
	}
};

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Main Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * need d6_construct, d6_calccons, d6_calcmeasures, d6_calcaverage, d6_setvalue, d6_tools
 * 
 * construct();
 *   setscenario()					initialize diagnosis structure by scenario file
 *   addMeasureEachCons()			add measure definition
 *   addConsSetting()				add consumption definition 
 
 * calcCons()					calculate consumption
 * calcConsAdjust()				adjust consumption

 * calcMeasures()				calculate measure
 * calcMeasuresLifestyle()		calculate all measures and select lifestyle
 * calcMeasuresNotLifestyle()	calculate all measures and select not lifestyle
 * calcMeasuresOne()			calculate in temporal selection
 * calcMaxMeasuresList()		automatic select max combination 

 * calcAverage()				get avearage consumption
 * rankIn100()					get rank				

 * inSet()						input data setter
 * measureAdd()					set select flag and not calculate 
 * measureDelete()				clear select flag and not calculate 

 * getGid()						get group id
 * getCommonParameters()		result common parameters
 * 
 * toHalfWidth()
 * ObjArraySort()
 * 
 * other D6 class
 * 		D6.disp		disp.js, disp_input.js, disp_measure.js
 * 		D6.senario	scenarioset.js
 * 
 */

//resolve D6
var D6 = D6 || {};

//instances
D6.consList = []; //consumption full list
D6.consListByName = []; //consumption list by consname
D6.consShow = []; //major consumption list by conscode
D6.measureList = []; //measure list
D6.monthly = []; //monthly energy
D6.resMeasure = []; //result of measures list

D6.mesCount = 0; //count of measures
D6.consCount = 0; //count of consumptions

D6.average = {
	consList: ""
}; //average of consumptions

D6.isOriginal = true; //in case of no measure is selected
D6.sortTarget = "co2ChangeOriginal"; //by which measureas are sorted, changeable by input

//view / Debug set. set in workercalc(start,*)
D6.viewparam = {};
D6.debugMode = false;

//constructor
D6.constructor = function(a, b, c) {
	D6.setscenario(a, b, c);
};

//calculate
D6.calculateAll = function() {
	D6.area.setCalcBaseParams();
	//D6.calcCons();
	D6.calcAverage();
	D6.calcMeasures(-1);
};

//log
D6.calclog = "";
D6.calcshow = "";

/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * base64.js 
 * 
 * define atob , btoa
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/04/12 original to JavaScript
 */

// atob, btoa is defined in windows. it doesn't work in web worker
if (typeof atob == "undefined") {
	atob = function(str) {
		return str;
	};
	btoa = function(str) {
		return str;
	};
}

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * d6_calcmonthly.js 
 * 
 * D6 Monthly Class, calculate season or monthly difference
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2012/08/20 created as ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 */

var D6 = D6 || {};

D6.calcMonthly = function( ave, season, monthly, seasonPatternP, energyCode ) {
	// first use monthly, season
	// next  use seasonPattern

	var month2season = [ 0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 0 ];
	var seasonPatternCons = [ 0, 0, 0 ];	//winter, spring, summer
	var seasonPattern = [ 0, 0, 0 ];
	var seasonCount = [ 0, 0, 0 ];
	var seasonCons = [ 0, 0, 0 ];
	//var monthlyCons = [];
	var i;
	var noConsData = true;

	//estimate season pattern by monthly consumption
	var sumCons = 0;
	var countCons = 0;
	for ( i=0 ; i<12 ; i++ ) {
		if( monthly[i] != -1 ) {
			seasonPatternCons[month2season[i]] += monthly[i];
			seasonCount[month2season[i]]++;
			sumCons += monthly[i];
			countCons++;
			noConsData = false;
		}
	}
		
	//seasonal weight
	if ( seasonCount[0] > 0 &&  seasonCount[1] > 0 && seasonCount[2] > 0 ) {
		//monthly consumption has priority to calculate
		seasonPattern[0] = seasonPatternCons[0] / seasonCount[0];
		seasonPattern[1] = seasonPatternCons[1] / seasonCount[1];
		seasonPattern[2] = seasonPatternCons[2] / seasonCount[2];
	} else if ( season[0] != -1 && season[1] != -1 && season[2] != -1 ) {
		//all seasonal value is set
		seasonPattern[0] = season[0];
		seasonPattern[1] = season[1];
		seasonPattern[2] = season[2];
	} else if (seasonPatternP ) {
		//not all season value is set
		seasonPattern = seasonPatternP;
	} else {
		//no data is set
		seasonPattern = [ 1, 1, 1 ];
	}

	//normalize seasonal parameters
	var sum = seasonPattern[0]*4 + seasonPattern[1]*5 + seasonPattern[2]*3;
	if ( sum != 0 ) {
		seasonPattern[0] *= 12/sum;
		seasonPattern[1] *= 12/sum;
		seasonPattern[2] *= 12/sum;
	}

	//calculate seasonal fee
	if( season[0] == -1 && season[1] == -1 && season[2] == -1 ) {
		//no data
		if ( countCons > 6 ) {
			ave = D6.Unit.consToCost( sumCons / countCons, energyCode );
		}
		//calculate from average consumption
		season[0] = ave * seasonPattern[0];
		season[1] = ave * seasonPattern[1];
		season[2] = ave * seasonPattern[2];
	} else {
		//calculate from seasonal data
		noConsData = false;
		var ave2 = 0;
		var ave2count = 0;
		for( i=0 ; i<3 ; i++ ) {
			if ( seasonPattern[i] != 0 ) {
				if( season[i] != -1 ) {
					ave2 += season[i] / seasonPattern[i];
					ave2count++;
				} else if ( seasonCount[i] >= 1 ) {
					season[i] = D6.Unit.consToCost( seasonPatternCons[i] / seasonCount[i], energyCode );
					ave2 += season[i] / seasonPattern[i];
					ave2count++;
				}
			} else{
				//not use is effiective data
				ave2count++;
			}
		}

		ave2 /= ave2count;
		ave = ave2;
		season[0] = ( season[0] == -1 ? ave * seasonPattern[0] : season[0] );
		season[1] = ( season[1] == -1 ? ave * seasonPattern[1] : season[1] );
		season[2] = ( season[2] == -1 ? ave * seasonPattern[2] : season[2] );
	}

	//estimate monthly consumption
	seasonCons[0] = D6.Unit.costToCons( season[0], energyCode );
	seasonCons[1] = D6.Unit.costToCons( season[1], energyCode );
	seasonCons[2] = D6.Unit.costToCons( season[2], energyCode );

	//set to monthly data
	var sim, si, sip;
	for ( i=0 ; i<12 ; i++ ) {
		if ( monthly[i] == -1 ) {
			sim = month2season[ (i+12-1) % 12 ];
			si = month2season[ i ];
			sip = month2season[ (i+1) % 12 ];
			monthly[i] = ( season[sim] + season[si] + season[sip] ) / 3;
		}
	}
	
	//return value set
	var ret = [];
	ret.ave = ave;
	ret.season  = season;
	ret.seasonCons  = seasonCons;
	ret.monthly = monthly;
	ret.noConsData = noConsData;

	return ret;
};
/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * d6_get.js 
 * 
 * called from d6fcalc.js
 * 
 * display data create main Class
 * 		combined with disp_input.js, disp_demand.js, disp_measue.js
 * 
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * showResultTable()		get collective result
 *
 * getAverage()			get average value
 * getAverage_cons()		get average table data set
 *
 * getItemize()		itemize
 * getItemizeGraph()
 * dataItemize()			get itemized value
 * 
 * getMonthly()		monthly graph data
 * 
 */

//resolve D6
var D6 = D6 || {};

//result total values
//	param
//		consName : ex. "consTotal"
//  return
//		graphItemize,graphMonthly,average,cons,measure
D6.getAllResult = function(consName) {
	var ret = {};
	if (consName) {
		if (!D6.logicList[consName]) consName = "consTotal";
		this.nowConsPageName = consName;
	} else {
		consName = "consTotal";
	}
	//if( this.nowConsPageName ) {
	//	consName = this.nowConsPageName;
	//}

	//get consCode
	var consCode = D6.consListByName[consName][0].consCode;

	//create collective result
	ret.common = this.getCommonParameters(consCode);
	ret.consShow = this.getConsShow();

	ret.monthly = this.getMonthly();
	ret.average = this.getAverage(consCode);
	ret.average_graph = this.getAverage_graph();
	ret.itemize = this.getItemize(consCode);
	ret.itemize_graph = this.getItemizeGraph(consCode);
	ret.measure = this.getMeasure(consName);

	return ret;
};

//compare to average value about one Consumption
// params
//		consCode : consumption category
// return
//		you and average params
D6.getAverage = function(consCode) {
	var ret = {};

	ret.you = D6.consShow[consCode].co2Original * 12; //yearly co2 emission
	ret.youc = D6.consShow[consCode].costOriginal * 12; //yearly cost
	ret.after = D6.consShow[consCode].co2 * 12; //yearly co2 after set measures
	ret.afterc = D6.consShow[consCode].cost * 12; //yearly cost after set measures

	ret.av = D6.average.consList[consCode].co2Original * 12; //yearly average co2
	ret.avc = D6.average.consList[consCode].costOriginal * 12; //yearly average cost

	ret.rank100 = D6.rankIn100(ret.you / ret.av); //rank( 1-100 )
	ret.afterrank100 = D6.rankIn100(ret.after / ret.av); //rank after set measures( 1-100 )

	var d6i012 = D6.doc.data["i021"];
	ret.samehome =
		D6.scenario.defSelectValue.sel021[d6i012 && d6i012 > 0 ? d6i012 : 13];

	//same home's name
	ret.sameoffice = D6.scenario.defSelectValue.sel001[D6.doc.data["i001"]];
	//same office's name

	ret.consCode = consCode;
	return ret;
};

//average compare result
D6.getAverage_graph = function() {
	var ret = {};
	ret.cost = [];
	ret.co2 = [];

	//  co2[0], cost[0] user
	ret.co2[0] = {};
	ret.co2[0].electricity =
		D6.consTotal.electricityOriginal * D6.Unit.co2.electricity;
	ret.co2[0].gas = D6.consTotal.gasOriginal * D6.Unit.co2.gas;
	ret.co2[0].kerosene = D6.consTotal.keroseneOriginal * D6.Unit.co2.kerosene;
	ret.co2[0].car = D6.consTotal.carOriginal * D6.Unit.co2.gasoline;
	ret.co2[0].total = D6.consTotal.co2Original;

	//user cost
	ret.cost[0] = {};
	ret.cost[0].electricity = D6.consTotal.priceEle;
	ret.cost[0].gas = D6.consTotal.priceGas;
	ret.cost[0].kerosene = D6.consTotal.priceKeros;
	ret.cost[0].car = D6.consTotal.priceCar;

	//	co2[1], cost[1] average
	//ret.cost[1] = D6.area.averageCostEnergy;　この値とkeroseneの値が異なる
	ret.co2[1] = {};
	ret.co2[1].total = D6.average.consList["TO"].co2Original;
	ret.co2[1].electricity =
		D6.average.consList["TO"].electricityOriginal * D6.Unit.co2.electricity;
	ret.co2[1].gas = D6.average.consList["TO"].gasOriginal * D6.Unit.co2.gas;
	ret.co2[1].kerosene =
		D6.average.consList["TO"].keroseneOriginal * D6.Unit.co2.kerosene;
	ret.co2[1].car = D6.average.consList["TO"].carOriginal * D6.Unit.co2.car;

	//average cost
	ret.cost[1] = {};
	ret.cost[1].electricity = D6.average.consList["TO"].priceEle;
	ret.cost[1].gas = D6.average.consList["TO"].priceGas;
	ret.cost[1].kerosene = D6.average.consList["TO"].priceKeros;
	ret.cost[1].car = D6.average.consList["TO"].priceCar;

	return ret;
};

//itemized value
// parameter
// 		consCode : consumption category
// result
//		ret[nowConsCode] : itemized data for table( all items )
//
D6.getItemize = function(consCode) {
	var ret = {};
	var cons;
	var i = 0;

	for (var cid in D6.consList) {
		cons = D6.consList[cid];
		ret[i] = {};

		//name
		ret[i].title = cons.title;
		ret[i].consName = cons.consName;
		ret[i].subID = cons.subID;
		ret[i].sumConsName = cons.sumConsName;
		ret[i].sumCons2Name = cons.sumCons2Name;
		ret[i].countCall = cons.countCall;

		//co2
		ret[i].co2 = cons.co2;
		ret[i].co2Total = D6.consShow["TO"].co2;

		//each energy
		ret[i].electricity = cons.electricity;
		ret[i].nightelectricity = cons.nightelectricity;
		ret[i].gas = cons.gas;
		ret[i].water = cons.water;
		ret[i].coal = cons.coal;
		ret[i].hotwater = cons.hotwater;
		ret[i].kerosene = cons.kerosene;
		ret[i].car = cons.car;
		ret[i].color = cons.color;
		i++;
	}
	return ret;
};

//itemize graph data set
// parameters
//		consCode: consumption code
//		sort:sort target (co2,energy,money)
// result
//		itemized co2 graph data
D6.getItemizeGraph = function(consCode, sort) {
	var otherCaption = "other";

	if (consCode) {
		this.nowConsCode = consCode;
	}
	consCode = this.nowConsCode;
	if (sort) {
		this.nowSortTarget = sort;
	}
	sort = this.nowSortTarget;

	//graph data
	var menu = {
		co2: { sort: "co2", title: "kg", round: 1, divide: 1 },
		energy: { sort: "jules", title: "GJ", round: 1, divide: 1000 },
		money: { sort: "cost", title: "yen", round: 10, divide: 1 } // same code to view
	};
	var show = menu[sort ? sort : "co2"];

	var ret = {};

	//in function getItemizeGraph( return one target of graph data )
	// params
	//		target:   co2/jules/cost
	//		scenario:
	//		original: "original" or ""
	//		consCode: 2 charactors
	// result
	//		ret[]
	var gdata = function(target, scenario, original, consCode) {
		var sorttarget = show.sort;
		if (original) sorttarget += "Original";
		var sum = 0;
		var data = [];
		var di = 0;
		if (consCode == "TO") {
			//in case of Total consumption
			for (var cid in target) {
				if (cid == "TO") continue;
				if (cid == "") continue; //180413
				data[di] = {};
				data[di]["compare"] = scenario;
				data[di]["ratio"] =
					Math.round(
						target[cid][sorttarget] / target[consCode][sorttarget] * 1000
					) / 10;
				data[di][show.title] =
					Math.round(target[cid][sorttarget] * 12 / show.divide * show.round) /
					show.round;
				data[di]["item"] = target[cid].title;
				di++;
				sum += target[cid][sorttarget];
			}
			data[di] = {};
			data[di]["compare"] = scenario;
			data[di]["ratio"] =
				Math.round(
					(target["TO"][sorttarget] - sum) / target["TO"][sorttarget] * 1000
				) / 10;
			data[di][show.title] =
				Math.round(
					(target["TO"][sorttarget] - sum) * 12 / show.divide * show.round
				) / show.round;
			data[di]["item"] = otherCaption;
		} else {
			//each consumption exclude consTotal
			if (target[consCode].partCons) {
				var target2 = target[consCode].partCons;
				for (cid in target2) {
					//if ( target2[cid].title == target[consCode].title ) continue;
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] =
						Math.round(
							target2[cid][sorttarget] / target[consCode][sorttarget] * 1000
						) / 10;
					data[di][show.title] =
						Math.round(
							target2[cid][sorttarget] * 12 / show.divide * show.round
						) / show.round;
					data[di]["item"] =
						target2[cid].title +
						(target2[cid].subID > 0
							? ":" +
							  (D6.viewparam.countfix_pre_after == 1
							  	? target2[cid].countCall + target2[cid].subID
							  	: target2[cid].subID + target2[cid].countCall)
							: "");
					di++;
					sum += target2[cid][sorttarget];
				}
				data[di] = {};
				data[di]["compare"] = scenario;
				data[di]["ratio"] =
					Math.round(
						(target[consCode][sorttarget] - sum) /
							target[consCode][sorttarget] *
							1000
					) / 10;
				data[di][show.title] =
					Math.round(
						(target[consCode][sorttarget] - sum) * 12 / show.divide * show.round
					) / show.round;
				data[di]["item"] = otherCaption;
			} else {
				data[di] = {};
				data[di]["compare"] = scenario;
				data[di]["ratio"] = 1000 / 10;
				data[di][show.title] =
					Math.round(
						target[consCode][sorttarget] * 12 / show.divide * show.round
					) / show.round;
				data[di]["item"] = target[consCode].title;
				di++;
			}
		}
		return data;
	};

	var captions = ["you", "after", "average"]; //same code to view
	var averageCaption = "";
	if (D6.targetMode == 1) {
		averageCaption = D6.scenario.defSelectValue.sel021[D6.area.area];
	} else {
		averageCaption =
			D6.scenario.defSelectValue.sel001[Math.max(1, D6.doc.data["i001"])];
	}
	var data = gdata(D6.consShow, captions[0], true, consCode);
	Array.prototype.push.apply(
		data,
		gdata(D6.consShow, captions[1], false, consCode)
	);
	Array.prototype.push.apply(
		data,
		gdata(D6.average.consList, captions[2], false, consCode)
	);

	//graph color list ( get from each cons** class )
	var clist = [];
	for (var cid in D6.consShow) {
		if (cid == "TO") continue;
		if (consCode == "TO" || cid == consCode) {
			clist.push({
				title: D6.consShow[cid].title,
				//co2:D6.consShow[cid].co2,
				target: D6.consShow[cid][show.sort + "Original"],
				color: D6.consShow[cid].color
			});
		}
	}

	//graph order set(sort)
	var ord = [];
	if (consCode == "TO") {
		D6.ObjArraySort(clist, "target", "desc");
		for (cid in clist) {
			ord.push(clist[cid].title);
		}
		ord.push(otherCaption);
	} else {
		ord.push(clist.title);
	}

	ret.data = data;
	ret.yaxis = show.title;
	ret.ord = ord;
	ret.clist = clist;
	ret.averageCaption = averageCaption;
	ret.captions = captions;
	ret.consTitle = D6.consShow[consCode].title;

	return ret;
};

//CO2 itemize array
//
// return
//		consObject array ( [0] is consTotal ) only for graph
//
D6.dataItemize = function() {
	var consShow = D6.consShow;

	var cons_temp = new Array();
	//var cons_rebuild = new Array();
	var ci;

	//remove consTotal
	for (ci in consShow) {
		if (consShow[ci].consCode != "TO") {
			cons_temp.push(consShow[ci]);
		}
	}

	//sort
	var NUMERIC = 16; //function parameter stable definition
	var DESCENDING = 2; //function parameter stable definition
	cons_temp.sortOn("co2", NUMERIC | DESCENDING); //sort

	//add consTotal as top
	cons_temp.unshift(consShow["TO"]);

	return cons_temp;
};

//monthly graph data
//
// return
//		ret.data[]	graph data
//		ret.yaxis	title
D6.getMonthly = function() {
	var ret = {};
	var menu = {
		co2: { sort: "co2", title: "kg", round: 1, divide: 1 },
		energy: { sort: "jules", title: "MJ", round: 1, divide: 1000 },
		money: { sort: "cost", title: "yen", round: 1, divide: 1 }
	};
	var show = menu["money"];
	var ene1 = [
		{ r: 0, ene: "electricity", name: D6.Unit.name["electricity"] },
		{ r: 1, ene: "gas", name: D6.Unit.name["gas"] },
		{ r: 2, ene: "kerosene", name: D6.Unit.name["kerosene"] },
		{ r: 3, ene: "coal", name: D6.Unit.name["coal"] },
		{ r: 4, ene: "hotwater", name: D6.Unit.name["hotwater"] },
		{ r: 5, ene: "car", name: D6.Unit.name["car"] }
	];

	var month = [];
	var ri = 0;
	var e;
	for (var m = 1; m <= 12; m++) {
		for (e = 0; e < ene1.length; e++) {
			if (!D6.consShow["TO"].monthlyPrice[ene1[e].ene]) continue;
			month[ri] = {};
			month[ri]["month"] = m;
			month[ri][show.title] =
				Math.round(
					D6.consShow["TO"].monthlyPrice[ene1[e].ene][m - 1] /
						show.divide *
						show.round
				) / show.round;
			month[ri]["energyname"] = ene1[e].ene;
			ri++;
		}
	}
	ret.data = month;
	ret.yaxis = show.title;
	return ret;
};

// getGid(consName)  getter group id of consumption ------------------
//
// parameters
//		consName	consumption name
// retrun
//		groupID		0-9
//
D6.getGid = function(consName) {
	return D6.logicList[consName].groupID;
};

// getCommonParameters()  getter common result parameters such as co2 ------------------
//
// parameters
//		consCode: consumption code
// retrun
//		co2,cost: total consumption
//		consco2 : target consumption
//
D6.getCommonParameters = function(consCode) {
	var ret = {};
	ret.co2Original = D6.consListByName["consTotal"][0].co2Original;
	ret.co2 = D6.consListByName["consTotal"][0].co2;
	ret.costOriginal = D6.consListByName["consTotal"][0].costOriginal;
	ret.cost = D6.consListByName["consTotal"][0].cost;

	ret.consco2Original = D6.consShow[consCode].co2Original;
	ret.consco2 = D6.consShow[consCode].co2;
	ret.conscostOriginal = D6.consShow[consCode].costOriginal;
	ret.conscost = D6.consShow[consCode].cost;

	return ret;
};

// getConsShow()  getter common result parameters such as co2 ------------------
//
// retrun
//		co2,cost: total consumption
//		consco2 : target consumption
//
D6.getConsShow = function() {
	var ret = {};
	for (var consCode in D6.consShow) {
		ret[consCode] = {};
		ret[consCode].co2Original = D6.consShow[consCode].co2Original;
		ret[consCode].co2 = D6.consShow[consCode].co2;
		ret[consCode].costOriginal = D6.consShow[consCode].costOriginal;
		ret[consCode].cost = D6.consShow[consCode].cost;
	}

	return ret;
};

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * disp_input.js 
 * 
 * display data create add to D6.disp class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/11/23 divided from js
 * 
 * getInputPage()		create html input pages
 * createComboBox()		combo box component
 * createTextArea()		textarea component
 * 
 * getFirstQues()		step by step question
 * getNextQues()
 * getPrevQues()
 * getQues()
 * getQuesList()
 * isEndOfQues()
 *
 * escapeHtml()
 */

//resolve D6
var D6 = D6 || {};

// getInputPage(consName,subName ) -----------------------------------------
//		generate html components
// parameters
//		consName : 		consumption code
//		subName:		sub consumption code
// return 
//		ret.group[] 		name of group
//		ret.groupAddable[] 	countable consumption list such as rooms/equipments 
//		ret.subgroup[] 		subgroup detail
//		ret.subguide[] 		subgroup input guidance
//		ret.combos[] 		input components html list
//		ret.addlist[]		addable equipment/room list
//
D6.getInputPage = function( consName,subName ) {
	var ret = {};
	var group = {};			//group name
	var groupAddable = {};		//countable consumption list such as rooms/equipments
	var subgroup = {};			//name of subgroup
	var subguide = {};			//guidance to input for subgroup
	var combos = {};			//input combobox html
	var definp;
	//var pagename;
	var subid = 0;
	var subcode = "";
	var cons = "";
	var addlist = {};

	//create input data for smartphone 
	for( var c in D6.scenario.defEasyQues ){
		var q = D6.scenario.defEasyQues[c];
		subcode = q.cname;
		group[q.cname] = q.title;
		groupAddable[q.cname] = {};
		addlist[q.cname] = {};
		subgroup[q.cname] = {};
		subguide[q.cname] = {};
		combos[q.cname] = {};
		subguide[q.cname][subcode] = {};
		combos[q.cname][subcode] = [];

		//only same to consName
		for( var i in q.ques ) {
			definp = D6.scenario.defInput[q.ques[i]];
			if ( !definp && D6.debugMode ) console.log( "defEasyQues error no " + q.ques[i] + " in scenarioset" );
			subgroup[q.cname][subcode] = q.title;
			subguide[q.cname][subcode] = "";
			if ( definp.varType == "String" ) {
				combos[q.cname][subcode].push( this.createTextArea( q.ques[i] ) );
			} else {
				combos[q.cname][subcode].push( this.createComboBox( q.ques[i] ) );
			}
		}
	}

	//create input data for PC
	for( var c in D6.consShow ) {
		//check all consumption 
		var cname = D6.consShow[c].consName;
		group[cname] = D6.consShow[c].title;
		groupAddable[cname] = [];
		addlist[cname] = [];
		subgroup[cname] = {};
		subguide[cname] = {};
		combos[cname] = {};

		// all check in doc.data.defInput[]
		for( var i in D6.doc.data ) {
			definp = D6.scenario.defInput[i.substr(0,4)];
			cons = D6.logicList[definp.cons];
				
			// condition to add this.cons 
			if ( cons.consName == cname 
				|| ( cons.sumConsName == cname 
					&& cons.sumConsName != "consTotal"
				)
				|| ( cons.sumCons2Name == cname 
					&& cons.sumCons2Name != "consTotal"
				)
				|| cons.inputDisp == cname
			) {
				if( i.length == 4 ) {	//consumption name is 4 or more length
					//not countable 
					subid = 0;
					subcode = cons.consName;
				} else {
					//countable
					subid = i.substr(4,2);
					if ( subid == 0 ) continue;
					subcode = cons.consName + subid;
				}

				//make subgroup 
				if ( subgroup[cname][subcode] == undefined ) {
					if( subid == 0) {
						subgroup[cname][subcode] = cons.title;
					} else {
						if( D6.viewparam.countfix_pre_after == 1 ) {
							subgroup[cname][subcode] = cons.countCall +( cons.titleList ? cons.titleList[subid] : subid );
						} else {
							subgroup[cname][subcode] = ( cons.titleList ? cons.titleList[subid] : subid ) + cons.countCall;
						}
					}
					subguide[cname][subcode] = cons.inputGuide;
					combos[cname][subcode] = [];
				}
				
				// make addlist such as countable equipment or room  
				if ( cons.addable ){
					if ( addlist[cname].indexOf(cons.consName) < 0 ){
						addlist[cname].push( cons.consName );
						groupAddable[cname].push( 
							{ "consName" : cons.consName,
								"caption" : cons.addable } );
					}
				}

				if ( consName != cname ) continue;
		
				//create combobox
				if ( definp.varType == "String" ) {
					combos[cname][subcode].push( this.createTextArea( i ) );
				} else {
					combos[cname][subcode].push( this.createComboBox( i ) );
				}
			}
		}
	}

	//set return data
	ret.group = group;
	ret.groupAddable = groupAddable;
	ret.subgroup = subgroup;
	ret.subguide = subguide;
	ret.combos = combos;
	ret.consName = consName;
	if ( !D6.logicList[consName] )consName = "consTotal";
	ret.title = D6.logicList[consName].title;
	ret.subName = subName;
	return ret;
};


//createComboBox(inpId, onlyCombo) --------------------------------
//		create combobox html
// parameters
//		inpId : input code "i" + number
//		onlyCombo : create only combobox and not wrap table style
// return
//		disp : combobox html
D6.createComboBox = function( inpId, onlyCombo )
{
	var disp = "";
	var selid = "sel" + inpId.substr( 1,3 );
	var inpIdDef = inpId.substr( 0,4 );
	var svalue = D6.scenario.defSelectValue[selid];
	var sdata = D6.scenario.defSelectData[selid];

	if ( !sdata || sdata[0] == "" ) {
		// in case of selection is not defined
		return this.createTextArea( inpId, onlyCombo );
	}
	var smax = svalue.length;
	var sel = D6.doc.data[inpId];
	var selectedclass = ( sel != -1 ) ? " class='written' " : "";

	var title = D6.scenario.defInput[inpIdDef].title;
	// not to show defined in EXCEL
	if ( title == "" || title.substr(0,1)=="#" ) return "";

	if ( !onlyCombo ){
		// create as table include question
		disp += "<tr><td class='qtitle' width='50%'>";
		disp += title;
		disp += "<div class='tool-tips'>" + D6.scenario.defInput[inpIdDef].text 
			+ (D6.debugMode ? " " + inpId : "" ) + "</div>";
		disp += "</td><td>";
	}
		
	//create combobox(select)
	disp += "<select title='"+D6.scenario.defInput[inpIdDef].title+"' name='" + inpId + "' id='" + inpId + "'";
	disp += " onchange='inchange(\"" + inpId + "\");'";
	disp += selectedclass;
	disp += " >";
	for ( var i=0 ; i<smax ; i++ ){
		if ( svalue[i] ) {
			disp += "<option value='" + sdata[i] + "' ";
			if ( sdata[i] == sel ) disp += "selected ";
			disp += ">" + (D6.debugMode ? sdata[i] + " " : "" ) + svalue[i] + "</option>";
		}
	}
	disp += "</select>";
		
	if ( !onlyCombo ){
		disp += "</td></tr>";
	}
	return disp;
};

// createTextArea( inpId, onlyCombo ) -----------------------------------
// 		create text input html
// parameters
//		inpId : input code "i" + number
//		onlyCombo : create only textbox and not wrap table style
// return
//		disp : textbox html
D6.createTextArea = function( inpId, onlyCombo )
{
	var disp = "";
	var selid = "sel" + inpId.substr( 1,3 );
	var inpIdDef = inpId.substr( 0,4 );
	var val = D6.doc.data[inpId];
	var selectedclass = ( val != "" && val != -1 ) ? " class='written' " : "";
	var alignright = (D6.scenario.defInput[inpIdDef].varType == "Number");

	if ( !onlyCombo ){
		disp += "<tr><td class='qtitle'>";
		disp += D6.scenario.defInput[inpIdDef].title;
		disp += "<div class='tool-tips' >" + D6.scenario.defInput[inpIdDef].text  
			+ (D6.debugMode ? " " + inpId : "" ) + "</div>";
		disp += "</td><td>";
	}

	disp += "<input type='text' title='"+D6.scenario.defInput[inpIdDef].title+"' name='" + inpId + "' id='" + inpId + "' " + selectedclass 
			+ ( alignright ? "style='text-align:right;'" : "") 
			+ " onchange='inchange(\"" + inpId + "\");'"
			+ (val && val!=-1 ? " value='" + this.escapeHtml(val) + "'" : "" )
			+ ">";

	if ( !onlyCombo ){
		disp += D6.scenario.defInput[inpIdDef].unit + "</td></tr>";
	}
	return disp;
};
	

// tfHandlerCombo( name ) ------------------------------------------------
//		set data to Input[] from combobox
D6.tfHandlerCombo = function( name ) {
	return function( e ) {
		Input[name] = e.target.value;
		e.target.removeEventListener( Event.ENTER_FRAME, arguments.callee );
	};
};

	
// parameters used in button view
D6.nowQuesCode = 0;		//now question code "i" + num
D6.nowQuesID = -1;			//now index in series of questions
D6.quesOrder = [];			//question code list
	
//getFirstQues() --------------------------------------------
//		return first question data, for smartphone
D6.getFirstQues = function(consName, subName)
{
	var definp;

	if ( consName == "easy01") {
		if ( Array.isArray(subName) ) {
			this.quesOrder = subName;
		} else {
			this.quesOrder = D6.scenario.defQuesOrder;
		}
	} else {
		for( var i in D6.doc.data ) {
			definp = D6.scenario.defInput[i.substr(0,4)];
			if ( definp.cons == subName ) {
				this.quesOrder.push( i );
			}
		}
	}
	this.nowQuesID = 0;
	this.nowQuesCode =  this.quesOrder[this.nowQuesID];
	return this.getQues(this.nowQuesCode);
};


//getNextQues() --------------------------------------------
//		return next question data, for smartphone
D6.getNextQues = function()
{
	this.nowQuesID++;
	this.nowQuesCode = this.quesOrder[this.nowQuesID];
	return this.getQues(this.nowQuesCode);
};

//getPrevQues() --------------------------------------------
//		return previous question data, for smartphone
D6.getPrevQues = function()
{
	this.nowQuesID--;
	if ( this.nowQuesID < 0) this.nowQuesID = 0;
	this.nowQuesCode =  this.quesOrder[this.nowQuesID];

	return this.getQues(this.nowQuesCode);
};

// getQues(id) ------------------------------------------------
//		create one question data, for smartphone
// parameters
//		id: input code "i" + number
// return
//		ret.info	"continue" or "end"
//		ret.id		input code
//		ret.numques	number of series of question
//		ret.nowques	now number of questions
//		ret.title	question title
//		ret.text	question detail
//		ret.unit	unit of data
//		ret.defSelectValue		list of selection caption
//		ret.defSelectData		list of data
//		ret.selected			selected value
//		ret.consTitle			related consumption name
D6.getQues = function( id ){
	var ret = {};
	if ( this.isEndOfQues() ) {
		ret.info = "end";
	} else {
		ret.info = "continue";
		ret.id = id;
		ret.numques = this.quesOrder.length;
		ret.nowques = this.nowQuesID+1;
			
		var def = D6.scenario.defInput[id.substr(0,4)];
		ret.title = def.title;
		ret.text = def.text;
		ret.unit = def.unit;
			
		var sel = def.inputType;
		ret.defSelectValue = D6.scenario.defSelectValue[sel];
		ret.defSelectData = D6.scenario.defSelectData[sel];
		ret.selected = D6.doc.data[id];
		ret.consTitle = D6.logicList[def.cons].title;
	}
	return ret;
};

// getQuesList( ) -----------------------------------------
//		get question list and data
// return 
//		ret.queslist[] 		question list
//
D6.getQuesList = function() {
	var ret = [];	
	ret.queslist = D6.doc.data;
	return ret;
};

// isEndOfQues() --------------------------------------------
//		check if end of series of questions, for smartphone
// return
//		true: end of question 
D6.isEndOfQues = function()
{
	var ret = false;
	if ( this.nowQuesID+1 > this.quesOrder.length ) {
		ret = true;
	}
	return ret;
};

// escapeHtml() ----------------------------------------------
//		sanitize input
//
D6.escapeHtml = function (String) {
	var escapeMap = {
		'&': '&amp;',
		"'": '&#x27;',
		'`': '&#x60;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;'
	};
	var escapeReg = "[";
	var reg;
	for (var p in escapeMap) {
		if (escapeMap.hasOwnProperty(p)) {
			escapeReg += p;
		}
	}
	escapeReg += "]";
	reg = new RegExp(escapeReg, "g");
	return function escapeHtml (str) {
		str = (str === null || str === undefined) ? "" : "" + str;
		return str.replace(reg, function (match) {
			return escapeMap[match];
		});
	};
}(String);



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
 * 								2016/11/23 divided from js
 *
 * getMeasureDetail()
 * tableMeasuresDetail()	for debug
 * tableMeasuresSimple()
 * getMeasureTable()
 * getMeasure_title()
 */

var D6 = D6 || {};

D6.getMeasure_title= function( mes ) {
	if ( mes.cons.consName =="consOTother" ){
		return mes.title;
	} else {
		return ( mes.cons.targetCall ? ( mes.cons.targetCall + "の" ) : 
			( mes.subID ? ( mes.subID + mes.cons.countCall + "の" ) : "" ) ) 
			+ mes.title;
	}
};

// getMeasureDetail(mesid) ---------------------------------------
//		detail data about measures
// parameters
//		mesid : measure sequence id
// return
//		ret: subset of measureBase class
D6.getMeasureDetail= function( mesid ) {
	var ret = {};
	var mes = D6.measureList[mesid];
	ret.title = D6.getMeasure_title(mes);
	ret.titleShort = mes.titleShort + ( mes.subID ? "(" + (mes.targetCall ? mes.targetCall : mes.subID + mes.cons.countCall) + ")" : "" );
	ret.measureName = mes.measureName;
	ret.mesID = mes.mesID;
	ret.groupID = mes.groupID;
	ret.subID = mes.subID;
	ret.consName = mes.cons.consName;
	ret.figNum = mes.figNum;
	ret.advice = mes.advice;
	ret.relation = mes.relation;
	ret.subsidy = mes.subsidy;
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

	ret.cons = {};
	ret.cons.title = mes.cons.title;
	ret.cons.consCode = mes.cons.consCode;
	ret.cons.co2 = mes.cons.co2;
	ret.cons.co2Original = mes.cons.co2Original;
	ret.cons.cost = mes.cons.cost;
	ret.cons.costOriginal = mes.cons.costOriginal;

	ret.cons.electricity = mes.cons.electricity;
	ret.cons.gas = mes.cons.gas;
	ret.cons.car = mes.cons.car;
	ret.cons.kerosene = mes.cons.kerosene;
	ret.cons.water = mes.cons.water;

	
	return ret;
};


//get Measures data
// consName
// maxPrice		not show over than this price
// notSelected 	1:only not select
D6.getMeasure = function( consName, maxPrice, notSelected )
{
	//cannot set default in function for IE
	if(typeof maxPrice === "undefined") maxPrice = 100000000;
	if(typeof notSelected === "undefined") notSelected = 0;

	var ret = [];
	var i=0;
	var mes;
	//var count = 0;
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

		ret[i] = {};
		ret[i].mesID = mes.mesID;
		ret[i].title = D6.getMeasure_title(mes);
		ret[i].selected = mes.selected;
		ret[i].consName = consName;
		ret[i].groupID = mes.groupID;
		ret[i].measureName = mes.measureName;
		ret[i].consCode = mes.cons.consCode;
		ret[i].consconsName = mes.cons.consName;
		ret[i].conssumConsName = mes.cons.sumConsName;
		ret[i].conssumCons2Name = mes.cons.sumCons2Name;
		ret[i].conssumCons3Name = mes.cons.sumCons3Name;
		ret[i].co2Original = mes.cons.co2Original;
		ret[i].co2Change = mes.co2Change;
		ret[i].co2ChangeOriginal = mes.co2ChangeOriginal;
		ret[i].costOriginal = mes.cons.costOriginal;
		ret[i].costChangeOriginal = mes.costChangeOriginal;
		ret[i].conssubID = mes.cons.subID;
		ret[i].consmesTitlePrefix = mes.cons.mesTitlePrefix;
		ret[i].relation = relation;
		ret[i].payBackYear = mes.payBackYear;
		ret[i].lifeTime = mes.lifeTime;
		ret[i].easyness = mes.easyness;
		ret[i].priceNew = mes.priceNew;
		ret[i].lifestyle = mes.lifestyle;
		ret[i].disable = mes.disable;			//consTotal
		ret[i].relation = mes.relation;

		if ( mes.cons.color || mes.cons.consName=="consTOTAL"){
			ret[i].color = mes.cons.color;
		} else {
			ret[i].color = mes.cons.sumCons.color;
		}
			
		i++;
	}

	return ret;
};
	

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * disp_demand.js 
 * 
 * demand input/graph add to D6.disp class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/11/23 divided from disp.js
 * 
 * getDemandGraph()
 * getInputDemandSumup()
 * getInputDemandLog()
 */

//resolve D6
var D6 = D6 || {};

///get data of Demand graph
// getDemandGraph()-----------------------------------------------------
//		demand graph of sumup and consumption log
// return
//		retall.log		log graph data
//		retall.sumup	pile up graph data
D6.getDemandGraph  = function (){
	var work = {};
	var retall = {};
	var clist = [];
		
	// pickup related concumption name "consName"
	for( var c in D6.scenario.defInput ) {
		if ( D6.scenario.defInput[c].demand > 0 ){
			work[D6.scenario.defInput[c].cons]= [];
		}
	}

	//make device data
	for( var i in D6.doc.data ) {
		//loop in doc.data and check in defInput
		var definp = D6.scenario.defInput[i.substr(0,4)];
		if ( work[definp.cons] ) {
			//work[consName][ID][1-6]
			var count = parseInt(i.substr(4,2));
			if( !work[definp.cons][count] ) work[definp.cons][count] = [];
			work[definp.cons][count][definp.demand] = D6.doc.data[i];
		}
	}
		
	var ret = [];
	var ri = 0;
	var ctitle = "";
	var ctitle2 = "";
	var watt = 0;
	var num = 1;
	var st = 0;
	var ed = 24;
	var colorcount = 0;
	var seriescolor = "";

	for ( c in work ){
		colorcount++;
		ctitle = D6.logicList[c].addable;
		for ( i in work[c] ){
			//input 
			if ( work[c][i][4] ){
				ctitle2 = work[c][i][4];
			} else {
				ctitle2 = i;
			}
			if ( work[c][i][1] && work[c][i][1] > 0 ){
				watt = work[c][i][1];
			} else if ( work[c][i][2] && work[c][i][2] > 0 ){
				watt = work[c][i][2]/1000;
			} else{
				watt = 0;
			}
			if ( work[c][i][3] && work[c][i][3] > 0 ){
				num = work[c][i][3];
			} else {
				num = 0;
			}
			if ( work[c][i][5] && work[c][i][5] >= 0 ){
				st = work[c][i][5];
			} else {
				st = 0;
			}
			if ( work[c][i][6] && work[c][i][6] >= 0 ){
				ed = work[c][i][6];
			} else {
				ed = 24;
			}
			if ( watt * num == 0 ) continue;
			if ( st >= ed ) continue;
			
			seriescolor = graphColorSeries( colorcount );
			//make graph data
			for ( var t=0 ; t<24 ; t++ ){
				ret[ri] = {};
				ret[ri]["equip"] = ctitle + "-" + ( parseInt(ctitle2) ? i : ctitle2);
				ret[ri]["time"] = t;
				if ( t>= st && t < ed ) {
					ret[ri]["electricity_kW"] = Math.round(watt * num * 10) / 10;
				} else {
					ret[ri]["electricity_kW"] = 0;
				}
				clist.push( { title:ret[ri]["equip"], 
					target:"electricity_kW", 
					color:seriescolor });
				ri++;
			}				
		}
	}
	retall.sumup = ret;		//sumup data
	retall.clist = clist;	//color list
	//log data
	var log = [];
	for ( t=0 ; t<24 ; t++ ){
		log[t] = {};
		log[t]["equip"] = "log";
		log[t]["time"] = t;
		log[t]["electricity_kW"] = D6.doc.data["i056"+(t+1)];
	}
	retall.log = log;		//log data
	return retall;
		
	//set color by ID "#0000ff"; .toString(16); 1-6 pattern
	function graphColorSeries( colid ) {
		var color;
		var col = [100,100,100];
		if ( colid <= 3 ) {
			col[colid-1] = 255;
		} else if ( colid <= 6 ){
			col[colid-4] = 0;
		}
		
		for ( var c in col ){
			if ( col[c] == 100 ){
				col[c] = Math.floor( Math.random() * 150 ) + 38;
			}
		}
		color = "#" + (col[0] * 256 * 256 + col[1] * 256 + col[2]).toString(16);
		return color;
	}
};
	

//create input dialog of demand
D6.getInputDemandSumup = function() {
	var work = {};
	var ret = {};
	var title = {};
	var pdata = {};

	//pick up related consName
	for( var c in D6.scenario.defInput ) {
		if ( D6.scenario.defInput[c].demand > 0 ){
			work[D6.scenario.defInput[c].cons]= true;
			ret[D6.scenario.defInput[c].cons]= {};
		}
	}

	//set data
	var inhtml = "";
	for( var i in D6.doc.data ) {
		//loop in doc.data and check with defInput
		var definp = D6.scenario.defInput[i.substr(0,4)];
		if ( work[definp.cons] ) {
			//in case of related class
			inhtml = this.createComboBox( i, true );
			//ret[consName][ID][1-6]
			var count = parseInt(i.substr(4,2));
			title[definp.cons] = D6.consListByName[definp.cons][0].addable;
			if( !ret[definp.cons][count] ) ret[definp.cons][count] = [];
			ret[definp.cons][count][definp.demand] = inhtml;
		}
	}
		
	pdata.data = ret;
	pdata.title = title;
		
	return pdata;
};

//create input diakog 
D6.getInputDemandLog = function() {
	var ret = [];
	for ( var t=0 ; t<24 ; t++ ){
		ret[t] = this.createComboBox( "i056" + (t+1), true );
	}
	return ret;
};
	


/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * evaluateaxis.js 
 * 
 * evaluate multi dimension Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2017/11/06 original ActionScript3
 */


//resolve D6
var D6 = D6||{};

// getEvaluateAxisPoint()
//
// parameters
// 		target : dummy
//		inpListDefCode: evaluate target Input List
// return
//		 [0-2][point, max, min ]
//
// value base is  D6.doc.data[inName]
// weight is defined in D6.scenario.defInput[inName]
//
D6.getEvaluateAxisPoint = function( target,inpListDefCode ) {
	//calc environmental load, performance, action points
	var retall = {};
	retall[0] = [0,"",""];
	retall[1] = [0,"",""];
	retall[2] = [0,"",""];

	var def = [];
	for( var d in D6.scenario.defEasyQues ) {
		if ( D6.scenario.defEasyQues[d].cname == inpListDefCode ) {
			def = D6.scenario.defEasyQues[d].ques;
			break;
		}
	}
	if ( def == "" ) return retall;

	//calculate point of 3 axis
	for ( var i=0 ; i<3 ; i++ ) {
		var pointfull = 0;
		var point = 0;
		var maxpoint = 0;
		var maxname = "";
		var minpoint = 0;
		var minname = "";
		var maxpoint2 = 0;
		var maxname2 = "";
		var minpoint2= 0;
		var minname2 = "";
		//var tmax = 0;
		var defaultvalue = 0;
		var thispoint = 0;

		for( var incode in def ) {
			//incode : input code
			var weight = D6.scenario.defInput[def[incode]];
			var ans = D6.doc.data[def[incode]];
			var weightone = weight["d"+(i+1)+"w"];
			if ( weightone == "" ) continue;

			defaultvalue = weight["d"+(i+1)+"d"] * weightone ;

			//no answer
			if ( ans == weight.defaultValue || ans === undefined ) {
				//point += defaultvalue;
				continue;
			}

			//evaluate total point
			pointfull += weightone * 2;

			//point
			if ( ans >= weight["d"+(i+1)+"1t"] ) {
				thispoint = weight["d"+(i+1)+"1p"] * weightone;

			} else if( weight["d"+(i+1)+"2t"] != ""  && ans >= weight["d"+(i+1)+"2t"] ) {
				thispoint = weight["d"+(i+1)+"2p"] * weightone;

			} else if( weight["d"+(i+1)+"3t"] != ""  && ans >= weight["d"+(i+1)+"3t"] ) {
				thispoint = weight["d"+(i+1)+"3p"] * weightone;

			} else {
				thispoint = 0;
			}
			
			if ( maxpoint2 < thispoint ) {
				maxpoint2 = thispoint;
				maxname2 = weight.title;
				if ( maxpoint <maxpoint2 ) {
					maxpoint2 = maxpoint;
					maxname2 = maxname;
					maxpoint = thispoint;
					maxname = weight.title;
				}
			}
			if ( minpoint2 > thispoint - weightone * 2 ) {
				minpoint2 = thispoint - weightone * 2;
				minname2 = weight.title;
				if ( minpoint > minpoint2 ) {
					minpoint2 = minpoint;
					minname2 = minname;
					minpoint = thispoint;
					minname = weight.title;
				}
			}
			point += thispoint;
		}
		retall[i][0] = point / (pointfull==0 ? 1 :pointfull) * 100;
		retall[i][1] = ( maxname ? "<li>"+maxname+ "</li>" : ""  ) + ( maxname2 ? "<li>"+maxname2+ "</li>" : ""  );
		retall[i][2] = ( minname ? "<li>"+minname+ "</li>" : ""  ) + ( minname2 ? "<li>"+minname2+ "</li>" : ""  );;
	}
	return retall;
};


/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Constructor Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2018/03/04 divided only constructor functions
 * 
 * setscenario()				initialize diagnosis structure by scenario file
 * addMeasureEachCons()			add measure definition
 * addConsSetting()				add consumption definition 
 */
 
//resolve D6
var D6 = D6||{};


/* setscenario -------------------------------------------------------------
 * 		set scenario by definition and create logic structure
 * parameters:
 *		prohibitQuestions		array of prohibitQuestions or "add" code for not initialize
 *		allowedQuestions
 *		defInput
 * return:
 *		none
 * set:
 *		-create new consumption instance in logicList
 *		-link to consList, consListByName, consShow
 *		-each consumption instance include measures, sumCons, subCons etc.
 */
D6.setscenario = function( prohibitQuestions, allowedQuestions, defInput ){
	var i,j;
	var notinit = false;

	if ( prohibitQuestions == "add"){
		notinit = true;
	}
	if ( !prohibitQuestions ) {
		prohibitQuestions =[];
	}
	if ( !allowedQuestions ) {
		allowedQuestions =[];
	}

	// step 1 : implementation of logics ------------------------
	if ( !notinit ) {
		D6.scenario.setDefs();		//set questions and measures

		D6.scenario.areafix();		//fix by area

		for ( var d in defInput ) {
			if ( defInput[d][2]) {
				D6.scenario.defInput[defInput[d][0]][defInput[d][1]] = defInput[d][2];
			}
		}
		D6.logicList = D6.scenario.getLogicList();
	}
	var consList = D6.consList;

	// step 2 : Implementation of consumption class -----------
	//
	D6.consCount = 0;	//counter for consList
	var logic;
	var tlogic;

	//create consumption class by logic, children of consTotal
	for( logic in D6.logicList ) {
		tlogic = D6.logicList[logic];
		D6.consListByName[tlogic.consName] = [];	//list by consName

		if ( tlogic.sumConsName == "consTotal" || tlogic.consName == "consTotal" ) {
				
			//fisrt set to consList
			consList[ D6.consCount ] = tlogic;
				
			//set another access path
			D6.consShow[ tlogic.consCode ] = consList[ D6.consCount ];
			D6.consListByName[tlogic.consName].push( consList[ D6.consCount ] );
			D6.consCount++;
		}
	}

	//create consumption class,  grandson of consTotal
	//  create grandson after children
	for( logic in D6.logicList ) {
		tlogic = D6.logicList[logic];								//shortcut

		//not direct connect to consTotal
		//implement by each equips/rooms
		if ( tlogic.sumConsName != "consTotal" && tlogic.consName != "consTotal" ) {
			if ( tlogic.orgCopyNum == 0 ) {
				consList[D6.consCount] = tlogic;
				D6.consListByName[tlogic.consName].push( consList[ D6.consCount ] );
				D6.consCount++;
			} else {
				for ( j = 0 ; j <= tlogic.orgCopyNum ; j++ ) {		// #0 is residue			
					//implementation in consList
					consList[D6.consCount] = D6.object( tlogic );	// set copy
					//consList[D6.consCount].setsubID( j );
					consList[D6.consCount].subID = j;
					if ( consList[D6.consCount].titleList ){
						consList[D6.consCount].title = consList[D6.consCount].titleList[j];
					}
								
					//another access path
					D6.consListByName[tlogic.consName].push( consList[ D6.consCount ] );
					D6.consCount++;
				}
			}
		}
	}

	// step 3 : resolve relation between consumption classes -------------
	var cons;
	var partconsTemp;
	var partCons;		//partition side classes to this class
	var partCons2nd;	//2nd partition side classes to this class

	for ( i=0 ; i< consList.length ; i++ ){
		//create relation by each cons in consList
		cons = consList[i];
		cons.measures = [];
		cons.partCons = [];

		//get instance of sum side class
		cons.sumCons = this.getTargetConsList( cons.sumConsName );
		cons.sumCons2 = this.getTargetConsList( cons.sumCons2Name );

		//get instance of part side class
		//    part side is not defined in this class definition, so check each
		//    part side class of which sumCons is related to this cons
		partCons = [];
		partCons2nd = [];

		for ( j=0 ; j<consList.length ; j++ ) {
			//check each cons in consList which is part side
			partconsTemp = consList[j];

			// if sum part is defined as this class
			if ( partconsTemp.sumConsName === cons.consName ) {

				//countable rooms/equips or not
				if ( partconsTemp.orgCopyNum >= 1 ) {
				
					if ( cons.orgCopyNum >= 1 ) {
						//if this cons is countable, add only same id
						if ( cons.subID == partconsTemp.subID ){
							cons.partConsName = partconsTemp.consName;
							partCons.push( partconsTemp );
						}
						
					} else {
						//this cons is not countable add each cons as partcons
						cons.partConsName = partconsTemp.consName;
						partCons.push( partconsTemp );
					}
					
				} else {
					//not countable add first cons as partCons
					partCons.push( partconsTemp );
				}
			}

			// if second sum part is defined as this class
			if ( partconsTemp.sumCons2Name == cons.consName ) {

				//countable rooms/equips or not
				if ( partconsTemp.orgCopyNum >= 1 ) {

					//if this cons is countable, add only same id
					if ( cons.orgCopyNum >= 1 ) {
						if ( cons.subID == partconsTemp.subID ){
							cons.partCons2Name = partconsTemp.consName;
							partCons2nd.push( partconsTemp );
						}
							
					} else {
						cons.partCons2Name = partconsTemp.consName;
						partCons2nd.push( partconsTemp );
					}
					
				} else {
					//not countable add first cons as partCons
					partCons2nd.push( partconsTemp );
				}
			}
		}

		//set to this cons 
		if ( partCons.length >= 1 ) {
			cons.partCons = partCons;
		} else {
			cons.partCons = "";
		}
		if ( partCons2nd.length >= 1 ) {
			cons.partCons2 = partCons2nd;
		} else {
			cons.partCons2 = "";
		}
	}

	// step 4 : Implementation of measures -----------------------
	this.mesCount = 0;			//counter of measures 

	//add measures to each cons class
	for ( i in consList ){
		this.addMeasureEachCons( consList[i] );
	}

	// in case of calculate by months, questions should be divided to months
	//	and need dataset of temperature, solar, average consumptions etc.

	// step 5 : set questions/inputs --------------------------
	
	//function to check is prohibited
	var isProhivitedQuestion = function( iname ) {
		// definition in EXCEL
		if ( iname["cons"] == "" ) return true;

		if ( prohibitQuestions.length <= 0 ) {
			if ( allowedQuestions.length <= 0 ) {
				return false;
			} else {
				if ( allowedQuestions.indexOf(iname) >= 0 ) {
					return false;
				} else {
					return true;
				}
			}
		} else {
			if ( prohibitQuestions.indexOf(iname) >= 0 ) {
				return true;
			} else {
				return false;
			}
		}
	};

	var iname;

	// loop each input definition
	for ( iname in D6.scenario.defInput ) {
		//check is prohibited
		if ( isProhivitedQuestion( iname ) ) continue;

		var defInp = D6.scenario.defInput[iname];
		logic = D6.logicList[defInp.cons];

		// if input has relation to consumption
		if ( logic ) {
			if ( logic.orgCopyNum > 0 ) {
				//in case of countable consumption 
				for ( j=0 ; j<logic.orgCopyNum ; j++ ) {
					//create one question as "iname + [1-n]"
					D6.inSet( iname+(j+1),defInp.defaultValue );
				}
			} else {
				//create one question
				D6.inSet( iname, defInp.defaultValue);
			}
		}
	}
		
	//set easy question list
	var ilist = [];
	if ( D6.scenario.defEasyQues ) {
		for( i in D6.scenario.defEasyQues[0].ques ) {
			if ( isProhivitedQuestion( D6.scenario.defEasyQues[0].ques[i] ) ) continue;
			ilist.push( D6.scenario.defEasyQues[0].ques[i] );
		}
		D6.scenario.defEasyQues[0].ques = [];
		for ( i in ilist ) {
			D6.scenario.defEasyQues[0].ques.push( ilist[i] );
		}
	}

};


// addMeasureEachCons(cons)-----------------------------
//		add measures related to one consumption
//		it works not only initialize but also after
// params
//		cons :  target consumption instance
// return
//		none
// set
//		set new measures to cons.measures
D6.addMeasureEachCons = function( cons ) {
	for ( var mesname in D6.scenario.defMeasures ) {
		if ( cons.consName != D6.scenario.defMeasures[mesname].refCons ) continue;
		this.measureList[this.mesCount] = D6.object(D6.MeasureBase);
		this.measureList[this.mesCount].Constructor( cons, D6.scenario.defMeasures[mesname], this.mesCount );
		cons.measures[mesname] = this.measureList[this.mesCount];
		this.mesCount++;
	}
};



// addConsSetting( consName ) ------------------------------------------------
//		add consumption instance of countable rooms/equipments
//		this function only increment setting number, so after that reconstruct all consumptions
// parameter
//		consName : consumption code(string)
// return
//		none
// set
//		increment the number of consumption setting
//		also increment part side of consumption
D6.addConsSetting = function(consName) {
	var cons = "";
	var pname = "";

	//check consAddSet in each logicList[]
	var rend = false;
	for ( cons in D6.logicList ){
		// same target is listed in consAddSet
		// for example rooms, both heating and cooling has relationship
		// see also consAC.js
		pname = D6.logicList[cons].consAddSet;
		for ( var t in pname ){
			if ( pname[t] == consName || cons == consName ){
				D6.logicList[cons].orgCopyNum = D6.logicList[cons].orgCopyNum + 1;
				for ( var s in pname ){
					D6.logicList[pname[s]].orgCopyNum = D6.logicList[pname[s]].orgCopyNum + 1;
				}
				rend = true;
				break;
			}
		}
		if ( rend ) break;
	}

	if ( !rend ){
		// no consAddSet, ordinal addition
		D6.logicList[consName].orgCopyNum = D6.logicList[consName].orgCopyNum + 1;
	}
};
	

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 *
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js
 *
 * D6 calc Cons Class
 *
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 *
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2018/03/04 divide consumption calculation functions
 *
 * calcCons()					calculate consumption
 * calcConsAdjust()				adjust consumption
 * getTargetConsList()			get Cons by name
 * getGid()						get group id
 */

//resolve D6
var D6 = D6 || {};

/* calcCons() -------------------------------------------------------
 *		calculate consumption in consumption instance
 */

D6.calcCons = function() {
	var i, j;

	//area parameters set
	D6.area.setCalcBaseParams();

	//pre calculation such as common parameters setting
	//priority 1-3 / none
	for (j = 1; j <= 4; j++) {
		for (i = 0; i < D6.consList.length; i++) {
			if (
				this.consList[i].calcpriority == j ||
				(j == 4 && !this.consList[i].calcpriority)
			) {
				this.consList[i].precalc();
			}
		}
	}
	//calculate each consumption at first time
	//priority 1-3 / none
	for (j = 1; j <= 4; j++) {
		for (i = 0; i < D6.consList.length; i++) {
			if (
				this.consList[i].calcpriority == j ||
				(j == 4 && !this.consList[i].calcpriority)
			) {
				this.consList[i].calc();
				this.consList[i].calcCO2();
			}
		}
	}

	//calculate 2nd step
	for (i = 0; i < this.consList.length; i++) {
		this.consList[i].calc2nd();
		this.consList[i].calcCO2();
	}

	//adjust among each consumption
	this.calcConsAdjust();

	//calculate cost and energy
	for (i = 0; i < this.consList.length; i++) {
		this.consList[i].calcCost();
		this.consList[i].calcJules();
		//set as original value, which is in case of no selection
		if (this.isOriginal) {
			this.consList[i].co2Original = this.consList[i].co2;
			this.consList[i].costOriginal = this.consList[i].cost;
			this.consList[i].julesOriginal = this.consList[i].jules;
			this.consList[i].electricityOriginal = this.consList[i].electricity;
			this.consList[i].gasOriginal = this.consList[i].gas;
			this.consList[i].keroseneOriginal = this.consList[i].kerosene;
			this.consList[i].carOriginal = this.consList[i].car;
		}
	}
};

/* calcConsAdjust() --------------------------------------------------
 *		adjust among each consumption
 *		called from calcCons()
 */
D6.calcConsAdjust = function() {
	var ci, i, j;
	var consNum;
	var consSum;
	var energySum = D6.object(D6.Energy);
	D6.energyAdj = D6.object(D6.Energy); //adjust parameters by energy
	var singleArray = true;
	var lastname = "";

	// calculate sum of part side consumptions of each consumption exclude total one
	for (ci in this.consShow) {
		consSum = this.consShow[ci];

		if (consSum.consName != "consTotal") {
			energySum.clear();

			if (consSum.partCons.length >= 1) {
				// countable consumption
				lastname = consSum.partCons[0].consName;
				for (i = 1; i < consSum.partCons.length; i++) {
					// sum from 1 not 0. #0 is residue
					energySum.add(consSum.partCons[i]);

					//check if different consName. true:different, false:same
					if (lastname != consSum.partCons[i].consName) {
						singleArray = false;
					}
				}
				energySum.calcCO2();

				if (D6.fg_calccons_not_calcConsAdjust || consSum.residueCalc == "no") {
					// refrigerator pattern : each consumption is important
					consSum.copy(energySum);
					consSum.add(consSum.partCons[0]);
					consSum.calcCO2();
				} else {
					// top down pattern : group consumption is important
					if (energySum.co2 > consSum.co2) {
						//in case of sum of each consumption is bigger than sumCons divide each cons
						for (i = 1; i <= consNum; i++) {
							consSum.partCons[i].multiply(consSum.co2 / energySum.co2);
						}
						consSum.partCons[0].clear();
					} else {
						//calculate residue
						if (singleArray) {
							//set residue to partCons[0]
							energySum.sub(consSum);
							energySum.multiply(-1);
							consSum.partCons[0].copy(energySum);
						} else {
							//not to set partCons[0], because #0 is not residue
							consSum.copy(energySum);
							consSum.add(consSum.partCons[0]);
							consSum.calcCO2();
						}
					}
				}
			}
		}
	}

	// adjust total balance by energy type
	//		if sum of electricity/gas or etc. is over total consumption one,
	//		adjust each consumption not over total.
	energySum.clear();

	//sum of consumptions to home total
	for (ci in this.consShow) {
		if (ci != "TO") {
			for (j in D6.Unit.co2) {
				energySum[j] += this.consShow[ci][j];
			}
		}
	}

	//parameters existence of extinct total data
	var nodataTotal =
		this.consShow["TO"].noConsData &&
		D6.fg_calccons_not_calcConsAdjust &&
		!D6.averageMode;

	//residue is more than 20% of electricity
	energySum.electricity += this.consShow["TO"].electricity * 0.2;

	//execute adjust
	if (!nodataTotal) {
		//in case of exist in total consumption
		for (j in D6.Unit.co2) {
			if (energySum[j] == 0) {
				this.energyAdj[j] = 1; //any number
			} else {
				this.energyAdj[j] = this.consShow["TO"][j] / energySum[j];
				if (
					typeof this.consShow["TO"].noPriceData[j] !== "undefined" &&
					this.consShow["TO"].noPriceData[j]
				) {
					if (!D6.averageMode) {
						//価格データがない場合totalは補正しない
						//本来ならあまりに大幅な補正が必要なときにはtotalの数値を変更するが、ここでは平均値も算出するために補正が不要
						if (this.energyAdj[j] < 0.25) {
							this.consShow["TO"][j] *= 0.25 / this.energyAdj[j];
							this.energyAdj[j] = 0.25;
						}
						if (this.energyAdj[j] > 4 && j != "electricity") {
							this.consShow["TO"][j] *= 4 / this.energyAdj[j];
							this.energyAdj[j] = 4;
						}
					}
				}
				if (j == "electricity") {
					// adjust is less than triple and more than 0.2 times
					this.energyAdj[j] = Math.max(0.2, Math.min(5, this.energyAdj[j]));
				} else if (j == "water") {
					this.consShow["TO"][j] = energySum[j];
					this.energyAdj[j] = 1;
				} else {
					// adjust electricity not to be minus but residue is OK
					this.energyAdj[j] = Math.max(0.2, Math.min(2.5, this.energyAdj[j]));
				}
			}
		}

		//execute adjust
		for (ci in this.consList) {
			if (this.consList[ci].consName != "consTotal") {
				this.consList[ci].calcAdjust(this.energyAdj);
			}
		}
	} else {
		//no total value
		for (j in D6.Unit.co2) {
			if (j == "electricity") {
				if (this.consShow["TO"][j] < energySum[j]) {
					this.consShow["TO"][j] = energySum[j];
				}
			} else {
				this.consShow["TO"][j] = energySum[j];
			}
		}
	}
	this.consShow["TO"].calcCO2(); //consTotalのCO2計算しなおし
};

/* getTargetConsList(consName)  getter consumption object ------------------
 *
 * parameters
 *		consName	consumption name
 * retrun
 *		consumption object / object array
 */
D6.getTargetConsList = function(consName) {
	var i,
		c = 0;
	var target = new Array();
	var ret;

	if (consName != "") {
		for (i = 0; i < this.consList.length; i++) {
			if (this.consList[i].consName == consName) {
				target[c++] = this.consList[i];
			}
		}
		if (target.length == 1) {
			//in case of single
			ret = target[0];
		} else {
			//in case of array
			ret = target;
		}
	}
	return ret;
};

/* getGid(consName)  getter group id of consumption ------------------
 *
 * parameters
 *		consName	consumption name
 * retrun
 *		groupID		0-9
 */
D6.getGid = function(consName) {
	return D6.logicList[consName].groupID;
};

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Main Class calc average functions
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2018/03/04 divided as average functions
 * 
 * calcAverage()				get avearage consumption
 * rankIn100()					get rank				
 * 
 */
 
//resolve D6
var D6 = D6||{};

/*
 * calcAverage()  get avearage consumption ------------------
 *
 * parameters
 *		none
 * return
 *		none
 *
 * set D6.average.consList[]
 *
 */
D6.calcAverage = function(){
	// 基本は全体だけだが、用途別にも平均値を算出するため
	// 値をでフォルト値にして計算する（灯油だけ補正がかかる）

	D6.averageMode = true;			//not use input parameters
	this.calcCons();				//and calculate, then get average
	this.average.consList = {};

	for( var c in this.consShow ) {
		this.average.consList[c] = {};
		this.average.consList[c].co2 = this.consShow[c].co2;
		this.average.consList[c].co2Original = this.consShow[c].co2Original;
		this.average.consList[c].electricity = this.consShow[c].electricity;
		this.average.consList[c].gas = this.consShow[c].gas;
		this.average.consList[c].kerosene = this.consShow[c].kerosene;
		this.average.consList[c].car = this.consShow[c].car;
		this.average.consList[c].electricityOriginal = this.consShow[c].electricityOriginal;
		this.average.consList[c].gasOriginal = this.consShow[c].gasOriginal;
		this.average.consList[c].keroseneOriginal = this.consShow[c].keroseneOriginal;
		this.average.consList[c].carOriginal = this.consShow[c].carOriginal;
		this.average.consList[c].water = this.consShow[c].water;
		this.average.consList[c].cost = this.consShow[c].cost;
		this.average.consList[c].costOriginal = this.consShow[c].costOriginal;
		this.average.consList[c].jules = this.consShow[c].jules;
		this.average.consList[c].title = this.consShow[c].title;
		if (c=="TO"){
			this.average.consList[c].priceEle = this.consShow[c].priceEle;
			this.average.consList[c].priceGas = this.consShow[c].priceGas;
			this.average.consList[c].priceKeros = this.consShow[c].priceKeros;
			this.average.consList[c].priceCar = this.consShow[c].priceCar;
		}
	}
	D6.averageMode = false;			//standard mode
	//this.calcCons();				//and calculate　単体で呼ばれることはないため不要
};

	

/* rankIn100(ratio)  calculate rank by ratio to average ------------------
 * 130410うちエコ診断
 *
 * parameters
 *		ratio	ratio to average
 * return
 *		rank 	number 1-100 in 100 
 */
D6.rankIn100 = function( ratio ){
	var ret;
	var i;
	var th = [ 0.0, 0.3, 0.5, 0.6, 0.8, 1.0, 1.3, 1.5, 1.8, 2.1, 2.4, 3.0, 4.0 ];
	var thrank = [ 0.50, 0.99, 4.68, 9.63, 27.32, 50, 71.86, 81.96, 91.01, 95.47, 97.56, 99.34, 100.19 ];

	if ( ratio < th[0] ) {
		ret = 1;
		return ret;
	}

	//4倍以上初期値
	ret = 100;

	for ( i=1 ; i<th.length ; i++ ) {
		if ( ratio < th[i] ) {
			ret = ( ( ratio - th[i-1] ) * thrank[i] + ( th[i] - ratio ) *  thrank[i-1] )
					/ ( th[i] - th[i-1] );
			break;
		}
	}

	return Math.round(ret);
};

	

/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Class calc measures functions
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * calcMeasures()				calculate measure
 * calcMeasuresLifestyle()		calculate all measures and select lifestyle
 * calcMeasuresNotLifestyle()	calculate all measures and select not lifestyle
 * calcMeasuresOne()			calculate in temporal selection
 * calcMaxMeasuresList()		automatic select max combination 
 */
 
//resolve D6
var D6 = D6||{};


/* calcMeasures(gid)  calculate all measures -----------------------------
 *
 * parameters
 *		gid		groupid, -1 is total
 * return
 *		measure array defined in calcMeasuresOne
 *
 * once clear selected measures, and set select and calculate one by one
 */
D6.calcMeasures = function( gid ) {
	var ret;
	var i;
	var mid, mlistid, mes;

	var selList = [];	//selected measures' ID

	//save selected measures id
	for( mes in this.measureList ) {
		selList[this.measureList[mes].mesID] =this.measureList[mes].selected;
	}

	//clear selection and calculate
	ret = this.clearSelectedMeasures( gid );

	//set select one by one
	for ( i = 0 ; i < ret.length ; i++ ) {
		mid = ret[i].mesID;
		mlistid = mid;
		mes = this.measureList[mlistid];

		if ( selList[mid] && !mes.selected ) {
			mes.selected = true;
			this.isOriginal = false;

			if ( mes.co2Change < 0 ) {
				//set select in case of useful measures
				mes.co2ChangeSumup = mes.co2Change;
				mes.costChangeSumup = mes.costChange;
				mes.costTotalChangeSumup = mes.costTotalChange;

				mes.addReduction();					//set reduction
				ret = this.calcMeasuresOne( -1 );	//main calculation for next step
			} else {
				mes.co2ChangeSumup = 0;
				mes.costChangeSumup = 0;
				mes.costTotalChangeSumup = 0;
			}
		}
	}

	//set selection property include not useful
	for ( mlistid in this.measureList ) {
		mes = this.measureList[mlistid];
		mes.selected = selList[mes.mesID];
		if ( mes.selected ) {
			this.isOriginal = false;
		}
	}
	var ret2 = [];
	for ( i=0 ; i<ret.length ; i++ ) {
		if ( ret[i].groupID == gid || gid == -1 ) {
			ret2.push( ret[i] );
		}
	}
	this.resMeasure = ret2;

	return ret2;
};


/* calcMeasuresLifestyle(gid)  
 *		calculate all measures and select lifestyle --------
 *
 * parameters
 *		gid		groupid, -1 is total
 * return
 *		measure array defined in calcMeasuresOne
 */
D6.calcMeasuresLifestyle = function( gid ) {
	var onemes;
	var retLife = new Array();
	var ret = D6.calcMeasures( gid );
		
	// select only related to lifestyle 
	for( onemes in ret ) {
		if ( ret[onemes].lifestyle == 1 ) {
			retLife.push( ret[onemes] );
		}
	}
	return retLife;
};
	

/* calcMeasuresNotLifestyle(gid)  
 *		calculate all measures and select not lifestyle --------
 *
 * parameters
 *		gid		groupid, -1 is total
 * return
 *		measure array defined in calcMeasuresOne
 */
D6.calcMeasuresNotLifestyle = function( gid ) {
	var onemes;
	var retLife = [];
	var ret = D6.calcMeasures( gid );
		
	// select only not related to lifestyle 
	for( onemes in ret ) {
		if ( ret[onemes].lifestyle != 1 ) {
			retLife.push( ret[onemes] );
		}
	}
	return retLife;
};


/* calcMeasuresOne(gid)  
 *		calculate all measures in temporal selection --------
 *
 * parameters
 *		gid		groupid, -1 is total
 * return
 *		measure array include mesID,groupID and lifestyle
 *
 * called by calcMeasures
 */
D6.calcMeasuresOne = function( gid ) {
	var ret;								//return
	//var topList;							//list of measures id
	//var selectList;							//list of selected measures id
	var i;

	var sortTarget = this.sortTarget;		//sort target
	ret = new Array();
	//topList = new Array();
	//selectList = new Array();

	//each measures defined in cons object
	for ( i in this.consList ) {
		//target group
		if ( gid == -1 || this.consList[i].groupID == gid ) {
			this.consList[i].calcMeasureInit();
			this.consList[i].calcMeasure();
				
			//in case of equipment/room number is defined and selected #0
			//not evaluate after #1
			if ( this.consList[i].subID >= 1 ){
				var cons0 = this.consListByName[this.consList[i].consName][0];
				for ( var m in cons0.measures ){
					if ( cons0.measures[m].selected ){
						this.consList[i].measures[m].copy( cons0 );
					}
				}
			}
		}
	}
	i=0;
	
	//format return measure data
	for( var mescode in this.measureList ) {
		var mes = this.measureList[mescode];
		mes.calcSave();
		ret[i] = {};
		ret[i][sortTarget] =mes[sortTarget];
		ret[i].mesID =mes.mesID;
		ret[i].groupID =mes.groupID;
		ret[i].lifestyle =mes.lifestyle;
		i++;
	}
	this.ObjArraySort( ret, sortTarget );	//sort
	return ret;
};



/* clearSelectedMeasures(gid)  clear all selection and calculate all --------
 *
 * parameters
 *		gid		groupid, -1 is total
 * return
 *		measure array defined in calcMeasuresOne
 */
D6.clearSelectedMeasures = function( gid ) {
	var ret;

	this.isOriginal = true;
	ret = this.calcCons();			//calcurate original state consumption
		
	//remove selection
	for ( var i = 0 ; i < D6.measureList.length ; i++ ) {
		if ( this.measureList[i].groupID == gid || gid < 0 ) {
			this.measureList[i].selected = false;
		}
	}
		
	//calculate
	ret = this.calcMeasuresOne( gid );
		
	return ret;
};

	
/* calcMaxMeasuresList(gid)
 *		automatic select max combination measures --------
 *
 * parameters
 *		gid		groupid, -1 is total
 *		count	max selected number
 * return
 *		measure array defined in calcMeasuresOne
 */
D6.calcMaxMeasuresList = function( gid, count )
{
	var resultCalc;
	var ret;
	var pt = 0;
	var maxCO2 = 0;
	var cost = 0;
	var i, j;
	var mes;
	var targetmes;
	var sumCO2 = 0;
	var sumCOST = 0;
		
	if( typeof(gid) == "undefined" ) gid = -1;
	if( typeof(count) == "undefined" || count<1 ) count = 100;
		
	//clear all selection
	resultCalc = this.clearSelectedMeasures( gid );
		
	//search max reduction measure for "count" times
	for ( i = 0 ; i < count ; i++  ) {
		pt = -1;
		maxCO2 = 0;
		for ( j = 0 ; j < this.measureList.length ; j++ ) {
			//max reduction in measureList
			mes = this.measureList[j];
			if ( mes.groupID == gid || gid < 0 ) {
				if ( this.measureList[j].selected != true 		//skip already selected
					|| !isFinite(mes.co2Change) 
					|| isNaN(mes.co2Change)) 				//useful
				{
					//select max measure
					if ( maxCO2 > mes.co2Change ) {
						maxCO2 = mes.co2Change;
						cost = mes.costChange;
						pt = mes.mesID;
						targetmes = mes;
					}
				}
			}
		}
		if ( pt == -1 ) {
			//end in case of no measures suitable
			break;
		}
		sumCO2 += maxCO2;
		sumCOST += cost;
		resultCalc = this.measureAdd( pt );			//select set to property
		targetmes.addReduction();					//set reduction
		resultCalc = this.calcMeasuresOne( -1 );	//main calculation for next step
	}
	ret = this.calcMeasures(gid);
	ret.sumCO2 = sumCO2;
	ret.sumCOST = sumCOST;

	return ret;
};




/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Main Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * inSet()						input data setter
 * measureAdd()					set select flag and not calculate 
 * measureDelete()				clear select flag and not calculate 
 */
 
//resolve D6
var D6 = D6||{};

	
// inSet(id, val)  input data setter ------------------
//
// parameters
//		id		input id, permit include equip/room code 'ixxxyy'
//		val		input value
//
D6.inSet = function ( id, val ){
	var inpIdDef = id.substr( 0,4 );
	if ( !D6.scenario.defInput[inpIdDef] ){
		console.log("ERROR: inSet input code: " + id + " val:" + val);
		return;
	}
	if ( D6.scenario.defInput[inpIdDef].varType == "String" || 
		D6.scenario.defInput[inpIdDef].varType == "Boolean"
	) {	
		//set data
		D6.doc.data[id] = val;
	} else {
		//string data set
		val = D6.toHalfWidth(val);
		D6.doc.data[id] = parseFloat( val ) ? parseFloat( val ) : 0;
	}
};

	
// measureAdd(mesId) set select flag and not calculate --------
//
// parameters
//		mesId		measure id which you select
// return
//		none
//
D6.measureAdd = function( mesId ) {
	var gid;
	var ret = "";
		
	gid = this.measureList[mesId].groupID;
	this.measureList[mesId].selected = true;
	this.isOriginal = false;
	//ret = this.calcMeasures( gid );	//recalc -> not calc

	return ret;
};


// measureDelete(mesId) remove select flag and not calculate--------
//
// parameters
//		mesId		measure id which you select
// return
//		none
//
D6.measureDelete = function( mesId ) {
	var gid;
	var ret ="";

	this.measureList[mesId].selected = false;
	gid = this.measureList[mesId].groupID;
	//ret = this.calcMeasures( gid );	//recalc 

	return ret;
};


/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Main Class as tools
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2018/03/04 divide as tools
 * 
 * toHalfWidth()
 * ObjArraySort()
 * 
 * 
 */
 
//resolve D6
var D6 = D6||{};

	
	
// toHalfWidth(strVal)  change double width charactor------------------
//
// parameters
//		strVal	original value
// return
//		halfVal replaced value
//
D6.toHalfWidth = function(strVal){
	/*
	if ( !strVal ) return strVal;
	var halfVal = strVal.replace(/[！-～]/g,
		function( tmpStr ) {
		// shift charactor code
			return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
		}
	);
	return halfVal;
	*/
	return strVal;
};

	
// ObjArraySort(ary, key, order )  object sort ------------------
//
// parameters
//		ary		array/object
//		key		sort target
//		order	incr/desc
// retrun
//		none
//
//	set "ary" sorted
//
D6.ObjArraySort = function(ary, key, order) {
	var reverse = 1;
	if(order && order.toLowerCase() == "desc") 
		reverse = -1;
	ary.sort(function(a, b) {
		if(a[key] < b[key])
			return -1 * reverse;
		else if(a[key] == b[key])
			return 0;
		else
			return 1 * reverse;
	});
};


/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 *
 * Home Energy Diagnosis System Ver.6
 * scenarioset.js
 *
 *	scenario setting of diagnosis is defined
 *	include list of logics, consumptions and questions
 *
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 *
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/06/15 original ActionScript3 version
 *								2011/10/31 set 40 measures
 *								2013/09/24 format design pattern
 * 								2016/04/12 ported to JavaScript
 *
 */

//resolve D6
var D6 = D6 || {};

D6.scenario = {
	//list of scenario
	defCons: {},
	defMeasures: {},
	defEquipment: {},
	defEquipmentSize: {},
	defInput: {},
	defSelectValue: {},
	defSelectData: {},

	//series of questions
	defQuesOrder: [],

	// getLogicList() -------------------------------------------
	//		construct consumption class and set to logicList[]
	// return
	//		logicList[]
	getLogicList: function() {
		var logicList = {};

		// in case of create new consumption class, write here to use in D6
		// in some case, the order is important
		logicList["consTotal"] = D6.consTotal;
		logicList["consEnergy"] = D6.consEnergy;
		logicList["consSeason"] = D6.consSeason;
		logicList["consHWsum"] = D6.consHWsum;
		logicList["consHWshower"] = D6.consHWshower;
		logicList["consHWtub"] = D6.consHWtub;
		logicList["consHWdresser"] = D6.consHWdresser;
		logicList["consHWdishwash"] = D6.consHWdishwash;
		logicList["consHWtoilet"] = D6.consHWtoilet;
		logicList["consCOsum"] = D6.consCOsum;
		logicList["consACcool"] = D6.consACcool;
		logicList["consHTsum"] = D6.consHTsum;
		logicList["consHTcold"] = D6.consHTcold;
		logicList["consACheat"] = D6.consACheat;
		logicList["consAC"] = D6.consAC;
		logicList["consRFsum"] = D6.consRFsum;
		logicList["consRF"] = D6.consRF;
		logicList["consLIsum"] = D6.consLIsum;
		logicList["consLI"] = D6.consLI;
		logicList["consTVsum"] = D6.consTVsum;
		logicList["consTV"] = D6.consTV;
		logicList["consDRsum"] = D6.consDRsum;
		logicList["consCRsum"] = D6.consCRsum;
		logicList["consCR"] = D6.consCR;
		logicList["consCRtrip"] = D6.consCRtrip;
		logicList["consCKpot"] = D6.consCKpot;
		logicList["consCKcook"] = D6.consCKcook;
		logicList["consCKrice"] = D6.consCKrice;
		logicList["consCKsum"] = D6.consCKsum;
		logicList["consOTother"] = D6.consOTother;

		return logicList;
	},

	//setDefs() -------------------------------------------------------
	//		definition of questions and measures copied from EXCEL file
	// set
	//		defMeasures[]: 		measures setting
	//		defInput[]: 		question setting
	//		defSelectValue[]: 	selection setting caption list
	//		defSelectData[]: 	selection setting data list
	//		defQuesOrder[]: 	series of question
	//		defEquipment[]: 	setting of equipments --not use now--
	//		defEquipmentSize[]: setting of equipment size --not use now--
	setDefs: function() {
		var defMeasures = {};
		var defInput = {};
		var defSelectValue = {};
		var defSelectData = {};
		var defQuesOrder = [];
		var defEquipment = {};
		var defEquipmentSize = {};

		// defMeasures[measure] ------------------------------------------
		//		measure : measure code (string) same to name below
		// mid			max 3 digit identify number need not to overlap
		// name 		measure code
		// title		measure title
		// easyness		the factor of easy to do
		// refCons 		related consumption class code
		// titleShort 	short title less than 30 charactors
		// joyfull		joyfull detail discription
		// level		suggest level 0:anytime, 1:only easy case , 5: only detail case
		// figNum		figure number
		// lifeTime		lifetime of equipments. year except last charactor is "h"
		// price		inital cost
		// roanShow		show roan simulation, if true
		// standardType	equipment name of orginal type
		// hojoGov		subsidy by national government
		// advice		advice to conqure this measure
		// lifestyle	no need to pay initial cost if 1
		// season		advice season, "wss" w:winter, s:summer, s:spring. in case
		//					not to advice, set "0" in spite of charactor
		//
		//	calculation logic is descrived in each consumption class

		//defined in EXCEL sheet

		// defInput[inname] ---------------------------------------------------------------
		//		definition of questions copied from EXCEL file
		//		inname is "i" + num
		//
		//	cons 		related consumption code
		//	title 		question
		//	unit 		unit of data
		//	text 		detail description of question
		//	inputType 	input method text/radio/sel/check
		//	right 		if set 1, align is right
		//	postfix 	automatic pre deal
		//	nodata 		show data in case of data is -1
		//	varType 	type of data
		//	min			minimum data
		//	max			maximum	data
		//	defaultValue	default data
		//

		// defSelectValue[selname] : caption array
		// defSelectData[selname]  : data array
		//		selname is "sel" + num

		//defined in EXCEL sheet

		// prefecture definition ----------------------------------------------------
		defSelectValue["sel021"] = ["select", "hokkaido"];
		defSelectData["sel021"] = ["-1", "1"];
		defSelectValue["sel022"] = ["select", "north", "south"];
		defSelectData["sel022"] = ["-1", "1", "2"];

		// input list which impact average
		this.defCalcAverage = ["i001", "i005", "i021"];

		// evaluation method of measures
		this.measuresSortChange = "i010"; // input code
		this.measuresSortTarget = [
			"co2ChangeOriginal",
			"co2ChangeOriginal",
			"costTotalChangeOriginal",
			"co2ChangeW1Original",
			"co2ChangeW2Original"
		];

		//additional question list definition. this can be changed by focus.js
		this.defEasyQues = [
			{
				title: "easy input",
				cname: "easy01",
				ques: [
					"i021",
					"i001",
					"i002",
					"i003",
					"i051",
					"i061",
					"i063",
					"i064",
					"i075",
					"i101",
					"i103",
					"i105",
					"i116",
					"i201",
					"i202",
					"i204",
					"i205",
					"i263",
					"i501",
					"i601",
					"i701"
				]
			},
			{
				title: "Action Point",
				cname: "action01",
				ques: [
					"i502",
					"i501",
					"i621",
					"i601",
					"i205",
					"i041",
					"i237",
					"i263",
					"i061",
					"i003",
					"i001",
					"i105",
					"i106",
					"i116",
					"i121",
					"i421",
					"i721",
					"i821"
				]
			}
		];

		//series of questions default
		this.defQuesOrder = [
			"i021",
			"i001",
			"i002",
			"i003",
			"i051",
			"i061",
			"i063",
			"i064",
			"i075",
			"i101",
			"i103",
			"i105",
			"i116",
			"i201",
			"i202",
			"i204",
			"i205",
			"i263",
			"i501",
			"i601",
			"i701"
		];

		// copy to D6 class instance
		this.defMeasures = defMeasures;
		this.defInput = defInput;
		this.defSelectValue = defSelectValue;
		this.defSelectData = defSelectData;
		this.defEquipment = defEquipment;
		this.defEquipmentSize = defEquipmentSize;

		//set area and person to calculate average, heat load etc.
		D6.area.setCalcBaseParams = function() {
			D6.area.setPersonArea(
				D6.doc.data.i001,
				D6.doc.data.i021,
				D6.doc.data.i023
			);
		};

		//get seasonal parameters
		D6.area.getSeasonParamCommon = function() {
			return D6.area.getSeasonParam(D6.area.area);
		};
	}
};

/* 2017/12/14  version 1.0
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.consCRsum
D6.consEnergy = D6.object( D6.ConsBase );

D6.consEnergy.init = function() {
	//construction setting
	this.consName = "consEnergy";    	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
	this.title = "General Energy Setting";	//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "0";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "the use of energy of the whole house, monthly bills";

	// add instance combined to this class
	this.partConsName = [		
	];
};
D6.consEnergy.init();


D6.consEnergy.calc = function() {
	this.clear();
};

D6.consEnergy.calcMeasure = function() {
};





/*  2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consSeason.js 
 * 
 * calculate seasonal consumption
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/06/09 original JavaScript
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consSeason = D6.object( D6.ConsBase );

D6.consSeason.init = function() {
	this.titleList = ["","winter","spring/fall","summer"];	//season name

	//construction setting
	this.consName = "consSeason";   	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
	this.title = "";					//consumption title name
	this.orgCopyNum = 3;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment
	this.residueCalc = "sumup";			//calculate method	no/sumup/yes

	this.sumConsName = "";				//code name of consumption sum up include this
	this.sumCons2Name = "consTotal";	//code name of consumption related to this

	//guide message in input page
	this.inputDisp = "consTotal";		//question display group
	this.inputGuide = "For monthly water and electricity charges per season. Please fill in the approximate value.";

};
D6.consSeason.init();


D6.consSeason.calc = function() {
	this.clear();
};

D6.consSeason.calcMeasure = function() {
};





/* 2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consTotal.js 
 * 
 * calculate consumption and measures related to total house
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consTotal = D6.object( D6.ConsBase );

//initialize setting
D6.consTotal.init = function() {
	//construction setting
	this.consName = "consTotal";   		//code name of this consumption 
	this.consCode = "TO";           	//short code to access consumption, only set main consumption user for itemize
	this.title = "whole";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "9";					//number code in items
	this.color = "#a9a9a9";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "";				//code name of consumption sum up include this
	this.sumCons2Name = "";	//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "Basic information about the area and house";
	
	//no price Data set 1 if nodata
	this.noPriceData = {};

	//parameters related to solar and nitght time electricity usage
	this.ratioNightEcocute = 0.4;		//night consumption rate of heat pump
	this.ratioNightHWElec = 0.6;		//night consumption rate of not heat pump
	this.solarSaleRatio = 0.6;			//PV sell rate
	this.generateEleUnit = 1000; 		//PV generation   kWh/kW/year
	this.reduceHEMSRatio = 0.1;			//reduce rate of Home Energy Management System
	this.standardSize = 3.6;			//PV standard size
	
	this.noConsData = true;				//flag of no input of fee
	
	this.averagePriceElec;

	this.seasonConsPattern = [ 1.4, 1, 1.2 ];	// consumption rate  - winter, spring, summer

};
D6.consTotal.init();


//change Input data to local value 
D6.consTotal.precalc = function() {
	this.clear();
	
	this.person =this.input( "i001", 3 );						//person

	//solar
	this.solarSet = this.input( "i051", 0 );					//PV exist 1:exist
	this.solarKw = this.input( "i052", this.solarSet * 3.5 );	//PV size (kW)
	this.solarYear = this.input( "i053", 0 );					//PV set year
	
	
	//electricity
	this.priceEle = this.input( "i061"
		,D6.area.averageCostEnergy.electricity );			//electricity fee
	this.priceEleSpring = this.input( "i0912" ,-1 );
	this.priceEleSummer = this.input( "i0913" ,-1 );
	this.priceEleWinter = this.input( "i0911" ,-1 );
	this.noPriceData.electricity = 
			this.input( "i061",-1) == -1
			& this.priceEleSpring == -1
			& this.priceEleSummer == -1
			& this.priceEleWinter == -1;

	this.priceEleSell =this.input( "i062", 0 );					//sell electricity
				
	//gas
	this.priceGas =this.input( "i063"
		,D6.area.averageCostEnergy.gas );						//gas fee
	this.priceGasSpring =this.input( "i0932" ,-1 );
	this.priceGasSummer =this.input( "i0933" ,-1 );
	this.priceGasWinter =this.input( "i0931" ,-1 );
	this.noPriceData.gas = 
			this.input( "i063",-1) == -1
			& this.priceGasSpring == -1
			& this.priceGasSummer == -1
			& this.priceGasWinter == -1;

	this.houseType =this.input( "i002", -1 );					//type of house
	this.houseSize =this.input( "i003", 
		( this.person == 1 ? 60 : (80 + this.person * 10) ) );	//floor size

	this.heatEquip =this.input( "i202", -1 );					//main heat equipment

	//kerosene------------------------------
	this.priceKerosSpring =this.input( "i0942" ,-1 );
	this.priceKerosSummer =this.input( "i0943" ,-1 );
	this.priceKerosWinter =this.input( "i0941" ,-1 );
	this.noPriceData.kerosene = 
			this.priceKerosSpring == -1
			& this.priceKerosSummer == -1
			& this.priceKerosWinter == -1;
	

	if( this.priceKerosWinter == -1 ) {
		if (D6.area.averageCostEnergy.kerosene < 1000 ) {
			this.priceKeros =this.input( "i064", 0 );
		} else {
			this.priceKeros =this.input( "i064"
				,D6.area.averageCostEnergy.kerosene 
				/ D6.area.seasonMonth.winter * 12 );
		}
	}

	this.priceCar =this.input( "i075"
		,D6.area.averageCostEnergy.car );						//gasoline
	this.noPriceData.car = (this.input( "i075",-1) == -1);

	this.equipHWType = this.input( "i101", 1 );					//type of heater

	this.generateEleUnit = D6.area.unitPVElectricity;			//area parameters of PV generate

	//set seasonal fee
	this.seasonPrice =  {
		electricity :	[ this.priceEleWinter, this.priceEleSpring, this.priceEleSummer ],	
		gas :			[ this.priceGasWinter, this.priceGasSpring, this.priceGasSummer ],	
		kerosene:		[ this.priceKeros, this.priceKerosSpring,this.priceKerosSummer ], 	
//		coal :			[ -1, -1,-1 ], 
//		hotwater :		[ -1, -1,-1 ],
		car :			[ -1, -1,-1 ] 
	};

	//monthly pattern  -1:no input
	this.monthlyPrice = {
		electricity :	[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
		gas :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
		kerosene :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
//		coal :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
//		hotwater :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
		car :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ] 
	};

	//add kerosene to gas if both input is null
	if (D6.area.averageCostEnergy.kerosene < 1000 ) {
		if (this.input( "i063", -1 ) < 0 			//gas no input 
			&&this.input( "i0931", -1 ) < 0 
			&&this.input( "i0932", -1 ) < 0 
			&&this.input( "i0933", -1 ) < 0 
		) {
			//add kerosene to gas
			this.keros2gas =D6.area.averageCostEnergy.kerosene
					/D6.Unit.price.kerosene
					*D6.Unit.calorie.kerosene
					/D6.Unit.calorie.gas
					*D6.Unit.price.gas;
			this.priceGasSpring += this.keros2gas;
			this.priceGasWinter += this.keros2gas;				
		}
	}

};

D6.consTotal.calc = function( ){
	var ret;					//return values

	//seasonal parameters
	var seasonConsPattern = D6.area.getSeasonParamCommon();

	//estimate of electricity
	ret = D6.calcMonthly( this.priceEle, this.seasonPrice["electricity"], this.monthlyPrice["electricity"], seasonConsPattern.electricity, "electricity" );
	this.priceEle = ret.ave;
	this.seasonPrice["electricity"] = ret.season;
	this.monthlyPrice["electricity"] = ret.monthly;
	
	//in case of no fee input, use sum of all consumption
	this.noConsData = ret.noConsData 
					&& ( this.input( "i061", -1) == -1 )
					&& this.noPriceData.gas
					&& this.noPriceData.car
					&& this.noPriceData.kerosene;
	//&& !D6.averageMode;

	//depend on hot water equipment
	if ( this.equipHWType == 5 ) {
		this.averagePriceElec = this.ratioNightHWElec *D6.Unit.price.nightelectricity 
						+ ( 1 - this.ratioNightHWElec ) *D6.Unit.price.electricity;
		this.allDenka = true;
		
	} else if (this.equipHWType == 6 ) {
		this.averagePriceElec = this.ratioNightEcocute *D6.Unit.price.nightelectricity 
						+ ( 1 - this.ratioNightEcocute ) *D6.Unit.price.electricity;
		this.allDenka = true;
		
	} else {
		this.averagePriceElec =D6.Unit.price.electricity;
		this.allDenka = false;
	}

	//base price
	var priceBase;
	if ( this.allDenka ) {
		priceBase = D6.Unit.price.nightelectricity;
	} else {
		priceBase = 0;
	}

	//solar generation
	var generateEle = this.generateEleUnit * this.solarKw / 12;
	

	// solar generation restirict system
	this.pvRestrict = 1;
	if ( D6.area.electCompany == 2			//tokyo
		|| D6.area.electCompany == 3		//chubu
		|| D6.area.electCompany == 5		//kansai
	) {
		this.pvRestrict = 0;
	}

	//solar sell price in Japan
	var pvSellUnitPrice = D6.Unit.price.sellelectricity;
	if ( this.solarYear > 1990 && this.solarYear <= 2010 ) {
		pvSellUnitPrice = 48;
	} else if ( this.solarYear == 2011 ||  this.solarYear == 2012 ) {
		pvSellUnitPrice = 42;
	} else if ( this.solarYear == 2013  ) {
		pvSellUnitPrice = 38;
	} else if ( this.solarYear == 2014 ) {
		pvSellUnitPrice = 37;
	} else if ( this.solarYear == 2015 ) {
		if ( this.pvRestrict == 1 ) {
			pvSellUnitPrice = 35;
		} else {
			pvSellUnitPrice = 33;
		}
	} else if ( this.solarYear == 2016 ) {
		if ( this.pvRestrict == 1 ) {
			pvSellUnitPrice = 33;
		} else {
			pvSellUnitPrice = 31;
		}
	} else if ( this.solarYear >= 2017 &&   this.solarYear  < 2020) {
		if ( this.pvRestrict == 1 ) {
			pvSellUnitPrice = 30;
		} else {
			pvSellUnitPrice = 28;
		}
	} else if ( this.solarYear  < 2100) {
		//estimate
		pvSellUnitPrice = 20;
	}
	
	//PV installed
	if ( this.solarKw > 0 ) {
		// gross = electricity consumed in home include self consumption amount
		this.grossElectricity = ( 1 - this.solarSaleRatio ) * generateEle 
					+ Math.max(0, ( this.priceEle 
						-  this.priceEleSell
						+ this.solarSaleRatio * generateEle * pvSellUnitPrice 
						- priceBase ) 
					) / this.averagePriceElec;
		this.electricity = this.grossElectricity - generateEle;
	} else {
		//not installed
		this.electricity = ( this.priceEle - priceBase ) / this.averagePriceElec;
		this.grossElectricity = this.electricity;
	}

	//gas
	ret = D6.calcMonthly( this.priceGas, this.seasonPrice["gas"], this.monthlyPrice["gas"], seasonConsPattern.gas, "gas" );
	this.priceGas = ret.ave;
	this.seasonPrice["gas"] = ret.season;
	this.monthlyPrice["gas"] = ret.monthly;

	this.gas = ( this.priceGas -D6.Unit.priceBase.gas ) 
											/D6.Unit.price.gas;

	//kerosene
	ret = D6.calcMonthly( this.priceKeros, this.seasonPrice["kerosene"], this.monthlyPrice["kerosene"], seasonConsPattern.kerosene, "kerosene" );
	this.priceKeros = ret.ave;
	this.seasonPrice["kerosene"] = ret.season;
	this.monthlyPrice["kerosene"] = ret.monthly;
	
	if ( this.heatEquip == 4 && this.priceKeros < 1000 ) {
		//in case of no input
		this.priceKeros = 2000;
	}
	this.kerosene = this.priceKeros / D6.Unit.price.kerosene;

	//gasoline
	ret = D6.calcMonthly( this.priceCar, this.seasonPrice["car"], this.monthlyPrice["car"], seasonConsPattern.car, "car" );
	this.priceCar = ret.ave;
	this.seasonPrice["car"] = ret.season;
	this.monthlyPrice["car"] = ret.monthly;

	this.car = this.priceCar / D6.Unit.price.car;

};


D6.consTotal.calcMeasure = function( ) {
	var mes,pvSellUnitPrice;

	var solar_reduceVisualize = this.reduceHEMSRatio;

	if ( this.pvRestrict == 1 ) {
		pvSellUnitPrice = 30;
	} else {
		pvSellUnitPrice = 28;
	}

	//mTOsolar-----------------------------------------
	mes = this.measures[ "mTOsolar" ];		//set mes
	mes.copy( this );
	
	// not installed and ( stand alone or desired )
	if ( this.solarKw == 0 
		&& ( this.houseType != 2  ) 
	) {
		// monthly generate electricity
		var solar_generate_kWh = this.generateEleUnit * this.standardSize / 12;

		// saving by generation
		var solar_priceDown = solar_generate_kWh * this.solarSaleRatio * pvSellUnitPrice 
						+ solar_generate_kWh * ( 1 - this.solarSaleRatio ) *D6.Unit.price.electricity;

		// saving by visualize display
		var solar_priceVisualize = this.electricity * solar_reduceVisualize
							*D6.Unit.price.electricity;
		
		//electricity and cost
		mes.electricity = this.electricity * ( 1 - solar_reduceVisualize ) - solar_generate_kWh;
		mes.costUnique = this.cost - solar_priceDown - solar_priceVisualize;	
		
		//initial cost 
		mes.priceNew = this.standardSize * mes.priceOrg;	
		
		//comment add to original definition
		mes.advice = D6.scenario.defMeasures["mTOsolar"]["advice"] 
			+ "<br>(" + this.standardSize + "kW)";
	}

	//mTOhems HEMS-----------------------------------------
	mes = this.measures[ "mTOhems" ];		//set mes
	mes.copy( this );
	
	//pv system is not installed  --- pv system includes visualize display
	if ( !this.isSelected( "mTOsolar" ) ) {
		mes.electricity = this.electricity * ( 1 - this.reduceHEMSRatio );
	}
	
	//mTOsolarSmall ------------------------------------------
	mes = this.measures[ "mTOsolarSmall" ];		//set mes
	mes.copy( this );
	var watt_panel = 50;			// install panel size (W)
	var eff = 0.3;						// effectiveness to roof 
	mes.electricity -= watt_panel / 1000 * eff * this.generateEleUnit / 12 ;

};


/*  2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWsum.js 
 * 
 * calculate consumption and measures related to hot water supply
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

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.ConsBase
D6.consHWsum = D6.object(D6.ConsBase);

//initialize-------------------------------
D6.consHWsum.init = function() {
	//construction setting
	this.consName = "consHWsum"; //code name of this consumption
	this.consCode = "HW"; //short code to access consumption, only set main consumption user for itemize
	this.title = "hot water supply"; //consumption title name
	this.orgCopyNum = 0; //original copy number in case of countable consumption, other case set 0
	this.groupID = "1"; //number code in items
	this.color = "#ffb700"; //color definition in graph
	this.countCall = ""; //how to point n-th equipment

	this.sumConsName = "consTotal"; //code name of consumption sum up include this
	this.sumCons2Name = ""; //code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use hot water supply in general";

	this.hwEnergy = 0;

	// parameters setting in this consumption
	this.waterTemp = 18; //temperature of water degree-C
	this.hotWaterTemp = 42; //hot water temperature degree-C
	this.tabWaterLitter = 200; //tab hot water amount L
	this.showerWaterLitterUnit = 10; //shower speed L/min
	this.reduceRateShowerHead = 0.3; //reduce rate by saving shower head
	this.showerWaterMinutes = 5; //shower time min/person
	this.otherWaterLitter = 50; //other amount of hot water L/day
	this.tankLossWatt = 100; //keep tank hot energy
	this.tabTemplatureDown = 2; //temperature down in tab water degree-C/hour
	this.tabTemplatureInsulationDown = 0.5; //temperature down in insulated tab degree-C/hour

	this.performanceGas = 0.73; //efficient of ordinal gas heater
	this.performanceEcojozu = 0.877; //efficient of good gas heater
	this.performanceElec = 0.8; //efficient of electric heater
	this.performanceEcocute = 3; //efficient of heat pump heater
	this.performanceEnefarmEle = 0.289; //efficient of electricity generation of co-generator
	this.performanceEnefarmHW = 0.33; //efficient of heat supply of co-generator
	this.performanceKeepWithTank = 0.6; //efficient of keep tab temperature with stock hot water

	this.reduceRateSaveMode = 0.2; //reduce rate to use electric heater with saving mode
	this.reduceRateSolar = 0.4; //reduce rate to use solar heater
	this.reduceRateSolarSystem = 0.5; //reduce rate to use solar heating system

	this.warmerElec_kWh_y = 200; //hot seat of toilet kWh/year
	this.water_m3_d = 0.1; //water use for toilet m3/person/day

	this.reduceRateKeepStop;
};
D6.consHWsum.init(); // initialize when this class is loaded

//change Input data to local value
D6.consHWsum.precalc = function() {
	this.clear();

	// use answers for calclation
	this.person = this.input("i001", 3); //person number
	this.housetype = this.input("i002", 1); //structure of house
	this.prefecture = this.input("i021", 13); //prefecture
	this.solarHeater = this.input("i102", 3); //solar heater
	this.heatArea = D6.area.getHeatingLevel(this.prefecture); //heating level
	this.tabDayWeek = this.input(
		"i103",
		this.heatArea == 1 || this.heatArea == 6 ? 2 : 6
	); //use tab day day/week
	this.tabDayWeekSummer = this.input("i104", 2); //use tab day in summer day/week
	var ret = this.input2seasons(
		"i105",
		"i106",
		this.showerWaterMinutes * this.person
	);
	this.showerMinutes = ret[0]; //shower time min/day
	this.showerMinutesSummer = ret[1]; //shower time in summer min/day
	this.showerHotTimeSpan = this.input("i112", 10); //time(seconds) to pour Hot Water

	this.savingShower = this.input("i116", -1); //saving shower head
	this.tabKeepHeatingTime = this.input("i108", this.person > 1 ? 3 : 0); //keep time to tab hot hour/day

	this.keepMethod2 = this.input("i111", 5); //keep hot method 2
	this.keepMethod = this.input("i110", this.keepMethod2); //keep hot method
	this.tabInsulation = this.input("i117", -1); //tab insulation
	this.tabHeight = this.input("i107", 8); //height of tab hot water 0-10

	this.equipType = this.input("i101", -1); //type of heater
	this.priceGas = D6.consShow["TO"].priceGas; //gas fee yen/month
	this.priceKeros = D6.consShow["TO"].priceKeros; //kerosene price yen/month

	this.dresserMonth = this.input("i114", 4); //months of use hot water for dresser month
	this.dishWashMonth = this.input("i115", 4); //months of use hot water for dish wash month / 99 is machine
	this.dishWashWater = this.input("i113", 3); //use cold water for dish wash 1every day - 4 not
	this.heaterPerformance = this.input("i121", 2); //performance of heater 1good  3bad
	this.cookingFreq = this.input("i802", 6); //frequency of cooking 0-10

	this.keepSeason = this.input("i131", 2); //use keep toilet seat hot 1:everyday - 4not use
};

// calculation of this consumption ------------------------------------
D6.consHWsum.calc = function() {
	// guess equip type
	if (this.equipType <= 0) {
		if (this.priceGas == 0) {
			if (this.priceKeros > 3000) {
				this.equipType = 3;
			} else {
				this.equipType = 5;
			}
		} else {
			this.equipType = 1;
		}
	}

	//good type
	if (this.equipType == 1 && this.heaterPerformance == 1) {
		this.equipType == 2;
	}
	if (this.equipType == 5 && this.heaterPerformance == 1) {
		this.equipType == 6;
	}
	//bad type
	if (this.equipType == 2 && this.heaterPerformance == 3) {
		this.equipType == 1;
	}

	// estimate templature of tap water
	this.waterTemp = D6.area.getWaterTemplature();

	//adjust by solar heater
	this.waterTemp =
		this.solarHeater == 1
			? 0.4 * this.hotWaterTemp + 0.6 * this.waterTemp
			: this.solarHeater == 2
				? 0.15 * this.hotWaterTemp + 0.85 * this.waterTemp
				: this.waterTemp;

	// estimate amount of hot water used as shower litter/day
	this.showerWaterLitter =
		((this.showerMinutes * (12 - D6.area.seasonMonth.summer) +
			this.showerMinutesSummer * D6.area.seasonMonth.summer) /
			12 *
			(this.savingShower == 1 ? 1 - this.reduceRateShowerHead : 1) +
			this.showerHotTimeSpan / 60 * 5) * //	5 times
		this.showerWaterLitterUnit;

	// estimate amount of hot water used in tub	litter/day
	this.consHWtubLitter =
		this.tabWaterLitter *
		this.tabHeight /
		10 *
		(this.tabDayWeek * (12 - D6.area.seasonMonth.summer) +
			this.tabDayWeekSummer * D6.area.seasonMonth.summer) /
		12 /
		7;

	// sum hot water use litter/day
	this.allLitter =
		this.consHWtubLitter + this.showerWaterLitter + this.otherWaterLitter;

	// tap water heating energy   kcal/month
	this.heatTapEnergy =
		this.allLitter * (this.hotWaterTemp - this.waterTemp) * 365 / 12;

	// tab keep energy kcal/month
	this.tabKeepEnergy =
		this.consHWtubLitter *
		this.tabKeepHeatingTime *
		365 /
		12 *
		(this.tabInsulation == 1 || this.tabInsulation == 2
			? this.tabTemplatureInsulationDown
			: this.tabTemplatureDown) /
		(this.equipType == 4 || this.equipType == 5
			? this.performanceKeepWithTank
			: 1) *
		this.keepMethod /
		10;

	// heating energy   kcal/month
	this.heatEnergy = this.heatTapEnergy + this.tabKeepEnergy;
	this.hwEnergy = this.heatEnergy;

	// ratio of tub
	this.consHWtubRate =
		this.consHWtubLitter / this.allLitter +
		this.tabKeepEnergy / this.heatEnergy;

	// ratio of shower
	this.consHWshowerRate =
		this.showerWaterLitter /
		this.allLitter *
		(this.heatTapEnergy / this.heatEnergy);

	// ratio of dresser
	this.consHWdresserRate =
		this.otherWaterLitter /
		2 /
		this.allLitter *
		(this.heatTapEnergy / this.heatEnergy) *
		this.dresserMonth /
		6;

	// ratio of dish wash
	this.consHWdishwashRate =
		this.otherWaterLitter /
		2 /
		this.allLitter *
		(this.heatTapEnergy / this.heatEnergy) *
		(this.dishWashMonth == 99 ? 1 : this.dishWashMonth / 6) *
		(4 - this.dishWashWater) /
		2 *
		this.cookingFreq /
		6;

	// estimate loss energy when stored in tank  kcal/month
	this.tanklossEnergy =
		this.tankLossWatt / 1000 * D6.Unit.calorie.electricity * 365 / 12;

	// Heater Equip Type
	switch (this.equipType) {
	case 1:
		//gas heater
		this.mainSource = "gas";
		this[this.mainSource] =
				this.heatEnergy /
				this.performanceGas /
				D6.Unit.calorie[this.mainSource];
		break;
	case 2:
		//high efficient gas heater
		this.mainSource = "gas";
		this[this.mainSource] =
				this.heatEnergy /
				this.performanceEcojozu /
				D6.Unit.calorie[this.mainSource];
		break;
	case 3:
		//kerosene heater
		this.mainSource = "kerosene";
		this[this.mainSource] =
				this.heatEnergy /
				this.performanceGas /
				D6.Unit.calorie[this.mainSource];
		break;
	case 4:
		//high efficient kerosene heate
		this.mainSource = "kerosene";
		this[this.mainSource] =
				this.heatEnergy /
				this.performanceEcojozu /
				D6.Unit.calorie[this.mainSource];
		break;
	case 5:
		//electricity heater
		this.mainSource = "electricity";
		this[this.mainSource] =
				(this.heatEnergy + this.tanklossEnergy) /
				this.performanceElec /
				D6.Unit.calorie[this.mainSource];
		break;
	case 6:
		//heat pump heater
		this.mainSource = "electricity";
		this[this.mainSource] =
				(this.heatEnergy + this.tanklossEnergy) /
				this.performanceEcocute /
				D6.Unit.calorie[this.mainSource];
		break;
	case 7:
	case 8:
	default:
		this.mainSource = "gas";
		this.gas =
				this.heatEnergy / this.performanceEcojozu / D6.Unit.calorie.gas;
	}

	//toilet
	this.electricity += this.warmerElec_kWh_y / 12 * (4 - this.keepSeason) / 3;
	this.water += this.water_m3_d * this.person * 30;

	//reduce rate by use shower
	this.reduceRateShowerTime =
		1 / (this.showerMinutes / this.person - 1) * this.consHWshowerRate;

	//reduce rate by stop keep hot
	this.reduceRateTabKeep =
		this.tabKeepEnergy /
		(this.heatEnergy * this.consHWtubLitter / this.allLitter);

	//reduce rate by insulation tab
	this.reduceRateInsulation =
		this.tabInsulation == 1 || this.tabInsulation == 2
			? 0
			: this.reduceRateTabKeep *
			  (this.tabTemplatureDown - this.tabTemplatureInsulationDown) /
			  this.tabTemplatureDown;

	//reduce rate by use shower in summer
	var ssummer = this.tabDayWeekSummer * D6.area.seasonMonth.summer;
	var snsummer = this.tabDayWeek * (12 - D6.area.seasonMonth.summer);
	this.reduceRateStopTabSummer = ssummer / (ssummer + snsummer);
};

// calclate measures ----------------------------------------------
//		calculate co2/cost saving related to this consumption
// parameter
//		none
// result
//		none
// set
//		calclate result in this.measures[] also link to D6.measuresList[]
D6.consHWsum.calcMeasure = function() {
	var goodPerformance = false;

	// installed good performance equipments
	if (
		this.isSelected("mHWecocute") ||
		this.isSelected("mHWecofeel") ||
		//|| this.isSelected( "mHWecojoze" )
		this.isSelected("mHWenefarm")
	) {
		goodPerformance = true;
	}

	//endEnergy adjust with installed measures 170426
	var endEnergyNow = this.hwEnergy * this.co2 / this.co2Original;
	if (
		(this.equipType == -1 ||
			this.equipType == 1 ||
			this.equipType == 3 ||
			this.equipType == 5) &&
		!goodPerformance
	) {
		//mHWecocute
		if (this.housetype == 1) {
			this.measures["mHWecocute"].clear();
			this.measures["mHWecocute"].nightelectricity =
				(endEnergyNow + this.tanklossEnergy) /
				this.performanceEcocute /
				D6.Unit.calorie.nightelectricity;
		}

		//mHWecofeel
		if (this.equipType == 3) {
			this.measures["mHWecofeel"].clear();
			this.measures["mHWecofeel"].kerosene =
				endEnergyNow / this.performanceEcojozu / D6.Unit.calorie.kerosene;
		}

		//mHWecojoze
		this.measures["mHWecojoze"].clear();
		this.measures["mHWecojoze"].gas =
			endEnergyNow / this.performanceEcojozu / D6.Unit.calorie.gas;

		//mHWenefarm
		if (this.housetype == 1) {
			this.measures["mHWenefarm"].clear();
			//electricity generation
			var notCoGenerationEnergy = 500 * 1000 / 12; //	kcal/month
			var coGenerationEnergy = endEnergyNow - notCoGenerationEnergy;

			this.measures["mHWenefarm"].gas =
				(coGenerationEnergy / this.performanceEnefarmHW +
					notCoGenerationEnergy / this.performanceEcojozu) /
				D6.Unit.calorie.gas;

			this.measures["mHWenefarm"].electricity =
				-coGenerationEnergy /
				this.performanceEnefarmHW *
				this.performanceEnefarmEle /
				D6.Unit.calorie.electricity;
		}
	}

	//mHWsaveMode
	if (this.equipType == 6 || this.equipType == 5) {
		this.measures["mHWsaveMode"].calcReduceRate(this.reduceRateSaveMode);
	}

	var rejectSolarSelect = false; //can or not to install solar heater
	if (
		this.isSelected("mHWecocute") ||
		this.isSelected("mHWenefarm") ||
		this.isSelected("mHWsolarSystem") ||
		this.isSelected("mHWsolarHeater")
	) {
		//tank type or co generation type
		rejectSolarSelect = true;
	}

	if (
		this.equipType != 5 &&
		this.equipType != 6 &&
		!rejectSolarSelect &&
		this.housetype == 1
	) {
		this.measures["mHWsolarHeater"].calcReduceRate(this.reduceRateSolar);
		this.measures["mHWsolarSystem"].calcReduceRate(this.reduceRateSolarSystem);
	}
};

//hot water energy is also adjusted
D6.consHWsum.calcAdjustStrategy = function(energyAdj) {
	this.heatEnergy *= energyAdj[this.mainSource];
	this.tanklossEnergy *= energyAdj[this.mainSource];
	this.hwEnergy *= energyAdj[this.mainSource];
};

/* 2017/12/15  version 1.0
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

//resolve D6
var D6 = D6||{};
 
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


/* 2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWdresser.js 
 * 
 * calculate consumption and measures related to bathtub
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

//resolve D6
var D6 = D6||{};
 
//Inherited class of D6.ConsBase
D6.consHWtub = D6.object( D6.ConsBase );

D6.consHWtub.init = function() {
	this.autoKeepRate = 0.5;			//reduce rate to change auto heating to demand heating

	//construction setting
	this.consName = "consHWtub";   	 	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "Bathtub";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use hot water in bath tub";

};
D6.consHWtub.init();


D6.consHWtub.calc = function() {
	this.copy( this.sumCons );
	this.multiply( this.sumCons.consHWtubRate );
};

D6.consHWtub.calcMeasure = function() {
	//mHWinsulation
	this.measures[ "mHWinsulation" ].calcReduceRate( this.sumCons.reduceRateInsulation );

	//mHWkeep
	this.measures[ "mHWkeep" ].calcReduceRate( this.sumCons.reduceRateTabKeep );

	//mHWstopAutoKeep 
	if ( this.sumCons.keepMethod > 5 )  {
		this.measures[ "mHWstopAutoKeep" ].calcReduceRate( this.sumCons.reduceRateTabKeep * this.autoKeepRate );
	}

	//mHWonlyShower
	this.measures[ "mHWonlyShower" ].calcReduceRate(  this.sumCons.reduceRateStopTabSummer );
};



/* 2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWdresser.js 
 * 
 * calculate consumption and measures related to dresser
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consHWdresser = D6.object( D6.ConsBase );

D6.consHWdresser.init = function(){
	//construction setting
	this.consName = "consHWdresser";    //code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "basin";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to wash hot water in the basin";
};
D6.consHWdresser.init();


D6.consHWdresser.calc = function( ) {
	this.copy( this.sumCons );
	this.multiply( this.sumCons.consHWdresserRate );
};

D6.consHWdresser.calcMeasure = function( ) {
};


/* 2017/12/14  version 1.0
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
 * 								2017/12/14 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumptionb
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//resolve D6
var D6 = D6||{};

//Inherited class of D6.consCRsum
D6.consHWdishwash = D6.object( D6.ConsBase );

D6.consHWdishwash.init = function() {
	this.reduceRateWashTank = 0.3;			//reduction rate wash with stored water
	this.reduceRateWashNotSummer = 0.5;		//reduction rate with cold water in summer
	this.reduceRateDishWasher = 0.2;		//reduction rate with wash machine

	//construction setting
	this.consName = "consHWdishwash";  	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "Dish Wash";			//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use the dishwasher";
};
D6.consHWdishwash.init();


D6.consHWdishwash.calc = function() {
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

/* 2017/12/15  version 1.0
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

//resolve D6
var D6 = D6||{};
 
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
	this.title = "toilet";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use toilet water and heat insulation";
};
D6.consHWtoilet.init();


D6.consHWtoilet.precalc = function() {
	this.clear();

	this.person =this.input( "i001", 3 );			//person
	this.keepSeason =this.input( "i131", 2 );		//use heating 1:everyday - 4 don't use
	this.keepTemp =this.input( "i132", 2 );			//temperature 1:high - 3low, 4 don't know
	this.savingToilet = this.input( "i133", 2 );	//use demand heat type
	this.coverToilet = this.input( "i134", 1 );		//cover use
};

D6.consHWtoilet.calc = function() {	
	this.electricity = this.warmerElec_kWh_y / 12 
						* (4-this.keepSeason)/3
						* (this.keepTemp == 1 ? 1.1 : (this.keepTemp == 3 ? 0.9 : 1) )
						* (this.savingToilet == 1 ? 0.5 : 1 )
						* (this.coverToilet == 2 ? 1.1 : 1 );
	this.water = this.water_m3_d * this.person *30;
};

D6.consHWtoilet.calcMeasure = function() {		
	//var mes;
	
	//mHWreplaceToilet5
	this.measures[ "mHWreplaceToilet5" ].copy( this );
	this.measures[ "mHWreplaceToilet5" ].water = this.water_m3_d * this.person *30 / 2;

	//mHWreplaceToilet
	if ( this.savingToilet != 1 || this.keepSeason != 4 ) {
		this.measures[ "mHWreplaceToilet" ].calcReduceRate( this.resudeRateGoodSheat );
	}
		
	//mHWtemplatureToilet
	if ( this.isSelected( "mHWreplaceToilet" ) || this.savingToilet == 1 ) {
	} else {
		if ( this.keepTemp == 1 ) {
			this.measures[ "mHWtemplatureToilet" ].calcReduceRate( this.resudeRateTemplature );
		} else if ( this.keepTemp == 2 ) {
			this.measures[ "mHWtemplatureToilet" ].calcReduceRate( this.resudeRateTemplature/2 );
		}
	}

	//mHWcoverTilet
	if ( this.isSelected( "mHWreplaceToilet" )|| this.savingToilet == 1 || this.coverToilet == 1 ) {
	} else {
		this.measures[ "mHWcoverTilet" ].calcReduceRate( this.resudeRateCover );
	}

};



/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCOsum.js 
 * 
 * calculate consumption and measures related to cooling of total home
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consCOsum = D6.object( D6.ConsBase );

D6.consCOsum.init = function() {
	this.coolLoadUnit_Wood = 220;			//standard wood house cool load（W/m2）
	this.coolLoadUnit_Steel = 145;			//standard steel house cool load（W/m2）
	this.apf = 4;							//APF Annual performance factor

	this.reduceRateSunCut = 0.1;			//reduce rate by sun cut

	//construction setting
	this.consName = "consCOsum";    	//code name of this consumption 
	this.consCode = "CO";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "cooling";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#0000ff";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use air cooling in the whole house";

};
D6.consCOsum.init();


D6.consCOsum.precalc = function() {
	this.clear();

	this.person =this.input( "i001", 3 );			//person number
	this.houseSize =this.input( "i003", 
		( this.person == 1 ? 60 : (80 + this.person * 10) ) );	//space of house
	this.houseType = this.input( "i002", 1 );		//standalone / collective
	this.coolArea  = this.input( "i201", 0.5 );		//rate by space of cooling
	this.coolTime  = this.input( "i261", 4 );		//time
	this.coolTemp  = this.input( "i263", 27 );		//temperature
	this.coolMonth  = this.input( "i264", D6.area.seasonMonth.summer );		//month
};
	
D6.consCOsum.calc = function() {
	var coolArea_m2;				//area of cooling m2
	coolArea_m2 = this.houseSize * this.coolArea;
	if ( this.coolArea > 0.05 ) {
		coolArea_m2 = Math.max( coolArea_m2, 13 );		//minimun 13m2
	}

	var coolKcal = this.calcCoolLoad(coolArea_m2, this.coolTime, this.coolMonth, this.coolTemp );

	//calculate year average from seasonal average
	coolKcal *= this.coolMonth / 12;

	//monthly electricity
	this.electricity =  coolKcal / this.apf / D6.Unit.calorie.electricity;
};


D6.consCOsum.calcMeasure = function() {
	//mCOsunCut
	this.measures["mCOsunCut"].calcReduceRate( this.reduceRateSunCut );

};


//cool load calculation kcal/month
//
//		cons.houseType : type of structure
//		cons.houseSize : floor size(m2)
//		cons.heatArea : area rate of heating(-)
D6.consCOsum.calcCoolLoad = function( coolArea_m2, coolTime, coolMonth, coolTemp )
{
	var energyLoad = 0;

	var coolLoadUnit = 0;				//cool load kcal/m2/hr
	if ( this.houseType == 1 ) 
	{
		coolLoadUnit = this.coolLoadUnit_Wood;
	} else {
		coolLoadUnit = this.coolLoadUnit_Steel;
	}

	//coefficient of cooling
	var coolFactor = D6.area.getCoolFactor( coolMonth, coolTime );

	var coefTemp;					//difference by temperature
	coefTemp = ( 27 - coolTemp ) / 10 + 1;

	energyLoad = coolLoadUnit * coolFactor[0] *  coolArea_m2 * coolTime * 30 * coefTemp;

	return energyLoad;

};


/* 2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consACcool.js 
 * 
 * calculate consumption and measures related to cooling in one room
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2016/04/12 devide file from consCOOL.js
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6||{};

//Inherited class of D6.consCOsum
D6.consACcool = D6.object( D6.consCOsum );

//initialize
D6.consACcool.init = function(){
	//construction setting
	this.consName = "consACcool"; 		//code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
	this.title = "room air conditioning";			//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "room air conditioning";	//the name of object shown as add target
	this.groupID = "2";					//number code in items
	this.color = "#0000ff";				//color definition in graph
	this.countCall = "th room";			//how to point n-th equipment

	this.sumConsName = "consCOsum";		//code name of consumption sum up include this
	this.sumCons2Name = "consAC";		//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use air conditioning for each room";

};
D6.consACcool.init();


D6.consACcool.precalc = function() {
	this.clear();
	this.houseSize = 1;

	//link to consAC
	this.ac = D6.consListByName["consAC"][this.subID];

	//prepare input value
	this.coolArea  = this.input( "i212" + this.subID, 12 );		//size of room (m2)
	this.coolTime  = this.input( "i271" + this.subID, this.sumCons.coolTime );	//time of cooling per day (hour/day)
	this.coolTemp  = this.input( "i273" + this.subID, this.sumCons.coolTemp );	//temperature setting (degree-C)
	this.coolMonth  = this.input( "i274" + this.subID, this.sumCons.coolMonth );	//cooling month
};

D6.consACcool.calc = function() {
	//calculate cooling load ( kcal/month in cooling days )
	var coolKcal = this.calcCoolLoad(this.coolArea, this.coolTime, this.coolTemp, this.coolMonth  );

	//calculate annual electricity from cooling season monthly one.
	coolKcal *= D6.area.seasonMonth.summer / 12;

	//monthly consumption electricity kWh/mon
	this.electricity =  coolKcal / this.ac.apf / D6.Unit.calorie.electricity;

};

//calculation after all consumptions are calclated
D6.consACcool.calc2nd = function( ) {
	//in case of residue
	if ( this.subID == 0 ){
		this.electricity = this.sumCons.electricity;
		var cons = D6.consListByName[this.consName];
		for( var i=1 ; i< cons.length ; i++ ){
			this.electricity -= cons[i].electricity;
		}
	}
};

D6.consACcool.calcMeasure = function() {
	if ( this.subID > 0 || this.electriity == this.sumCons.electricity ) return;

	//mCOtemplature
	if ( this.coolTemp < 28 && this.coolTemp > 20 ){
		this.measures["mCOtemplature"].calcReduceRate( ( 28 - this.coolTemp ) / 10 );
	} else {
		this.measures["mCOtemplature"].calcReduceRate( 0 );
	}
};




/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHTsum.js 
 * 
 * calculate consumption and measures related to heating in cold area
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6||{};
 
//Inherited class of D6.ConsBase
D6.consHTsum = D6.object( D6.ConsBase );

D6.consHTsum.init = function() {
	//construction setting
	this.consName = "consHTsum";    	//code name of this consumption 
	this.consCode = "HT";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "heating";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";			//how to point n-th equipment

	this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use the whole house heating";

	//common parameters related to heating
	this.heatMcal;						//heating energy (Mcal/month)
	this.heatACCalcMcal;				//in case of heated by air conditioner consumption

	this.heatLoadUnit_Wood = 220 * 1.25 * 0.82;		//average heat load in wood house (W/m2)
	this.heatLoadUnit_Steel = 145 * 1.25 * 0.82;	//average heat load in concrete house (W/m2)
	this.apf = 3;									//APF annual performance factor
	this.apfMax = 4.5;								//max performance

	this.reduceRateInsulation = 0.082;				//reduce rate by wall inslation
	this.reduceRateDouble = 0.124;					//reduce rate by double glasses
	this.reduceRateUchimado = 0.14;					//reduce rate by set inner grass
	this.reduceRateLowe = 0.16;						//reduce rate by Low-e grass
	this.reduceRateFilterCool= 0.05;				//reduce rate of cooling by 

	this.reduceRateFilter= 0.12;					//reduce rate by clean filter
	this.reduceRateDanran= 0.303;					//reduce rate by gathering family
};
D6.consHTsum.init();


//change Input data to local value 
D6.consHTsum.precalc = function() {
	this.clear();

	this.prefecture =this.input( "i021", 13 );		//prefecture
	this.heatArea = D6.area.getHeatingLevel(this.prefecture);

	this.person =this.input( "i001", 3 );			//person number
	this.houseType =this.input( "i002", 1 );		//standalone / collective
	this.houseSize =D6.consShow["TO"].houseSize;	//floor size

	this.heatSpace  =this.input( "i201",
		this.heatArea <= 2 ? 0.6 :
			this.heatArea == 3 ? 0.25 : 0.2
	);												//heating area m2
		
	this.heatEquip =this.input( "i202", -1 );		//heating equipment
	this.heatTime  =this.input( "i204", 
		this.heatArea == 1 ? 24 :
			this.heatArea == 2 ? 10 :
				this.heatArea == 3 ? 6 : 6
	);												//heating time
	this.heatMonth  = this.input( "i206", D6.area.seasonMonth.winter );	//heating month
	this.heatTemp  =this.input( "i205", 21 );		//heating temperature setting
	this.priceEleSpring =this.input( "i0912", -1 );	//electricity charge in spring/fall
	this.priceEleWinter =this.input( "i0911", -1 );	//electricity charge in winter
	this.priceGasSpring =this.input( "i0922", -1 );	//gas charge in spring/fall
	this.priceGasWinter =this.input( "i0921", -1 );	//gas charge in winter
	this.consKeros =this.input( "i064", -1 );		//consumption of kerosene
	this.hotwaterEquipType = this.input( "i101", -1 );	//hot water temperature

	this.performanceWindow =this.input( "i041", -1 );	//performance of window
	this.performanceWall =this.input( "i042", -1 );	//performance of wall insulation
	this.reformWindow =this.input( "i043", -1 );	//reform to change window
	this.reformfloor =this.input( "i044", -1 );		//reform to change floor

};

D6.consHTsum.calc = function() {
	//heat floor/room size m2
	var heatArea_m2	= this.houseSize * this.heatSpace;
	if ( this.heatSpace > 0.05 ) {
		heatArea_m2 = Math.max( heatArea_m2, 13 );		//minimum 13m2
	}

	//calculate heat energy
	var heatKcal = this.calcHeatLoad(heatArea_m2, this.heatTime, this.heatMonth, this.heatTemp);

	//covert to monthly by seasonal data
	heatKcal *= this.heatMonth / 12;
	this.endEnergy = heatKcal;

	//guess of heat source
	if ( this.heatEquip <= 0 ) {
		if ( this.consKeros > 0 
			||D6.area.averageCostEnergy.kerosene > 1000 
		) {
			//kerosene 
			this.heatEquip = 4;
		} else if ( this.priceGasWinter < 0 
				|| this.priceGasWinter > 4000 
		) {
			//gas
			this.heatEquip = 3;
		} else {
			//electricity
			this.heatEquip = 1;
		}
	}

	//calculate residue
	var elecOver = 0;
	var coef = ( this.heatEquip == 1 ? this.apf : 1 );
	if ( this.heatEquip == 1 || this.heatEquip == 2 ) {
		if ( this.priceEleWinter > 0  ) {
			var priceMaxCons = this.priceEleWinter * 0.7
					/ D6.Unit.price.electricity 
					* this.heatMonth / 12;
			if ( heatKcal / coef /D6.Unit.calorie.electricity > priceMaxCons ) {
				//in case that calculated electricity is more than fee
				elecOver = heatKcal - priceMaxCons * coef *D6.Unit.calorie.electricity;
				heatKcal -= elecOver;
			}
		}
	}

	//estimate of heat source
	if ( this.heatEquip == 1 || this.heatEquip == 2 ) {
		//electricity / air conditioner
		this.mainSource = "electricity";
	} else if ( this.heatEquip == 3 ) {
		//gas
		this.mainSource = "gas";
	} else if ( this.heatEquip == 4 ) {
		//kerosene
		this.mainSource = "kerosene";
	} else if ( this.priceHotWater > 0 ) {
		this.mainSource = "hotwater";
	} else {
		this.mainSource = this.sumCons.mainSource;
	}

	//calculate as air conditioner, calculate this value for change heat method
	this.calcACkwh = heatKcal / this.apf /D6.Unit.calorie.electricity;
	if ( this.mainSource == "electricity" && this.heatEquip != 2) {
		//set air conditioner
		this[this.mainSource] =  this.calcACkwh;
	} else {
		//other than air conditioner
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	}
	
	//estimate from fee
	var consbyprice = -1;
	
	//electricity
	consbyprice = Math.max( 0,  this.priceEleWinter -this.priceEleSpring ) / D6.Unit.price.electricity;
	if ( this.priceEleSpring != -1 && this.priceEleWinter != -1) {
		if( this.hotwaterEquipType !=5 && this.hotwaterEquipType !=6 ) {
			this.electricity = ( this.electricity*2 + consbyprice ) / 3;
		}
	} else {
		this.electricity = ( this.electricity*4 + consbyprice ) / 5;		
	}

	//gas
	consbyprice = Math.max( 0, this.priceGasWinter -this.priceGasSpring ) / D6.Unit.price.gas;
	var gasover = 0;
	if ( this.priceGasSpring != -1 && this.priceGasWinter != -1) {
		if( this.hotwaterEquipType >=3 && this.hotwaterEquipType <=6 ) {	//not gas
			this.gas = ( this.gas*3 + consbyprice ) / 4;
		} else {
			this.gas = ( this.gas*2 + consbyprice ) / 3;
		}
	} else {
		this.gas = ( this.gas*4 + consbyprice ) / 5;
	}
	gasover = Math.max( 0,  this.gas - consbyprice );

	//kerosene
	var keroseneover = 0;
	if (this.consKeros != -1 && this.hotwaterEquipType != 3 && this.hotwaterEquipType != 4){
		consbyprice = this.consKeros / D6.Unit.price.kerosene;
		keroseneover = Math.max( 0,  this.kerosene - consbyprice );
		this.kerosene = consbyprice;
	}

	//fix electricity estimate is more than that of by fee
	if ( elecOver > 0 ) {
		//kerosene fix
		if (D6.Unit.areaHeating <= 4 && this.priceKeros > 0 ) {
			this.kerosene +=  elecOver *  D6.Unit.calorie.electricity /D6.Unit.calorie.kerosene;
		} else {
			this.gas +=  elecOver *  D6.Unit.calorie.electricity /D6.Unit.calorie.gas;
		}
	}
	//gas over fix
	if ( gasover>0 ){
		if( this.priceKeros > 0 ) {
			this.kerosene = Math.min( gasover * D6.Unit.calorie.gas / D6.Unit.calorie.kerosene, this.consKeros / D6.Unit.price.kerosene );
		} else {
			this.electricity +=  gasover * D6.Unit.calorie.gas / D6.Unit.calorie.electricity;
		}
	}

	//kerosene use estimate is more than fee
	if (keroseneover>0){
		this.electricity +=  keroseneover * D6.Unit.calorie.kerosene / D6.Unit.calorie.electricity;
	}

	//re-calculate after fix
	this.calcACkwh = heatKcal / this.apf /D6.Unit.calorie.electricity;
	if ( this.mainSource == "electricity" && this.heatEquip != 2) {
		//air conditioner
		this[this.mainSource] =  this.calcACkwh;
	} else {
		//other than air conditioner
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	}
};


D6.consHTsum.calc2nd = function( ) {
	var spaceK;
	var spaceG;
	var consHW = D6.consShow["HW"];
	var consTotal = D6.consShow["TO"];
	var consCK = D6.consShow["CK"];

	//amount of not fixed kerosene
	spaceK = Math.max( 0, consTotal.kerosene - consHW.kerosene );
	
	//amount of not fixed gas
	spaceG = Math.max( 0, 
		consTotal.gas - consHW.gas - consCK.gas );

	//in case of use kerosene for heat, check electricity usage
	if ( this.heatEquip == 4 ) {
		//in case kerosene estimate is more than fee
		if ( this.kerosene > spaceK && this.consKeros != -1) {
			//heat consumption is over gas residue
			if ( this.kerosene - spaceK 
				> spaceG *D6.Unit.calorie.gas /D6.Unit.calorie.kerosene
			) {
				//estimate heat is supplied by electricity
				this.electricity += 
						( this.kerosene - spaceK ) 
						*D6.Unit.calorie.kerosene
						/D6.Unit.calorie.electricity;
				//not over 70% of winter electricity
				this.electricity = Math.min( this.electricity,
					D6.consShow["TO"].electricity * this.heatMonth / 12 *0.7 );
				this.kerosene = spaceK;
				this.gas = spaceG;
			} else {
				//in case to use gas residure
				this.gas += 
					( this.kerosene - spaceK ) 
					*D6.Unit.calorie.kerosene
					/D6.Unit.calorie.gas;
				this.kerosene = spaceK;
			}
		}
	}

	//kerosene cannot find suitable usage
	var ret;
	if ( spaceK > 0 ) {
		if ( this.consKeros == -1 ) {
			D6.consShow["TO"].kerosene = consHW.kerosene + this.kerosene;
			
			//total kerosene recalculate
			var seasonConsPattern = D6.area.getSeasonParamCommon();
			ret = D6.calcMonthly( D6.consShow["TO"].kerosene * D6.Unit.price.kerosene, [-1,-1,-1], [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ], seasonConsPattern.kerosene, "kerosene" );
			D6.consShow["TO"].priceKeros = ret.ave;
			D6.consShow["TO"].seasonPrice["kerosene"] = ret.season;
			D6.consShow["TO"].monthlyPrice["kerosene"] = ret.monthly;
			
		} else {
			this.kerosene = spaceK;
		}
	}

	//in case of use gas heater
	if ( this.heatEquip == 3 ) {
		if ( this.gas > spaceG ) {
			this.electricity += 
						( this.gas - spaceG ) 
						*D6.Unit.calorie.gas
						/D6.Unit.calorie.electricity;
			this.gas = spaceG;
		}
	}

	//add electricity use in toilet
	this.electricity += D6.consListByName["consHWtoilet"][0].electricity;
};

//calculate heat load kcal/month
//
//		cons.houseType : type of house
//		cons.houseSize : floor size(m2)
//		cons.heatSpace : heat area rate(-)   room size(m2)
D6.consHTsum.calcHeatLoad = function( heatArea_m2, heatTime, heatMonth, heatTemp ){
	var energyLoad = 0;

	// heat loss when temperature difference between house and outside is 20 degree-C  kcal/h/m2
	var heatLoadUnit = this.heatLoadUnit_Wood;
	
	// cold area insulation standard
	if ( this.heatArea == 1 ){
		heatLoadUnit *= 0.3;
	} else if ( this.heatArea <= 2 ){
		heatLoadUnit *= 0.6;
	}

	//thickness of insulation
	if ( this.performanceWall >= 200 ){
		heatLoadUnit = this.heatLoadUnit_Wood * 0.2;
	} else if ( this.performanceWall >= 100 ){
		heatLoadUnit = this.heatLoadUnit_Wood * 0.4;
	} else if ( this.performanceWall >= 50 ){
		heatLoadUnit = this.heatLoadUnit_Wood * 0.7;
	} else if ( this.performanceWall >= 30 ){
		heatLoadUnit = this.heatLoadUnit_Wood;
	}

	// collective house heat load adjust
	if ( this.houseType == 2 ) 
	{
		heatLoadUnit *= this.heatLoadUnit_Steel / this.heatLoadUnit_Wood;
	}

	//heat factor by month and hours
	var heatFactor = D6.area.getHeatFactor( heatMonth, heatTime );

	//heat time adjust for long time use
	var heatTimeFactor = Math.min( heatTime, (heatTime - 8 ) * 0.3 + 8) / heatTime;

	//coefficient by temperature
	var coefTemp = ( heatTemp - 20 ) / 10 + 1;

	energyLoad = heatLoadUnit * heatFactor[1] * heatArea_m2 * heatTime * heatTimeFactor * 30 * coefTemp;

	return energyLoad;
};

//calculate heat load by fee
D6.consHTsum.calcHeatLoadbyPrice = function(){
	var energyLoad = 0;
	return energyLoad;
};

//adjust heat load 
D6.consHTsum.calcAdjustStrategy = function( energyAdj ){
	this.calcACkwh *= energyAdj[this.mainSource];
	this.endEnergy *= energyAdj[this.mainSource];
};

D6.consHTsum.calcMeasure = function() {
	//mHTdoubleGlassAll
	if ( !this.isSelected( "mHTuchimadoAll" ) && 
		!this.isSelected( "mHTloweAll" ) && 
		this.houseType != 2
	){
		this.measures["mHTdoubleGlassAll"].calcReduceRate( this.reduceRateDouble );
	}
	//mHTuchimadoAll
	if (  !this.isSelected( "mHTloweAll" ) ){
		this.measures["mHTuchimadoAll"].calcReduceRate( this.reduceRateUchimado );
	}
	//mHTloweAll
	if (  this.houseType != 2){
		this.measures["mHTloweAll"].calcReduceRate( this.reduceRateLowe );
	}
};




/* 2017/12/14  version 1.0
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

//resolve D6
var D6 = D6||{};
 
//Inherited class of D6.ConsBase
D6.consHTcold = D6.object( D6.ConsBase );

D6.consHTcold.init = function() {
	//construction setting
	this.consName = "consHTcold";    	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
	this.title = "In the cold climate area";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consHTsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use heating in cold climate area";

};
D6.consHTcold.init();


D6.consHTcold.calc = function() {
	this.clear();
};

D6.consHTcold.calcMeasure = function() {
};





/* 2017/12/10  version 1.0
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
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6||{};

// Inherited class of D6.consHTsum
D6.consACheat = D6.object( D6.consHTsum );

// initialize
D6.consACheat.init = function() {
	//construction setting
	this.consName = "consACheat"; 		//code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
	this.title = "room heating";		//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "room air conditioning";	//the name of object shown as add target
	this.sumConsName = "consHTsum";		//code name of consumption sum up include this
	this.sumCons2Name = "consAC";		//code name of consumption related to this
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "th room";			//how to point n-th equipment

	//guide message in input page
	this.inputGuide = "how to use each room heating";
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
	this.heatTime  = this.input( "i233" + this.subID, this.consHeat.heatTime );	//heating time ( hour/day )
	this.heatTemp  = this.input( "i234" + this.subID, this.consHeat.heatTemp );	//temperature setting( degree-C )
	this.heatMonth  = this.input( "i235" + this.subID, this.consHeat.heatMonth );	//heating month
	this.windowArea = this.input( "i213" + this.subID, -1 );		//window size (m2)
	this.windowPerf = this.input( "i214" + this.subID, -1 );		//window insulation level
	
};

D6.consACheat.calc = function() {
	//calculate heat load ( kcal/month in heating days )
	var heatKcal = this.calcHeatLoad(this.heatSpace, this.heatTime, this.heatMonth, this.heatTemp );

	//calculate annual energy from heating season monthly one.
	heatKcal *= this.heatMonth / 12;
	this.endEnergy = heatKcal;

	//guess heat equipment
	if ( this.heatEquip <= 0 ) {
		//use house total
		this.heatEquip = this.consHeat.heatEquip;
	}
	
	//guess main energy source
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

//calculation after all consumptions are calculated
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
	//var mes;

	//mACFilter,mACchangeHeat
	if ( this.heatEquip == 1 ){
		//in case of air-conditioner heater
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



/* 2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consAC.js 
 * 
 * calculate consumption and measures related to air conditioning incude heating and cooling in one room
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6||{};

//Inherited class of D6.consBase
D6.consAC = D6.object( D6.ConsBase );

//initialize
D6.consAC.init = function() {
	//construction setting
	this.consName = "consAC";           //code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
	this.title = "room air conditioning";			//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "th room";			//how to point n-th equipment

	this.sumConsName = "";				//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//code name of consumption in which input is shown, set only input page is hidden
	this.inputDisp = "consACcool";

	//guide message in input page
	this.inputGuide = "";
	
	//definition to point the part of this consumption  
	this.consAddSet = [
		"consACcool",
		"consACheat"
	];
};
D6.consAC.init();

D6.consAC.precalc = function() {
	this.clear();

	//prepare input value
	this.acYear  = this.input( "i215" + this.subID, 6 );		//year of equipment
	this.acPerf  = this.input( "i216" + this.subID, 2 );		//1:low energy 2:other
	this.acFilter  = this.input( "i217" + this.subID, -1 );	//cleaning action of filter
	this.roomSize = this.input( "i212" + this.subID, 12 );		//room size (m2)

	var now = new Date();
	this.nowEquip = this.equip( now.getFullYear() - this.acYear, ( this.roomSize < 16 ? 2.8 : 4 ) );
	this.newEquip = this.equip( now.getFullYear(), ( this.roomSize < 16 ? 2.8 : 4 ) );
	this.apf = this.nowEquip.pf2 * 0.7;
	this.apfMax = this.newEquip.pf1 * 0.7;
	
	//test code for performance
	if ( D6.debugMode ) {	
		console.assert( this.equip( 2015, 2.8 ).pf1 == 6.5 ,"2015 2.8kW" );
		console.assert( this.equip( 2030, 4.5 ).pf1 == 7 ,"2030 4.5kW" );
		console.assert( this.equip( now.getFullYear(), 4.5 ).pr1 == 200000 ,"now 4.5kW price" );
		console.assert( this.equip( now.getFullYear(), 4.5 ).pf1 > 6 ,"now 4.5kW price" );
	}
};

D6.consAC.calc = function() {
};

//calcuration after all consumptions are calcrated
D6.consAC.calc2nd = function( ) {
	//heating plus cooling
	this.acHeat = D6.consListByName["consACheat"][this.subID];
	this.acCool = D6.consListByName["consACcool"][this.subID];
	this.copy( this.acHeat );
	this.add( this.acCool );
	
};

/*performance and price of equipment
 * 	parameter
 *		year : product year include future1
 *		level : 1:good, 2:ordinal
 *		size : kw less than or equal to
 *	return value
 *		ret.pr1 : price of good one
 *		ret.pr2 : price of ordinal one
 *		ret.pf1 : performance of good one
 *		ret.pf2 : performance of ordinal one
 */
D6.consAC.equip = function( year, size ) {
	var sizeThreshold = [ 2.8, 4.5, 100 ];	//last is maxsize

	//definition of equip [size][year][code]
	//	code: pf1,pf2 performance 1 is good one
	//				pr1,pr2 price 1 is good one
	var defEquip = {
		2.8 : {
			1900 : { "pf1" : 3, "pf2" : 2, "pr1" : 150000, "pr2" : 120000 } ,
			1995 : { "pf1" : 3, "pf2" : 2, "pr1" : 150000, "pr2" : 120000 } ,
			2005 : { "pf1" : 5, "pf2" : 3.5, "pr1" : 150000, "pr2" : 120000 } ,
			2015 : { "pf1" : 6.5, "pf2" : 5, "pr1" : 150000, "pr2" : 120000 } ,
			2030 : { "pf1" : 7, "pf2" : 6, "pr1" : 150000, "pr2" : 120000 } 
		},
		4.5 : {
			1900 : { "pf1" : 3, "pf2" : 2, "pr1" : 200000, "pr2" : 160000 } ,
			1995 : { "pf1" : 3, "pf2" : 2, "pr1" : 200000, "pr2" : 160000 } ,
			2005 : { "pf1" : 4, "pf2" : 2.5, "pr1" : 200000, "pr2" : 160000 } ,
			2015 : { "pf1" : 6, "pf2" : 4, "pr1" : 200000, "pr2" : 160000 } ,
			2030 : { "pf1" : 7, "pf2" : 6, "pr1" : 200000, "pr2" : 160000 } 
		},
		100 : {
			1900 : { "pf1" : 3, "pf2" : 2, "pr1" : 240000, "pr2" : 220000 } ,
			1995 : { "pf1" : 3, "pf2" : 2, "pr1" : 240000, "pr2" : 220000 } ,
			2005 : { "pf1" : 3.5, "pf2" : 2.5, "pr1" : 240000, "pr2" : 220000 } ,
			2015 : { "pf1" : 4.5, "pf2" : 3.5, "pr1" : 240000, "pr2" : 220000 } ,
			2030 : { "pf1" : 6, "pf2" : 5, "pr1" : 240000, "pr2" : 220000 } 
		}
	};

	return this.getEquipParameters( year, size, sizeThreshold, defEquip );
};


D6.consAC.calcMeasure = function() {
	var mes;	//temporary variable of measure instance
	
	//mACreplace
	mes = this.measures["mACreplace"];
	if ( !this.isSelected( "mACreplaceHeat" ) ){
		mes.copy( this );
		if ( this.acHeat.heatEquip == 1 ) {
			//in case of use air conditioner as heater
			mes.electricity = this.electricity * this.apf / this.apfMax;
			//calc part consumption room heating
			mes["consACheat"] = D6.object( D6.Energy );
			mes["consACheat"].copy( this.acHeat );
			mes["consACheat"].electricity = this.acHeat.electricity * this.apf / this.apfMax;
		} else {
			mes.electricity -= this.acCool.electricity * ( 1 - this.apf / this.apfMax );
		}
		//calculate part consumption room cooling
		mes["consACcool"] = D6.object( D6.Energy );
		mes["consACcool"].copy( this.acCool );
		mes["consACcool"].electricity = this.acCool.electricity * this.apf / this.apfMax;
		
		// in case of wide area heating
		if ( this.acHeat.heatArea > 0.3 
			&& this.acHeat.houseSize > 60 
		) {
			var num = Math.round( Math.max( this.acHeat.houseSize * this.acHeat.heatArea, 25 ) / 25 );
			mes.priceNew = num * mes.def["price"];
		}
	}

	//mACreplaceHeat
	mes = this.measures["mACreplaceHeat"];
	if ( !this.acHeat.heatEquip == 1 ) {
		mes.clear();
		mes["consACheat"] = D6.object( D6.Energy );
		mes["consACheat"].copy( this.acHeat );
		mes["consACheat"].electricity = this.acHeat.endEnergy / this.apfMax / D6.Unit.calorie.electricity;

		mes["consACcool"] = D6.object( D6.Energy );
		mes["consACcool"].copy( this.acCool );
		mes["consACcool"].electricity = this.acCool.electricity * this.acHeat.apf / this.apfMax;

		mes.electricity = mes["consACheat"].electricity + mes["consACcool"].electricity;
		if ( this.heatArea > 0.3 
			&& this.houseSize > 60 
		) {
			mes.priceNew = Math.round( Math.max( this.houseSize * this.heatArea , 25 ) / 25 ) * this.nowEquip.pr1;
		}
	}

};





/* 2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consRFsum.js 
 * 
 * calculate consumption and measures related to refrigerator in your hourse
 * total use
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 */

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consRFsum = D6.object( D6.ConsBase );

//initialize
D6.consRFsum.init = function() {
	//construction setting
	this.consName = "consRFsum";      	//code name of this consumption 
	this.consCode = "RF";              	//short code to access consumption, only set main consumption user for itemize
	this.title = "refrigerator";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this
	this.groupID = "3";					//number code in items
	this.color = "#a0ffa0";				//color definition in graph

	this.residueCalc = "no";			//evaluate residue as #0 or not	no/sumup/yes

	//guide message in input page
	this.inputGuide = "usage of refrigerator";
};
D6.consRFsum.init();


D6.consRFsum.calc = function( ) {
	this.clear();	
	this.count =this.input( "i701", 1 );		//number of refragerator
};


D6.consRFsum.calcMeasure = function( ) {
};

/*performance and price of equipment
 * 	parameter
 *		year : product year include future1
 *		level : 1:good, 2:ordinal
 *		size : L less than or equal to
 *	return value
 *		ret.pr1 : price of good one
 *		ret.pr2 : price of ordninal one
 *		ret.pf1 : performance of good one
 *		ret.pf2 : performance of ordninal one
 */
D6.consRFsum.equip = function( year, size ) {
	var sizeThreshold = [ 100, 200, 300, 400, 500, 1100 ];	//last is maxsize

	//definition of equip [size][year][code]
	//	code: pf1,pf2 performance 1 is good one
	//				pr1,pr2 price 1 is good one
	var defEquip = {
		100 : {
			1900 : { "pf1" : 300, "pf2" : 400, "pr1" : 50000, "pr2" : 40000 } ,
			2005 : { "pf1" : 300, "pf2" : 400, "pr1" : 50000, "pr2" : 40000 } ,
			2015 : { "pf1" : 250, "pf2" : 350, "pr1" : 50000, "pr2" : 40000 } ,
			2030 : { "pf1" : 250, "pf2" : 350, "pr1" : 50000, "pr2" : 40000 }
		},
		200 : {
			1900 : { "pf1" : 350, "pf2" : 450, "pr1" : 90000, "pr2" : 70000 } ,
			2005 : { "pf1" : 350, "pf2" : 450, "pr1" : 90000, "pr2" : 70000 } ,
			2015 : { "pf1" : 350, "pf2" : 450, "pr1" : 90000, "pr2" : 70000 } ,
			2030 : { "pf1" : 350, "pf2" : 450, "pr1" : 90000, "pr2" : 70000 }
		},
		300 : {
			1900 : { "pf1" : 500, "pf2" : 750, "pr1" : 120000, "pr2" : 100000 } ,
			2005 : { "pf1" : 450, "pf2" : 550, "pr1" : 120000, "pr2" : 100000 } ,
			2015 : { "pf1" : 350, "pf2" : 450, "pr1" : 90000, "pr2" : 70000 } ,
			2030 : { "pf1" : 350, "pf2" : 450, "pr1" : 90000, "pr2" : 70000 }
		},
		400 : {
			1900 : { "pf1" : 700, "pf2" : 950, "pr1" : 140000, "pr2" : 120000 } ,
			1995 : { "pf1" : 650, "pf2" : 900, "pr1" : 140000, "pr2" : 120000 } ,
			2015 : { "pf1" : 300, "pf2" : 550, "pr1" : 120000, "pr2" : 100000 } ,
			2030 : { "pf1" : 300, "pf2" : 400, "pr1" : 120000, "pr2" : 100000 }
		},
		500 : {
			1900 : { "pf1" : 900, "pf2" : 1300, "pr1" : 200000, "pr2" : 180000 } ,
			1995 : { "pf1" : 900, "pf2" : 1200, "pr1" : 200000, "pr2" : 180000 } ,
			2015 : { "pf1" : 300, "pf2" : 550, "pr1" : 160000, "pr2" : 140000 } ,
			2030 : { "pf1" : 300, "pf2" : 400, "pr1" : 160000, "pr2" : 140000 }
		},
		1100 : {
			1900 : { "pf1" : 1000, "pf2" : 1500, "pr1" : 220000, "pr2" : 200000 } ,
			1995 : { "pf1" : 900, "pf2" : 1400, "pr1" : 220000, "pr2" : 200000 } ,
			2015 : { "pf1" : 400, "pf2" : 750, "pr1" : 200000, "pr2" : 180000 } ,
			2030 : { "pf1" : 400, "pf2" : 500, "pr1" : 200000, "pr2" : 180000 }
		}
	};

	return this.getEquipParameters( year, size, sizeThreshold, defEquip );
};




/* 2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consRF.js 
 * 
 * calculate consumption and measures related to refrigerator
 * one unit of refrigarator
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.consRFsum
D6.consRF = D6.object(D6.consRFsum);

//initialize
D6.consRF.init = function() {
	this.consYear = 650; //ordinal electricity consumption per year(kWh/year)
	this.consYearAdvanced = 300; //energy saving type (kWh/year)
	this.reduceRateWall = 0.1; //reduction rate through make space between wall and refrigerator
	this.reduceRateTemplature = 0.12; //reduction rate through set saving temperature

	//construction setting
	this.consName = "consRF"; //code name of this consumption
	this.consCode = ""; //short code to access consumption, only set main consumption user for itemize
	this.title = "refrigerator"; //consumption title name
	this.orgCopyNum = 1; //original copy number in case of countable consumption, other case set 0
	this.addable = "refrigerator"; //the name of object shown as add target
	this.groupID = "3"; //number code in items
	this.color = "#a0ffa0"; //color definition in graph
	this.countCall = "th"; //how to point n-th equipment

	this.sumConsName = "consRFsum"; //code name of consumption sum up include this
	this.sumCons2Name = ""; //code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use each refrigerator";
};
D6.consRF.init();

D6.consRF.precalc = function() {
	this.clear();

	//prepare input value
	this.year = this.input("i711" + this.subID, 8); //equipment year
	this.type = this.input("i712" + this.subID, 1); //type
	this.size = this.input("i713" + this.subID, 350); //size (L)
	this.templature = this.input("i714" + this.subID, 4); //setting of temprature
	this.full = this.input("i715" + this.subID, 4); //stuffing too much
	this.space = this.input("i716" + this.subID, 3); //space beteween wall and refragerator
	this.performance = this.input("i721", 2); //performance

	var d = new Date();
	this.nowEquip = this.equip(d.getFullYear() - this.year, this.size);
	this.newEquip = this.equip(d.getFullYear(), this.size);
};

D6.consRF.calc = function() {
	// now consumption (kWh/year)
	this.consYear = this.nowEquip.pf2 * (this.type == 2 ? 2 : 1);

	//new type of refregerator(kWh/year)
	this.consYearAdvanced = this.newEquip.pf1 * (this.type == 2 ? 2 : 1);

	//reduction rate to replace new one
	this.reduceRateChange = this.consYearAdvanced / this.consYear;

	// set 0-th equipment charactrictic to refregerator
	if (this.subID == 0) {
		if (this.input("i7111", -1) < 0 && this.input("i7131", -1) < 0) {
			//in case of no input set 0-th data as sumup by count
			this.electricity = this.consYear * this.count / 12;
		} else {
			this.electricity = 0;
		}
		return;
	}

	if (
		this.subID > 0 &&
		this.input("i711" + this.subID, -1) < 0 &&
		this.input("i713" + this.subID, -1) < 0
	) {
		//not calculate of no input
		return;
	}

	//monthly electricity consumption (kWh/month)
	this.electricity = this.consYear / 12;

	//fix in case of stuffing too much
	this.electricity =
		this.electricity * (this.full == 3 ? 1.1 : this.full == 1 ? 0.9 : 1);

	//fix in case of no space
	this.electricity =
		this.electricity * (this.space == 1 ? 0.95 : this.space == 2 ? 1.05 : 1);

	//fix by temperature
	this.electricity =
		this.electricity *
		(this.templature == 1 ? 1.1 : this.templature == 3 ? 0.95 : 1);

	//fix by performance
	this.electricity =
		this.electricity *
		(this.performance == 1 ? 0.8 : this.performance == 3 ? 1.2 : 1);

	if (this.year == 0) this.electricity = 0;
};

D6.consRF.calcMeasure = function() {
	//mRFreplace
	this.measures["mRFreplace"].calcReduceRate(this.reduceRateChange);

	//mRFtemplature
	if (this.templature != 3) {
		this.measures["mRFtemplature"].calcReduceRate(this.reduceRateTemplature);
	}

	//mRFwall
	if (this.space != 1) {
		this.measures["mRFwall"].calcReduceRate(this.reduceRateWall);
	}

	//mRFstop
	if (this.count > 1) {
		if (this.subID == 0) {
			//in case of rough estimation
			this.measures["mRFstop"].calcReduceRate(1 / this.count);
		} else {
			this.measures["mRFstop"].electricity = 0;
		}
	}
};

/* 2017/12/15  version 1.0
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
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
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

//resolve D6
var D6 = D6||{};
 
//Inherited class of D6.ConsBase
D6.consLIsum = D6.object( D6.ConsBase );

D6.consLIsum.init =function() {
	//construction setting
	this.consName = "consLIsum";   		//code name of this consumption 
	this.consCode = "LI";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "light";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "6";					//number code in items
	this.color = "#ffff00";				//color definition in graph
	this.residueCalc = "sumup";			//calculate method	no/sumup/yes

	this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use the whole house lighting";


	this.lightTime = 6;					//standard light time hour/day

	this.performanceLED = 140;			//LED  lm/W
	this.performanceHF = 100;			//HF  lm/W
	this.performanceFlueciend = 70;		//fluorescent light  lm/W
	this.preformanceBulb = 15;			//bulb lm/W

	this.wattLivingBulb = 300;			//watt to use bulb in living
	this.wattLivingFlue = 70;			//watt to use fluorescent light in living
	this.wattLivingLED = 40;			//watt to use LED in living
	
	this.outdoorWatt = 150;				//sensor light (W)
	this.outdoorTime = 0.5;				//sensor light time hour
	this.sensorWatt = 2;				//sensor standby（W)
	
	//reduce rate to change bulb to fluorescent light
	this.reduceRateBulb = 1 - this.preformanceBulb/this.performanceFlueciend;

	//reduce rate to change fluorescent light to LED
	this.reduceRateCeiling = 1 - this.performanceFlueciend/this.performanceLED;	

	//reduce rate to change bulb to LED
	this.reduceRateLED = 1 - this.preformanceBulb/this.performanceLED;

};
D6.consLIsum.init();


D6.consLIsum.precalc = function(){
	this.clear();

	this.person =this.input( "i001", 3 );			//person
	this.lightType =this.input( "i501", 2 );		//living light 1bulb 2fluorescent 3LED
	this.otherRate =this.input( "i502", 3 );		//other room light use
	this.houseSize =D6.consShow["TO"].houseSize;	//floor size
};

D6.consLIsum.calc = function( ) {
	//living consumption kWh/month
	if( this.lightType == 1 ) {
		this.sumWatt = this.wattLivingBulb;
	} else if ( this.lightType == 3 ) {
		this.sumWatt = this.wattLivingLED;
	} else {
		this.sumWatt = this.wattLivingFlue;
	}
	this.electricity =  this.sumWatt * this.lightTime / 1000 * 30;

	//other than living room, 0.2 times of living
	this.electricity *= ( Math.max( this.houseSize - 20, 0 ) / 20 * 0.2  + 1 );
	
	//consumption used in no person room, assume half time to living
	this.electricity *= ( Math.max( this.houseSize - 20, 0 ) / 20 * 0.5 * (this.otherRate / 10)  + 1 );

};


D6.consLIsum.calc2nd = function() {
	var electricity = this.electricity;	 //backup
	this.clear();

	//sum up all room
	for( var id in this.partCons ) {
		this.add( this.partCons[id] );
	}
	//maximum of total consumption and sum of rooms
	if ( electricity > this.electricity ){
		this.electricity = electricity;
	}
};

D6.consLIsum.calcMeasure = function() {
};



/* 2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consLI.js 
 * 
 * calculate consumption and measures related to light
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
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

//resolve D6
var D6 = D6||{};
 
//Inherited class of D6.consLIsum
D6.consLI = D6.object( D6.consLIsum );

D6.consLI.init = function() {
	//construction setting
	this.consName = "consLI";   		//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
	this.title = "light";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "room for lighting";		//add message
	this.groupID = "6";					//number code in items
	this.color = "#ffff00";				//color definition in graph
	this.countCall = "th room";			//how to point n-th equipment

	this.sumConsName = "consLIsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use each room lighting";
};
D6.consLI.init();


D6.consLI.precalc = function( ) {
	this.clear();

	// room name
	var roomNames = [ "", "玄関", "門灯", "廊下", "トイレ", "脱衣所", "風呂", "居室" ];
	this.rid = this.input("i511" + this.subID, 0);					//room ID
	this.mesTitlePrefix = this.rid ? roomNames[this.rid] 
		: this.mesTitlePrefix;										//set room name

	this.type =this.input( "i512" + this.subID, 2 );				//type of light
	this.watt =this.input( "i513" + this.subID, -1 );				//electricity W/tube
	this.num =this.input( "i514" + this.subID, 0 );					//tube number
	this.time =this.input( "i515" + this.subID, this.lightTime );	//time to use hour/day

};

D6.consLI.calc = function( ) {
	//in case of no electricity input
	if ( !(this.watt > 0) ) {
		if ( this.type <= 2 ) {
			//fluorescent lump 
			this.watt = 60;
		} else {
			//bulb
			this.watt = 100;
		}
	}
	this.electricity = this.watt * this.time * this.num / 1000 * 365 / 12;	

};

D6.consLI.calc2nd = function( ) {
	//in case of residue
	if ( this.subID == 0 ){
		this.electricity = this.sumCons.electricity;
		var cons = D6.consListByName[this.consName];
		for( var i=1 ; i< cons.length ; i++ ){
			this.electricity -= cons[i].electricity;
		}
		if ( this.lightType == 1 ) {
			this.type = 1;
		} else if (this.lightType == 3 ) {
			this.type = 5;
		} else {
			this.type = 2;			
		}
		this.watt = this.sumWatt;
		this.num = 1;
	}
};

D6.consLI.calcMeasure = function() {
	var rejectSelect = false;
	//var mes;
	
	//can or not install good light
	if (
		this.isSelected( "mLILED" )
		|| this.isSelected( "mLIceilingLED" )
		|| this.isSelected( "mLIsensor" )
	) {
		rejectSelect = true;
	}

	//mLILED
	if ( ( this.type == 5 || this.type == 6 ) 
		|| this.watt < 20 
		|| rejectSelect
	) {
	} else {
		if ( this.type == 1 ) {
			this.measures["mLILED"].calcReduceRate( this.reduceRateLED );
		} else if ( this.type == 2 || this.type == 3  ) {
			this.measures["mLILED"].calcReduceRate( 
				( this.reduceRateLED - this.reduceRateBulb ) / this.reduceRateLED );
		}
	}

	//mLIceilingLED
	if ( this.type == 3 
		&& this.watt * this.num > 50 
		&& !rejectSelect
	) {
		this.measures["mLIceilingLED"].calcReduceRate( this.reduceRateCeiling );
	}

	//mLIsensor
	if ( this.rid >= 1 && this.rid <= 3 ) {
		this.measures["mLIsensor"].electricity = ( this.outdoorWatt * this.outdoorTime + this.sensorWatt * 24 ) 
											* 365 / 1000 / 12;
	}

	//mLItime
	if ( this.time >= 2 ) {
		this.measures["mLItime"].calcReduceRate( 1 / ( this.time - 1 ) );
	}
};


/* 2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consTV.js 
 * 
 * calculate consumption and measures related to television
 * total television
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/16 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.consTVsum
D6.consTVsum = D6.object(D6.ConsBase);

//初期設定値
D6.consTVsum.init = function() {
	this.watt = 100; //electricity consumption default W

	this.reduceRateRadio = 0.5; //reduce rate by change to radio
	this.reduceRateBright = 0.2; //reduce rate by change brightness

	//construction setting
	this.consName = "consTVsum"; //code name of this consumption
	this.consCode = "TV"; //short code to access consumption, only set main consumption user for itemize
	this.title = "TV"; //consumption title name
	this.orgCopyNum = 0; //original copy number in case of countable consumption, other case set 0
	this.groupID = "7"; //number code in items
	this.color = "#00ff00"; //color definition in graph

	this.sumConsName = "consTotal"; //code name of consumption sum up include this
	this.sumCons2Name = ""; //code name of consumption related to this
	this.residueCalc = "sumup"; //calculate type of residue	no/sumup/yes

	//guide message in input page
	this.inputGuide = "how to use TV totally";
};
D6.consTVsum.init();

D6.consTVsum.calc = function() {
	this.useTime = this.input("i601", 8.5); //time to use hour

	//electiricy kWh/month
	this.electricity = this.watt / 1000 * this.useTime * 30;
};

D6.consTVsum.calc2nd = function() {
	var electricity = this.electricity; //backup
	this.clear();

	//add each terevition
	for (var id in this.partCons) {
		this.add(this.partCons[id]);
	}

	//use total electricity if sum of TV is smaller
	if (electricity > this.electricity) {
		this.electricity = electricity;
	}
};

/*performance and price of equipment
 * 	parameter
 *		year : product year include future1
 *		level : 1:good, 2:ordinal
 *		size : inch less than or equal to
 *	return value
 *		ret.pr1 : price of good one
 *		ret.pr2 : price of ordninal one
 *		ret.pf1 : performance of good one
 *		ret.pf2 : performance of ordninal one
 */
D6.consTVsum.equip = function(year, size) {
	var sizeThreshold = [20, 30, 40, 50, 60, 120]; //last is maxsize

	//definition of equip [size][year][code]
	//	code: pf1,pf2 performance 1 is good one
	//				pr1,pr2 price 1 is good one
	var defEquip = {
		20: {
			1900: { pf1: 100, pf2: 150, pr1: 500000, pr2: 400000 },
			1995: { pf1: 50, pf2: 100, pr1: 50000, pr2: 40000 },
			2005: { pf1: 40, pf2: 80, pr1: 40000, pr2: 30000 },
			2015: { pf1: 30, pf2: 50, pr1: 30000, pr2: 25000 },
			2030: { pf1: 20, pf2: 30, pr1: 30000, pr2: 25000 }
		},
		30: {
			1900: { pf1: 150, pf2: 300, pr1: 500000, pr2: 400000 },
			1995: { pf1: 80, pf2: 150, pr1: 80000, pr2: 60000 },
			2005: { pf1: 50, pf2: 100, pr1: 50000, pr2: 40000 },
			2015: { pf1: 40, pf2: 60, pr1: 40000, pr2: 35000 },
			2030: { pf1: 30, pf2: 40, pr1: 40000, pr2: 35000 }
		},
		40: {
			1900: { pf1: 400, pf2: 500, pr1: 500000, pr2: 400000 },
			1995: { pf1: 300, pf2: 500, pr1: 200000, pr2: 150000 },
			2005: { pf1: 100, pf2: 200, pr1: 120000, pr2: 100000 },
			2015: { pf1: 60, pf2: 120, pr1: 100000, pr2: 80000 },
			2030: { pf1: 40, pf2: 80, pr1: 80000, pr2: 70000 }
		},
		50: {
			1900: { pf1: 500, pf2: 700, pr1: 500000, pr2: 400000 },
			1995: { pf1: 500, pf2: 700, pr1: 400000, pr2: 300000 },
			2005: { pf1: 200, pf2: 400, pr1: 200000, pr2: 180000 },
			2015: { pf1: 100, pf2: 200, pr1: 140000, pr2: 120000 },
			2030: { pf1: 80, pf2: 160, pr1: 100000, pr2: 90000 }
		},
		60: {
			1900: { pf1: 500, pf2: 700, pr1: 500000, pr2: 400000 },
			1995: { pf1: 500, pf2: 700, pr1: 500000, pr2: 400000 },
			2005: { pf1: 250, pf2: 500, pr1: 400000, pr2: 300000 },
			2015: { pf1: 120, pf2: 200, pr1: 180000, pr2: 160000 },
			2030: { pf1: 100, pf2: 180, pr1: 160000, pr2: 150000 }
		},
		120: {
			1900: { pf1: 500, pf2: 700, pr1: 500000, pr2: 400000 },
			1995: { pf1: 500, pf2: 700, pr1: 500000, pr2: 400000 },
			2005: { pf1: 350, pf2: 500, pr1: 400000, pr2: 300000 },
			2015: { pf1: 200, pf2: 400, pr1: 180000, pr2: 160000 },
			2030: { pf1: 180, pf2: 250, pr1: 160000, pr2: 150000 }
		}
	};

	return this.getEquipParameters(year, size, sizeThreshold, defEquip);
};

D6.consTVsum.calcMeasure = function() {
	//mTVradio
	this.measures["mTVradio"].calcReduceRate(this.reduceRateRadio);
};

/* 2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consTV.js 
 * 
 * calculate consumption and measures related to television
 * one unit of television
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/16 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//resolve D6
var D6 = D6||{};

//Inherited class of D6.consTVsum
D6.consTV = D6.object( D6.consTVsum );

D6.consTV.init = function() {
	//construction setting
	this.consName = "consTV";           //code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
	this.title = "TV";					//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "TV";				//the name of object shown as add target
	this.groupID = "7";					//number code in items
	this.color = "#00ff00";				//color definition in graph
	this.countCall = "th";				//how to point n-th equipment

	this.sumConsName = "consTVsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use each TV";
};
D6.consTV.init();


D6.consTV.precalc = function( ) {
	this.clear();

	this.size = this.input( "i631"+this.subID, 32 );	//size inch
	this.year = this.input( "i632"+this.subID, 6 );		//year to use

	//time to use hour/day
	if ( this.subID == 1 ) {
		this.useTime =this.input( "i633"+this.subID, 8.5 );
	} else {
		//set 0 if not first one and not fill input
		this.useTime =this.input( "i633"+this.subID, 0 );
	}
	
	//equipment data set
	var d = new Date();
	this.nowEquip = this.equip( d.getFullYear() - this.year, this.size );
	this.newEquip = this.equip( d.getFullYear(), this.size );
	this.nowWatt = this.nowEquip.pf2;
	this.newWatt = this.newEquip.pf1;
};

D6.consTV.calc = function( ) {
	//reduce rate by replace
	this.reduceRateReplace = ( 1 - this.newWatt / this.nowWatt);

	//electricity kWh/month
	this.electricity =  this.useTime * this.nowWatt / 1000 * 30;
};

D6.consTV.calc2nd = function( ) {
	//in case of residue #0
	if ( this.subID == 0 ){
		this.electricity = this.sumCons.electricity;
		var cons = D6.consListByName[this.consName];
		for( var i=1 ; i< cons.length ; i++ ){
			this.electricity -= cons[i].electricity;
		}
	}
};

D6.consTV.calcMeasure = function( ) {
	if ( this.subID == 0 && D6.consListByName[this.consName][1].electricity > 0 ) return;

	//mTVtime
	if ( this.useTime > 2 ) {
		this.measures["mTVtime"].calcReduceRate( 1 / ( this.useTime - 1 ) );
	}

	//mTVbright
	this.measures["mTVbright"].calcReduceRate( this.reduceRateBright );

	//mTVreplace
	this.measures["mTVreplace"].calcReduceRate( this.reduceRateReplace );

};



/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consDRsum.js 
 * 
 * calculate consumption and measures related to washer drier of cloth
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.ConsBase
D6.consDRsum = D6.object(D6.ConsBase);

D6.consDRsum.init = function() {
	this.whWash = 100; // only wash wh/day in case of 3 persons
	this.whDry = 1000; // use dry wh/day in case of 3 persons

	this.reduceRateHeatPump = 0.65; //reduce rate by heatpump type
	this.res2Freq = [0, 1, 0.5, 0.2, 0.07, 0];

	//construction setting
	this.consName = "consDRsum"; //code name of this consumption
	this.consCode = "DR"; //short code to access consumption, only set main consumption user for itemize
	this.title = "laundry washing"; //consumption title name
	this.orgCopyNum = 0; //original copy number in case of countable consumption, other case set 0
	this.groupID = "5"; //number code in items
	this.color = "#00ffff"; //color definition in graph

	this.sumConsName = "consTotal"; //code name of consumption sum up include this
	this.sumCons2Name = ""; //code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use the cleaner, washing machine and clothes dryer";
};
D6.consDRsum.init();

D6.consDRsum.precalc = function() {
	this.clear();

	this.dryUse = this.input("i401", 0); //use dryer or not
	this.washFreq = this.input("i403", 1); //use dryer or not
	this.person = D6.consShow["TO"].person; //person number
};

D6.consDRsum.calc = function() {
	//rate of dry
	this.rateDry =
		this.whDry *
		this.res2Freq[this.dryUse] /
		(this.whWash + this.whDry * this.res2Freq[this.dryUse]);

	//electricity kWh/month
	this.electricity =
		(this.whWash * this.washFreq + this.whDry * this.res2Freq[this.dryUse]) /
		1000 *
		this.person /
		3 *
		30;
};

D6.consDRsum.calcMeasure = function() {
	//mDRheatPump
	this.measures["mDRheatPump"].calcReduceRate(
		this.rateDry * this.reduceRateHeatPump
	);

	//mDRsolar
	this.measures["mDRsolar"].calcReduceRate(this.rateDry);
};

/* 2017/12/14  version 1.0
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

//resolve D6
var D6 = D6||{};

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
	if ( this.carNum == 0 && D6.consShow["TO"].noPriceData.car ) {
		this.car = 0;
		D6.consShow["TO"].priceCar = 0;
	} else {
		this.car =  this.priceCar /D6.Unit.price.car;	//monthly gasoline L/month
	}
};


D6.consCRsum.calc = function() {
};


D6.consCRsum.calcMeasure = function( ){
	//mCRecoDrive
	this.measures["mCRecoDrive"].calcReduceRate( this.reduceRateEcoDrive );

};


/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCR.js 
 * 
 * calculate consumption and measures related to each car
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.consCRsum
D6.consCR = D6.object(D6.consCRsum);

D6.consCR.init = function() {
	//construction setting
	this.consName = "consCR"; //code name of this consumption
	this.consCode = ""; //short code to access consumption, only set main consumption user for itemize
	this.title = "vehicle"; //consumption title name
	this.orgCopyNum = 1; //original copy number in case of countable consumption, other case set 0
	this.groupID = "8"; //number code in items
	this.color = "#ee82ee"; //color definition in graph
	this.countCall = "th car"; //how to point n-th equipment
	this.addable = "vehicle";

	//consCR is sub aggrigation, consCRtrip is connected to  consCRsum
	this.sumConsName = ""; //code name of consumption sum up include this
	this.sumCons2Name = "consCRsum"; //code name of consumption related to this

	//guide message in input page
	this.inputGuide = "the performance and use of each car";
};
D6.consCR.init();

D6.consCR.precalc = function() {
	this.clear();

	this.carType = this.input("i911" + this.subID, 1); //type of car
	this.performance = this.input("i912" + this.subID, 12); //performance km/L

	// car user
	this.user = this.input("i913" + this.subID, this.subID + this.countCall);
	this.ecoTier = this.input("i914" + this.subID, 3); //eco tier
};

D6.consCR.calc = function() {
	//calculated in consCRtrip
};

D6.consCR.calc2nd = function() {
	//calc by trip
	var trsum = 0;
	var carnum = D6.consListByName["consCR"].length;
	var tripnum = D6.consListByName["consCRtrip"].length;
	for (var i = 1; i < tripnum; i++) {
		trsum += D6.consListByName["consCRtrip"][i].car;
	}
	if (!D6.fg_calccons_not_calcConsAdjust) {
		if (trsum == 0) {
			if (this.subID == 0) {
				//residure
				this.car = this.sumCons2.car;
			} else {
				//in case of no residue
				this.car *= Math.pow(0.5, this.subID);
				if (this.subID == carnum - 1) {
					this.car *= 2;
				}
			}
		} else {
			//recalculate by rate of destination consumption, and calculated by gasoline
			this.car *= this.sumCons2.car / trsum;
		}
	}
};

D6.consCR.calcMeasure = function() {
	//mCRreplace
	if (!this.isSelected("mCRreplaceElec")) {
		this.measures["mCRreplace"].calcReduceRate(
			(this.performanceNew - this.performanceNow) / this.performanceNew
		);
	}

	//mCRreplaceElec
	if (!this.isSelected("mCRreplace")) {
		this.measures["mCRreplaceElec"].clear();
		this.measures["mCRreplaceElec"].electricity =
			this.performanceNow * this.car / this.performanceElec;
	}
};

/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCRtrip.js 
 * 
 * calculate consumption and measures related to movement with cars
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.consCRsum
D6.consCRtrip = D6.object( D6.consCRsum );

//initialize
D6.consCRtrip.init = function() {
	//construction setting
	this.consName = "consCRtrip";    		//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
	this.title = "movement";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "8";					//number code in items
	this.color = "#ee82ee";				//color definition in graph
	this.countCall = "th places";			//how to point n-th equipment
	this.addable = "destination";

	this.sumConsName = "consCRsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use cars by destinations";
};
D6.consCRtrip.init();


D6.consCRtrip.precalc = function() {
	this.clear();

	this.mesTitlePrefix = this.input( "i921" + this.subID, this.mesTitlePrefix );	//destination
	this.frequency =this.input( "i922" + this.subID, 250 );		//frequency to visit
	this.km =		this.input( "i923" + this.subID, 0 );		//distance
	this.carID =	this.input( "i924" + this.subID, 1 );		//car to mainly use
	
	//instance of car
	this.consCar = D6.consListByName["consCR"][this.carID];
};

D6.consCRtrip.calc = function() {
	//performance
	this.performance =this.consCar.performance;
	
	//consumption of gasoline L/month
	this.car = this.km * 2 * this.frequency / 12 / this.performance;

	//add related car
	this.consCar.car += this.car;
};

D6.consCRtrip.calc2nd = function( ) {
	//calc residue
	if ( this.subID == 0 ){
		this.car = this.sumCons.car;
		var cons = D6.consListByName[this.consName];
		for( var i=1 ; i< cons.length ; i++ ){
			this.car -= cons[i].car;
		}
	}
};

D6.consCRtrip.calcMeasure = function( ){
	//mCRwalk
	if ( this.km < 3 ){
		this.measures["mCRwalk"].calcReduceRate( this.walkRate );
	}
	
	//mCR20percent
	this.measures["mCR20percent"].calcReduceRate( 0.2 );
	
	//mCRtrain
	this.measures["mCRtrain"].calcReduceRate( this.reduceRatePublic * this.publicRate );

};


/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCKpot.js 
 * 
 * calculate consumption and measures related to pot
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consCKsum = D6.object( D6.ConsBase );

D6.consCKsum.init = function() {
	//construction setting
	this.consName = "consCKsum";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "Cooking";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this
	this.residueCalc = "no";			//calculate residue

	//guide message in input page
	this.inputGuide = "How to use cooking equipments";
};
D6.consCKsum.init();


D6.consCKsum.calc = function() {
	this.clear();
};

D6.consCKsum.calcMeasure = function() {
};



/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCKpot.js 
 * 
 * calculate consumption and measures related to pot
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consCKpot = D6.object( D6.ConsBase );

//initialize
D6.consCKpot.init = function() {
	this.wattOrdinal = 30;				//electricity for keep hot（W)

	//construction setting
	this.consName = "consCKpot";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "heat holding pot";	//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consCKsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use heat holding pot";
};
D6.consCKpot.init();


D6.consCKpot.precalc = function() {
	this.clear();

	//prepare input value
	this.time = this.input( "i821", 6 );		//keep hot time
	this.ecoType = this.input( "i822", 3 );		//energy level
};

D6.consCKpot.calc = function() {
	//monthly electricity consumption kWh/month
	this.electricity = this.wattOrdinal * this.time * 30 / 1000
						* (this.ecoType == 1 ? 0.5 : 1 );
};

D6.consCKpot.calcMeasure = function() {
};



/* 2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCKrice.js 
 * 
 * calculate consumption and measures related to rice cooker
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
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

//resolve D6
var D6 = D6||{};

//Inherited class of D6.ConsBase
D6.consCKrice = D6.object( D6.ConsBase );

//initialize
D6.consCKrice.init = function() {
	this.wattOrdinal = 30;				//electricity for keep hot（W)
	
	//construction setting
	this.consName = "consCKrice";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
	this.title = "rice cooker";			//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

	this.sumConsName = "consCKsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "how to use rice cooker";
};
D6.consCKrice.init();


D6.consCKrice.precalc = function() {
	this.clear();

	//prepare input value
	this.person = this.input( "i001", 3 );			//person number
	this.frequency = this.input( "i802", 5 );		//frequency of cooking
	this.time = this.input( "i820", 6 );			//keep hot time
};

D6.consCKrice.calc = function() {
	//monthly electricity consumption kWh/month
	this.electricity = this.wattOrdinal * this.time * 30 / 1000;
};

D6.consCKrice.calcMeasure = function() {
};



/* 2017/12/10  version 1.0
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
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.ConsBase
D6.consCKcook = D6.object(D6.ConsBase);

//initialize
D6.consCKcook.init = function() {
	this.consEnergyStat = 840000; //statistical cooking energy (kcal/year) EDMC Japan
	this.efficentEL = 2; //coefficient of IH compare to heat type

	//construction setting
	this.consName = "consCKcook"; //code name of this consumption
	this.consCode = "CK"; //short code to access consumption, only set main consumption user for itemize
	this.title = "Cooking"; //consumption title name
	this.orgCopyNum = 0; //original copy number in case of countable consumption, other case set 0
	this.groupID = "4"; //number code in items
	this.color = "#ffe4b5"; //color definition in graph

	this.sumConsName = "consCKsum"; //code name of consumption sum up include this
	this.sumCons2Name = ""; //code name of consumption related to this

	//guide message in input page
	this.inputGuide = "How to use cooking to focus on the stove";
};
D6.consCKcook.init();

D6.consCKcook.precalc = function() {
	this.clear();

	//prepare input value
	this.equipHW = this.input("i101", 2); //energy source of bath
	this.equipCK = this.input("i801", -1); //energy source of cooking
	this.freq10 = this.input("i802", 7); //frequency
	this.person = this.input("i001", 3); //member of family
};

D6.consCKcook.calc = function() {
	this.priceGas = D6.consShow["TO"].priceGas; //gas fee

	//calc cooking energy by number of person
	this.consEnergy = this.consEnergyStat * this.person / 3 * this.freq10 / 10;

	if (this.equipCK == -1) {
		//cocking energy source estimate by hotwater source
		if (this.equipHW == 5 || this.equipHW == 6 || this.priceGas == 0) {
			//2:electricity
			this.equipCK = 2;
		} else {
			//1:gas
			this.equipCK = 1;
		}
	}
	if (this.equipCK == 2) {
		//use electricity for cooking (kWh/month)
		this.electricity =
			this.consEnergy / 12 / this.efficentEL / D6.Unit.calorie.electricity;
	} else {
		//use gas for cooking (m3/month)
		this.gas = this.consEnergy / 12 / D6.Unit.calorie.gas;
	}
};

D6.consCKcook.calcMeasure = function() {};

/* 2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 *
 * Home Energy Diagnosis System Ver.6
 * consOTother.js
 *
 * calculate consumption and measures other electronics in your hourse
 * total use
 *
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 *
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2019/04/28 			original
 */

//resolve D6
var D6 = D6 || {};

//Inherited class of D6.ConsBase
D6.consOTother = D6.object(D6.ConsBase);

//initialize
D6.consOTother.init = function() {
	//construction setting
	this.consName = "consOTother"; //code name of this consumption
	this.consCode = "OT"; //short code to access consumption, only set main consumption user for itemize
	this.title = "others"; //consumption title name
	this.orgCopyNum = 1; //original copy number in case of countable consumption, other case set 0
	this.sumConsName = ""; //code name of consumption sum up include this
	this.sumCons2Name = "consTotal"; //code name of consumption related to this
	this.groupID = "9"; //number code in items
	this.color = "#a9a9a9"; //color definition in graph
	this.residueCalc = "no"; //evaluate residue as #0 or not	no/sumup/yes

	//guide message in input page
	this.inputGuide = "usage of other electronics";

	//機器の情報
	//0:名前 1:ワット数　2:使用時間（時間/日）　3:使用日(日/年）→初期値　4:コメント
	this.eq_list = [
		[
			"ノートパソコン",
			20,
			2,
			365,
			"使用時の消費電力は、ラベル表示より小さくなります。"
		],
		[
			"デスクトップパソコン",
			200,
			2,
			365,
			"ノートパソコンのほうが消費電力が少なくなります。"
		],
		[
			"インターネットモデム",
			10,
			24,
			365,
			"モデム、ルータなど複数の機器がある場合があります。"
		],
		["電話・FAX", 5, 24, 365, "消費電力はもっと少ないタイプもあります。"],
		["携帯電話充電", 5, 1, 365, "充電器の待機電力はほとんどありません。"],
		[
			"据置ゲーム機",
			100,
			4,
			365,
			"これ以外にテレビの電気がかかります。携帯型のほうが消費電力が少なくなります。"
		],
		[
			"携帯ゲーム機",
			5,
			4,
			365,
			"ゲームを使用する時間で換算しています。電池駆動のため省エネの工夫がされています。"
		],
		[
			"録画機器",
			30,
			4,
			365,
			"通常は待機電力は小さいですが、「瞬間起動」を設定していると稼働中と同じくらい消費します。"
		],
		[
			"炊飯器",
			500,
			0.5,
			365,
			"2合を2回炊く設定です。まる1日保温を続けると同じ程度の電気を消費してしまいます。"
		],
		[
			"電子レンジ",
			1000,
			0.17,
			365,
			"消費電力は大きいですが、使用時間が短く、活用することで省エネにすることもできます。"
		],
		[
			"トースター",
			1000,
			0.17,
			365,
			"消費電力は大きいですが、使用時間が短くなっています。"
		],
		[
			"掃除機",
			500,
			0.17,
			365,
			"強弱の設定により消費電力が大きく変わる機種もあります。"
		],
		["除湿機", 500, 6, 104, "エアコンの除湿より効率は悪くなっています。"],
		[
			"加湿機",
			100,
			6,
			182,
			"断熱が弱い家では、使い過ぎると窓や壁で結露を起こす危険があります。"
		],
		[
			"空気清浄機",
			20,
			24,
			365,
			"長時間使用することで、多くの電気を消費する傾向があります。"
		],
		[
			"ヘアドライヤー",
			1000,
			0.17,
			365,
			"消費電力が大きい機器です。タオルでよく拭いてから使うと少なくなります。"
		],
		[
			"換気扇",
			30,
			8,
			365,
			"長時間使用することで、多くの電気を消費する傾向があります。"
		],
		[
			"換気システム",
			50,
			24,
			365,
			"長時間使用することで、多くの電気を消費する傾向があります。"
		],
		[
			"浄化槽ポンプ",
			50,
			24,
			365,
			"長時間使用することで、多くの電気を消費する傾向があります。"
		],
		[
			"熱帯魚水槽",
			50,
			24,
			365,
			"長時間使用することで、多くの電気を消費する傾向があります。"
		],
		[
			"パイプ凍結防止",
			100,
			12,
			104,
			"水道管の破裂を防ぐためですが、断熱材を十分に使うなどで消費電力を減らすこともできます。"
		],
		["そのほか", 5, 0.03, 1, "考えられるものを試してみてください。"]
	];
	this.subName = " ";
};
D6.consOTother.init();

D6.consOTother.precalc = function() {
	this.clear();
	this.name = this.input("i653" + this.subID, ""); //name
	this.watt = this.input("i654" + this.subID, 0); //watt
	this.hour = this.input("i655" + this.subID, 0); //use hour / day
	this.day = this.input("i656" + this.subID, 0); //use day
	this.reduceRate = this.input("i657" + this.subID, 0) / 10; //reduce rate
};

D6.consOTother.calc = function() {
	this.electricity = this.watt * this.hour * this.day / 12 / 1000; //kWh/month
};

D6.consOTother.calcMeasure = function() {
	//mOTother
	/*
	this.measures["mOTother"].calcReduceRate(this.reduceRate);
	if (this.reduceRate == 1) {
		this.measures["mOTother"].title = this.name + "を使用しない";
	} else {
		this.measures["mOTother"].title =
			this.name + "の使用を" + this.reduceRate * 10 + "割減らす";
	}
	*/
};
