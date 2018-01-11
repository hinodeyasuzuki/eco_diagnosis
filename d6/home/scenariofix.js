/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * scenariofix.js 
 * 
 * fix area function and data between home and office
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/04/12 ported to JavaScript
 * 
 * 
 */


 // fix area set by home/office
 // called by diagnosis.js  just after create scenario
D6.scenario.areafix = function() {
	//set area and person to calculate average, heat load etc.
	D6.area.setCalcBaseParams = function(){
		D6.area.setPersonArea( D6.doc.data.i001, D6.doc.data.i021, D6.doc.data.i023);		
	},
	
	//get seasonal parameters
	D6.area.getSeasonParamCommon = function(){
		return D6.area.getSeasonParam(  D6.area.area  );
	}
};




