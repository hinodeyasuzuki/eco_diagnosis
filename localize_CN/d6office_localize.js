// シナリオによってarea内の修正をする場合
//
//
//
D6.scenario.areafix = function() {

	//calcConsの標準値設定に関わる標準呼び出し
	D6.area.setCalcBaseParams = function(){
		//地域の設定
		D6.area.setArea( D6.doc.data.i021 );
	};

	//季節パラメータの標準呼び出し
	D6.area.getSeasonParamCommon = function(){
		//地域の設定
		return D6.area.getSeasonParam(  D6.consShow["TO"].business  );
	};


	//事業所別標準値
	// i001(業種)に対応
	//'事務所', 'スーパー', 'コンビニエンスストア', 'ほか小売・卸業', '飲食店', '旅館・ホテル', '学校', '病院', '工場', 'その他'
	// MJ/m2・年, 季節排出比,　営業時間外消費比率
	//　DECC　　非住宅建築物の環境関連データベース（H22年3月）　より作成
	// floor 		業種平均床面積
	// workTime		業種平均営業時間
	D6.area.businessParams = {
	1: { energy:1724, winter:0.93, spring:0.97, summer:1.14, notservice:0.2, floor:200, workTime:8, workDay:5 },
	2: { energy:4640, winter:0.91, spring:0.99, summer:1.14, notservice:0.2, floor:200, workTime:12, workDay:7},
	3: { energy:14783, winter:0.97, spring:0.99, summer:1.06, notservice:1, floor:60, workTime:24, workDay:7},
	4: { energy:2942, winter:0.89, spring:0.98, summer:1.19, notservice:0.1, floor:200, workTime:8, workDay:6},
	5: { energy:17543, winter:0.86, spring:0.99, summer:1.2, notservice:0.4, floor:60, workTime:8, workDay:6},
	6: { energy:2668, winter:0.9, spring:0.97, summer:1.18, notservice:0.4, floor:1000, workTime:8, workDay:7},
	7: { energy:366, winter:1.08, spring:0.96, summer:0.95, notservice:0.1, floor:1000, workTime:8, workDay:6},
	8: { energy:2422, winter:0.97, spring:0.96, summer:1.11, notservice:0.4, floor:1000, workTime:8, workDay:7},
	9: { energy:17543, winter:0.86, spring:0.99, summer:1.2, notservice:0.4, floor:1000, workTime:8, workDay:5},
	10: { energy:2942, winter:0.89, spring:0.98, summer:1.19, notservice:0.1, floor:200, workTime:8, workDay:5}
		
	};

	//業種から季節別の係数を得る
	D6.area.getSeasonParam = function( business ) {
		ret = Array();
		var p = D6.area.businessParams[business];
		ret["electricity"] = [ p["winter"], p["spring"], p["summer"] ];
		ret["gas"] = [ 1, 1, 1 ];
		ret["kerosene"] = [ 1, 1, 1 ];
		ret["car"] = [ 1, 1, 1 ];
		ret["heavyoil"] = [ 1, 1, 1 ];

		return ret;
	};
	
	//地域ごとの標準値の設定 :(地域設定後に設定する)
	//　areaId：都道府県ID
	D6.area.setArea = function( areaId  )
	{
		if ( areaId < 0 ) {
			areaId = 13;
		}

		D6.area.area = Math.round(areaId ? areaId : 0);	

		//電力会社の設定
		D6.area.electCompany = D6.area.getElectCompany(D6.area.area);

		//電力のCO2排出係数の設定
		D6.Unit.co2.electricity = D6.area.getCo2Unit( D6.area.electCompany );
		D6.Unit.co2.nightelectricity = D6.Unit.co2.electricity;
		D6.Unit.co2.sellelectricity = D6.Unit.co2.electricity;
		
		//エアコンパラメータ設定
		D6.area.airconFactor_mon = D6.accons.getArray( D6.area.area );
		D6.area.heatFactor_mon = D6.acload.getArray( D6.area.area );
		D6.area.plusHeatFactor_mon = D6.acadd.getArray( D6.area.area );

		
		//平均気温設定
		D6.area.averageTemplature = D6.area.getTemplature( D6.area.area );
		
		//太陽光発電量の設定　100622
		D6.area.unitPVElectricity = 1000 * D6.area.getPVElectricity( D6.area.area ) / 3.6;

		//暖房地域の設定
		D6.area.heatingLevel = D6.area.getHeatingLevel( D6.area.area );

		//冷暖房月数の設定
		switch( D6.area.heatingLevel ) {
			case 1:
				D6.area.seasonMonth = { winter:7, spring:2, summer:3 };
				break;
			case 2:
				D6.area.seasonMonth = { winter:6, spring:2, summer:4 };
				break;
			case 3:
				D6.area.seasonMonth = { winter:5, spring:2, summer:5 };
				break;
			case 5:
				D6.area.seasonMonth = { winter:4, spring:2, summer:6 };
				break;
			case 6:
				D6.area.seasonMonth = { winter:3, spring:2, summer:7 };
				break;
			case 4:
			default:
				D6.area.seasonMonth = { winter:4, spring:2, summer:6 };
				break;
		}
		
		//calculate average cost for business
		this.averageCostEnergy = this.getAverageCostEnergy( 
						D6.consShow["TO"].business ,
						D6.consShow["TO"].floor );
		
		//calculate average CO2
		this.averageCO2Energy = [];
		for( var i in this.averageCostEnergy ) {
			this.averageCO2Energy[i] = 
						D6.Unit.costToCons( this.averageCostEnergy[i] , i )
						* D6.Unit.co2[i];
		}
	};
	
	// get average fee depend on business type,floor
	// 	ret[energy_name]
	//
	//	energy_name: electricity,gas,kerosene,car
	//
	D6.area.getAverageCostEnergy= function( business, floor ) {
		var ret;
		ret = new Array();

		var id;
		for ( i in this.energyCode2id) {
			id = this.energyCode2id[i];
			if ( i=="electricity" ){
				ret[i] = D6.Unit.consToCost(business * floor 
							/ D6.Unit.jules.electricity / 12 
						,"electricity", 1, 0 );			//月電気代
			} else {
				ret[i] = 0;
			}
		}

		return ret;
	};

};




﻿/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * acadd.js for override
 * 
 * AreaParameters acadd: additional heat load cannot supply with  air conditioner
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/16 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 */

D6.acadd = Object.assign( D6.acadd, {
// getArray(param)  return paramArray
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
factorPrefTimeMonth : [

	[ [ 0.17, 0.16, 0.14, 0.12, 0.09, 0.06, 0.05],   //hokkaido
	  [ 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.01], 
	  [ 0.09, 0.09, 0.07, 0.06, 0.04, 0.03, 0.02], 
	  [ 0.16, 0.15, 0.13, 0.11, 0.09, 0.06, 0.04] ], 

	[ [ 0.17, 0.16, 0.14, 0.12, 0.09, 0.06, 0.05],   //hokkaido
	  [ 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.01], 
	  [ 0.09, 0.09, 0.07, 0.06, 0.04, 0.03, 0.02], 
	  [ 0.16, 0.15, 0.13, 0.11, 0.09, 0.06, 0.04] ], 

	[ [ 0.17, 0.16, 0.14, 0.12, 0.09, 0.06, 0.05],   //hokkaido
	  [ 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.01], 
	  [ 0.09, 0.09, 0.07, 0.06, 0.04, 0.03, 0.02], 
	  [ 0.16, 0.15, 0.13, 0.11, 0.09, 0.06, 0.04] ], 


	[ [ 0.02, 0.01, 0.01, 0.01, 0.01, 0, 0],   //uchunomiya
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0.01, 0.01, 0, 0, 0, 0, 0] ], 
 	  
 	[ [ 0.02, 0.01, 0.01, 0.01, 0.01, 0, 0],   //uchunomiya
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0.01, 0.01, 0, 0, 0, 0, 0] ], 
 	  
    [ [ 0, 0, 0, 0, 0, 0, 0],   //tokyo
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ], 
	  
    [ [ 0, 0, 0, 0, 0, 0, 0],   //tokyo
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ], 
	  
    [ [ 0, 0, 0, 0, 0, 0, 0],   //tokyo
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ], 
	  
    [ [ 0, 0, 0, 0, 0, 0, 0],   //tokyo
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ], 
	  
	[ [ 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.02],   //nagano
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0.01, 0.01, 0.01, 0, 0, 0, 0], 
	  [ 0.05, 0.04, 0.03, 0.02, 0.02, 0.01, 0.01] ], 
 
	[ [ 0, 0, 0, 0, 0, 0, 0],   //miyazaki
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ], 
	  
	[ [ 0, 0, 0, 0, 0, 0, 0],   //naha
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ] ,
	  
	[ [ 0, 0, 0, 0, 0, 0, 0],   //naha
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0], 
	  [ 0, 0, 0, 0, 0, 0, 0] ] 
]

});
﻿/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * accons.js  for override
 * 
 * AreaParameters  accons: electricity consumption rate of air conditioner used as heater
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/16 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 */
 
D6.accons = Object.assign( D6.accons, {
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

factorPrefTimeMonth : [

[ [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.94, 0.77, 0.06, 0.05, 0.03, 0.02, 0.02],   //sapporo
  [ 1.14, 1.13, 1.1, 1.05, 0.98, 0.8, 0.67, 0.2, 0.17, 0.13, 0.1, 0.08], 
  [ 1.2, 1.19, 1.16, 1.13, 1.06, 0.88, 0.72, 0.1, 0.08, 0.05, 0.04, 0.03], 
  [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.95, 0.79, 0.03, 0.02, 0.01, 0.01, 0.01] ], 
  
[ [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.94, 0.77, 0.06, 0.05, 0.03, 0.02, 0.02],   //sapporo
  [ 1.14, 1.13, 1.1, 1.05, 0.98, 0.8, 0.67, 0.2, 0.17, 0.13, 0.1, 0.08], 
  [ 1.2, 1.19, 1.16, 1.13, 1.06, 0.88, 0.72, 0.1, 0.08, 0.05, 0.04, 0.03], 
  [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.95, 0.79, 0.03, 0.02, 0.01, 0.01, 0.01] ], 
  
[ [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.94, 0.77, 0.06, 0.05, 0.03, 0.02, 0.02],   //sapporo
  [ 1.14, 1.13, 1.1, 1.05, 0.98, 0.8, 0.67, 0.2, 0.17, 0.13, 0.1, 0.08], 
  [ 1.2, 1.19, 1.16, 1.13, 1.06, 0.88, 0.72, 0.1, 0.08, 0.05, 0.04, 0.03], 
  [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.95, 0.79, 0.03, 0.02, 0.01, 0.01, 0.01] ], 
  
[ [ 1.02, 1, 0.97, 0.91, 0.83, 0.67, 0.56, 0.18, 0.16, 0.13, 0.1, 0.08],   //uchunmiya
  [ 0.48, 0.46, 0.44, 0.41, 0.37, 0.32, 0.3, 0.54, 0.5, 0.44, 0.38, 0.31], 
  [ 0.64, 0.62, 0.6, 0.55, 0.5, 0.42, 0.37, 0.32, 0.31, 0.27, 0.22, 0.18], 
  [ 0.97, 0.95, 0.93, 0.88, 0.81, 0.65, 0.54, 0.11, 0.1, 0.08, 0.06, 0.05] ], 

[ [ 1.02, 1, 0.97, 0.91, 0.83, 0.67, 0.56, 0.18, 0.16, 0.13, 0.1, 0.08],   //uchunmiya
  [ 0.48, 0.46, 0.44, 0.41, 0.37, 0.32, 0.3, 0.54, 0.5, 0.44, 0.38, 0.31], 
  [ 0.64, 0.62, 0.6, 0.55, 0.5, 0.42, 0.37, 0.32, 0.31, 0.27, 0.22, 0.18], 
  [ 0.97, 0.95, 0.93, 0.88, 0.81, 0.65, 0.54, 0.11, 0.1, 0.08, 0.06, 0.05] ], 

[ [ 0.64, 0.63, 0.6, 0.55, 0.5, 0.41, 0.37, 0.31, 0.28, 0.25, 0.21, 0.16],   //tokyo
  [ 0.39, 0.37, 0.35, 0.32, 0.29, 0.26, 0.25, 0.62, 0.57, 0.52, 0.45, 0.37], 
  [ 0.42, 0.4, 0.39, 0.36, 0.33, 0.28, 0.26, 0.43, 0.4, 0.37, 0.32, 0.26], 
  [ 0.58, 0.56, 0.54, 0.5, 0.46, 0.38, 0.34, 0.25, 0.23, 0.21, 0.17, 0.13] ], 

[ [ 0.64, 0.63, 0.6, 0.55, 0.5, 0.41, 0.37, 0.31, 0.28, 0.25, 0.21, 0.16],   //tokyo
  [ 0.39, 0.37, 0.35, 0.32, 0.29, 0.26, 0.25, 0.62, 0.57, 0.52, 0.45, 0.37], 
  [ 0.42, 0.4, 0.39, 0.36, 0.33, 0.28, 0.26, 0.43, 0.4, 0.37, 0.32, 0.26], 
  [ 0.58, 0.56, 0.54, 0.5, 0.46, 0.38, 0.34, 0.25, 0.23, 0.21, 0.17, 0.13] ], 
  
[ [ 0.64, 0.63, 0.6, 0.55, 0.5, 0.41, 0.37, 0.31, 0.28, 0.25, 0.21, 0.16],   //tokyo
  [ 0.39, 0.37, 0.35, 0.32, 0.29, 0.26, 0.25, 0.62, 0.57, 0.52, 0.45, 0.37], 
  [ 0.42, 0.4, 0.39, 0.36, 0.33, 0.28, 0.26, 0.43, 0.4, 0.37, 0.32, 0.26], 
  [ 0.58, 0.56, 0.54, 0.5, 0.46, 0.38, 0.34, 0.25, 0.23, 0.21, 0.17, 0.13] ], 
  
[ [ 0.64, 0.63, 0.6, 0.55, 0.5, 0.41, 0.37, 0.31, 0.28, 0.25, 0.21, 0.16],   //tokyo
  [ 0.39, 0.37, 0.35, 0.32, 0.29, 0.26, 0.25, 0.62, 0.57, 0.52, 0.45, 0.37], 
  [ 0.42, 0.4, 0.39, 0.36, 0.33, 0.28, 0.26, 0.43, 0.4, 0.37, 0.32, 0.26], 
  [ 0.58, 0.56, 0.54, 0.5, 0.46, 0.38, 0.34, 0.25, 0.23, 0.21, 0.17, 0.13] ], 

[ [ 1.2, 1.18, 1.15, 1.1, 1.02, 0.84, 0.7, 0.14, 0.12, 0.09, 0.07, 0.05],   //nagano
  [ 0.88, 0.84, 0.81, 0.74, 0.66, 0.54, 0.49, 0.57, 0.51, 0.43, 0.35, 0.29], 
  [ 0.99, 0.96, 0.93, 0.86, 0.79, 0.64, 0.55, 0.31, 0.26, 0.21, 0.16, 0.13], 
  [ 1.16, 1.14, 1.11, 1.06, 0.99, 0.82, 0.68, 0.09, 0.07, 0.05, 0.04, 0.03] ], 

[ [ 0.64, 0.61, 0.57, 0.52, 0.47, 0.4, 0.37, 0.29, 0.28, 0.26, 0.22, 0.18],   //miyazaki
  [ 0.29, 0.26, 0.23, 0.2, 0.18, 0.18, 0.18, 0.62, 0.61, 0.58, 0.52, 0.44], 
  [ 0.36, 0.33, 0.3, 0.27, 0.24, 0.23, 0.22, 0.46, 0.45, 0.43, 0.38, 0.32], 
  [ 0.58, 0.54, 0.51, 0.47, 0.42, 0.36, 0.33, 0.24, 0.24, 0.22, 0.19, 0.15] ], 
  
[ [ 0.11, 0.07, 0.06, 0.05, 0.04, 0.08, 0.08, 0.39, 0.38, 0.38, 0.36, 0.33],   //naha
  [ 0.08, 0.03, 0.02, 0.02, 0.02, 0.06, 0.06, 0.61, 0.59, 0.58, 0.56, 0.51], 
  [ 0.09, 0.05, 0.03, 0.03, 0.02, 0.06, 0.06, 0.46, 0.45, 0.44, 0.43, 0.39], 
  [ 0.11, 0.07, 0.06, 0.05, 0.04, 0.08, 0.08, 0.35, 0.35, 0.34, 0.33, 0.3] ] 

[ [ 0.11, 0.07, 0.06, 0.05, 0.04, 0.08, 0.08, 0.39, 0.38, 0.38, 0.36, 0.33],   //naha
  [ 0.08, 0.03, 0.02, 0.02, 0.02, 0.06, 0.06, 0.61, 0.59, 0.58, 0.56, 0.51], 
  [ 0.09, 0.05, 0.03, 0.03, 0.02, 0.06, 0.06, 0.46, 0.45, 0.44, 0.43, 0.39], 
  [ 0.11, 0.07, 0.06, 0.05, 0.04, 0.08, 0.08, 0.35, 0.35, 0.34, 0.33, 0.3] ] 

  ]
  
});

 ﻿/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * accons.js  for override
 * 
 * AreaParameters  acload: heat load of house 
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/16 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 */
 
D6.acload = Object.assign( D6.acload, {

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

factorPrefTimeMonth: [
[ [ 1.06, 1.05, 1.03, 1, 0.95, 0.95, 0.82, 0.09, 0.09, 0.05, 0.03, 0.02],   //sapporo
  [ 0.93, 0.92, 0.9, 0.87, 0.83, 0.7, 0.59, 0.27, 0.23, 0.18, 0.14, 0.11], 
  [ 0.99, 0.98, 0.96, 0.93, 0.88, 0.76, 0.64, 0.14, 0.11, 0.07, 0.05, 0.04], 
  [ 1.05, 1.04, 1.02, 0.99, 0.95, 0.83, 0.7, 0.04, 0.03, 0.02, 0.01, 0.01] ], 
  
[ [ 1.06, 1.05, 1.03, 1, 0.95, 0.95, 0.82, 0.09, 0.09, 0.05, 0.03, 0.02],   //sapporo(asahikawa)
  [ 0.93, 0.92, 0.9, 0.87, 0.83, 0.7, 0.59, 0.27, 0.23, 0.18, 0.14, 0.11], 
  [ 0.99, 0.98, 0.96, 0.93, 0.88, 0.76, 0.64, 0.14, 0.11, 0.07, 0.05, 0.04], 
  [ 1.05, 1.04, 1.02, 0.99, 0.95, 0.83, 0.7, 0.04, 0.03, 0.02, 0.01, 0.01] ], 
 
[ [ 1.06, 1.05, 1.03, 1, 0.95, 0.95, 0.82, 0.09, 0.09, 0.05, 0.03, 0.02],   //sapporo
  [ 0.93, 0.92, 0.9, 0.87, 0.83, 0.7, 0.59, 0.27, 0.23, 0.18, 0.14, 0.11], 
  [ 0.99, 0.98, 0.96, 0.93, 0.88, 0.76, 0.64, 0.14, 0.11, 0.07, 0.05, 0.04], 
  [ 1.05, 1.04, 1.02, 0.99, 0.95, 0.83, 0.7, 0.04, 0.03, 0.02, 0.01, 0.01] ], 

[ [ 0.84, 0.83, 0.81, 0.78, 0.73, 0.73, 0.61, 0.25, 0.25, 0.18, 0.14, 0.11],   //utunomiya
  [ 0.52, 0.5, 0.48, 0.45, 0.41, 0.35, 0.33, 0.65, 0.62, 0.55, 0.48, 0.4], 
  [ 0.63, 0.62, 0.6, 0.56, 0.52, 0.44, 0.39, 0.43, 0.41, 0.36, 0.3, 0.24], 
  [ 0.81, 0.8, 0.79, 0.76, 0.71, 0.61, 0.51, 0.15, 0.14, 0.11, 0.09, 0.07] ], 

[ [ 0.84, 0.83, 0.81, 0.78, 0.73, 0.73, 0.61, 0.25, 0.25, 0.18, 0.14, 0.11],   //utunomiya
  [ 0.52, 0.5, 0.48, 0.45, 0.41, 0.35, 0.33, 0.65, 0.62, 0.55, 0.48, 0.4], 
  [ 0.63, 0.62, 0.6, 0.56, 0.52, 0.44, 0.39, 0.43, 0.41, 0.36, 0.3, 0.24], 
  [ 0.81, 0.8, 0.79, 0.76, 0.71, 0.61, 0.51, 0.15, 0.14, 0.11, 0.09, 0.07] ], 

[ [ 0.63, 0.62, 0.6, 0.57, 0.53, 0.53, 0.44, 0.43, 0.43, 0.35, 0.28, 0.23],   //tokyo
  [ 0.44, 0.42, 0.4, 0.37, 0.34, 0.3, 0.29, 0.75, 0.7, 0.63, 0.56, 0.47], 
  [ 0.48, 0.45, 0.44, 0.41, 0.37, 0.32, 0.3, 0.58, 0.54, 0.5, 0.43, 0.35], 
  [ 0.6, 0.58, 0.56, 0.53, 0.5, 0.41, 0.37, 0.36, 0.33, 0.3, 0.24, 0.19] ], 

[ [ 0.63, 0.62, 0.6, 0.57, 0.53, 0.53, 0.44, 0.43, 0.43, 0.35, 0.28, 0.23],   //tokyo
  [ 0.44, 0.42, 0.4, 0.37, 0.34, 0.3, 0.29, 0.75, 0.7, 0.63, 0.56, 0.47], 
  [ 0.48, 0.45, 0.44, 0.41, 0.37, 0.32, 0.3, 0.58, 0.54, 0.5, 0.43, 0.35], 
  [ 0.6, 0.58, 0.56, 0.53, 0.5, 0.41, 0.37, 0.36, 0.33, 0.3, 0.24, 0.19] ], 

[ [ 0.63, 0.62, 0.6, 0.57, 0.53, 0.53, 0.44, 0.43, 0.43, 0.35, 0.28, 0.23],   //tokyo
  [ 0.44, 0.42, 0.4, 0.37, 0.34, 0.3, 0.29, 0.75, 0.7, 0.63, 0.56, 0.47], 
  [ 0.48, 0.45, 0.44, 0.41, 0.37, 0.32, 0.3, 0.58, 0.54, 0.5, 0.43, 0.35], 
  [ 0.6, 0.58, 0.56, 0.53, 0.5, 0.41, 0.37, 0.36, 0.33, 0.3, 0.24, 0.19] ], 

[ [ 0.63, 0.62, 0.6, 0.57, 0.53, 0.53, 0.44, 0.43, 0.43, 0.35, 0.28, 0.23],   //tokyo
  [ 0.44, 0.42, 0.4, 0.37, 0.34, 0.3, 0.29, 0.75, 0.7, 0.63, 0.56, 0.47], 
  [ 0.48, 0.45, 0.44, 0.41, 0.37, 0.32, 0.3, 0.58, 0.54, 0.5, 0.43, 0.35], 
  [ 0.6, 0.58, 0.56, 0.53, 0.5, 0.41, 0.37, 0.36, 0.33, 0.3, 0.24, 0.19] ], 

[ [ 0.98, 0.96, 0.93, 0.9, 0.85, 0.85, 0.73, 0.2, 0.2, 0.13, 0.1, 0.07],   //nagano(karuizawa)
  [ 0.76, 0.74, 0.72, 0.67, 0.62, 0.52, 0.48, 0.7, 0.63, 0.54, 0.45, 0.37], 
  [ 0.83, 0.81, 0.79, 0.75, 0.7, 0.59, 0.51, 0.42, 0.36, 0.29, 0.22, 0.18], 
  [ 0.94, 0.92, 0.9, 0.87, 0.82, 0.72, 0.6, 0.13, 0.1, 0.07, 0.05, 0.04] ], 

[ [ 0.62, 0.6, 0.57, 0.53, 0.49, 0.49, 0.42, 0.4, 0.4, 0.37, 0.31, 0.25],   //miyazaki(takachiho)
  [ 0.33, 0.3, 0.26, 0.23, 0.2, 0.21, 0.21, 0.75, 0.74, 0.71, 0.65, 0.56], 
  [ 0.41, 0.38, 0.35, 0.31, 0.28, 0.26, 0.25, 0.61, 0.6, 0.57, 0.51, 0.43], 
  [ 0.58, 0.55, 0.53, 0.49, 0.45, 0.39, 0.35, 0.34, 0.33, 0.31, 0.27, 0.21] ], 

[ [ 0.12, 0.08, 0.07, 0.06, 0.05, 0.05, 0.09, 0.55, 0.55, 0.53, 0.52, 0.47],   //okinawa
  [ 0.09, 0.04, 0.03, 0.02, 0.02, 0.06, 0.06, 0.76, 0.75, 0.74, 0.72, 0.67], 
  [ 0.1, 0.05, 0.04, 0.03, 0.03, 0.07, 0.07, 0.64, 0.62, 0.62, 0.6, 0.54], 
  [ 0.12, 0.08, 0.06, 0.06, 0.04, 0.08, 0.08, 0.51, 0.5, 0.49, 0.48, 0.43] ],
  
[ [ 0.12, 0.08, 0.07, 0.06, 0.05, 0.05, 0.09, 0.55, 0.55, 0.53, 0.52, 0.47],   //okinawa
  [ 0.09, 0.04, 0.03, 0.02, 0.02, 0.06, 0.06, 0.76, 0.75, 0.74, 0.72, 0.67], 
  [ 0.1, 0.05, 0.04, 0.03, 0.03, 0.07, 0.07, 0.64, 0.62, 0.62, 0.6, 0.54], 
  [ 0.12, 0.08, 0.06, 0.06, 0.04, 0.08, 0.08, 0.51, 0.5, 0.49, 0.48, 0.43] ],
]



} );
/**
* Home-Eco Diagnosis for JavaScript
* AreaParameters area: parameters by prefecture for home
* 
* @author Yasufumi SUZUKI  2011/04/15 Diagnosis5
*								2011/05/06 actionscript3
* 								2016/04/12 js
*/

D6.area = D6.patch( D6.area , {

	//name of prefecture/city
	//	prefName[prefectureid/cityid]
	//
	//都道府県名
	prefName : [ 
		'上海',
		"長春",	//1
		"北京",
		"青島",
		"鄭州",
		"蘭州", //5
		"上海",
		"重慶",
		"敦煌",
		"拉萨",
		"昆明",	//10
		"広州",
		"海口"
	],

	prefDefault : 6,	//not selected

	// heat category with prefecture
	//	prefHeatingLeverl[prefecture]
	//
	//	return code
	//		1:cold area in Japan(Hokkaido)
	//			.
	//			.
	//		6:hot area in Japan(Okinawa)
	//
	//
	prefHeatingLeverl : [ 
		5, //8,1,32,25	'上海',			//2
		1, //-11,-23, 29, 18"長春",		//1　旭川 -3,-13, 26,17
		2, //2,-10,31,22"北京",			//2	札幌 -1,-7, 27,19
		2, //3,-4, 28,23"青島",			//3
		3, //6,-5, 32,23 "鄭州",		//3 宇都宮 8,-3, 31, 22
		2, //2, -11, 29, 16 "蘭州",		//5
		5, //8,1,32,25	'上海',			//5 東京 10, 1, 31, 23
		5, //9,5, 35,25"重慶",			//5
		2, //-2,-16,33,16 "敦煌",		//5
		4, //7,-10, 23,10"拉萨",　夏が涼しい	//4	軽井沢 2,-9, 26,16
		6, //15, 2, 24,16 "昆明",　夏が涼しい	//6 高千穂 9,-1, 30, 21
		7, //18,10,33,25 "広州",				//7 那覇 20, 15, 32, 27
		7, //21,15,33,25 "海口"					//7
 	],

								
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
	//都道府県の電力会社コード
	// 0:北海道、1:東北電力 2:東京電力 3:中部電力 4:北陸電力 5:関西電力
	// 6:中国電力 7:四国電力 8:九州電力 9:沖縄電力
	prefToEleArea : [ 2,
				2, 2, 2, 2, 2, 2, 2,
				2, 2, 2, 2, 2, 2, 2,
				1, 4, 4, 4, 2, 3, 3, 3, 3,
				3, 5, 5, 5, 5, 5, 5,
				6, 6, 6, 6, 6, 7, 7, 7, 7,
				8, 8, 8, 8, 8, 8, 8, 9 ],

	//electricity supply company price ratio
	electCompanyPrice : [
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1
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
		// 1:従量電灯A, 2:従量電灯B、3:時間帯別、4:低圧、5:低圧総合、6:高圧
		// ピーク単価,標準単価,割引単価,切片,kW契約単価
		1: [ 33.32, 33.32, 33.32, -1500, 0 ],
		2: [ 33.32, 33.32, 33.32, -1500, 280 ],
		3: [ 38.89, 27.32, 13.10, 2160, 0 ],
		4: [ 17.98, 16.53, 16.53, 0, 1054 ],
		5: [ 20.22, 18.56, 18.56, 64800, 0 ],
		6: [ 22.58, 17.36, 13.08, 0, 1733 ]
	},

	//electricity supply company price
	elecCompanyPrice : {
	},


	// meteorological annal average templature C
	//
	//		prefTemplature( prefecture )
	//
	//
	//気象庁｢気象庁年報｣ 平成19年　各都道府県の平均気温
	//数値は各都道府県の県庁所在地の気象官署の観測値。
	//  （ただし、埼玉県は熊谷市、滋賀県は彦根市の気象官署の観測値)
	// Unit.setArea()で　該当する地域について　averageTemplature　にコピーをして利用
	//
	prefTemplature : [

		19, //8,1,32,25	'上海',
		13, //-11,-23, 29, 18"長春",
		20, //2,-10,31,22"北京",	
		14, //3,-4, 28,23"青島",
		21, //6,-5, 32,23 "鄭州",
		19, //2, -11, 29, 16 "蘭州",
		19, //8,1,32,25	'上海',
		23, //9,5, 35,25"重慶",
		21, //-2,-16,33,16 "敦煌",
		16, //7,-10, 23,10"拉萨",
		24, //15, 2, 24,16 "昆明",	//10
		26, //18,10,33,25 "広州",
		30, //21,15,33,25 "海口"
	],

	// solar factor
	//
	//		prefPVElectricity( prefecture )
	//
	// ex. JWA　monsola05
	//  annual solar energy input at most provable direction kWh/m2/day
	prefPVElectricity : [
		4,4,4,4,4,4,4,4,4,4,4,4,4,4
	],

	// convert energy name to energy_type id
	//
	//	energyCode2id[energy_name]	: get energy code
	//
	energyCode2id : {
		"electricity" : 0,
		"gas" : 1,
		"kerosene" : 2,
		"coal" : 4,
		"hotwater" : 5,
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
	//地域別平均光熱費 2人以上世帯（補正後）
	//　中国の電力消費 2011年 413kWh/年・人　http://www.chinaero.com.cn/zxdt/djxx/ycwz/2014/05/146440.shtml
	//　413×1元/kWh×3人÷12
	prefKakeiEnergy : [ 
		[ 200, 80, 0, 50, 5, 0 ],  //東京都区部
		[ 150, 80, 0, 50, 5, 300 ],  //旭川市
		[ 150, 80, 0, 50, 5, 250 ],  //札幌市
		[ 150, 80, 0, 50, 5, 250 ],  //札幌市
		[ 150, 80, 0, 50, 5, 200 ],  //宇都宮市
		[ 150, 80, 0, 50, 5, 250 ],  //札幌市
		[ 200, 80, 0, 50, 5, 0 ],  //東京都区部
		[ 200, 80, 0, 50, 5, 200 ],  //東京都区部
		[ 150, 80, 0, 50, 5, 250 ],  //札幌市
		[ 150, 80, 0, 50, 5, 200 ],  //奈良市
		[ 150, 80, 0, 50, 5, 200 ],  //奈良市
		[ 200, 80, 0, 50, 5, 0 ],   //那覇市
		[ 200, 80, 0, 50, 5, 0 ]   //那覇市

	],

	// Hot Water Supply by local government per m2 in Season
	//
	prefHotWaterPrice : [ 
		0, //8,1,32,25	'上海',
		31, //-11,-23, 29, 18"長春",
		25, //2,-10,31,22"北京",	
		25, //3,-4, 28,23"青島",
		22, //6,-5, 32,23 "鄭州", 0.19*120
		17, //2, -11, 29, 16 "蘭州", 4.2*4
		0, //8,1,32,25	'上海',
		24, //9,5, 35,25"重慶",		12元/m2 + 44元/GJ
		20, //-2,-16,33,16 "敦煌",
		20, //7,-10, 23,10"拉萨",
		0, //15, 2, 24,16 "昆明",	//10
		0, //18,10,33,25 "広州",
		0, //21,15,33,25 "海口"
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

	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //tokyo
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //sapporo
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //sapporo
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //sapporo
	[ [ 1.1498, 1.2742, 1.934, 1.0276 ], [ 0.9069, 0.9497, 0.6857, 0.9587 ], [ 0.9555, 0.7183, 0.2786, 1.032 ] ],   //utsunomiya
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //sapporo
	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //tokyo
	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //tokyo
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //sapporo
	[ [ 1.1301, 1.3407, 2.324, 0.9201 ], [ 0.8464, 0.9429, 0.4949, 0.9414 ], [ 1.0826, 0.6409, 0.0765, 1.2042 ] ],   //nara
	[ [ 1.1301, 1.3407, 2.324, 0.9201 ], [ 0.8464, 0.9429, 0.4949, 0.9414 ], [ 1.0826, 0.6409, 0.0765, 1.2042 ] ],   //nara
	[ [ 0.8457, 1.1222, 1.5081, 0.9201 ], [ 0.9351, 0.9941, 0.8528, 0.9802 ], [ 1.3139, 0.847, 0.5678, 1.1395 ] ],   //naha
	[ [ 0.8457, 1.1222, 1.5081, 0.9201 ], [ 0.9351, 0.9941, 0.8528, 0.9802 ], [ 1.3139, 0.847, 0.5678, 1.1395 ] ]   //naha

	],



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
	//世帯人数別の支出金額比率（標準値に対する割合:家計調査より）
	//	[電気、ガス、灯油、ガソリン]
	//	[1人世帯、2人世帯、3人世帯、4人世帯、5人世帯、6人以上世帯]
	//　　出典について複数の環境家計簿からの集計値（確認：評価基礎情報ではない）
	kakeiNumCoefficent:
			  [ [ 0.47, 0.52,  0.37, 0.45, 0.4, 0.4 ],
				[ 0.86, 0.83,  0.90, 0.79, 0.8, 0.8 ],
				[ 0.99, 1.00,  0.90, 0.98, 1.0, 1.0 ],
				[ 1.07, 1.10,  0.85, 1.16, 1.1, 1.1 ],
				[ 1.24, 1.17,  1.10, 1.26, 1.3, 1.3 ],
				[ 1.55, 1.19,  1.67, 1.33, 1.4, 1.4  ]
	],

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
	//郊外の場合の比率　家計調査より 2001～2007年
	//　都市部：大都市と中都市の平均
	//　郊外：小都市A、小都市B、町村の平均 
	urbanCostCoefficient :
			[ [ 8762, 9618 ],
			  [ 6100, 5133 ],
			  [ 828,  1898 ],
			  [ 3415, 6228 ],
			  [ 3,  20 ],
			  [ 24,  5 ]
	],
} );


﻿/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * unit.js 
 * 
 * any kind of unit related to energy type is defined here, change here
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

//fix D6.Unit

	// unit price   元(in China)/each unit
D6.Unit.price = {
		electricity:1,			// override in D6.area.setPersonArea by supplyer
		nightelectricity:0.3,
		sellelectricity:1,
		nagas:10,
		lpgas:30,
		kerosene:7,
		gasoline:8,
		lightoil:7,
		heavyoil:6,
		coal:3,
		biomass:0,
		hotwater:0.036,
		waste:0,
		water:0,
		gas:10,
		car:8
	};

	// intercept price when consumption is zero
D6.Unit.priceBase = {
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
		hotwater:50,
		waste:0,
		water:0,
		gas:0,
		car:0
	};
	
	// names ( dataset is now witten in Japanse )
D6.Unit.name = {
		electricity:"电力",
		nightelectricity:"电力",
		sellelectricity:"売電",
		nagas:"都市ガス",
		lpgas:"LPガス",
		kerosene:"灯油",
		gasoline:"ガソリン",
		lightoil:"軽油",
		heavyoil:"重油",
		coal:"煤球",
		biomass:0,
		hotwater:"区供热",
		waste:0,
		water:0,
		gas:"气",
		car:"汽油"
	};
	
	// unit discription text
D6.Unit.unitChar = {
		electricity:"kWh",
		nightelectricity:"kWh",
		sellelectricity:"kWh",
		nagas:"m3",
		lpgas:"m3",
		kerosene:"L",
		gasoline:"L",
		lightoil:"L",
		heavyoil:"L",
		coal:"kg",
		biomass:0,
		hotwater:"MJ",
		waste:0,
		water:0,
		gas:"m3",
		car:"L"
	};
	
	// second energy(end-use)  kcal/each unit
D6.Unit.calorie = {
		electricity:860,
		nightelectricity:860,
		sellelectricity:860,
		nagas:11000,
		lpgas:36000,
		kerosene:8759,
		gasoline:8258,
		lightoil:9117,
		heavyoil:9000,
		coal:8000,
		biomass:0,
		hotwater:225,
		waste:0,
		water:0,
		gas:11000,
		car:8258
	};

	// primary energy  MJ/each unit
D6.Unit.jules = {
		electricity:9.6,
		nightelectricity:9.6,
		sellelectricity:9.6,
		nagas:46,
		lpgas:60,
		kerosene:38,
		gasoline:38,
		lightoil:38,
		heavyoil:38,
		coal:32,
		biomass:0,
		hotwater:1,
		waste:0,
		water:0,
		gas:45,
		car:38
	};
	
	
	// costToCons( cost, energy_name, elecType, kw ) -----------------------------
	//		estimate consumption from cost, per month
	// parameters
	//		cost: energy fee/cost per month
	//		energy_name: energy code
	//		elecType: type of electricity supply
	//			1:従量電灯A, 2:従量電灯B、3:時間帯別、4:低圧、5:低圧総合、6:高圧 in Japan
	//		kw:	contract demand
	// return
	//		cons: energy consumption per month
D6.Unit.costToCons = function( cost, energy_name, elecType, kw )
	{
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
	};
	
	
	//consToCost( cons, energy_name, elecType, kw ) -----------------------
	//		estimate cost from energy consumption
	// parameters
	//		cons: energy consumption per month
	//		energy_name: energy code
	//		elecType: type of electricity supply
	//			1:従量電灯A, 2:従量電灯B、3:時間帯別、4:低圧、5:低圧総合、6:高圧 in Japan
	//		kw:	contract demand
	// return
	//		cost: energy fee/cost per month, not include intercept price
D6.Unit.consToCost = function( cons, energy_name, elecType, kw )
	{
		var ret;

		if ( cons == -1 || cons == "" ) {
			ret = "";
		}
//		if ( energy_name != "electricity" || typeof(D6.area.elecPrice) == undefined  ) {
			// this is rough method, multify only unit price
			// it will better to fix regionally
			ret = cons * D6.Unit.price[energy_name];
/*
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
*/
		return ret;
	};
	
	// consToEnergy( cons, energy_name ) --------------------------------
	//		calculate energy from energy consumption 
	// parameters
	//		cons: energy consumption per month
	//		energy_name: energy code
	// return
	//		ret: energy MJ per month
	consToEnergy = function( cons, energy_name )
	{
		var ret;

		if ( cons == -1 || cons == "" ) {
			ret = "";
		}
		//static function
		ret = cons * D6.Unit.jules[energy_name]/1000000;

		return ret;
	};

