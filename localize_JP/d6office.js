/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * d6facade.js 
 * 
 * call diagnosis calculation functions through onmessage()
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2016/05/25 make facade design
 * 
 */


/*
 * D6 functions 
 *
//====Create Pages=====
D6.disp.getInputPage(consName, subName)		create input page (disp_input.js)
				consName: consumption code name
				subName: sub category of consumption name

D6.disp.showResultTable(consName)			get total result 
				consName: consumption code name
				
D6.disp.showItemizeGraph(consCode, sort )	get itemized graph data
				consCode: consumption short code
				sort: target 

D6.disp.createDemandSumupPage()				get demand value
D6.disp.createDemandLogPage()
D6.disp.demandGraph()						get demand graph

D6.disp.getMeasureComment(id)				comment of measure
				id:measureID
D6.disp.modalHtml( id, ret )				measure detail data to show dialog	
				id:measureID

//====Calculation set no return =====
D6.setscenario()							generate calculation logic
D6.calcAverage()							calculate average		
D6.calcMeasures(cid)						calculate measures		
				cid:consumption ID , -1 is total consumption
D6.inSet(id,val)							set data when input change
				id: question id
				val:answerd value
D6.measureAdd(mesId)						add(accept) one measure and calculate
D6.measureDelete(mesid)						delete(recall) one measure and calculate
				mesid:measure id
D6.addConsSetting(consName)					add countable consumption, ex. room, equipment
				consName: consumption code name
D6.doc.serialize()							serialize input data for saving
D6.doc.loadDataSet(data)					load saved data
				data:serialized data

**/

//resolve D6 -------------------------------------
var D6 = D6||{};
D6.debugMode = false;	//Debug to console.log, set in workercalc(start,*)


//onmessage(event ) function called as worker ========================================
//
onmessage = function (event) {
  
	var param = event.data.param;
	if ( !event.data.param ) {
		param = "";
	}
	if ( typeof(param.targetMode) != "undefined" ){
		D6.targetMode = param.targetMode;
	};
	var result = D6.workercalc( event.data.command, param );

	//return to main.js
	try {
		postMessage({ 
			"command": event.data.command,
			"result": result
		}, "http://" + window.location.hostname);
	} catch(e) {
		postMessage({ 
			"command": event.data.command,
			"result": result
		});
		
	};
	
};


//workercalc(command, param)  simulating worker for non worker ========================
// parameters
// 		command: command code(string)
// 		param: parameters array
//
D6.workercalc = function( command, param ){
	var result = {};
	var ad;
	
	switch( command ) {
		case "start" :
			//program setting , execute only once.
			D6.viewparam = D6.viewparam || {};
			D6.viewparam.dispMode = param.dispMode;
			D6.viewparam.focusMode = param.focusMode;
			D6.viewparam.countfix_pre_after = param.countfix_pre_after;
			
			//initialize datasets
			D6.setscenario(param.prohibitQuestions, param.allowedQuestions, param.defInput);

			// set file data
			if ( typeof(param.rdata) != "undefined" && param.rdata ) {
				try {
					D6.doc.loadDataSet( decodeURIComponent(escape(atob(param.rdata))) );
				} catch(e){
					//console.log("load data error");
				}
			}
			
			//set debug mode
			if ( param.debugMode && param.debugMode == 1 ){
				D6.debugMode = true;
			} else {
				D6.debugMode = false;
			}

			//calculation
			D6.calcAverage();
			D6.calcMeasures(-1);

			//get initial page as consTotal
			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable( "consTotal" );

			//create input componets
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);

			//button selection
			result.quesone = D6.disp.getFirstQues(param.consName,param.subName);

			//debug
			if ( D6.debugMode ) {
				console.log( "d6 construct value ----" );
				console.log( D6 );
			}

			break;

		case "addandstart":
			//in case of structure is changed
			var serialize = D6.doc.serialize();
			param.rdata = btoa(unescape(encodeURIComponent(serialize)));

			//add equip or room(sub category)
			D6.addConsSetting(param.consName);
			//initialize datasets without scenarioset
			D6.setscenario("add");

			//filed data set
			if ( typeof(param.rdata) != "undefined"  ) {
				D6.doc.loadDataSet( decodeURIComponent(escape(atob(param.rdata))), "add" );
			}

			//calculate
			D6.calcAverage();
			D6.calcMeasures(-1);

			//#0 page is basic question
			var showName = D6.consListByName[param.consName][0].sumConsName;

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable(showName );

			//create input componets
			result.inputPage = D6.disp.getInputPage(showName,param.subName);

			break;

		case "tabclick" :
			//menu selected / main cons change		

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable(param.consName);

			//create input componets
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);

			//button selection
			result.quesone = D6.disp.getFirstQues(param.consName,param.subName);

			break;

		case "subtabclick" :
			//create input componets / sub cons change
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);
			result.subName = param.subName;
			break;

		case "inchange" :
			//in case of changing input value, recalc.
			D6.inSet(param.id,param.val);
			if ( D6.scenario.defCalcAverage.indexOf( param.id ) != -1 ){
				D6.calcAverage();
			}
			if ( param.id == D6.scenario.measuresSortChange ){
				D6.sortTarget =  D6.scenario.measuresSortTarget[param.val < 0 ? 0:param.val];
			}
			D6.calcMeasures(-1);

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable();	//show result 
			break;

		case "inchange_only" :
			//in case of changing input value, recalc.
			D6.inSet(param.id,param.val);
			result = "ok";
			break;

		case "quesone_next" : 
			result.quesone = D6.disp.getNextQues();
			break;
			
		case "quesone_prev" : 
			result.quesone = D6.disp.getPrevQues();
			break;
			
		case "quesone_set" : 
			D6.inSet(param.id,param.val);
			result.quesone = D6.disp.getNextQues();
			break;
			
		case "recalc" :
			//only recalc no graph data
			D6.calcAverage();
			D6.calcMeasures(-1);

			result = D6.disp.showResultTable(param.consName);
			//create input componets
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);
			break;

		case "pagelist" :
			//create itemize list
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);
			break;
			
		case "measureadd" :
		case "measureadd_comment" :
			//add measure to select list 
			D6.measureAdd( param.mid );
			D6.calcMeasures(-1);

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable();
			break;

		case "measuredelete" :
			//delete measure from select list
			D6.measureDelete( param.mid  );
			D6.calcMeasures(-1);

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable();
			break;

		case "graphchange" :
			//change graph
			result.graphItemize = D6.disp.getItemizeGraph("", param.graph);
			break;

		case "evaluateaxis" :
			//calc evaluate axis point
			result.evaluateAxis = D6.evaluateAxisPoint("", param.subName);
			break;

		case "add_demand" :
			// add equipment to demand graph
			var serialize = D6.doc.serialize();
			param.rdata = btoa(unescape(encodeURIComponent(serialize)));
			
			D6.addConsSetting(param.consName);
			
			//initialize datasets
			D6.setscenario("add");

			//filedataset
			if ( param.rdata ) {
				D6.doc.loadDataSet( decodeURIComponent(escape(atob(param.rdata))), "add" );
			}
			//--continue to demand command

		case "demand" :
			//create input componets and graph for demand page
			result.demandin = D6.disp.getInputDemandSumup();
			result.demandlog = D6.disp.getInputDemandLog();
			result.graphDemand = D6.disp.getDemandGraph();
			break;
			
		case "inchange_demand" :
			D6.inSet(param.id,param.val);
			result.graphDemand = D6.disp.getDemandGraph();
			break;
			
		case "modal" :
			//display detail information about measure, modal dialog
			var id =param.mid;
			result.measureDetail = D6.disp.getMeasureDetail( id );	
			break;

		case "save" :
		case "savenew" :
		case "saveandgo" :
		case "save_noalert" :
			//save data
			var serialize = D6.doc.serialize();
			result = btoa(unescape(encodeURIComponent(serialize)));
			break;

		case "load":
			break;

		case "getinputpage" :
			//create input componets
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);
			break;

		case "getqueslist" :
			//return question list
			result.queslist = D6.disp.getQuesList();
			break;

		case "common" :
			//common action to get full data set----------------------------------
			if ( typeof(param.rdata) != "undefined" && param.rdata ) {
				try {
					D6.doc.loadDataSet( decodeURIComponent(escape(atob(param.rdata))) );
				} catch(e){
					//console.log("load data error");
				}
			}
			//set one data
			if ( typeof(param.id) != "undefined" && param.id ) {
				D6.inSet(param.id,param.val);
			}
			//set array data
			if ( typeof(param.inputs) != "undefined" && param.inputs) {
				for ( var inp in param.inputs ) {
					D6.inSet(param.inputs[inp].id,param.inputs[inp].val);
				}
			}
			D6.measureAdd( param.mid );
			D6.calcMeasures(-1);

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.disp.showResultTable();
			
			//create input componets
			result.inputPage = D6.disp.getInputPage(param.consName,param.subName);
			
			//calc evaluate axis point
			result.evaluateAxis = D6.evaluateAxisPoint("", param.subName);
			break;

		default:
	};
	
	return result;
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
if ( typeof ( atob) =="undefined" ) {
	function atob(str){
		return str;
	};
	function btoa(str){
		return str;
	};
};
﻿/*  2017/12/16  version 1.0
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

D6.acadd = {

// getArray(param)  return paramArray
//		param: prefecture(original)
//
//  return addac[time_slot_index][heat_month_index]
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
//
//アメダス10分間データを元に算出:追加電熱負荷
//
//	配列は　  [朝、昼、夕、夜]の係数で、
//	それぞれ　[暖房半月、暖房1ヶ月、暖房2ヶ月、暖房3ヶ月、暖房4ヶ月、暖房6ヶ月、暖房8ヶ月]
//	の規定温度における消費量に対する割合を示す。
//
// Unit.setArea()で　該当する地域について　plusHeatFactor_mon　にコピーをして利用
//


factorPrefTimeMonth : [
[ [ 0, 0, 0, 0, 0, 0, 0],   //神戸
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 

[ [ 0.17, 0.16, 0.14, 0.12, 0.09, 0.06, 0.05],   //札幌
  [ 0.06, 0.05, 0.04, 0.04, 0.03, 0.02, 0.01], 
  [ 0.09, 0.09, 0.07, 0.06, 0.04, 0.03, 0.02], 
  [ 0.16, 0.15, 0.13, 0.11, 0.09, 0.06, 0.04] ], 
[ [ 0.05, 0.04, 0.03, 0.03, 0.02, 0.01, 0.01],   //青森
  [ 0.02, 0.02, 0.01, 0.01, 0.01, 0, 0], 
  [ 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01], 
  [ 0.05, 0.04, 0.03, 0.02, 0.02, 0.01, 0.01] ], 
[ [ 0.12, 0.11, 0.09, 0.07, 0.06, 0.04, 0.03],   //盛岡
  [ 0.01, 0.01, 0.01, 0.01, 0, 0, 0], 
  [ 0.03, 0.03, 0.02, 0.01, 0.01, 0.01, 0.01], 
  [ 0.1, 0.09, 0.07, 0.06, 0.04, 0.03, 0.02] ], 
[ [ 0.01, 0.01, 0, 0, 0, 0, 0],   //仙台
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0.02, 0.02, 0.01, 0.01, 0.01, 0, 0],   //秋田
  [ 0.01, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0.01, 0.01, 0, 0, 0] ], 
[ [ 0.03, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01],   //山形
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0, 0, 0, 0, 0], 
  [ 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0] ], 
[ [ 0.01, 0.01, 0.01, 0.01, 0, 0, 0],   //福島
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0, 0, 0, 0, 0] ], 
[ [ 0.01, 0.01, 0.01, 0.01, 0.01, 0, 0],   //水戸
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0, 0, 0, 0, 0, 0] ], 
[ [ 0.02, 0.01, 0.01, 0.01, 0.01, 0, 0],   //宇都宮
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //前橋
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0.01, 0, 0, 0, 0, 0],   //さいたま
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //千葉
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //東京
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //横浜
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //新潟
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //富山
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //金沢
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //福井
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0.02, 0.02, 0.01, 0.01, 0.01, 0, 0],   //甲府
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0, 0, 0, 0, 0] ], 
[ [ 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.02],   //長野
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0.01, 0.01, 0.01, 0, 0, 0, 0], 
  [ 0.05, 0.04, 0.03, 0.02, 0.02, 0.01, 0.01] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //岐阜
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //静岡
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //名古屋
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //津
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //彦根
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //京都
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //大阪
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //神戸
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //奈良
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //和歌山
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //鳥取
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //松江
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //岡山
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //広島
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //山口
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //徳島
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //高松
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //松山
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //高知
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //福岡
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //佐賀
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //長崎
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //熊本
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //大分
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //宮崎
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //鹿児島
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ], 
[ [ 0, 0, 0, 0, 0, 0, 0],   //那覇
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0], 
  [ 0, 0, 0, 0, 0, 0, 0] ] ],


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
﻿/*  2017/12/16  version 1.0
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
 
D6.accons = {

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
//アメダス10分間データを元に算出:エアコン消費電力量
//
//	配列は　  [朝、昼、夕、夜]の係数で、
//	それぞれ　[暖房半月、暖房1ヶ月、暖房2ヶ月、暖房3ヶ月、暖房4ヶ月、暖房6ヶ月、暖房8ヶ月、
//				冷房半月、冷房1ヶ月、冷房2ヶ月、冷房3ヶ月、冷房4ヶ月]
//	の規定温度における消費量に対する割合を示す。
//
// Unit.setArea()で　該当する地域について　airconFactor_mon　にコピーをして利用
//

factorPrefTimeMonth: [
[ [ 0.69, 0.65, 0.6, 0.56, 0.5, 0.42, 0.38, 0.34, 0.33, 0.28, 0.23, 0.18],   //神戸
  [ 0.45, 0.42, 0.39, 0.36, 0.32, 0.28, 0.27, 0.65, 0.63, 0.55, 0.48, 0.39], 
  [ 0.53, 0.5, 0.46, 0.43, 0.38, 0.32, 0.31, 0.46, 0.44, 0.4, 0.34, 0.28], 
  [ 0.68, 0.63, 0.59, 0.55, 0.5, 0.41, 0.37, 0.29, 0.28, 0.24, 0.2, 0.16] ], 

[ [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.94, 0.77, 0.06, 0.05, 0.03, 0.02, 0.02],   //札幌
  [ 1.14, 1.13, 1.1, 1.05, 0.98, 0.8, 0.67, 0.2, 0.17, 0.13, 0.1, 0.08], 
  [ 1.2, 1.19, 1.16, 1.13, 1.06, 0.88, 0.72, 0.1, 0.08, 0.05, 0.04, 0.03], 
  [ 1.24, 1.22, 1.21, 1.18, 1.13, 0.95, 0.79, 0.03, 0.02, 0.01, 0.01, 0.01] ], 
[ [ 1.14, 1.13, 1.09, 1.05, 0.98, 0.81, 0.67, 0.11, 0.09, 0.06, 0.04, 0.03],   //青森
  [ 0.99, 0.96, 0.93, 0.87, 0.8, 0.65, 0.55, 0.26, 0.23, 0.18, 0.14, 0.11], 
  [ 1.08, 1.05, 1.02, 0.97, 0.9, 0.73, 0.61, 0.16, 0.14, 0.09, 0.07, 0.05], 
  [ 1.15, 1.12, 1.09, 1.06, 1, 0.84, 0.69, 0.06, 0.05, 0.03, 0.02, 0.01] ], 
[ [ 1.2, 1.18, 1.16, 1.12, 1.05, 0.89, 0.73, 0.09, 0.07, 0.05, 0.03, 0.03],   //盛岡
  [ 0.98, 0.95, 0.91, 0.85, 0.78, 0.63, 0.55, 0.35, 0.31, 0.24, 0.19, 0.15], 
  [ 1.11, 1.08, 1.04, 0.98, 0.91, 0.75, 0.63, 0.2, 0.18, 0.13, 0.1, 0.08], 
  [ 1.2, 1.17, 1.15, 1.11, 1.05, 0.9, 0.74, 0.04, 0.03, 0.02, 0.01, 0.01] ], 
[ [ 0.98, 0.95, 0.92, 0.87, 0.8, 0.66, 0.55, 0.15, 0.12, 0.09, 0.07, 0.05],   //仙台
  [ 0.69, 0.66, 0.63, 0.58, 0.53, 0.44, 0.39, 0.34, 0.3, 0.24, 0.2, 0.16], 
  [ 0.84, 0.79, 0.76, 0.71, 0.65, 0.53, 0.45, 0.19, 0.17, 0.13, 0.1, 0.08], 
  [ 0.97, 0.94, 0.91, 0.86, 0.8, 0.66, 0.54, 0.08, 0.07, 0.05, 0.04, 0.03] ], 
[ [ 1.06, 1.03, 1, 0.95, 0.89, 0.73, 0.61, 0.17, 0.14, 0.1, 0.07, 0.05],   //秋田
  [ 0.92, 0.89, 0.85, 0.79, 0.71, 0.58, 0.51, 0.41, 0.37, 0.29, 0.22, 0.18], 
  [ 0.98, 0.94, 0.91, 0.85, 0.78, 0.64, 0.54, 0.28, 0.25, 0.18, 0.14, 0.1], 
  [ 1.05, 1.01, 0.98, 0.94, 0.88, 0.73, 0.61, 0.11, 0.09, 0.06, 0.04, 0.03] ], 
[ [ 1.13, 1.11, 1.08, 1.02, 0.95, 0.79, 0.66, 0.15, 0.12, 0.09, 0.07, 0.05],   //山形
  [ 0.9, 0.87, 0.82, 0.75, 0.68, 0.56, 0.5, 0.54, 0.49, 0.39, 0.31, 0.26], 
  [ 1.01, 0.98, 0.94, 0.87, 0.79, 0.65, 0.55, 0.33, 0.29, 0.22, 0.18, 0.14], 
  [ 1.11, 1.09, 1.06, 1.01, 0.94, 0.79, 0.66, 0.09, 0.07, 0.05, 0.04, 0.03] ], 
[ [ 1.01, 0.98, 0.94, 0.89, 0.82, 0.68, 0.57, 0.17, 0.15, 0.11, 0.09, 0.07],   //福島
  [ 0.69, 0.67, 0.63, 0.58, 0.52, 0.44, 0.4, 0.56, 0.52, 0.42, 0.35, 0.29], 
  [ 0.81, 0.78, 0.74, 0.69, 0.63, 0.51, 0.45, 0.35, 0.31, 0.25, 0.2, 0.16], 
  [ 0.97, 0.95, 0.91, 0.86, 0.8, 0.66, 0.55, 0.12, 0.1, 0.07, 0.06, 0.04] ], 
[ [ 0.98, 0.96, 0.95, 0.89, 0.81, 0.66, 0.55, 0.18, 0.16, 0.13, 0.11, 0.08],   //水戸
  [ 0.44, 0.42, 0.41, 0.38, 0.35, 0.3, 0.28, 0.47, 0.43, 0.37, 0.32, 0.26], 
  [ 0.61, 0.59, 0.58, 0.54, 0.49, 0.41, 0.36, 0.26, 0.24, 0.19, 0.16, 0.13], 
  [ 0.95, 0.92, 0.91, 0.86, 0.79, 0.65, 0.54, 0.1, 0.09, 0.07, 0.06, 0.04] ], 
[ [ 1.02, 1, 0.97, 0.91, 0.83, 0.67, 0.56, 0.18, 0.16, 0.13, 0.1, 0.08],   //宇都宮
  [ 0.48, 0.46, 0.44, 0.41, 0.37, 0.32, 0.3, 0.54, 0.5, 0.44, 0.38, 0.31], 
  [ 0.64, 0.62, 0.6, 0.55, 0.5, 0.42, 0.37, 0.32, 0.31, 0.27, 0.22, 0.18], 
  [ 0.97, 0.95, 0.93, 0.88, 0.81, 0.65, 0.54, 0.11, 0.1, 0.08, 0.06, 0.05] ], 
[ [ 0.9, 0.88, 0.84, 0.78, 0.71, 0.58, 0.49, 0.22, 0.2, 0.17, 0.13, 0.1],   //前橋
  [ 0.45, 0.44, 0.41, 0.38, 0.34, 0.3, 0.29, 0.63, 0.59, 0.52, 0.44, 0.37], 
  [ 0.63, 0.62, 0.59, 0.55, 0.5, 0.41, 0.37, 0.44, 0.42, 0.38, 0.31, 0.26], 
  [ 0.89, 0.86, 0.83, 0.78, 0.71, 0.58, 0.49, 0.15, 0.14, 0.12, 0.09, 0.07] ], 
[ [ 0.91, 0.91, 0.88, 0.82, 0.74, 0.6, 0.51, 0.23, 0.21, 0.18, 0.14, 0.11],   //さいたま
  [ 0.44, 0.43, 0.4, 0.37, 0.34, 0.3, 0.28, 0.63, 0.59, 0.53, 0.45, 0.38], 
  [ 0.55, 0.56, 0.53, 0.49, 0.44, 0.37, 0.34, 0.42, 0.4, 0.36, 0.3, 0.24], 
  [ 0.86, 0.85, 0.82, 0.77, 0.7, 0.57, 0.48, 0.16, 0.15, 0.13, 0.1, 0.08] ], 
[ [ 0.68, 0.66, 0.64, 0.59, 0.54, 0.44, 0.39, 0.27, 0.24, 0.21, 0.18, 0.14],   //千葉
  [ 0.39, 0.37, 0.35, 0.33, 0.3, 0.26, 0.25, 0.53, 0.49, 0.44, 0.38, 0.31], 
  [ 0.45, 0.43, 0.42, 0.39, 0.35, 0.3, 0.28, 0.36, 0.33, 0.29, 0.25, 0.2], 
  [ 0.63, 0.61, 0.59, 0.55, 0.5, 0.41, 0.36, 0.21, 0.19, 0.16, 0.13, 0.1] ], 
[ [ 0.64, 0.63, 0.6, 0.55, 0.5, 0.41, 0.37, 0.31, 0.28, 0.25, 0.21, 0.16],   //東京
  [ 0.39, 0.37, 0.35, 0.32, 0.29, 0.26, 0.25, 0.62, 0.57, 0.52, 0.45, 0.37], 
  [ 0.42, 0.4, 0.39, 0.36, 0.33, 0.28, 0.26, 0.43, 0.4, 0.37, 0.32, 0.26], 
  [ 0.58, 0.56, 0.54, 0.5, 0.46, 0.38, 0.34, 0.25, 0.23, 0.21, 0.17, 0.13] ], 
[ [ 0.67, 0.65, 0.62, 0.58, 0.53, 0.43, 0.38, 0.26, 0.24, 0.2, 0.17, 0.13],   //横浜
  [ 0.39, 0.37, 0.36, 0.33, 0.3, 0.27, 0.25, 0.53, 0.5, 0.44, 0.38, 0.31], 
  [ 0.45, 0.43, 0.41, 0.38, 0.35, 0.3, 0.27, 0.33, 0.31, 0.28, 0.23, 0.19], 
  [ 0.61, 0.59, 0.57, 0.53, 0.48, 0.4, 0.35, 0.2, 0.18, 0.16, 0.13, 0.1] ], 
[ [ 0.84, 0.83, 0.79, 0.74, 0.68, 0.56, 0.48, 0.29, 0.25, 0.19, 0.14, 0.11],   //新潟
  [ 0.72, 0.67, 0.63, 0.58, 0.52, 0.43, 0.4, 0.6, 0.53, 0.43, 0.34, 0.27], 
  [ 0.77, 0.72, 0.68, 0.63, 0.58, 0.47, 0.42, 0.4, 0.35, 0.27, 0.21, 0.16], 
  [ 0.83, 0.81, 0.77, 0.73, 0.67, 0.56, 0.47, 0.22, 0.19, 0.14, 0.1, 0.08] ], 
[ [ 0.9, 0.86, 0.82, 0.76, 0.69, 0.57, 0.49, 0.34, 0.29, 0.22, 0.17, 0.14],   //富山
  [ 0.68, 0.64, 0.59, 0.54, 0.48, 0.41, 0.38, 0.66, 0.59, 0.48, 0.39, 0.31], 
  [ 0.78, 0.74, 0.69, 0.63, 0.57, 0.47, 0.42, 0.41, 0.36, 0.28, 0.23, 0.18], 
  [ 0.9, 0.85, 0.81, 0.76, 0.7, 0.58, 0.49, 0.22, 0.18, 0.13, 0.1, 0.08] ], 
[ [ 0.79, 0.76, 0.72, 0.67, 0.61, 0.5, 0.44, 0.33, 0.3, 0.23, 0.18, 0.14],   //金沢
  [ 0.64, 0.59, 0.54, 0.5, 0.44, 0.38, 0.35, 0.63, 0.58, 0.47, 0.39, 0.31], 
  [ 0.68, 0.64, 0.6, 0.56, 0.51, 0.42, 0.38, 0.45, 0.41, 0.33, 0.26, 0.21], 
  [ 0.78, 0.74, 0.7, 0.66, 0.61, 0.51, 0.43, 0.25, 0.22, 0.17, 0.13, 0.1] ], 
[ [ 0.88, 0.86, 0.81, 0.77, 0.7, 0.58, 0.5, 0.3, 0.27, 0.21, 0.16, 0.12],   //福井
  [ 0.66, 0.61, 0.57, 0.51, 0.46, 0.39, 0.37, 0.71, 0.66, 0.55, 0.46, 0.37], 
  [ 0.73, 0.68, 0.63, 0.58, 0.52, 0.43, 0.39, 0.48, 0.45, 0.37, 0.3, 0.24], 
  [ 0.85, 0.82, 0.78, 0.73, 0.67, 0.56, 0.48, 0.23, 0.21, 0.16, 0.12, 0.09] ], 
[ [ 1.07, 1.04, 0.99, 0.92, 0.83, 0.66, 0.56, 0.18, 0.16, 0.14, 0.11, 0.09],   //甲府
  [ 0.54, 0.51, 0.46, 0.42, 0.37, 0.33, 0.31, 0.67, 0.61, 0.57, 0.48, 0.41], 
  [ 0.63, 0.6, 0.55, 0.5, 0.45, 0.37, 0.34, 0.37, 0.35, 0.33, 0.28, 0.23], 
  [ 0.96, 0.92, 0.88, 0.81, 0.74, 0.6, 0.5, 0.15, 0.13, 0.11, 0.09, 0.07] ], 
[ [ 1.2, 1.18, 1.15, 1.1, 1.02, 0.84, 0.7, 0.14, 0.12, 0.09, 0.07, 0.05],   //長野
  [ 0.88, 0.84, 0.81, 0.74, 0.66, 0.54, 0.49, 0.57, 0.51, 0.43, 0.35, 0.29], 
  [ 0.99, 0.96, 0.93, 0.86, 0.79, 0.64, 0.55, 0.31, 0.26, 0.21, 0.16, 0.13], 
  [ 1.16, 1.14, 1.11, 1.06, 0.99, 0.82, 0.68, 0.09, 0.07, 0.05, 0.04, 0.03] ], 
[ [ 0.83, 0.8, 0.76, 0.71, 0.64, 0.52, 0.45, 0.31, 0.28, 0.24, 0.19, 0.15],   //岐阜
  [ 0.48, 0.45, 0.41, 0.38, 0.33, 0.29, 0.28, 0.73, 0.7, 0.63, 0.55, 0.46], 
  [ 0.59, 0.56, 0.52, 0.48, 0.43, 0.35, 0.33, 0.54, 0.5, 0.45, 0.38, 0.31], 
  [ 0.78, 0.75, 0.71, 0.66, 0.6, 0.49, 0.43, 0.27, 0.25, 0.21, 0.17, 0.13] ], 
[ [ 0.67, 0.63, 0.6, 0.56, 0.5, 0.41, 0.37, 0.27, 0.25, 0.23, 0.19, 0.15],   //静岡
  [ 0.33, 0.3, 0.28, 0.26, 0.23, 0.21, 0.2, 0.52, 0.5, 0.47, 0.42, 0.35], 
  [ 0.42, 0.4, 0.37, 0.35, 0.31, 0.27, 0.25, 0.37, 0.35, 0.33, 0.29, 0.23], 
  [ 0.64, 0.6, 0.57, 0.53, 0.48, 0.4, 0.35, 0.2, 0.19, 0.17, 0.14, 0.11] ], 
[ [ 0.83, 0.79, 0.75, 0.7, 0.63, 0.51, 0.45, 0.3, 0.28, 0.24, 0.2, 0.15],   //名古屋
  [ 0.46, 0.44, 0.41, 0.37, 0.33, 0.29, 0.28, 0.7, 0.67, 0.61, 0.53, 0.44], 
  [ 0.58, 0.55, 0.51, 0.47, 0.42, 0.35, 0.33, 0.48, 0.46, 0.41, 0.35, 0.28], 
  [ 0.77, 0.74, 0.7, 0.65, 0.6, 0.48, 0.42, 0.24, 0.23, 0.19, 0.15, 0.12] ], 
[ [ 0.69, 0.66, 0.63, 0.59, 0.54, 0.44, 0.39, 0.32, 0.29, 0.25, 0.2, 0.16],   //津
  [ 0.43, 0.41, 0.39, 0.36, 0.32, 0.27, 0.26, 0.61, 0.57, 0.51, 0.44, 0.36], 
  [ 0.53, 0.5, 0.47, 0.44, 0.39, 0.33, 0.31, 0.5, 0.46, 0.42, 0.36, 0.29], 
  [ 0.68, 0.66, 0.62, 0.58, 0.53, 0.43, 0.38, 0.27, 0.25, 0.22, 0.18, 0.14] ], 
[ [ 0.84, 0.8, 0.77, 0.72, 0.66, 0.54, 0.46, 0.28, 0.25, 0.2, 0.16, 0.12],   //彦根
  [ 0.58, 0.56, 0.53, 0.49, 0.44, 0.36, 0.34, 0.62, 0.58, 0.5, 0.42, 0.33], 
  [ 0.64, 0.62, 0.58, 0.54, 0.49, 0.4, 0.36, 0.46, 0.43, 0.36, 0.3, 0.24], 
  [ 0.79, 0.77, 0.73, 0.68, 0.63, 0.52, 0.44, 0.23, 0.21, 0.16, 0.13, 0.1] ], 
[ [ 0.8, 0.77, 0.73, 0.68, 0.62, 0.51, 0.45, 0.31, 0.29, 0.24, 0.2, 0.15],   //京都
  [ 0.47, 0.45, 0.41, 0.38, 0.34, 0.3, 0.29, 0.76, 0.73, 0.65, 0.57, 0.48], 
  [ 0.56, 0.53, 0.5, 0.46, 0.41, 0.35, 0.33, 0.58, 0.55, 0.49, 0.42, 0.35], 
  [ 0.75, 0.72, 0.68, 0.64, 0.58, 0.48, 0.42, 0.27, 0.26, 0.21, 0.17, 0.13] ], 
[ [ 0.66, 0.62, 0.59, 0.55, 0.5, 0.41, 0.37, 0.39, 0.36, 0.31, 0.26, 0.2],   //大阪
  [ 0.43, 0.39, 0.37, 0.34, 0.3, 0.27, 0.26, 0.79, 0.75, 0.67, 0.59, 0.49], 
  [ 0.47, 0.45, 0.42, 0.39, 0.35, 0.3, 0.29, 0.57, 0.55, 0.49, 0.43, 0.35], 
  [ 0.62, 0.58, 0.55, 0.51, 0.47, 0.39, 0.35, 0.34, 0.32, 0.27, 0.23, 0.18] ], 
[ [ 0.69, 0.65, 0.6, 0.56, 0.5, 0.42, 0.38, 0.34, 0.33, 0.28, 0.23, 0.18],   //神戸
  [ 0.45, 0.42, 0.39, 0.36, 0.32, 0.28, 0.27, 0.65, 0.63, 0.55, 0.48, 0.39], 
  [ 0.53, 0.5, 0.46, 0.43, 0.38, 0.32, 0.31, 0.46, 0.44, 0.4, 0.34, 0.28], 
  [ 0.68, 0.63, 0.59, 0.55, 0.5, 0.41, 0.37, 0.29, 0.28, 0.24, 0.2, 0.16] ], 
[ [ 0.86, 0.83, 0.79, 0.75, 0.69, 0.57, 0.49, 0.24, 0.23, 0.19, 0.15, 0.12],   //奈良
  [ 0.49, 0.46, 0.43, 0.39, 0.35, 0.31, 0.29, 0.7, 0.67, 0.59, 0.5, 0.42], 
  [ 0.63, 0.6, 0.55, 0.52, 0.47, 0.39, 0.36, 0.45, 0.43, 0.38, 0.31, 0.26], 
  [ 0.84, 0.81, 0.78, 0.73, 0.68, 0.56, 0.48, 0.16, 0.14, 0.12, 0.09, 0.07] ], 
[ [ 0.7, 0.66, 0.63, 0.58, 0.53, 0.44, 0.39, 0.32, 0.31, 0.26, 0.22, 0.17],   //和歌山
  [ 0.43, 0.4, 0.36, 0.33, 0.29, 0.26, 0.26, 0.68, 0.65, 0.59, 0.52, 0.43], 
  [ 0.48, 0.45, 0.41, 0.38, 0.34, 0.29, 0.28, 0.47, 0.45, 0.41, 0.36, 0.3], 
  [ 0.65, 0.62, 0.58, 0.54, 0.49, 0.41, 0.36, 0.29, 0.27, 0.24, 0.2, 0.16] ], 
[ [ 0.82, 0.78, 0.74, 0.68, 0.63, 0.52, 0.46, 0.31, 0.27, 0.22, 0.17, 0.13],   //鳥取
  [ 0.57, 0.53, 0.49, 0.44, 0.39, 0.34, 0.33, 0.7, 0.66, 0.55, 0.46, 0.38], 
  [ 0.66, 0.62, 0.58, 0.53, 0.48, 0.4, 0.36, 0.45, 0.42, 0.34, 0.28, 0.22], 
  [ 0.81, 0.78, 0.72, 0.68, 0.63, 0.53, 0.45, 0.21, 0.19, 0.14, 0.11, 0.09] ], 
[ [ 0.79, 0.75, 0.7, 0.65, 0.6, 0.5, 0.43, 0.3, 0.27, 0.21, 0.16, 0.13],   //松江
  [ 0.56, 0.51, 0.47, 0.43, 0.38, 0.33, 0.31, 0.63, 0.58, 0.48, 0.4, 0.32], 
  [ 0.64, 0.6, 0.55, 0.51, 0.46, 0.38, 0.34, 0.38, 0.35, 0.29, 0.23, 0.18], 
  [ 0.76, 0.73, 0.68, 0.63, 0.59, 0.49, 0.42, 0.21, 0.19, 0.15, 0.11, 0.09] ], 
[ [ 0.83, 0.78, 0.74, 0.69, 0.63, 0.52, 0.45, 0.32, 0.3, 0.25, 0.2, 0.15],   //岡山
  [ 0.44, 0.42, 0.39, 0.35, 0.32, 0.28, 0.27, 0.76, 0.71, 0.63, 0.54, 0.45], 
  [ 0.51, 0.49, 0.45, 0.41, 0.37, 0.31, 0.3, 0.62, 0.58, 0.52, 0.44, 0.36], 
  [ 0.75, 0.71, 0.66, 0.62, 0.56, 0.46, 0.41, 0.31, 0.29, 0.24, 0.2, 0.15] ], 
[ [ 0.79, 0.74, 0.71, 0.66, 0.6, 0.5, 0.43, 0.3, 0.28, 0.23, 0.19, 0.14],   //広島
  [ 0.44, 0.41, 0.38, 0.35, 0.31, 0.27, 0.26, 0.71, 0.67, 0.59, 0.51, 0.43], 
  [ 0.5, 0.47, 0.43, 0.39, 0.35, 0.3, 0.29, 0.57, 0.54, 0.48, 0.41, 0.34], 
  [ 0.72, 0.68, 0.64, 0.59, 0.54, 0.45, 0.39, 0.3, 0.29, 0.24, 0.2, 0.15] ], 
[ [ 0.86, 0.81, 0.78, 0.74, 0.67, 0.56, 0.48, 0.25, 0.23, 0.19, 0.15, 0.12],   //山口
  [ 0.47, 0.44, 0.4, 0.36, 0.32, 0.28, 0.27, 0.68, 0.64, 0.56, 0.48, 0.41], 
  [ 0.58, 0.54, 0.49, 0.45, 0.4, 0.34, 0.32, 0.48, 0.45, 0.39, 0.33, 0.27], 
  [ 0.81, 0.77, 0.73, 0.68, 0.62, 0.52, 0.45, 0.2, 0.2, 0.16, 0.12, 0.1] ], 
[ [ 0.68, 0.63, 0.59, 0.55, 0.5, 0.41, 0.37, 0.31, 0.29, 0.25, 0.21, 0.16],   //徳島
  [ 0.41, 0.38, 0.35, 0.32, 0.29, 0.26, 0.25, 0.65, 0.62, 0.55, 0.47, 0.39], 
  [ 0.49, 0.45, 0.42, 0.39, 0.35, 0.3, 0.28, 0.48, 0.46, 0.41, 0.35, 0.28], 
  [ 0.64, 0.61, 0.57, 0.53, 0.48, 0.4, 0.35, 0.26, 0.25, 0.22, 0.18, 0.14] ], 
[ [ 0.71, 0.67, 0.64, 0.6, 0.55, 0.45, 0.4, 0.34, 0.31, 0.27, 0.22, 0.17],   //高松
  [ 0.42, 0.39, 0.36, 0.33, 0.29, 0.26, 0.25, 0.72, 0.68, 0.61, 0.53, 0.44], 
  [ 0.5, 0.47, 0.43, 0.4, 0.36, 0.31, 0.29, 0.6, 0.57, 0.5, 0.43, 0.35], 
  [ 0.68, 0.65, 0.61, 0.57, 0.52, 0.43, 0.38, 0.29, 0.28, 0.23, 0.19, 0.15] ], 
[ [ 0.69, 0.65, 0.61, 0.56, 0.51, 0.43, 0.38, 0.31, 0.29, 0.25, 0.21, 0.16],   //松山
  [ 0.42, 0.38, 0.35, 0.32, 0.28, 0.25, 0.24, 0.69, 0.64, 0.58, 0.51, 0.42], 
  [ 0.48, 0.45, 0.41, 0.38, 0.34, 0.29, 0.28, 0.53, 0.5, 0.45, 0.38, 0.31], 
  [ 0.66, 0.62, 0.58, 0.54, 0.5, 0.41, 0.36, 0.26, 0.24, 0.21, 0.17, 0.13] ], 
[ [ 0.75, 0.71, 0.66, 0.6, 0.54, 0.45, 0.4, 0.28, 0.27, 0.24, 0.2, 0.16],   //高知
  [ 0.33, 0.3, 0.27, 0.24, 0.21, 0.21, 0.2, 0.62, 0.61, 0.56, 0.5, 0.43], 
  [ 0.43, 0.41, 0.37, 0.34, 0.3, 0.26, 0.26, 0.42, 0.41, 0.38, 0.34, 0.28], 
  [ 0.69, 0.65, 0.6, 0.55, 0.5, 0.42, 0.37, 0.23, 0.22, 0.19, 0.16, 0.12] ], 
[ [ 0.61, 0.56, 0.52, 0.49, 0.44, 0.37, 0.33, 0.34, 0.32, 0.27, 0.23, 0.18],   //福岡
  [ 0.43, 0.39, 0.35, 0.31, 0.28, 0.25, 0.24, 0.68, 0.64, 0.56, 0.48, 0.41], 
  [ 0.46, 0.42, 0.38, 0.35, 0.32, 0.27, 0.26, 0.51, 0.47, 0.41, 0.35, 0.28], 
  [ 0.57, 0.53, 0.49, 0.46, 0.42, 0.35, 0.31, 0.32, 0.3, 0.25, 0.21, 0.16] ], 
[ [ 0.76, 0.72, 0.68, 0.63, 0.57, 0.47, 0.42, 0.28, 0.27, 0.22, 0.18, 0.14],   //佐賀
  [ 0.44, 0.4, 0.36, 0.32, 0.28, 0.26, 0.25, 0.72, 0.69, 0.59, 0.52, 0.45], 
  [ 0.49, 0.45, 0.41, 0.37, 0.33, 0.29, 0.28, 0.57, 0.53, 0.46, 0.39, 0.33], 
  [ 0.7, 0.66, 0.62, 0.57, 0.52, 0.43, 0.38, 0.26, 0.25, 0.21, 0.17, 0.13] ], 
[ [ 0.58, 0.54, 0.5, 0.47, 0.42, 0.36, 0.32, 0.31, 0.3, 0.26, 0.21, 0.17],   //長崎
  [ 0.4, 0.37, 0.32, 0.29, 0.26, 0.24, 0.23, 0.6, 0.59, 0.51, 0.45, 0.38], 
  [ 0.45, 0.41, 0.37, 0.34, 0.3, 0.26, 0.25, 0.47, 0.45, 0.4, 0.34, 0.28], 
  [ 0.56, 0.52, 0.48, 0.44, 0.4, 0.34, 0.31, 0.29, 0.28, 0.24, 0.2, 0.16] ], 
[ [ 0.79, 0.75, 0.7, 0.65, 0.58, 0.48, 0.43, 0.3, 0.29, 0.24, 0.2, 0.16],   //熊本
  [ 0.41, 0.38, 0.33, 0.3, 0.26, 0.25, 0.24, 0.76, 0.73, 0.64, 0.57, 0.49], 
  [ 0.48, 0.44, 0.39, 0.35, 0.31, 0.28, 0.27, 0.54, 0.53, 0.47, 0.42, 0.35], 
  [ 0.71, 0.66, 0.62, 0.57, 0.52, 0.43, 0.39, 0.26, 0.26, 0.23, 0.19, 0.15] ], 
[ [ 0.68, 0.65, 0.61, 0.57, 0.52, 0.43, 0.38, 0.25, 0.24, 0.21, 0.17, 0.14],   //大分
  [ 0.38, 0.35, 0.32, 0.29, 0.26, 0.24, 0.23, 0.64, 0.6, 0.54, 0.47, 0.39], 
  [ 0.45, 0.42, 0.38, 0.35, 0.32, 0.27, 0.26, 0.46, 0.44, 0.39, 0.33, 0.27], 
  [ 0.64, 0.61, 0.56, 0.53, 0.48, 0.4, 0.35, 0.22, 0.22, 0.19, 0.15, 0.12] ], 
[ [ 0.64, 0.61, 0.57, 0.52, 0.47, 0.4, 0.37, 0.29, 0.28, 0.26, 0.22, 0.18],   //宮崎
  [ 0.29, 0.26, 0.23, 0.2, 0.18, 0.18, 0.18, 0.62, 0.61, 0.58, 0.52, 0.44], 
  [ 0.36, 0.33, 0.3, 0.27, 0.24, 0.23, 0.22, 0.46, 0.45, 0.43, 0.38, 0.32], 
  [ 0.58, 0.54, 0.51, 0.47, 0.42, 0.36, 0.33, 0.24, 0.24, 0.22, 0.19, 0.15] ], 
[ [ 0.54, 0.51, 0.46, 0.42, 0.37, 0.33, 0.31, 0.36, 0.34, 0.31, 0.28, 0.22],   //鹿児島
  [ 0.31, 0.28, 0.23, 0.2, 0.18, 0.19, 0.19, 0.69, 0.66, 0.61, 0.56, 0.48], 
  [ 0.36, 0.33, 0.29, 0.26, 0.22, 0.21, 0.21, 0.53, 0.51, 0.48, 0.44, 0.37], 
  [ 0.52, 0.48, 0.43, 0.39, 0.35, 0.31, 0.29, 0.33, 0.32, 0.29, 0.26, 0.21] ], 
[ [ 0.11, 0.07, 0.06, 0.05, 0.04, 0.08, 0.08, 0.39, 0.38, 0.38, 0.36, 0.33],   //那覇
  [ 0.08, 0.03, 0.02, 0.02, 0.02, 0.06, 0.06, 0.61, 0.59, 0.58, 0.56, 0.51], 
  [ 0.09, 0.05, 0.03, 0.03, 0.02, 0.06, 0.06, 0.46, 0.45, 0.44, 0.43, 0.39], 
  [ 0.11, 0.07, 0.06, 0.05, 0.04, 0.08, 0.08, 0.35, 0.35, 0.34, 0.33, 0.3] ] ],

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
﻿/*  2017/12/16  version 1.0
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
 
D6.acload = {

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
//アメダス10分間データを元に算出:暖房負荷
//
//	配列は　  [朝、昼、夕、夜]の係数で、
//	それぞれ　[暖房半月、暖房1ヶ月、暖房2ヶ月、暖房3ヶ月、暖房4ヶ月、暖房6ヶ月、暖房8ヶ月、
//				冷房半月、冷房1ヶ月、冷房2ヶ月、冷房3ヶ月、冷房4ヶ月]
//	の規定温度における消費量に対する割合を示す。
//
// Unit.setArea()で　該当する地域について　heatFactor_mon　にコピーをして利用
//

factorPrefTimeMonth: [
[ [ 0.66, 0.63, 0.6, 0.57, 0.52, 0.52, 0.44, 0.48, 0.48, 0.39, 0.33, 0.26],   //神戸
  [ 0.5, 0.47, 0.44, 0.41, 0.36, 0.31, 0.31, 0.78, 0.76, 0.69, 0.61, 0.51], 
  [ 0.56, 0.53, 0.5, 0.47, 0.42, 0.36, 0.34, 0.62, 0.6, 0.54, 0.47, 0.38], 
  [ 0.65, 0.62, 0.59, 0.56, 0.52, 0.43, 0.39, 0.41, 0.4, 0.34, 0.29, 0.22] ], 

[ [ 1.06, 1.05, 1.03, 1, 0.95, 0.95, 0.82, 0.09, 0.09, 0.05, 0.03, 0.02],   //札幌
  [ 0.93, 0.92, 0.9, 0.87, 0.83, 0.7, 0.59, 0.27, 0.23, 0.18, 0.14, 0.11], 
  [ 0.99, 0.98, 0.96, 0.93, 0.88, 0.76, 0.64, 0.14, 0.11, 0.07, 0.05, 0.04], 
  [ 1.05, 1.04, 1.02, 0.99, 0.95, 0.83, 0.7, 0.04, 0.03, 0.02, 0.01, 0.01] ], 
[ [ 0.93, 0.92, 0.89, 0.86, 0.83, 0.83, 0.71, 0.15, 0.15, 0.09, 0.06, 0.05],   //青森
  [ 0.83, 0.81, 0.79, 0.76, 0.71, 0.6, 0.52, 0.34, 0.31, 0.24, 0.18, 0.14], 
  [ 0.88, 0.86, 0.85, 0.82, 0.77, 0.66, 0.56, 0.22, 0.19, 0.13, 0.09, 0.07], 
  [ 0.93, 0.91, 0.89, 0.87, 0.83, 0.73, 0.62, 0.08, 0.06, 0.04, 0.03, 0.02] ], 
[ [ 1.01, 0.99, 0.97, 0.93, 0.89, 0.89, 0.77, 0.13, 0.13, 0.07, 0.05, 0.03],   //盛岡
  [ 0.82, 0.8, 0.78, 0.75, 0.7, 0.59, 0.52, 0.45, 0.41, 0.32, 0.26, 0.21], 
  [ 0.9, 0.88, 0.86, 0.82, 0.78, 0.67, 0.57, 0.28, 0.24, 0.18, 0.14, 0.11], 
  [ 0.99, 0.97, 0.95, 0.92, 0.88, 0.78, 0.66, 0.06, 0.05, 0.03, 0.02, 0.02] ], 
[ [ 0.82, 0.8, 0.78, 0.75, 0.71, 0.71, 0.61, 0.21, 0.21, 0.13, 0.1, 0.08],   //仙台
  [ 0.66, 0.63, 0.61, 0.58, 0.54, 0.45, 0.41, 0.44, 0.4, 0.32, 0.26, 0.21], 
  [ 0.74, 0.71, 0.69, 0.66, 0.62, 0.52, 0.45, 0.27, 0.23, 0.18, 0.14, 0.11], 
  [ 0.81, 0.79, 0.78, 0.75, 0.71, 0.61, 0.52, 0.12, 0.09, 0.07, 0.05, 0.04] ], 
[ [ 0.87, 0.85, 0.83, 0.8, 0.77, 0.77, 0.66, 0.24, 0.24, 0.14, 0.1, 0.08],   //秋田
  [ 0.79, 0.77, 0.74, 0.71, 0.66, 0.55, 0.49, 0.52, 0.48, 0.38, 0.3, 0.24], 
  [ 0.82, 0.8, 0.78, 0.74, 0.7, 0.6, 0.51, 0.38, 0.34, 0.25, 0.19, 0.14], 
  [ 0.86, 0.84, 0.82, 0.8, 0.76, 0.66, 0.56, 0.16, 0.13, 0.09, 0.06, 0.05] ], 
[ [ 0.91, 0.9, 0.88, 0.84, 0.81, 0.81, 0.7, 0.21, 0.21, 0.12, 0.09, 0.07],   //山形
  [ 0.77, 0.76, 0.73, 0.68, 0.63, 0.53, 0.49, 0.65, 0.59, 0.49, 0.4, 0.33], 
  [ 0.84, 0.82, 0.79, 0.76, 0.71, 0.6, 0.52, 0.44, 0.39, 0.3, 0.24, 0.19], 
  [ 0.9, 0.88, 0.87, 0.84, 0.8, 0.7, 0.59, 0.12, 0.1, 0.07, 0.05, 0.04] ], 
[ [ 0.83, 0.82, 0.8, 0.77, 0.73, 0.73, 0.63, 0.24, 0.24, 0.16, 0.12, 0.1],   //福島
  [ 0.66, 0.64, 0.61, 0.57, 0.53, 0.45, 0.42, 0.65, 0.62, 0.51, 0.43, 0.37], 
  [ 0.73, 0.71, 0.68, 0.65, 0.61, 0.51, 0.45, 0.45, 0.41, 0.33, 0.27, 0.22], 
  [ 0.81, 0.8, 0.78, 0.75, 0.71, 0.62, 0.52, 0.17, 0.14, 0.1, 0.08, 0.06] ], 
[ [ 0.82, 0.81, 0.8, 0.77, 0.72, 0.72, 0.6, 0.25, 0.25, 0.19, 0.15, 0.12],   //水戸
  [ 0.49, 0.47, 0.46, 0.42, 0.39, 0.34, 0.31, 0.59, 0.54, 0.47, 0.4, 0.33], 
  [ 0.62, 0.59, 0.58, 0.55, 0.52, 0.43, 0.38, 0.35, 0.32, 0.27, 0.22, 0.18], 
  [ 0.8, 0.79, 0.78, 0.75, 0.71, 0.6, 0.51, 0.14, 0.13, 0.1, 0.08, 0.06] ], 
[ [ 0.84, 0.83, 0.81, 0.78, 0.73, 0.73, 0.61, 0.25, 0.25, 0.18, 0.14, 0.11],   //宇都宮
  [ 0.52, 0.5, 0.48, 0.45, 0.41, 0.35, 0.33, 0.65, 0.62, 0.55, 0.48, 0.4], 
  [ 0.63, 0.62, 0.6, 0.56, 0.52, 0.44, 0.39, 0.43, 0.41, 0.36, 0.3, 0.24], 
  [ 0.81, 0.8, 0.79, 0.76, 0.71, 0.61, 0.51, 0.15, 0.14, 0.11, 0.09, 0.07] ], 
[ [ 0.78, 0.76, 0.74, 0.7, 0.66, 0.66, 0.55, 0.3, 0.3, 0.23, 0.18, 0.14],   //前橋
  [ 0.49, 0.48, 0.46, 0.42, 0.39, 0.34, 0.32, 0.72, 0.69, 0.62, 0.54, 0.46], 
  [ 0.63, 0.61, 0.59, 0.56, 0.52, 0.44, 0.4, 0.55, 0.54, 0.48, 0.4, 0.33], 
  [ 0.77, 0.75, 0.73, 0.7, 0.66, 0.56, 0.47, 0.21, 0.2, 0.17, 0.13, 0.1] ], 
[ [ 0.78, 0.78, 0.76, 0.73, 0.68, 0.68, 0.57, 0.33, 0.33, 0.25, 0.2, 0.15],   //さいたま
  [ 0.48, 0.47, 0.45, 0.42, 0.38, 0.34, 0.32, 0.74, 0.69, 0.63, 0.55, 0.46], 
  [ 0.58, 0.57, 0.55, 0.52, 0.48, 0.4, 0.37, 0.55, 0.52, 0.47, 0.4, 0.32], 
  [ 0.75, 0.75, 0.73, 0.7, 0.65, 0.55, 0.47, 0.23, 0.21, 0.18, 0.14, 0.11] ], 
[ [ 0.66, 0.64, 0.62, 0.59, 0.55, 0.55, 0.46, 0.39, 0.39, 0.3, 0.25, 0.2],   //千葉
  [ 0.44, 0.42, 0.4, 0.37, 0.34, 0.3, 0.28, 0.68, 0.64, 0.57, 0.5, 0.42], 
  [ 0.5, 0.48, 0.46, 0.43, 0.4, 0.34, 0.31, 0.5, 0.47, 0.41, 0.35, 0.28], 
  [ 0.62, 0.61, 0.59, 0.56, 0.52, 0.44, 0.38, 0.29, 0.27, 0.23, 0.19, 0.15] ], 
[ [ 0.63, 0.62, 0.6, 0.57, 0.53, 0.53, 0.44, 0.43, 0.43, 0.35, 0.28, 0.23],   //東京
  [ 0.44, 0.42, 0.4, 0.37, 0.34, 0.3, 0.29, 0.75, 0.7, 0.63, 0.56, 0.47], 
  [ 0.48, 0.45, 0.44, 0.41, 0.37, 0.32, 0.3, 0.58, 0.54, 0.5, 0.43, 0.35], 
  [ 0.6, 0.58, 0.56, 0.53, 0.5, 0.41, 0.37, 0.36, 0.33, 0.3, 0.24, 0.19] ], 
[ [ 0.65, 0.64, 0.62, 0.59, 0.54, 0.54, 0.45, 0.37, 0.37, 0.29, 0.24, 0.19],   //横浜
  [ 0.45, 0.42, 0.41, 0.38, 0.34, 0.3, 0.29, 0.67, 0.63, 0.57, 0.5, 0.41], 
  [ 0.5, 0.48, 0.46, 0.43, 0.4, 0.33, 0.31, 0.46, 0.43, 0.39, 0.33, 0.26], 
  [ 0.62, 0.6, 0.58, 0.55, 0.51, 0.43, 0.37, 0.28, 0.26, 0.22, 0.18, 0.14] ], 
[ [ 0.75, 0.74, 0.72, 0.69, 0.65, 0.65, 0.55, 0.4, 0.4, 0.26, 0.2, 0.15],   //新潟
  [ 0.68, 0.64, 0.61, 0.58, 0.53, 0.45, 0.41, 0.72, 0.65, 0.54, 0.43, 0.35], 
  [ 0.71, 0.68, 0.65, 0.62, 0.58, 0.48, 0.43, 0.53, 0.47, 0.37, 0.28, 0.22], 
  [ 0.74, 0.73, 0.71, 0.68, 0.64, 0.55, 0.47, 0.31, 0.27, 0.19, 0.14, 0.11] ], 
[ [ 0.78, 0.75, 0.73, 0.69, 0.65, 0.65, 0.55, 0.45, 0.45, 0.3, 0.24, 0.18],   //富山
  [ 0.65, 0.62, 0.59, 0.54, 0.49, 0.42, 0.39, 0.76, 0.7, 0.58, 0.48, 0.39], 
  [ 0.71, 0.68, 0.65, 0.62, 0.57, 0.48, 0.42, 0.55, 0.49, 0.38, 0.31, 0.24], 
  [ 0.77, 0.75, 0.72, 0.69, 0.65, 0.56, 0.48, 0.3, 0.25, 0.18, 0.14, 0.11] ], 
[ [ 0.72, 0.7, 0.67, 0.64, 0.6, 0.6, 0.51, 0.45, 0.45, 0.32, 0.25, 0.19],   //金沢
  [ 0.62, 0.58, 0.55, 0.51, 0.47, 0.4, 0.38, 0.76, 0.71, 0.59, 0.5, 0.4], 
  [ 0.65, 0.62, 0.6, 0.57, 0.52, 0.44, 0.4, 0.6, 0.55, 0.44, 0.35, 0.28], 
  [ 0.71, 0.69, 0.66, 0.64, 0.6, 0.51, 0.44, 0.36, 0.31, 0.24, 0.18, 0.14] ], 
[ [ 0.77, 0.75, 0.73, 0.7, 0.65, 0.65, 0.56, 0.41, 0.41, 0.28, 0.22, 0.17],   //福井
  [ 0.64, 0.6, 0.57, 0.53, 0.47, 0.41, 0.39, 0.82, 0.77, 0.66, 0.56, 0.46], 
  [ 0.68, 0.65, 0.62, 0.58, 0.53, 0.45, 0.41, 0.63, 0.59, 0.48, 0.39, 0.31], 
  [ 0.75, 0.73, 0.71, 0.68, 0.64, 0.55, 0.47, 0.33, 0.29, 0.22, 0.16, 0.13] ], 
[ [ 0.88, 0.85, 0.83, 0.78, 0.73, 0.73, 0.61, 0.26, 0.26, 0.2, 0.16, 0.12],   //甲府
  [ 0.56, 0.54, 0.49, 0.45, 0.4, 0.36, 0.34, 0.79, 0.73, 0.68, 0.59, 0.51], 
  [ 0.62, 0.6, 0.56, 0.52, 0.48, 0.4, 0.37, 0.5, 0.48, 0.45, 0.38, 0.31], 
  [ 0.81, 0.79, 0.76, 0.72, 0.67, 0.56, 0.48, 0.2, 0.18, 0.16, 0.12, 0.09] ], 
[ [ 0.98, 0.96, 0.93, 0.9, 0.85, 0.85, 0.73, 0.2, 0.2, 0.13, 0.1, 0.07],   //長野
  [ 0.76, 0.74, 0.72, 0.67, 0.62, 0.52, 0.48, 0.7, 0.63, 0.54, 0.45, 0.37], 
  [ 0.83, 0.81, 0.79, 0.75, 0.7, 0.59, 0.51, 0.42, 0.36, 0.29, 0.22, 0.18], 
  [ 0.94, 0.92, 0.9, 0.87, 0.82, 0.72, 0.6, 0.13, 0.1, 0.07, 0.05, 0.04] ], 
[ [ 0.74, 0.72, 0.7, 0.66, 0.62, 0.62, 0.51, 0.43, 0.43, 0.33, 0.27, 0.21],   //岐阜
  [ 0.52, 0.48, 0.45, 0.42, 0.37, 0.33, 0.32, 0.82, 0.79, 0.73, 0.65, 0.56], 
  [ 0.6, 0.57, 0.54, 0.51, 0.46, 0.38, 0.36, 0.68, 0.63, 0.57, 0.5, 0.41], 
  [ 0.71, 0.69, 0.67, 0.64, 0.59, 0.5, 0.43, 0.38, 0.35, 0.29, 0.23, 0.18] ], 
[ [ 0.65, 0.61, 0.6, 0.56, 0.52, 0.52, 0.43, 0.38, 0.38, 0.32, 0.27, 0.21],   //静岡
  [ 0.38, 0.35, 0.32, 0.29, 0.26, 0.24, 0.23, 0.68, 0.64, 0.61, 0.54, 0.45], 
  [ 0.47, 0.45, 0.43, 0.4, 0.36, 0.3, 0.29, 0.52, 0.49, 0.45, 0.4, 0.32], 
  [ 0.63, 0.6, 0.58, 0.55, 0.51, 0.42, 0.37, 0.28, 0.27, 0.24, 0.19, 0.15] ], 
[ [ 0.74, 0.71, 0.69, 0.66, 0.61, 0.61, 0.51, 0.42, 0.42, 0.34, 0.27, 0.21],   //名古屋
  [ 0.51, 0.48, 0.45, 0.41, 0.37, 0.32, 0.31, 0.8, 0.78, 0.72, 0.64, 0.54], 
  [ 0.59, 0.57, 0.54, 0.5, 0.46, 0.38, 0.36, 0.62, 0.59, 0.54, 0.46, 0.38], 
  [ 0.71, 0.69, 0.66, 0.63, 0.59, 0.49, 0.43, 0.34, 0.32, 0.27, 0.21, 0.16] ], 
[ [ 0.66, 0.64, 0.62, 0.59, 0.55, 0.55, 0.46, 0.44, 0.44, 0.35, 0.29, 0.22],   //津
  [ 0.48, 0.46, 0.44, 0.4, 0.37, 0.31, 0.3, 0.74, 0.7, 0.64, 0.56, 0.46], 
  [ 0.56, 0.53, 0.51, 0.48, 0.44, 0.36, 0.34, 0.64, 0.6, 0.55, 0.47, 0.38], 
  [ 0.66, 0.64, 0.61, 0.59, 0.55, 0.46, 0.4, 0.38, 0.36, 0.31, 0.25, 0.19] ], 
[ [ 0.74, 0.72, 0.7, 0.67, 0.63, 0.63, 0.53, 0.39, 0.39, 0.29, 0.23, 0.17],   //彦根
  [ 0.6, 0.58, 0.55, 0.52, 0.47, 0.39, 0.37, 0.75, 0.71, 0.62, 0.53, 0.43], 
  [ 0.63, 0.62, 0.59, 0.56, 0.51, 0.43, 0.39, 0.61, 0.57, 0.49, 0.41, 0.32], 
  [ 0.72, 0.7, 0.68, 0.65, 0.61, 0.52, 0.45, 0.32, 0.29, 0.23, 0.18, 0.14] ], 
[ [ 0.72, 0.7, 0.68, 0.65, 0.61, 0.61, 0.51, 0.43, 0.43, 0.34, 0.28, 0.22],   //京都
  [ 0.51, 0.49, 0.46, 0.42, 0.38, 0.33, 0.32, 0.85, 0.83, 0.76, 0.68, 0.58], 
  [ 0.58, 0.56, 0.53, 0.5, 0.45, 0.38, 0.36, 0.71, 0.68, 0.62, 0.54, 0.45], 
  [ 0.69, 0.68, 0.65, 0.62, 0.58, 0.49, 0.43, 0.39, 0.36, 0.3, 0.24, 0.19] ], 
[ [ 0.64, 0.61, 0.6, 0.57, 0.53, 0.53, 0.44, 0.54, 0.54, 0.43, 0.36, 0.28],   //大阪
  [ 0.48, 0.45, 0.42, 0.39, 0.34, 0.3, 0.3, 0.88, 0.85, 0.78, 0.7, 0.59], 
  [ 0.52, 0.49, 0.47, 0.43, 0.39, 0.33, 0.32, 0.72, 0.7, 0.64, 0.56, 0.46], 
  [ 0.62, 0.59, 0.57, 0.54, 0.5, 0.42, 0.38, 0.48, 0.45, 0.39, 0.32, 0.25] ], 
[ [ 0.66, 0.63, 0.6, 0.57, 0.52, 0.52, 0.44, 0.48, 0.48, 0.39, 0.33, 0.26],   //神戸
  [ 0.5, 0.47, 0.44, 0.41, 0.36, 0.31, 0.31, 0.78, 0.76, 0.69, 0.61, 0.51], 
  [ 0.56, 0.53, 0.5, 0.47, 0.42, 0.36, 0.34, 0.62, 0.6, 0.54, 0.47, 0.38], 
  [ 0.65, 0.62, 0.59, 0.56, 0.52, 0.43, 0.39, 0.41, 0.4, 0.34, 0.29, 0.22] ], 
[ [ 0.75, 0.73, 0.71, 0.68, 0.64, 0.64, 0.55, 0.34, 0.34, 0.26, 0.21, 0.16],   //奈良
  [ 0.53, 0.5, 0.47, 0.43, 0.39, 0.34, 0.33, 0.81, 0.77, 0.7, 0.61, 0.52], 
  [ 0.62, 0.6, 0.57, 0.54, 0.49, 0.42, 0.38, 0.58, 0.56, 0.5, 0.42, 0.34], 
  [ 0.74, 0.73, 0.7, 0.68, 0.64, 0.55, 0.47, 0.22, 0.2, 0.16, 0.12, 0.1] ], 
[ [ 0.67, 0.64, 0.62, 0.58, 0.54, 0.54, 0.46, 0.45, 0.45, 0.36, 0.31, 0.24],   //和歌山
  [ 0.48, 0.45, 0.41, 0.37, 0.33, 0.3, 0.29, 0.81, 0.78, 0.73, 0.65, 0.55], 
  [ 0.53, 0.5, 0.46, 0.43, 0.39, 0.33, 0.32, 0.63, 0.61, 0.56, 0.5, 0.41], 
  [ 0.64, 0.62, 0.58, 0.55, 0.51, 0.43, 0.39, 0.41, 0.39, 0.34, 0.28, 0.22] ], 
[ [ 0.73, 0.71, 0.68, 0.65, 0.61, 0.61, 0.52, 0.42, 0.42, 0.3, 0.24, 0.19],   //鳥取
  [ 0.58, 0.54, 0.51, 0.47, 0.42, 0.37, 0.35, 0.81, 0.77, 0.66, 0.56, 0.47], 
  [ 0.64, 0.61, 0.58, 0.54, 0.5, 0.42, 0.38, 0.6, 0.56, 0.46, 0.37, 0.3], 
  [ 0.73, 0.71, 0.67, 0.65, 0.61, 0.52, 0.45, 0.29, 0.26, 0.2, 0.15, 0.12] ], 
[ [ 0.71, 0.69, 0.66, 0.63, 0.59, 0.59, 0.5, 0.41, 0.41, 0.29, 0.23, 0.18],   //松江
  [ 0.57, 0.53, 0.5, 0.46, 0.42, 0.36, 0.34, 0.75, 0.7, 0.6, 0.5, 0.42], 
  [ 0.63, 0.6, 0.56, 0.53, 0.49, 0.41, 0.37, 0.52, 0.48, 0.39, 0.31, 0.24], 
  [ 0.7, 0.68, 0.65, 0.62, 0.59, 0.5, 0.43, 0.3, 0.26, 0.2, 0.16, 0.12] ], 
[ [ 0.73, 0.71, 0.69, 0.66, 0.61, 0.61, 0.52, 0.45, 0.45, 0.34, 0.28, 0.22],   //岡山
  [ 0.49, 0.47, 0.44, 0.4, 0.36, 0.31, 0.3, 0.86, 0.82, 0.75, 0.66, 0.56], 
  [ 0.55, 0.52, 0.49, 0.45, 0.41, 0.35, 0.33, 0.75, 0.72, 0.65, 0.57, 0.47], 
  [ 0.69, 0.67, 0.64, 0.61, 0.57, 0.48, 0.42, 0.43, 0.4, 0.34, 0.28, 0.22] ], 
[ [ 0.72, 0.69, 0.67, 0.64, 0.59, 0.59, 0.5, 0.42, 0.42, 0.33, 0.26, 0.2],   //広島
  [ 0.49, 0.46, 0.42, 0.39, 0.35, 0.3, 0.3, 0.82, 0.79, 0.72, 0.63, 0.54], 
  [ 0.53, 0.5, 0.47, 0.43, 0.39, 0.33, 0.32, 0.71, 0.69, 0.62, 0.54, 0.45], 
  [ 0.68, 0.65, 0.62, 0.59, 0.55, 0.46, 0.41, 0.43, 0.41, 0.34, 0.28, 0.21] ], 
[ [ 0.75, 0.72, 0.71, 0.68, 0.63, 0.63, 0.54, 0.35, 0.35, 0.26, 0.21, 0.16],   //山口
  [ 0.51, 0.48, 0.43, 0.4, 0.35, 0.31, 0.3, 0.8, 0.76, 0.69, 0.6, 0.52], 
  [ 0.59, 0.55, 0.51, 0.48, 0.44, 0.37, 0.35, 0.62, 0.59, 0.52, 0.44, 0.36], 
  [ 0.73, 0.7, 0.67, 0.64, 0.6, 0.52, 0.45, 0.29, 0.28, 0.22, 0.17, 0.13] ], 
[ [ 0.65, 0.62, 0.6, 0.56, 0.52, 0.52, 0.44, 0.44, 0.44, 0.35, 0.29, 0.22],   //徳島
  [ 0.47, 0.43, 0.4, 0.37, 0.33, 0.29, 0.28, 0.78, 0.75, 0.68, 0.6, 0.5], 
  [ 0.53, 0.5, 0.47, 0.43, 0.39, 0.33, 0.32, 0.63, 0.61, 0.55, 0.47, 0.39], 
  [ 0.63, 0.61, 0.58, 0.55, 0.51, 0.43, 0.38, 0.38, 0.36, 0.31, 0.25, 0.19] ], 
[ [ 0.67, 0.64, 0.62, 0.59, 0.55, 0.55, 0.47, 0.47, 0.47, 0.37, 0.3, 0.24],   //高松
  [ 0.47, 0.44, 0.41, 0.38, 0.34, 0.29, 0.29, 0.83, 0.8, 0.73, 0.65, 0.55], 
  [ 0.54, 0.51, 0.48, 0.45, 0.4, 0.34, 0.33, 0.73, 0.7, 0.64, 0.55, 0.46], 
  [ 0.65, 0.63, 0.6, 0.58, 0.54, 0.45, 0.4, 0.41, 0.39, 0.33, 0.27, 0.21] ], 
[ [ 0.66, 0.63, 0.6, 0.57, 0.53, 0.53, 0.45, 0.43, 0.43, 0.35, 0.29, 0.23],   //松山
  [ 0.47, 0.43, 0.39, 0.36, 0.32, 0.28, 0.27, 0.81, 0.77, 0.71, 0.64, 0.54], 
  [ 0.52, 0.5, 0.46, 0.43, 0.39, 0.33, 0.31, 0.67, 0.64, 0.59, 0.51, 0.42], 
  [ 0.64, 0.61, 0.59, 0.56, 0.52, 0.44, 0.38, 0.36, 0.34, 0.3, 0.24, 0.19] ], 
[ [ 0.69, 0.66, 0.63, 0.59, 0.54, 0.54, 0.45, 0.39, 0.39, 0.33, 0.28, 0.22],   //高知
  [ 0.38, 0.34, 0.31, 0.28, 0.24, 0.23, 0.23, 0.76, 0.74, 0.7, 0.64, 0.55], 
  [ 0.47, 0.45, 0.42, 0.38, 0.34, 0.3, 0.29, 0.58, 0.57, 0.53, 0.47, 0.39], 
  [ 0.65, 0.63, 0.59, 0.56, 0.51, 0.43, 0.39, 0.32, 0.31, 0.27, 0.22, 0.17] ], 
[ [ 0.6, 0.58, 0.55, 0.52, 0.48, 0.48, 0.4, 0.48, 0.48, 0.38, 0.32, 0.25],   //福岡
  [ 0.47, 0.43, 0.39, 0.35, 0.31, 0.28, 0.27, 0.8, 0.77, 0.69, 0.6, 0.51], 
  [ 0.51, 0.47, 0.43, 0.4, 0.36, 0.31, 0.29, 0.66, 0.62, 0.55, 0.47, 0.38], 
  [ 0.58, 0.55, 0.52, 0.49, 0.46, 0.39, 0.35, 0.45, 0.42, 0.36, 0.3, 0.23] ], 
[ [ 0.69, 0.67, 0.64, 0.61, 0.56, 0.56, 0.48, 0.39, 0.39, 0.31, 0.26, 0.2],   //佐賀
  [ 0.48, 0.44, 0.4, 0.36, 0.32, 0.29, 0.29, 0.82, 0.8, 0.71, 0.63, 0.56], 
  [ 0.52, 0.49, 0.45, 0.41, 0.37, 0.32, 0.31, 0.7, 0.67, 0.59, 0.51, 0.44], 
  [ 0.66, 0.64, 0.61, 0.57, 0.53, 0.45, 0.4, 0.36, 0.35, 0.29, 0.24, 0.19] ], 
[ [ 0.59, 0.56, 0.53, 0.5, 0.46, 0.46, 0.39, 0.44, 0.44, 0.36, 0.3, 0.24],   //長崎
  [ 0.45, 0.41, 0.37, 0.33, 0.29, 0.27, 0.26, 0.74, 0.73, 0.66, 0.59, 0.5], 
  [ 0.49, 0.46, 0.42, 0.38, 0.34, 0.29, 0.28, 0.63, 0.61, 0.54, 0.47, 0.39], 
  [ 0.58, 0.54, 0.51, 0.48, 0.44, 0.37, 0.34, 0.42, 0.4, 0.34, 0.28, 0.22] ], 
[ [ 0.71, 0.68, 0.65, 0.62, 0.57, 0.57, 0.48, 0.42, 0.42, 0.34, 0.29, 0.23],   //熊本
  [ 0.46, 0.42, 0.37, 0.33, 0.29, 0.28, 0.27, 0.85, 0.83, 0.76, 0.69, 0.6], 
  [ 0.51, 0.47, 0.43, 0.39, 0.35, 0.31, 0.3, 0.68, 0.67, 0.61, 0.54, 0.46], 
  [ 0.66, 0.63, 0.6, 0.57, 0.52, 0.45, 0.4, 0.38, 0.37, 0.32, 0.27, 0.21] ], 
[ [ 0.65, 0.63, 0.6, 0.57, 0.53, 0.53, 0.45, 0.36, 0.36, 0.3, 0.24, 0.19],   //大分
  [ 0.44, 0.4, 0.36, 0.33, 0.3, 0.27, 0.26, 0.77, 0.73, 0.67, 0.59, 0.49], 
  [ 0.5, 0.47, 0.43, 0.4, 0.36, 0.31, 0.3, 0.61, 0.59, 0.53, 0.45, 0.37], 
  [ 0.63, 0.6, 0.57, 0.54, 0.5, 0.43, 0.38, 0.32, 0.31, 0.27, 0.21, 0.17] ], 
[ [ 0.62, 0.6, 0.57, 0.53, 0.49, 0.49, 0.42, 0.4, 0.4, 0.37, 0.31, 0.25],   //宮崎
  [ 0.33, 0.3, 0.26, 0.23, 0.2, 0.21, 0.21, 0.75, 0.74, 0.71, 0.65, 0.56], 
  [ 0.41, 0.38, 0.35, 0.31, 0.28, 0.26, 0.25, 0.61, 0.6, 0.57, 0.51, 0.43], 
  [ 0.58, 0.55, 0.53, 0.49, 0.45, 0.39, 0.35, 0.34, 0.33, 0.31, 0.27, 0.21] ], 
[ [ 0.55, 0.53, 0.49, 0.45, 0.41, 0.41, 0.36, 0.51, 0.51, 0.43, 0.39, 0.32],   //鹿児島
  [ 0.35, 0.32, 0.27, 0.23, 0.2, 0.21, 0.21, 0.82, 0.79, 0.75, 0.7, 0.61], 
  [ 0.41, 0.38, 0.33, 0.29, 0.25, 0.24, 0.24, 0.69, 0.67, 0.64, 0.59, 0.5], 
  [ 0.53, 0.51, 0.46, 0.43, 0.38, 0.34, 0.32, 0.48, 0.46, 0.42, 0.37, 0.3] ], 
[ [ 0.12, 0.08, 0.07, 0.06, 0.05, 0.05, 0.09, 0.55, 0.55, 0.53, 0.52, 0.47],   //那覇
  [ 0.09, 0.04, 0.03, 0.02, 0.02, 0.06, 0.06, 0.76, 0.75, 0.74, 0.72, 0.67], 
  [ 0.1, 0.05, 0.04, 0.03, 0.03, 0.07, 0.07, 0.64, 0.62, 0.62, 0.6, 0.54], 
  [ 0.12, 0.08, 0.06, 0.06, 0.04, 0.08, 0.08, 0.51, 0.5, 0.49, 0.48, 0.43] ] ],


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
﻿/*  2017/12/16  version 1.0
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
		'兵庫',
		"北海道",	//1
		"青森",
		"岩手",
		"宮城",
		"秋田",	//5
		"山形",
		"福島",
		"茨城",
		"栃木",
		"群馬",	//10
		"埼玉",
		"千葉",
		"東京",
		"神奈川",
		"新潟",	//15
		"富山",
		"石川",
		"福井",
		"山梨",
		"長野",	//20
		"岐阜",
		"静岡",
		"愛知",
		"三重",
		"滋賀",	//25
		"京都",
		"大阪",
		"兵庫",
		"奈良",
		"和歌山",	//30
		"鳥取",
		"島根",
		"岡山",
		"広島",
		"山口",	//35
		"徳島",
		"香川",
		"愛媛",
		"高知",
		"福岡",	//40
		"佐賀",
		"長崎",
		"熊本",
		"大分",
		"宮崎",	//45
		"鹿児島",
		"沖縄"
	],

	prefDefault : 13,	//not selected


	// heat category with prefecture
	//	prefHeatingLeverl[prefecture]
	//
	//	return code
	//		1:cold area in Japan(Hokkaido)
	//			.
	//			.
	//		6:hot area in Japan(Okinawa)
	//
	prefHeatingLeverl : [ 4,
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

	17.4	,	//兵庫
	 9.4	,	//北海道
	11.1	,	//青森
	10.7	,	//岩手
	13.1	,	//宮城
	12.4	,	//秋田
	12.2	,	//山形
	13.6	,	//福島
	14.4	,	//茨城
	14.6	,	//栃木
	15.3	,	//群馬
	15.8	,	//埼玉
	16.6	,	//千葉
	17.0	,	//東京
	16.5	,	//神奈川
	14.4	,	//新潟
	14.9	,	//富山
	15.1	,	//石川
	15.0	,	//福井
	15.3	,	//山梨
	12.5	,	//長野
	16.4	,	//岐阜
	17.1	,	//静岡
	16.6	,	//愛知
	16.6	,	//三重
	15.2	,	//滋賀
	16.3	,	//京都
	17.6	,	//大阪
	17.4	,	//兵庫
	15.3	,	//奈良
	17.3	,	//和歌山
	15.5	,	//鳥取
	15.7	,	//島根
	17.0	,	//岡山
	17.0	,	//広島
	16.2	,	//山口
	17.4	,	//徳島
	17.3	,	//香川
	17.3	,	//愛媛
	17.9	,	//高知
	18.0	,	//福岡
	17.4	,	//佐賀
	18.0	,	//長崎
	18.0	,	//熊本
	17.4	,	//大分
	18.1	,	//宮崎
	19.3	,	//鹿児島
	23.5		//沖縄
	],

	// solar factor
	//
	//		prefPVElectricity( prefecture )
	//
	prefPVElectricity : [

	4.04	,	//兵庫
	3.95	,	//北海道
	3.66	,	//青森
	3.88	,	//岩手
	3.84	,	//宮城
	3.54	,	//秋田
	3.72	,	//山形
	3.87	,	//福島
	3.95	,	//茨城
	3.97	,	//栃木
	4.08	,	//群馬
	3.81	,	//埼玉
	4.00	,	//千葉
	3.74	,	//東京
	3.92	,	//神奈川
	3.54	,	//新潟
	3.56	,	//富山
	3.68	,	//石川
	3.57	,	//福井
	4.31	,	//山梨
	3.95	,	//長野
	4.25	,	//岐阜
	4.15	,	//静岡
	4.11	,	//愛知
	4.15	,	//三重
	3.46	,	//滋賀
	3.72	,	//京都
	3.92	,	//大阪
	4.04	,	//兵庫
	3.99	,	//奈良
	4.12	,	//和歌山
	3.66	,	//鳥取
	3.74	,	//島根
	4.06	,	//岡山
	4.26	,	//広島
	3.99	,	//山口
	4.13	,	//徳島
	4.18	,	//香川
	4.15	,	//愛媛
	4.32	,	//高知
	3.79	,	//福岡
	3.94	,	//佐賀
	3.97	,	//長崎
	4.05	,	//熊本
	3.95	,	//大分
	4.26	,	//宮崎
	4.01	,	//鹿児島
	4.15		//沖縄
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


	// heat load factore table
	//
	//エアコン・冷暖房負荷算出用　
	//	配列は　  [朝、昼、夕、夜]の係数で、
	//	それぞれ　[暖房半月、暖房1ヶ月、暖房2ヶ月、暖房3ヶ月、暖房4ヶ月、暖房6ヶ月、暖房8ヶ月、
	//				冷房半月、冷房1ヶ月、冷房2ヶ月、冷房3ヶ月、冷房4ヶ月]
	//	の規定温度における消費量に対する割合を示す。
	//	この計算方法等については、京都府地球温暖化防止活動推進センター,2006より

	// accons factor copy from D6.accons
	//月数別のエアコン負荷（初期設定は神戸市）
	airconFactor_mon :
			  [ [ 0.66, 0.62, 0.59, 0.55, 0.50, 0.41, 0.37, 0.39, 0.36, 0.31, 0.26, 0.20 ],
   				[ 0.43, 0.39, 0.37, 0.34, 0.30, 0.27, 0.26, 0.79, 0.75, 0.67, 0.59, 0.49 ],
     			[ 0.47, 0.45, 0.42, 0.39, 0.35, 0.30, 0.29, 0.57, 0.55, 0.49, 0.43, 0.35 ],
     			[ 0.62, 0.58, 0.55, 0.51, 0.47, 0.39, 0.35, 0.34, 0.32, 0.27, 0.23, 0.18 ] ],
	// heat factor copy from D6.heatcons
	//月数別の熱需要負荷（初期設定は神戸市）
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
		return this.prefHeatingLeverl[pref];
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
		ret = new Array();

		var id;
		for ( i in this.energyCode2id) {
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
		[ 7959, 5661, 313, 2647],	//0:神戸
		[ 7568, 5400, 3772, 3984],  //札幌市
		[ 8892, 4251, 4886, 3806],  //青森市
		[ 8455, 5536, 3471, 4168],  //盛岡市
		[ 7822, 6913, 1492, 4149],  //仙台市
		[ 8134, 4816, 4284, 5573],  //秋田市
		[ 9019, 6170, 3119, 5078],  //山形市
		[ 8979, 6080, 2086, 5063],  //福島市
		[ 8644, 6398, 1160, 6005],  //水戸市
		[ 8438, 5842, 1100, 5612],  //宇都宮市
		[ 7785, 5318, 968, 5777],  //前橋市
		[ 9217, 6501, 374, 2922],  //さいたま市
		[ 8296, 5735, 442, 3230],  //千葉市
		[ 8982, 6123, 232, 1462],  //東京都区部
		[ 8719, 6441, 428, 2793],  //横浜市
		[ 8685, 6683, 1370, 5120],  //新潟市
		[ 10824, 5846, 2679, 6369],  //富山市
		[ 10443, 6423, 1918, 5602],  //金沢市
		[ 11659, 6434, 1674, 5284],  //福井市
		[ 8615, 5110, 1393, 4719],  //甲府市
		[ 8552, 5710, 1992, 6084],  //長野市
		[ 10186, 6953, 915, 5483],  //岐阜市
		[ 8980, 7392, 586, 3997],  //静岡市
		[ 8783, 6160, 455, 3352],  //名古屋市
		[ 9409, 6204, 885, 5788],  //津市
		[ 9113, 5571, 712, 4367],  //大津市
		[ 8994, 6135, 413, 2463],  //京都市
		[ 9246, 6026, 196, 1345],  //大阪市
		[ 7959, 5661, 313, 2647],  //神戸市
		[ 9096, 6517, 593, 3637],  //奈良市
		[ 10169, 4862, 842, 4110],  //和歌山市
		[ 8691, 5382, 1327, 4652],  //鳥取市
		[ 9122, 6504, 979, 5699],  //松江市
		[ 9466, 6275, 934, 4759],  //岡山市
		[ 9201, 6303, 765, 4310],  //広島市
		[ 8724, 5867, 1074, 7451],  //山口市
		[ 11443, 5315, 956, 4817],  //徳島市
		[ 9765, 5072, 778, 4649],  //高松市
		[ 9356, 5474, 759, 3979],  //松山市
		[ 8898, 5947, 549, 4191],  //高知市
		[ 8572, 6426, 542, 3958],  //福岡市
		[ 8875, 5993, 958, 5042],  //佐賀市
		[ 7805, 6368, 627, 2823],  //長崎市
		[ 8745, 5735, 688, 4111],  //熊本市
		[ 8260, 5606, 735, 5775],  //大分市
		[ 8188, 5252, 604, 5034],  //宮崎市
		[ 7790, 6001, 469, 5401],  //鹿児島市
		[ 8960, 4911, 366, 3177]   //那覇市
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

	[ [ 1.1084, 1.3537, 2.5436, 0.9465 ], [ 0.8664, 0.9165, 0.3546, 0.9764 ], [ 1.0782, 0.6675, 0.0175, 1.1107 ] ],   //神戸市
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //札幌市
	[ [ 1.185, 1.0197, 1.8202, 1.0114 ], [ 0.9286, 1.0217, 0.7966, 0.9894 ], [ 0.8722, 0.9376, 0.2455, 1.0025 ] ],   //青森市
	[ [ 1.2519, 1.176, 1.9527, 0.9121 ], [ 0.9035, 0.9891, 0.7324, 1.0333 ], [ 0.8249, 0.7835, 0.1757, 1.0616 ] ],   //盛岡市
	[ [ 1.1606, 1.2125, 2.2116, 0.9972 ], [ 0.9272, 0.9747, 0.5783, 0.9563 ], [ 0.9071, 0.7588, 0.0873, 1.0766 ] ],   //仙台市
	[ [ 1.1375, 1.1571, 1.962, 1.0131 ], [ 0.9253, 0.9971, 0.7264, 0.9946 ], [ 0.9411, 0.7954, 0.1733, 0.9915 ] ],   //秋田市
	[ [ 1.1941, 1.1766, 1.9629, 0.9636 ], [ 0.8986, 0.9952, 0.6925, 0.9746 ], [ 0.9103, 0.7726, 0.2285, 1.091 ] ],   //山形市
	[ [ 1.1462, 1.1823, 1.9593, 0.9525 ], [ 0.9195, 0.9801, 0.6816, 0.987 ], [ 0.9393, 0.7901, 0.2515, 1.085 ] ],   //福島市
	[ [ 1.1464, 1.252, 2.0957, 1.021 ], [ 0.9062, 0.9648, 0.5947, 0.9815 ], [ 0.9611, 0.7228, 0.2145, 1.0028 ] ],   //水戸市
	[ [ 1.1498, 1.2742, 1.934, 1.0276 ], [ 0.9069, 0.9497, 0.6857, 0.9587 ], [ 0.9555, 0.7183, 0.2786, 1.032 ] ],   //宇都宮市
	[ [ 1.1471, 1.2582, 1.9129, 0.9325 ], [ 0.8853, 0.948, 0.6602, 0.9919 ], [ 0.9949, 0.7424, 0.3491, 1.1035 ] ],   //前橋市
	[ [ 1.1087, 1.3465, 2.5018, 0.8666 ], [ 0.8778, 0.9416, 0.3854, 0.9338 ], [ 1.0587, 0.6352, 0.0219, 1.2882 ] ],   //さいたま市
	[ [ 1.1219, 1.3604, 2.4476, 1.0147 ], [ 0.881, 0.9263, 0.4213, 0.9324 ], [ 1.0359, 0.6424, 0.0343, 1.0931 ] ],   //千葉市
	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //東京都区部
	[ [ 1.1243, 1.3369, 2.3761, 0.929 ], [ 0.8828, 0.9295, 0.4813, 0.9553 ], [ 1.0296, 0.6683, 0.0296, 1.1692 ] ],   //横浜市
	[ [ 1.1343, 1.3681, 2.2726, 0.9586 ], [ 0.893, 0.9273, 0.5639, 0.9968 ], [ 0.9993, 0.6303, 0.0302, 1.0607 ] ],   //新潟市
	[ [ 1.1048, 1.1422, 1.9012, 1.053 ], [ 0.8787, 0.9851, 0.7561, 0.9779 ], [ 1.0624, 0.8352, 0.205, 0.966 ] ],   //富山市
	[ [ 1.1945, 1.1597, 2.0031, 1.0081 ], [ 0.8731, 1.0076, 0.6543, 0.9632 ], [ 0.9521, 0.7745, 0.2386, 1.0505 ] ],   //金沢市
	[ [ 1.1454, 1.1327, 2.1399, 1.0077 ], [ 0.8642, 1.0102, 0.5938, 1.0036 ], [ 1.0325, 0.8059, 0.1572, 0.9838 ] ],   //福井市
	[ [ 1.1554, 1.1964, 1.8836, 0.9521 ], [ 0.8678, 0.9947, 0.689, 0.9717 ], [ 1.013, 0.747, 0.3402, 1.1109 ] ],   //甲府市
	[ [ 1.2328, 1.2225, 1.9588, 0.957 ], [ 0.8761, 0.9709, 0.7043, 0.9998 ], [ 0.896, 0.7519, 0.2145, 1.0576 ] ],   //長野市
	[ [ 1.0541, 1.199, 2.3036, 0.9536 ], [ 0.89, 0.9711, 0.4871, 0.9731 ], [ 1.1112, 0.7827, 0.1166, 1.1066 ] ],   //岐阜市
	[ [ 1.0731, 1.175, 2.3433, 0.9896 ], [ 0.8948, 0.9886, 0.453, 0.9589 ], [ 1.0778, 0.7857, 0.1207, 1.0824 ] ],   //静岡市
	[ [ 1.0842, 1.3188, 2.4434, 0.9445 ], [ 0.8755, 0.9435, 0.4371, 0.9695 ], [ 1.0953, 0.6692, 0.0136, 1.1248 ] ],   //名古屋市
	[ [ 1.079, 1.2873, 2.276, 1.0473 ], [ 0.8916, 0.964, 0.4966, 0.9682 ], [ 1.0753, 0.677, 0.1377, 0.9898 ] ],   //津市
	[ [ 1.1796, 1.3788, 2.4042, 0.9903 ], [ 0.8665, 0.9313, 0.4425, 0.9513 ], [ 0.983, 0.6095, 0.0569, 1.094 ] ],   //大津市
	[ [ 1.1548, 1.4195, 2.4335, 1.0361 ], [ 0.8259, 0.9153, 0.4398, 0.9566 ], [ 1.0838, 0.5819, 0.0223, 1.0242 ] ],   //京都市
	[ [ 1.051, 1.3736, 2.6546, 0.8413 ], [ 0.8319, 0.9203, 0.2663, 0.9845 ], [ 1.2122, 0.6347, 0.0167, 1.2374 ] ],   //大阪市
	[ [ 1.1084, 1.3537, 2.5436, 0.9465 ], [ 0.8664, 0.9165, 0.3546, 0.9764 ], [ 1.0782, 0.6675, 0.0175, 1.1107 ] ],   //神戸市
	[ [ 1.1301, 1.3407, 2.324, 0.9201 ], [ 0.8464, 0.9429, 0.4949, 0.9414 ], [ 1.0826, 0.6409, 0.0765, 1.2042 ] ],   //奈良市
	[ [ 1.0738, 1.2468, 2.1346, 0.9533 ], [ 0.875, 0.9801, 0.5627, 0.967 ], [ 1.1098, 0.7042, 0.216, 1.1172 ] ],   //和歌山市
	[ [ 1.1396, 1.2053, 2.116, 0.9945 ], [ 0.8942, 0.9914, 0.5994, 0.9753 ], [ 0.9902, 0.7406, 0.1796, 1.0486 ] ],   //鳥取市
	[ [ 1.1848, 1.2606, 2.2206, 0.9281 ], [ 0.8625, 0.9772, 0.5387, 0.9858 ], [ 0.9828, 0.6904, 0.1414, 1.1197 ] ],   //松江市
	[ [ 1.1117, 1.2538, 2.2167, 0.9359 ], [ 0.8468, 0.9675, 0.5474, 0.9602 ], [ 1.1063, 0.7157, 0.1321, 1.1519 ] ],   //岡山市
	[ [ 1.1835, 1.3205, 2.2709, 0.9131 ], [ 0.8344, 0.9538, 0.5145, 0.986 ], [ 1.0313, 0.6496, 0.1146, 1.1393 ] ],   //広島市
	[ [ 1.1315, 1.2583, 2.1551, 0.9978 ], [ 0.8563, 0.9579, 0.5741, 0.9821 ], [ 1.0642, 0.7259, 0.1697, 1.0328 ] ],   //山口市
	[ [ 1.1012, 1.1775, 1.9936, 0.974 ], [ 0.8708, 0.9956, 0.6212, 0.9728 ], [ 1.0805, 0.7707, 0.3065, 1.0799 ] ],   //徳島市
	[ [ 1.083, 1.219, 2.1848, 0.9868 ], [ 0.8645, 0.9739, 0.548, 0.9244 ], [ 1.1151, 0.7514, 0.1737, 1.1437 ] ],   //高松市
	[ [ 1.1214, 1.2011, 2.1502, 0.9629 ], [ 0.8572, 0.9762, 0.5598, 0.9506 ], [ 1.076, 0.7716, 0.2, 1.1317 ] ],   //松山市
	[ [ 1.0502, 1.203, 2.307, 0.9864 ], [ 0.8667, 0.9859, 0.4585, 0.9409 ], [ 1.1553, 0.7529, 0.1598, 1.1166 ] ],   //高知市
	[ [ 1.0572, 1.2804, 2.4313, 0.9451 ], [ 0.8802, 0.9628, 0.4214, 0.9737 ], [ 1.1234, 0.688, 0.056, 1.1171 ] ],   //福岡市
	[ [ 1.072, 1.2351, 2.2281, 0.9328 ], [ 0.8631, 0.9775, 0.5252, 0.9638 ], [ 1.1322, 0.724, 0.1539, 1.1499 ] ],   //佐賀市
	[ [ 1.0812, 1.2687, 2.4828, 0.9539 ], [ 0.876, 0.9636, 0.3415, 1.0029 ], [ 1.0984, 0.7025, 0.1204, 1.0566 ] ],   //長崎市
	[ [ 1.0242, 1.1665, 2.303, 1.0177 ], [ 0.8686, 0.9761, 0.479, 0.9543 ], [ 1.1867, 0.8178, 0.131, 1.0525 ] ],   //熊本市
	[ [ 1.084, 1.2347, 2.1746, 0.965 ], [ 0.8782, 0.972, 0.562, 0.9673 ], [ 1.0909, 0.7337, 0.1639, 1.1011 ] ],   //大分市
	[ [ 1.0268, 1.2281, 2.2258, 0.9817 ], [ 0.887, 0.9818, 0.5177, 0.939 ], [ 1.1527, 0.7262, 0.1694, 1.126 ] ],   //宮崎市
	[ [ 1.0288, 1.2375, 2.4612, 0.9435 ], [ 0.8727, 0.966, 0.3749, 0.9441 ], [ 1.1738, 0.7401, 0.0937, 1.1685 ] ],   //鹿児島市
	[ [ 0.8457, 1.1222, 1.5081, 0.9201 ], [ 0.9351, 0.9941, 0.8528, 0.9802 ], [ 1.3139, 0.847, 0.5678, 1.1395 ] ]   //那覇市

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

		ret = Array();
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
				seasonMonth = [ 8, 3, 1 ];
				break;
			case 2:
				seasonMonth = [ 6, 4, 2 ];
				break;
			case 3:
				seasonMonth = [ 5, 5, 2 ];
				break;
			case 5:
				seasonMonth = [ 3, 5, 4 ];
				break;
			case 6:
				seasonMonth = [ 2, 5, 5 ];
				break;
			case 4:
			default:
				seasonMonth = [ 4, 5, 3 ];
				break;
		}
		
		//calculate average cost
		this.averageCostEnergy = this.getAverageCostEnergy( 
						( numPerson<=0 ? 3 : numPerson ) ,
						Math.floor(this.area), 
						this.urban );
		
		//calculate average CO2
		this.averageCO2Energy = [];
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

		return avConst * seasonArray[seasonCode2id(season_name)][eid];
	}
	
};


﻿/*  2017/12/16  version 1.0
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
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:2.23,
		car:2.32
	},

	defaultPriceElectricity : 27,

	// unit price   yen(in Japan)/each unit
	price : {
		electricity:27,				// override in D6.area.setPersonArea by supplyer
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
	
	// names ( dataset is now witten in Japanse )
	name : {
		electricity:"電気",
		nightelectricity:"夜間電気",
		sellelectricity:"売電",
		nagas:"都市ガス",
		lpgas:"LPガス",
		kerosene:"灯油",
		gasoline:"ガソリン",
		lightoil:"軽油",
		heavyoil:"重油",
		coal:0,
		biomass:0,
		hotwater:0,
		waste:0,
		water:0,
		gas:"都市ガス",
		car:"ガソリン"
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
	//			1:従量電灯A, 2:従量電灯B、3:時間帯別、4:低圧、5:低圧総合、6:高圧 in Japan
	//		kw:	contract demand
	// return
	//		cons: energy consumption per month
	costToCons : function( cost, energy_name, elecType, kw=0 )
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
	},
	
	
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
		this.endEnergy = source.endEnergy;
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
		this.endEnergy -= target.endEnergy;
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
		this.endEnergy += target.endEnergy;
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





﻿/*  2017/12/10  version 1.0
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

//Inherited class of D6.Energy
D6.ConsBase = D6.object(D6.Energy);		//base class is energy

D6.ConsBase.init = function(){
	//----------- declare instanses ---------------------------


	this.measures = [];				//related instanses of measure
									// name of related measures is declared in each consumption definition
	//names, codes
	this.title = "";				//caption of this consumption
	this.consName = "consXX";		//name of consumption "cons" +  2 charactors
	this.consCode = "";				//code of consumption written in 2 charactors
	this.subID = 0;					//id in same kind of consumtion, rooms or equipments
	this.groupID = 0;				//consumption group id
	this.inputGuide = "";			//guide message for input

	//structure
	this.consShow = [];				//other main consumption instances list
	this.sumCons = "";				//sum side consumption instance
	this.sumCons2 = "";				//sum related side of consumption
	this.sumConsName = "";			//sum side consumption name
	this.sumCons2Name = "";			//sum related side of consumption name
	this.partCons = [];				//part side consumption instances
	this.partCons2 = [];			//part related side consumption instance
	this.partConsName = "";			//part side name
	this.partCons2Name = "";		//part related side name
	this.residueCalc = "yes";		//calc residue in this brother consumption ( yes or not)

	//calclation parameters
	this.performance = "";			//performance factor
	this.mainSource = "";			//main energy source 
	this.co2Original = "";			//CO2 in case of no measures are selected
	this.costOriginal = "";			//cost in case of no measures are selected
	this.julesOriginal = "";		//energy consumption in case of no measures are selected

	//display
	this.color = "";				//fill color in graph

	//type of calclation
	this.total = false;				//in case of reprezent all of related consumption 
									// for example, tv consumption not each equipments but total.
	this.orgCopyNum = 0;			//count of same consumption 
	this.addable = "";				//in case of add consumption set this postfix 
	
	//--------- calclation of consumption ---------------------------------	
	// pre calculation
	this.precalc = function(){
		this.clear();
	};

	// calculation
	this.calc = function(){
		this.clear();
	};
	
	//dummy definition, main routine is defined in each consumption class
	this.calc2nd = function(){
	};

	//calculation adjust
	this.calcAdjust = function( energyAdj ) {
		this.multiplyArray( energyAdj );	//main adjust
		
		//add adjust for some calculation
		this.calcAdjustStrategy( energyAdj );
	};

	//dummy definition, add adjust 
	this.calcAdjustStrategy = function( energyAdj ) {
	};

	// in case of monthly calculation
	this.consSumMonth  = function( source, month ) {
		for (var i in Unit.co2 ) {
			this.i += source.i * month;
		}
		this.co2 += source.co2 * month;
		this.cost += source.cost * month;
	};

	//--------- calculation of each measures ---------------------------------	

	//main calculation of measures , defined in each classes
	this.calcMeasure = function() {
	};

	//measures initialize, fit to consumption
	this.calcMeasureInit = function() {
		for ( var mes in this.measures ) {
			//set reduction zero
			this.measures[mes].setzero();
		}
	};

	// when select measure, reduce consumption with related consumption link
	//		called by addReduction in measures files
	//		originalConsName: consumption name of original in chain 
	//		sourceConsName: consumption name called by
	this.addReductionMargin = function( margin, originalConsName, sourceConsName ) {
		var ccons;
		var pcons;
		var fromPart;

		//execute reduction of consumption
		this.add( margin );
		this.calcCO2();		//calc CO2, cost and energy
		this.calcCost();
		this.calcJules();

		//reduction chain in use of relation
		if ( sourceConsName == "" ){
			sourceConsName = originalConsName;
		}

		//sum side of reduction
		if ( this.sumConsName != sourceConsName 
			&& this.sumConsName != originalConsName 
		) { 
			// if the direction is not called by
			ccons = this.sumCons;
			if ( ccons ) {
				if ( ccons[this.subID] ) {
					ccons[this.subID].addReductionMargin( margin, originalConsName, this.consName );
				} else {
					ccons.addReductionMargin( margin, originalConsName, this.consName );
				}
			}
		}

		//sum related side of reduction
		if ( this.sumCons2Name != "" 
			&& this.sumCons2Name != sourceConsName 
			&& this.sumCons2Name != originalConsName 
		) { 
			// if the direction is not called by
			ccons = this.sumCons2;
			if ( ccons ) {
				if ( ccons[this.subID] ) {
					ccons[this.subID].addReductionMargin( margin, originalConsName, this.consName );
				} else {
					ccons.addReductionMargin( margin, originalConsName, this.consName );
				}
			}
		}

		//part side reduction
		if ( this.consCode != "TO" ){
			// total consumption is excluded

			//part side 
			fromPart = false;
			for( pcons in this.partCons ) {
				if ( this.partCons[pcons].consName == sourceConsName 
					|| this.partCons[pcons].consName == originalConsName 
				) {
					//in case of looped 
					fromPart = true;
				}
			}
			if ( !fromPart && this.partCons.length > 0 ) {
				// step to detail sub part calclation
				this.addReductionMargin2Part( this.partCons, margin, originalConsName, this.consName );
			}

			//part related side
			fromPart = false;
			for( pcons in this.partCons2 ) {
				if ( this.partCons2[pcons].consName == sourceConsName 
					|| this.partCons2[pcons].consName == originalConsName 
				) {
					fromPart = true;
				}
			}
			if ( !fromPart && this.partCons2.length > 0 ) {
				// step to detail sub part calclation
				this.addReductionMargin2Part( this.partCons2, margin, originalConsName, this.consName );
			}
		}
	};

	//calclate to sub part reduction, take rate of each sub consumption for consern
	this.addReductionMargin2Part = function( pconsList, margin, originalConsName, sourceConsName ) {
		var submargin = D6.object(D6.Energy);
		var pcons;
		
		if ( pconsList.length > 1 ) {
			//sum of part side consumptions
			var sumCo2 = 0;
			for( pcons in pconsList ) {
				if ( !isNaN(pconsList[pcons].co2) ) {
					sumCo2 += pconsList[pcons].co2;
				}
			}

			//chech if objects not matrix
			if ( pconsList[0].orgCopyNum >= 1 &&
				pconsList[0].subID != pconsList[1].subID
			) {
				//in case of matrix,  devide reduction acrding to consumption amount
				for( pcons in pconsList ) {
					if ( pconsList[pcons].co2 > 0 ) {
						submargin.copy( margin );
						submargin.multiply( pconsList[pcons].co2 / sumCo2 );

						//calc next relation 
						pconsList[pcons].addReductionMargin( submargin, originalConsName, this.consName );
					}
				}
			
			} else {
				//in case of objects
				//　親のmeasuresについて、pconsListにリストされているconsNameが存在する場合
				//	分割側の消費量を、対策の消費量とする（もう一度親を計算する） consAC
				//		例： mes["consACCool"] = ***; を 消費クラスで定義	
				//親のIDがある場合にはそのsubIDを用いる（冷暖房部屋など）
				for( pcons in pconsList ) {
					if ( pconsList[pcons].co2 > 0 ) {
						if ( pconsList[pcons].consAddSet ) {
							//devide method is defined in consAddSet
							for ( pmes in this.measures ){
								var mes = this.measures[pmes];
								if ( mes.selected && mes[pconsList[pcons].consName] ){
									submargin.copy( mes[pconsList[pcons].consName] );
									submargin.sub( pconsList[pcons] );
									pconsList[pcons].addReductionMargin( submargin, originalConsName, this.consName );
								}
							}
						} else{
							// not defined
							submargin.copy( margin );
							submargin.multiply( pconsList[pcons].co2 / sumCo2 );
							pconsList[pcons].addReductionMargin( submargin, originalConsName, this.consName );
						}
					}
				}
			}
		}
	};
	
	//set input data
	this.input = function( InDataCode, defaultData ) {
		var ret;
		//return only average if average mode
		if ( D6.averageMode ) {
			if ( D6.scenario.defCalcAverage.indexOf( InDataCode ) == -1 ){
				return defaultData;
			}
		}
		
		var InData = D6.doc.data[InDataCode];
		if ( typeof InData === "undefined" || InData == -1 || InData === "" ) {
			//in  InData compare, user  === instead of ==
			ret = defaultData;
		} else {
			ret = InData;
			if ( D6.scenario.defInput[InDataCode.substr(0,4)].varType == "Number" ) {
				//convert to number
				ret = parseFloat(ret);
			}
		}
		return ret;
	};

	//get equip parameters
	this.getEquipParameters = function( year, size, sizeThreshold, defEquip ) {
		var ret = {};
		
		//get definisiton by size
		var sizeCode = sizeThreshold[0];
		for( var sizeTmp in sizeThreshold ) {
			if ( size > sizeThreshold[sizeTmp] *1.001 ) {
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
		for( var defone in defs ) {
			if ( year <= defone ) {
				if ( defone < justafter ) justafter = defone;
			} else {
				if ( defone > justbefore ) justbefore = defone;
			}
		}
		for ( var parameters in defs[justbefore] ) {
			ret[parameters] = ( (justafter - year) * defs[justbefore][parameters]
							+ (year - justbefore) * defs[justafter][parameters] ) / (justafter - justbefore);
		}
		return ret;
	};
	
	//room/equip id
	this.setsubID = function( num ) {
		this.subID = num;
		if ( this.titleList ){
			this.title = this.titleList[num];
		}
	};

	//is thhis measurea selected?
	this.isSelected = function( mName ){
		if ( !this.measures[mName] ) {
			return false;
		} else {
			return this.measures[mName].selected;
		}
	};

	//get size rank
	//	val : value, thresholdList: list of value to get rank
	this.getIndex = function( val, thresholdList ) {
		for( var i=0 ; i<thresholdList.length ; i++ ){
			if ( val < thresholdList[i] ){
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
	this.lifestyle = mdef["lifestyle"];
	this.advice = mdef["advice"];
	this.joyfull = mdef["joyfull"];
	this.figNum = mdef["figNum"];
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

	//calculate total cost include install cost
	if ( this.priceNew == 0 ) this.priceNew = this.priceOrg;
	if ( this.priceNew >= 0 && this.lifeTime > 0 )
	{
		this.costTotalChange = this.costChangeOriginal + this.priceNew / this.lifeTime / 12;

		//payback year
		if ( this.costChangeOriginal > 0 ) {
			this.payBackYear = 999;
		} else {
			this.payBackYear = Math.min( Math.round( -this.priceNew / this.costChangeOriginal / 12 ), 999 );
		}
	} else {
		this.costTotalChange = this.costChange;
	}

	//save as original value if no measure is selected
	if ( D6.isOriginal ) {
		this.co2ChangeOriginal = this.co2Change;
		this.costChangeOriginal = this.costChange;
		this.costTotalChangeOriginal = this.costTotalChange;
		this.co2ChangeW1Original = this.co2ChangeW1;
		this.co2ChangeW2Original = this.co2ChangeW2;
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
	this[target] = this.cons[target];
	this.multiply( 1 - reduceRate );
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
	cons.calcMeasure( this.measureName );	//call consumption class 
	this.calcSave();						//calc saving CO2 and cost
};

//sum up 12 months, in case of calculate by month
D6.MeasureBase.measureSumMonth = function( source, month ) {
	for (var i in Unit.co2 ) {
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
 * monthly.js 
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

D6.Monthly = {};

D6.Monthly.seasonCalc = function( ave, season, monthly, seasonPatternP, energyCode ) {
	// first use monthly, season
	// next  use seasonPattern

	var month2season = [ 0, 0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 0 ];
	var seasonPatternCons = [ 0, 0, 0 ];
	var seasonPattern = [ 0, 0, 0 ];
	var seasonCount = [ 0, 0, 0 ];
	var seasonCons = [ 0, 0, 0 ];
	var monthlyCons = [];
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
};/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * disp.js 
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
 * dataAverage()			get average value
 * getAverageTable()		get average table data set
 *
 * getItemizeTable()		itemize
 * getItemizeGraph()
 * dataItemize()			get itemized value
 * 
 * getMonthlyGraph()		monthly graph data
 * 
 */

 //resolve D6
var D6 = D6||{};

D6.disp = 
{
	//result total values
	//	param
	//		consName : ex. "consTotal"
	//  return
	//		graphItemize,graphMonthly,average,cons,measure
	showResultTable : function(consName){
		var ret = [];
		if ( consName ) {
			if ( !D6.logicList[consName] ) consName = "consTotal";
			this.nowConsPageName = consName;
		}
		consName = this.nowConsPageName;
		
		//get consCode
		var consCode = D6.consListByName[consName][0].consCode;

		//create collective result
		ret.graphItemize = this.getItemizeGraph(consCode);
		ret.common = D6.getCommonParameters();
		
		ret.graphMonthly = this.getMonthlyGraph();		
		ret.average = this.getAverageTable(consCode);
		ret.averageData = this.dataAverage();
		ret.cons = this.getItemizeTable(consCode);
		ret.measure = this.getMeasureTable(consName);

		return ret;
	},
	
	
	//compare to average value 
	// params
	//		consCode : consumption category
	// return
	//		you and average params
	getAverageTable  : function ( consCode ){
		var ret = [];
		ret.you = D6.consShow[consCode].co2Original*12;		//yearly co2 emission
		ret.after = D6.consShow[consCode].co2*12;			//yearly co2 after set measures
		ret.av = D6.average.consList[consCode].co2*12;		//yearly average co2
		ret.youc = D6.consShow[consCode].costOriginal*12;	//yearly cost
		ret.afterc = D6.consShow[consCode].cost*12;			//yearly cost after set measures
		ret.avc = D6.average.consList[consCode].cost*12;	//yearly average cost
		ret.rank100 = D6.rankIn100( ret.you/ret.av);		//rank( 1-100 )
		ret.afterrank100 = D6.rankIn100( ret.after/ret.av);	//rank after set measures( 1-100 )
		ret.samehome = D6.scenario.defSelectValue["sel021"][Math.max(1,D6.doc.data["i021"])];
			//same home's name
		ret.sameoffice = D6.scenario.defSelectValue["sel001"][Math.max(1,D6.doc.data["i001"])];
			//same office's name
		ret.consCode = consCode;
		return ret;
		
	},
	
	//average compare result 
	dataAverage : function()
	{		
		var ret = [];
		ret.cost = [];
		ret.co2 = [];
		ret.cost[1] = D6.area.averageCostEnergy;
		ret.co2[1] = D6.area.averageCO2Energy;
		ret.co2[1].total = ret.co2[1].electricity + ret.co2[1].gas + ret.co2[1].kerosene + ret.co2[1].car;
		
		ret.cost[0] = [];
		ret.cost[0].electricity = D6.consTotal.priceEle;
		ret.cost[0].gas = D6.consTotal.priceGas;
		ret.cost[0].kerosene = D6.consTotal.priceKeros;
		ret.cost[0].car = D6.consTotal.car * D6.Unit.price.gasoline;

		ret.co2[0] = [];
		ret.co2[0].electricity = D6.consTotal.electricity * D6.Unit.co2.electricity;
		ret.co2[0].gas = D6.consTotal.gas * D6.Unit.co2.gas;
		ret.co2[0].kerosene = D6.consTotal.kerosene * D6.Unit.co2.kerosene;
		ret.co2[0].car = D6.consTotal.car * D6.Unit.co2.gasoline;
		ret.co2[0].total = D6.consTotal.co2Original;
		return ret;
	},

	//itemized value
	// parameter
	// 		consCode : consumption category
	// result
	//		ret[nowConsCode] : itemized data for table( all items )
	//
	getItemizeTable  : function (consCode){
		var ret = [];
		var cons;
		var i = 0;

		for ( var cid in D6.consList ) {
			cons = D6.consList[cid];
			ret[i] = [];

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
	},

	
	//itemize graph data set
	// parameters
	//		consCode: consumption code
	//		sort:sort target (co2,energy,money)
	// result
	//		itemized co2 graph data
	getItemizeGraph  : function ( consCode, sort ){
		var otherCaption = "other";

		if ( consCode ) {
			this.nowConsCode = consCode;
		}
		consCode = this.nowConsCode;
		if ( sort ) {
			this.nowSortTarget = sort;
		}
		sort = this.nowSortTarget;
		
		//graph data
		var menu = {
			co2: {sort:"co2", title:"kg", round:1, divide:1},
			energy: {sort:"jules", title:"GJ", round:1, divide:1000},
			money: {sort:"cost", title:"yen", round:10,divide:1},	// same code to view
		};
		var show = menu[(sort ? sort : "co2")];

		var ret = [];

		//in function getItemizeGraph( return one target of graph data )
		// params
		//		target:   co2/jules/cost
		//		scenario:  
		//		original: "original" or "" 
		//		consCode: 2 charactors
		// result
		//		ret[]	
		var gdata = function( target, scenario, original, consCode ){
			var sorttarget = show.sort;
			if( original ) sorttarget += "Original";
			var sum = 0;
			var data = [];
			var di = 0;
			if ( consCode =="TO") {
				//in case of Total consumption
				for ( var cid in target ) {
					if ( cid == "TO" ) continue;
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] = Math.round(target[cid][sorttarget]/target[consCode][sorttarget]*1000)/10;
					data[di][show.title] = Math.round(target[cid][sorttarget]*12/show.divide*show.round)/show.round;
					data[di]["item"] = target[cid].title;
					di++;
					sum += target[cid][sorttarget];
				}
				data[di] = {};
				data[di]["compare"] = scenario;
				data[di]["ratio"] = Math.round((target["TO"][sorttarget] - sum)/target["TO"][sorttarget]*1000)/10;
				data[di][show.title] = Math.round((target["TO"][sorttarget] - sum)*12/show.divide*show.round)/show.round;
				data[di]["item"] = otherCaption;

			} else {
				//each consumption exclude consTotal
				if ( target[consCode].partCons ) {
					var target2 = target[consCode].partCons;
					for ( var cid in target2 ) {
						//if ( target2[cid].title == target[consCode].title ) continue;
						data[di] = {};
						data[di]["compare"] = scenario;
						data[di]["ratio"] = Math.round(target2[cid][sorttarget]/target[consCode][sorttarget]*1000)/10;
						data[di][show.title] = Math.round(target2[cid][sorttarget]*12/show.divide*show.round)/show.round;
						data[di]["item"] = target2[cid].title + 
							( target2[cid].subID > 0 ? 
								":" +  
								( D6.viewparam.countfix_pre_after == 1 ? 
									target2[cid].countCall + target2[cid].subID : 
									target2[cid].subID + target2[cid].countCall )
							:  "" );
						di++;
						sum += target2[cid][sorttarget];
					}
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] = Math.round((target[consCode][sorttarget] - sum)/target[consCode][sorttarget]*1000)/10;
					data[di][show.title] = Math.round((target[consCode][sorttarget] - sum)*12/show.divide*show.round)/show.round;
					data[di]["item"] = otherCaption;
				} else {
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] = 1000/10;
					data[di][show.title] = Math.round(target[consCode][sorttarget]*12/show.divide*show.round)/show.round;
					data[di]["item"] = target[consCode].title;
					di++;
				}
			}
			return data;
		};

		var captions = ["you", "after", "average"];		//same code to view
		var averageCaption ="";
		if ( D6.targetMode == 1 ){
			averageCaption = D6.scenario.defSelectValue["sel021"][D6.area.area];
		} else {
			averageCaption = D6.scenario.defSelectValue["sel001"][Math.max(1,D6.doc.data["i001"])];
		}
		var data = gdata( D6.consShow, captions[0],true,consCode );
		Array.prototype.push.apply(data, gdata( D6.consShow, captions[1] ,false,consCode));
		Array.prototype.push.apply(data, gdata( D6.average.consList, captions[2],false,consCode) );

		//graph color list ( get from each cons** class )
		var clist = [];
		for ( var cid in D6.consShow ) {
			if ( cid == "TO" ) continue;
			if ( consCode == "TO" || cid == consCode ) {
				clist.push( { title:D6.consShow[cid].title, 
						//co2:D6.consShow[cid].co2, 
						target:D6.consShow[cid][show.sort + "Original"], 
						color:D6.consShow[cid].color });
			}
		}

		//graph order set(sort)
		var ord = [];
		if ( consCode =="TO") {
			D6.ObjArraySort( clist, "target","desc" );
			for ( var cid in clist ) {
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
	},

	//CO2 itemize array
	//
	// return
	//		consObject array ( [0] is consTotal ) only for graph
	//		
	dataItemize : function()
	{
		var consShow = D6.consShow;

		var cons_temp = new Array();
		var cons_rebuild = new Array();
		var ci;

		//remove consTotal
		for ( ci in consShow ) {
			if ( consShow[ci].consCode != "TO" ) {
				cons_temp.push( consShow[ci] );
			}
		}
		
		//sort
		var NUMERIC = 16;			//function parameter stable definition
		var DESCENDING = 2;		//function parameter stable definition
		cons_temp.sortOn( "co2", NUMERIC | DESCENDING );	//sort
		
		//add consTotal as top
		cons_temp.unshift( consShow["TO"] );

		return cons_temp;
	},


	//monthly graph data
	//
	// return
	//		ret.data[]	graph data
	//		ret.yaxis	title
	getMonthlyGraph  : function ( ){
		var retall = [];
		var menu = {
			co2: {sort:"co2", title:"kg", round:1, divide:1},
			energy: {sort:"jules", title:"MJ", round:1, divide:1000},
			money: {sort:"cost", title:"yen", round:1,divide:1},
		};
		var show = menu["money"];
		var ene1 = [
			{ r:0, ene:"electricity", name:D6.Unit.name["electricity"]},
			{ r:1, ene:"gas", name:D6.Unit.name["gas"]},
			{ r:2, ene:"kerosene", name:D6.Unit.name["kerosene"]},
			{ r:3, ene:"coal", name:D6.Unit.name["coal"]},
			{ r:4, ene:"hotwater", name:D6.Unit.name["hotwater"]},
			{ r:5, ene:"car", name:D6.Unit.name["car"]}
		];
		var ene2 = [];
		
		var ret = [];
		var ri = 0;
		var captions = [];
		var e;
		for ( var m=1 ; m<=12 ; m++ ){
			captions[m-1] = m;
			for ( e=0 ; e<ene1.length ;e++ ){
				if ( !D6.consShow["TO"].monthlyPrice[ene1[e].ene] ) continue;
				ret[ri] = [];
				ret[ri]["month"] = m;
				ret[ri][show.title] = Math.round(D6.consShow["TO"].monthlyPrice[ene1[e].ene][m-1]/show.divide*show.round)/show.round;
				ret[ri]["energyname"] = ene1[e].ene;
				ri++;
			}
		}
		retall.data = ret;
		retall.yaxis = show.title;
		return retall;
	}
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
 * 								2016/11/23 divided from disp.js
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
D6.disp.getInputPage = function( consName,subName ) {
	var ret = [];
	var group = [];			//group name
	var groupAddable = [];		//countable consumption list such as rooms/equipments
	var subgroup = [];			//name of subgroup
	var subguide = [];			//guidance to input for subgroup
	var combos = [];			//input combobox html
	var definp;
	var pagename;
	var subid = 0;
	var subcode = "";
	var cons = "";
	var addlist = [];

	//create input data for smartphone 
	for( var c in D6.scenario.defEasyQues ){
		var q = D6.scenario.defEasyQues[c];
		subcode = q.cname;
		group[q.cname] = q.title;
		groupAddable[q.cname] = [];
		addlist[q.cname] = [];
		subgroup[q.cname] = [];
		subguide[q.cname] = [];
		combos[q.cname] = [];
		subguide[q.cname][subcode] = "";
		combos[q.cname][subcode] = "";

		//only same to consName
		for( var i in q.ques ) {
			definp = D6.scenario.defInput[q.ques[i]];
			if ( !definp && D6.debugMode ) console.log( "defEasyQues error no " + q.ques[i] + " in scenarioset" );
			subgroup[q.cname][subcode] = q.title;
			if ( definp.varType == "String" ) {
				combos[q.cname][subcode] += this.createTextArea( q.ques[i] );
			} else {
				combos[q.cname][subcode] += this.createComboBox( q.ques[i] );
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
		subgroup[cname] = [];
		subguide[cname] = [];
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
					combos[cname][subcode] = "";
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
					combos[cname][subcode] += this.createTextArea( i );
				} else {
					combos[cname][subcode] += this.createComboBox( i );
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
D6.disp.createComboBox = function( inpId, onlyCombo )
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
D6.disp.createTextArea = function( inpId, onlyCombo )
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
D6.disp.tfHandlerCombo = function( name ) {
	return function( e ) {
		Input[name] = e.target.value;
    		e.target.removeEventListener( Event.ENTER_FRAME, arguments.callee );
	}
};

	
// parameters used in button view
D6.disp.nowQuesCode = 0;		//now question code "i" + num
D6.disp.nowQuesID = -1;			//now index in series of questions
D6.disp.quesOrder = [];			//question code list
	
//getFirstQues() --------------------------------------------
//		return first question data, for smartphone
D6.disp.getFirstQues = function(consName, subName)
{
	var definp;
	var cons;
	quesOrder = [];
	if ( consName == "easy01") {
		if ( Array.isArray(subName) ) {
			quesOrder = subName;
		} else {
			quesOrder = D6.scenario.defQuesOrder;
		}
	} else {
		for( var i in D6.doc.data ) {
			definp = D6.scenario.defInput[i.substr(0,4)];
			if ( definp.cons == subName ) {
				quesOrder.push( i );
			}
		}
	}
	nowQuesID = 0;
	nowQuesCode =  quesOrder[nowQuesID];
	return this.getQues(nowQuesCode);
};


//getNextQues() --------------------------------------------
//		return next question data, for smartphone
D6.disp.getNextQues = function()
{
	nowQuesID++;
	nowQuesCode =  quesOrder[nowQuesID];
		return this.getQues(nowQuesCode);
};

//getPrevQues() --------------------------------------------
//		return previous question data, for smartphone
D6.disp.getPrevQues = function()
{
	nowQuesID--;
	if ( nowQuesID < 0) nowQuesID = 0;
	nowQuesCode =  quesOrder[nowQuesID];

	return this.getQues(nowQuesCode);
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
D6.disp.getQues = function( id ){
	ret = {};
	if ( this.isEndOfQues() ) {
		ret.info = "end";
	} else {
		ret.info = "continue";
		ret.id = id;
		ret.numques = quesOrder.length;
		ret.nowques = nowQuesID+1;
			
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
D6.disp.getQuesList = function() {
	var ret = [];	
	ret.queslist = D6.doc.data;
	return ret;
};

// isEndOfQues() --------------------------------------------
//		check if end of series of questions, for smartphone
// return
//		true: end of question 
D6.disp.isEndOfQues = function()
{
	var ret = false;
	if ( nowQuesID+1 > quesOrder.length ) {
		ret = true;
	}
	return ret;
};

// escapeHtml() ----------------------------------------------
//		sanitize input
//
D6.disp.escapeHtml = function (String) {
	var escapeMap = {
		'&': '&amp;',
		"'": '&#x27;',
		'`': '&#x60;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;'
	};
	var escapeReg = '[';
	var reg;
	for (var p in escapeMap) {
		if (escapeMap.hasOwnProperty(p)) {
			escapeReg += p;
		}
	}
	escapeReg += ']';
	reg = new RegExp(escapeReg, 'g');
	return function escapeHtml (str) {
		str = (str === null || str === undefined) ? '' : '' + str;
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
D6.disp.getMeasureTable = function( consName, maxPrice = 100000000, notSelected = 0 )
{
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

///get data of Demand graph
// getDemandGraph()-----------------------------------------------------
//		demand graph of sumup and consumption log
// return
//		retall.log		log graph data
//		retall.sumup	pile up graph data
D6.disp.getDemandGraph  = function ( ){
	var work = {};
	var retone = {};
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
	for ( var t=0 ; t<24 ; t++ ){
		log[t] = {};
		log[t]["equip"] = "log";
		log[t]["time"] = t;
		log[t]["electricity_kW"] = D6.doc.data["i056"+(t+1)];
	}
	retall.log = log;		//log data
	return retall;
		
	//set color by ID　"#0000ff";　.toString(16); 1-6 pattern
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
D6.disp.getInputDemandSumup = function() {
	var work = {};
	var ret = {};
	var title = {};
	var pdata = {};
	var demandone= {};
	var combos = [];

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
D6.disp.getInputDemandLog = function() {
	var ret = [];
	for ( var t=0 ; t<24 ; t++ ){
		ret[t] = this.createComboBox( "i056" + (t+1), true );
	}
	return ret;
};
	

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* D6.scenario: シナリオ設定 Class
* 
* 家庭エコ診断　シナリオ設定
* 		別のエクセルシートをもとに、診断シナリオを設定する。
*
*
* @author SUZUKI Yasufumi	2011/06/15
*							2011/10/31 対策40項目設定
*							2013/09/24 デザインパターンの整理
* 								2016/04/12 js
*/


D6.scenario =
{
	//シナリオ記述配列
	defCons : [],
	defMeasures : [],
	defEquipment : [],
	defEquipmentSize : [],
	defInput : [],
	defSelectValue : [],
	defSelectData : [],
	defQuesOrder : [],			//質問順の配列（展開前）

	//消費量計算クラスの実装
	getLogicList : function()
	{
		var logicList = new Array();
		
		//分野設定を追加した場合にはここに記述する
		logicList["consTotal"] = 	D6.consTotal;
		logicList["consEnergy"] = 	D6.consEnergy;
		logicList["consMonth"] = 	D6.consMonth;
		logicList["consSeason"] = 	D6.consSeason;
		logicList["consRM"] = 		D6.consRM;
		logicList["consHWsum"] = 	D6.consHWsum;
		logicList["consCOsum"] = 	D6.consCOsum;
		logicList["consCO"] = 		D6.consCO;
		logicList["consHTsum"] = 	D6.consHTsum;
		logicList["consHT"] = 		D6.consHT;
		logicList["consACsum"] = 	D6.consACsum;
		logicList["consAC"] = 		D6.consAC;
		logicList["consRFsum"] = 	D6.consRFsum;
		logicList["consRF"] = 		D6.consRF;
		logicList["consCKsum"] = 	D6.consCKsum;
		logicList["consLIsum"] = 	D6.consLIsum;
		logicList["consLI"] = 		D6.consLI;
		logicList["consOAsum"] = 	D6.consOAsum;
		logicList["consOTsum"] = 	D6.consOTsum;
		logicList["consOT"] = 		D6.consOT;
		logicList["consCRsum"] = 	D6.consCRsum;
		logicList["consCR"] = 		D6.consCR;
		logicList["consCRtrip"] = 	D6.consCRtrip;

		//今後の展開準備　160619
		// 定格消費電力の設定（最大でどこまでの契約になるのか）、その時点で使っている機器（現状の電力）
		// その他の機器を自由に追加できるようにする。
		//エリアごとの冷暖房等の設定を明確にする
		//冷蔵庫・照明をグループごとに登録できるようにする
		
		return logicList;
	},

	//クラス内容の定義
	setDefs : function()
	{
		var defMeasures = [];
		var defInput = [];
		var defSelectValue = [];
		var defSelectData = [];
		var defQuesOrder = [];
		var defEquipment = [];
		var defEquipmentSize = [];

		//　診断設定（表計算ソフトで設定した別ファイルからコピーする）　
		//-----------------------------

		//【１】Cons構造の定義（なし：各クラスで記述する）

		//【２】Measures構造の定義 配列の分だけ生成する
			// 0 name 		'対策コード'
			// 1 title 		'タイトル　「部屋名の×台目の」に続く文章'
			// 2 equip 		'機器コード'
			// 3 refCons 	'関連消費クラス'
			// 4 titleShort '短いタイトル'
			// 5 titleKids	'子ども向けタイトル'
			// 6 level		'診断レベル(0:常に表示、1:簡易のみ,5:詳細のみ)'
			// 7 figNum		'図番号'
			// 8 lifeTime	'寿命（年）'　数値の最後にhがついた場合は実働時間
			// 9 price		'価格'
			// 10 roanShow	'ローン'
			// 11 standardType'普及型名'
			// 12 hojoGov	'国補助'
			// 13 advice	'アドバイス'
			// 14 lifestyle	'ライフスタイル項目'
			//
			// 計算式については、該当するconsクラスのcalcMeasures関数に記述する

		defMeasures['mTOcontracthigh'] = { mid:'1',  name:'mTOcontracthigh',  title:'低圧契約から高圧契約に変更する',  easyness:'1',  refCons:'consTotal',  titleShort:'高圧契約に変更',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'利用する電気の量が多い場合、低圧契約から高圧契約にするほうが電力単価が安くなります。ただし、受電装置（キュービクル）を設定したり、管理者を設置する必要も出てきます。',   lifestyle:'',   season:'wss' };
		defMeasures['mTOcontracthome'] = { mid:'2',  name:'mTOcontracthome',  title:'低圧契約から従量電灯契約に変更する',  easyness:'1',  refCons:'consTotal',  titleShort:'従量電灯に変更',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'利用する電気が比較的少なく、最も多くの電気を使用する時間帯が短い場合には、従量電灯契約のほうが基本料金が安くなります。低圧電力を想定した三相交流モーター（一部のエアコンや、動力装置）については、単相200Vに対応した機器に置き換える必要があります。',   lifestyle:'',   season:'wss' };
		defMeasures['mTOcontractequip'] = { mid:'3',  name:'mTOcontractequip',  title:'使っていない機器分の契約更新をする',  easyness:'1',  refCons:'consTotal',  titleShort:'機器契約見直し',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'低圧契約では、保有する機器の消費電力の合計値で基本料金が決まる契約方法があります。以前の契約時から、機器を使用しなくなった場合や、省エネ型機器に置き換えた場合には、届け出により基本料金を安くできます。',   lifestyle:'',   season:'wss' };
		defMeasures['mTOcontractbreaker'] = { mid:'4',  name:'mTOcontractbreaker',  title:'負荷設備量ではなく、契約主開閉器（ブレーカー）による契約に変更する',  easyness:'1',  refCons:'consTotal',  titleShort:'ブレーカー契約に変更',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'低圧契約では、保有する機器の消費電力の合計値で基本料金が決まる契約方法があります。複数の機器を同時に使用しない場合には、ブレーカー契約にすることで削減になる場合があります。',   lifestyle:'',   season:'wss' };
		defMeasures['mTOcontractintegrated'] = { mid:'5',  name:'mTOcontractintegrated',  title:'低圧＋従量電灯から、低圧総合電力に変更する',  easyness:'1',  refCons:'consTotal',  titleShort:'低圧総合契約に変更',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'電力会社によっては、低圧電力と従量電灯を合わせた契約形態がある場合があります。別に契約するより、合わせたほうが電気を有効に使えたり、価格を下げたりすることができる場合があります。',   lifestyle:'',   season:'wss' };
		defMeasures['mTOdemand'] = { mid:'6',  name:'mTOdemand',  title:'デマンドコントロールを行う',  easyness:'1',  refCons:'consTotal',  titleShort:'デマンドコントロール',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'500000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mTOreducetranse'] = { mid:'7',  name:'mTOreducetranse',  title:'変圧器の負荷を集約し、稼働台数を減らす',  easyness:'1',  refCons:'consTotal',  titleShort:'変圧器削減',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mTOpeakgenerator'] = { mid:'8',  name:'mTOpeakgenerator',  title:'電力ピーク時間帯の自家発電装置の導入(3kVA)',  easyness:'1',  refCons:'consTotal',  titleShort:'ピーク時の自家発電利用',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'100000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'低圧のブレーカー容量契約の場合、ピーク時の消費電力に応じて12ヶ月の基本料金が決まります。ピーク時の時間が限られている場合、自家発電装置を用意し、ピーク時間帯に発電でまかなうことで、基本料金の削減になります。',   lifestyle:'',   season:'wss' };
		defMeasures['mTOpeakcut'] = { mid:'9',  name:'mTOpeakcut',  title:'電力ピーク時間帯に、電気利用を抑制する',  easyness:'1',  refCons:'consTotal',  titleShort:'ピークカット',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mACfilter'] = { mid:'101',  name:'mACfilter',  title:'フィルターの掃除をする',  easyness:'1',  refCons:'consACsum',  titleShort:'フィルター掃除',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'フィルターがつまっていると、冷暖気の吹き出しが弱くなり、効率が落ちます。定期的にフィルター掃除を行って下さい。',   lifestyle:'1',   season:'wss' };
		defMeasures['mACairinflow'] = { mid:'102',  name:'mACairinflow',  title:'空気取り入れ量を必要最小に押さえる',  easyness:'1',  refCons:'consACsum',  titleShort:'空気取り入れ制御',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'空調をしているときには、換気はなるべく最小限に抑えることで、冷暖気の漏れが少なくなります。ただし、二酸化炭素濃度など、基準を超えないよう、運用には注意を払って下さい。',   lifestyle:'1',   season:'wss' };
		defMeasures['mACarea'] = { mid:'103',  name:'mACarea',  title:'使用していないエリアの空調を停止する',  easyness:'1',  refCons:'consACsum',  titleShort:'空調エリア制限',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'人が入らないエリアや、保管において空調が必要ない場合には、空調を止めることで省エネになります。',   lifestyle:'1',   season:'wss' };
		defMeasures['mACinsulationpipe'] = { mid:'104',  name:'mACinsulationpipe',  title:'室外機のパイプの断熱をしなおす',  easyness:'1',  refCons:'consACsum',  titleShort:'パイプ断熱',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'空調や温冷水の配管が断熱されていないと、熱のロスが発生します。断熱材がはがれていないかをしっかり確認してください。',   lifestyle:'1',   season:'wss' };
		defMeasures['mACreplace'] = { mid:'105',  name:'mACreplace',  title:'省エネ型のエアコンに買い換える',  easyness:'1',  refCons:'consAC',  titleShort:'省エネ型エアコン',  joyfull:'',  level:'',  figNum:'',  lifeTime:'20',  price:'300000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mACheatcool'] = { mid:'106',  name:'mACheatcool',  title:'暖房と冷房を同時に使用しないようにする',  easyness:'1',  refCons:'consACsum',  titleShort:'冷暖房同時使用確認',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'0s0' };
		defMeasures['mACcurtain'] = { mid:'107',  name:'mACcurtain',  title:'店舗の開放された入り口に透明カーテンをとりつける',  easyness:'1',  refCons:'consACsum',  titleShort:'出入口の透明カーテン',  joyfull:'',  level:'',  figNum:'',  lifeTime:'5',  price:'50000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'来客用に入り口を扉で閉めることが難しい場合、のれんのように、透明カーテンを設置することにより、冷気や暖気の漏れを減らすこともできます。透明カーテンなら、店頭から店内を見ることも可能です。',   lifestyle:'1',   season:'wss' };
		defMeasures['mACbackyarddoor'] = { mid:'108',  name:'mACbackyarddoor',  title:'搬入口やバックヤードの扉を閉める',  easyness:'1',  refCons:'consACsum',  titleShort:'バックヤード扉閉じる',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'搬入口やバックヤードも扉が常に開いていると、冷暖気が漏れる原因となります。搬入・搬出が終了するたびに、閉めるようにしてください。',   lifestyle:'1',   season:'wss' };
		defMeasures['mACfrontdoor'] = { mid:'109',  name:'mACfrontdoor',  title:'冷暖房時は店舗の入り口の扉を閉めておく',  easyness:'1',  refCons:'consACsum',  titleShort:'店舗出入口扉閉じる',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'冷暖房をしているときには、入り口の扉は閉めないと、空気の大きな漏れが生じ、消費エネルギーが大きくなります。暑い日や寒い日には、扉を閉めておくことにより、空調が効いていることをアピールすることにもつながります。',   lifestyle:'',   season:'wss' };
		defMeasures['mACclosewindow'] = { mid:'110',  name:'mACclosewindow',  title:'冷暖房機の空調運転開始時に、外気の取り入れをカットする',  easyness:'1',  refCons:'consACsum',  titleShort:'空調時の換気停止',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mACstopcentral'] = { mid:'111',  name:'mACstopcentral',  title:'セントラル空調をやめて、ユニット式のエアコンにする',  easyness:'1',  refCons:'consACsum',  titleShort:'ユニットエアコン利用',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'中央管理のエアコンよりも、部屋ごとにエアコンが設置できる場合には、そのほうが効率がよくなります。',   lifestyle:'',   season:'wss' };
		defMeasures['mHWinverter'] = { mid:'112',  name:'mHWinverter',  title:'循環水ポンプをインバータ式にする',  easyness:'1',  refCons:'consHWsum',  titleShort:'インバータ式ポンプ',  joyfull:'',  level:'',  figNum:'',  lifeTime:'20',  price:'1000000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'チラーなどの循環水を回すときに、インバーター式であれば流量調整をすることができます。温度などを管理しながら、最適な運転を行うことで、省エネにつながります。',   lifestyle:'',   season:'wss' };
		defMeasures['mHWadjust'] = { mid:'113',  name:'mHWadjust',  title:'負荷に応じてボイラーや冷凍機の運転をする',  easyness:'1',  refCons:'consHWsum',  titleShort:'熱源機負荷制御',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'冷凍機は能力に比べて低出力の場合に効率が落ちます。複数台のボイラーや冷凍機がある場合、負荷が小さいときには台数を集約することで効率があがります。',   lifestyle:'1',   season:'wss' };
		defMeasures['mHTtemplature'] = { mid:'114',  name:'mHTtemplature',  title:'暖房の設定温度を控えめにする',  easyness:'1',  refCons:'consHT',  titleShort:'暖房温度設定',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'オフィスなどの暖房の目安温度は20℃とされています。厚着をしたり、足元に毛布をかけるなどして、温かく工夫をしてみてください。ただし、個人で足元用に電熱器を置くと、かえって消費電力を増やしてしまうことにもなりかねませんので、注意してください。',   lifestyle:'1',   season:'w00' };
		defMeasures['mHTnothalogen'] = { mid:'115',  name:'mHTnothalogen',  title:'ハロゲンヒータなどの暖房を使わない',  easyness:'1',  refCons:'consHT',  titleShort:'電熱補助暖房停止',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'暖房時、足元にハロゲンヒータなどを設置すると、暖かさを補うことができますが、こうした暖房器具は消費電力が1000W近くあり、かえって電力消費を増やしてしまいます。暖気が足元へ届くようサーキュレータを回したり、ひざ掛けを使うなど、工夫をしてみてください。',   lifestyle:'',   season:'w00' };
		defMeasures['mHWairratio'] = { mid:'116',  name:'mHWairratio',  title:'ボイラーの空気比を調整する',  easyness:'1',  refCons:'consHWsum',  titleShort:'ボイラー空気比調整',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mHTwindow'] = { mid:'117',  name:'mHTwindow',  title:'外気を活用して空調を止める',  easyness:'1',  refCons:'consHT',  titleShort:'暖房時外気利用',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'冷房時にも外気温が低くなる時間帯などは、空調をとめて外気の取り入れをすることで省エネにつながります。',   lifestyle:'1',   season:'ws0' };
		defMeasures['mHTbrind'] = { mid:'118',  name:'mHTbrind',  title:'暖房時は夕方以降はブラインドを閉める',  easyness:'1',  refCons:'consHT',  titleShort:'暖房時夜ブラインド利用',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'ガラスは熱伝導率が高く、暖気が窓から逃げる割合が大きくなっています。少しでも熱のロスを減らすため、また照明の効率を高めるためにも、夕方以降はブラインドを閉めることが有効です。',   lifestyle:'1',   season:'wss' };
		defMeasures['mHWtenplature'] = { mid:'119',  name:'mHWtenplature',  title:'熱源機の温水出口温度を低めに設定する',  easyness:'1',  refCons:'consHWsum',  titleShort:'熱源機温度設定',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mCOtemplature'] = { mid:'120',  name:'mCOtemplature',  title:'冷房の設定温度を控えめにする',  easyness:'1',  refCons:'consCO',  titleShort:'冷房温度設定',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'冷房の設定温度の目安は28℃です。クールビスや、扇風機の活用などにより、温度設定を低すぎないように調整してください。',   lifestyle:'1',   season:'0ss' };
		defMeasures['mCOroof'] = { mid:'121',  name:'mCOroof',  title:'屋根面に表面反射塗料を塗る',  easyness:'1',  refCons:'consCO',  titleShort:'屋根反射塗料',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'3000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mCOwindow'] = { mid:'122',  name:'mCOwindow',  title:'外気を活用して空調を止める',  easyness:'1',  refCons:'consCO',  titleShort:'冷房時外気利用',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'0ss' };
		defMeasures['mHWwatertemplature'] = { mid:'123',  name:'mHWwatertemplature',  title:'冷凍機の冷水出口温度を高めに設定する',  easyness:'1',  refCons:'consHWsum',  titleShort:'冷水機温度設定',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mCObrind'] = { mid:'124',  name:'mCObrind',  title:'冷房時にブラインドを閉める',  easyness:'1',  refCons:'consCO',  titleShort:'ブラインド',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'日射が入ると、冷房の効率が落ちます。冷房時にはブラインドを閉めて、日射が入らないようにしてください。また、窓から冷気が逃げることがあるため、ブラインドで遮蔽する意味でも有効です。',   lifestyle:'',   season:'0ss' };
		defMeasures['mCOoutunitsolar'] = { mid:'125',  name:'mCOoutunitsolar',  title:'冷房時に室外機が直射日光に当たらないようにする',  easyness:'1',  refCons:'consCO',  titleShort:'室外機日光遮蔽',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'0ss' };
		defMeasures['mCOcurtain'] = { mid:'126',  name:'mCOcurtain',  title:'冷房時に日射を遮る',  easyness:'1',  refCons:'consCO',  titleShort:'日光遮蔽',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'0ss' };
		defMeasures['mLIcull'] = { mid:'501',  name:'mLIcull',  title:'蛍光管の間引きをする',  easyness:'1',  refCons:'consLI',  titleShort:'照明間引き',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'照度が十分にある場所については、蛍光灯の間引きをすることで省エネになります。ただし、2管セットの照明器具の場合には、片方を取り外すと点灯しなかったり、消費電力が結果的に減らない場合もあります。回路を考慮した上で、実施してください。',   lifestyle:'',   season:'wss' };
		defMeasures['mLInotbulb'] = { mid:'502',  name:'mLInotbulb',  title:'シャンデリア照明を使わない',  easyness:'1',  refCons:'consLI',  titleShort:'シャンデリア照明不使用',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mLILED'] = { mid:'503',  name:'mLILED',  title:'従来型蛍光灯をLEDに付け替える',  easyness:'1',  refCons:'consLI',  titleShort:'蛍光灯をLED化',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'30000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'蛍光灯と同じサイズのLEDが販売されています。現在の蛍光管を取り替えるタイプもありましたが、安全のために器具から付け替えるものが望ましいです。',   lifestyle:'1',   season:'wss' };
		defMeasures['mLIhf'] = { mid:'503',  name:'mLIhf',  title:'従来型蛍光灯をHf型に付け替える',  easyness:'1',  refCons:'consLI',  titleShort:'Hf式蛍光灯',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'30000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'蛍光管の太さが細いHf式の蛍光灯は、通常の蛍光灯よりも3割程度省エネとなっています。管だけをつけかることはできず、器具からのつけかえになります。',   lifestyle:'1',   season:'wss' };
		defMeasures['mLImercu2LED'] = { mid:'504',  name:'mLImercu2LED',  title:'水銀灯をLEDに取り替える',  easyness:'1',  refCons:'consLI',  titleShort:'水銀灯をLED化',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'50000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'水銀灯の代替ができるLEDが販売されています。寿命が長く、点灯させてからすぐに明るくなるのも特徴です。',   lifestyle:'1',   season:'wss' };
		defMeasures['mLIspot2LED'] = { mid:'505',  name:'mLIspot2LED',  title:'スポットライトをLEDタイプに変える',  easyness:'1',  refCons:'consLI',  titleShort:'スポット照明をLED化',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'10000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mLIbulb2LED'] = { mid:'508',  name:'mLIbulb2LED',  title:'電球・ハロゲン照明をLEDに取り替える',  easyness:'1',  refCons:'consLI',  titleShort:'電球をLED化',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'5000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mLItask'] = { mid:'507',  name:'mLItask',  title:'手元照明を設置して全体照明を控える',  easyness:'1',  refCons:'consLI',  titleShort:'タスクアンビエント照明',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mLIarea'] = { mid:'509',  name:'mLIarea',  title:'日中に明るいエリアの照明を消す',  easyness:'1',  refCons:'consLI',  titleShort:'昼間照明カット',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mLIwindowswitch'] = { mid:'510',  name:'mLIwindowswitch',  title:'窓側照明の回路をつくり、昼間に消す',  easyness:'1',  refCons:'consLI',  titleShort:'窓際スイッチ回路',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mLIemargency'] = { mid:'511',  name:'mLIemargency',  title:'避難誘導灯を省エネ型に付け替える',  easyness:'1',  refCons:'consLI',  titleShort:'誘導灯LED化',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mLInoperson'] = { mid:'512',  name:'mLInoperson',  title:'不在時の消灯を徹底する',  easyness:'1',  refCons:'consLI',  titleShort:'不在時の消灯徹底',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mLInotuse'] = { mid:'513',  name:'mLInotuse',  title:'不要な場所の消灯をする',  easyness:'1',  refCons:'consLI',  titleShort:'不要場所の消灯',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mLInotusearea'] = { mid:'514',  name:'mLInotusearea',  title:'使用していないエリアの消灯をする',  easyness:'1',  refCons:'consLI',  titleShort:'不使用エリアの消灯',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mHWshowerhead'] = { mid:'201',  name:'mHWshowerhead',  title:'節水型のシャワーヘッドに取り替える',  easyness:'1',  refCons:'consHWsum',  titleShort:'節水シャワーヘッド',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'5000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mHWheatpunp'] = { mid:'202',  name:'mHWheatpunp',  title:'ヒートポンプ式の給湯器に置き換える',  easyness:'1',  refCons:'consHWsum',  titleShort:'ヒートポンプ給湯器',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'800000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mHWcogeneration'] = { mid:'203',  name:'mHWcogeneration',  title:'コジェネに置き換える',  easyness:'1',  refCons:'consHWsum',  titleShort:'コジェネ',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'1000000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mLIcut'] = { mid:'515',  name:'mLIcut',  title:'常時消灯',  easyness:'1',  refCons:'consLIsum',  titleShort:'常時消灯',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mRFnight'] = { mid:'701',  name:'mRFnight',  title:'ナイトカバーの設置',  easyness:'1',  refCons:'consRFsum',  titleShort:'ナイトカバー',  joyfull:'',  level:'',  figNum:'',  lifeTime:'5',  price:'10000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mRFslit'] = { mid:'702',  name:'mRFslit',  title:'スリットカーテン設置',  easyness:'1',  refCons:'consRFsum',  titleShort:'スリットカーテン',  joyfull:'',  level:'',  figNum:'',  lifeTime:'5',  price:'10000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mRFcontroler'] = { mid:'703',  name:'mRFcontroler',  title:'防露ヒーターコントローラー導入',  easyness:'1',  refCons:'consRFsum',  titleShort:'防露コントローラー',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'30000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mRFdoor'] = { mid:'704',  name:'mRFdoor',  title:'スライド扉設置',  easyness:'1',  refCons:'consRFsum',  titleShort:'スライド扉設置',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'30000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mRFflow'] = { mid:'705',  name:'mRFflow',  title:'冷気の吹き出し口、吸い込み口の清掃と吸い込み口の確保',  easyness:'1',  refCons:'consRFsum',  titleShort:'空気口の確保',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'',   season:'wss' };
		defMeasures['mRFicecover'] = { mid:'706',  name:'mRFicecover',  title:'冷凍ナイトカバーの設置',  easyness:'1',  refCons:'consRFsum',  titleShort:'冷凍ナイトカバー',  joyfull:'',  level:'',  figNum:'',  lifeTime:'5',  price:'20000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mRFiceflat'] = { mid:'707',  name:'mRFiceflat',  title:'冷凍ケースを平台型に変更',  easyness:'1',  refCons:'consRFsum',  titleShort:'冷凍平台',  joyfull:'',  level:'',  figNum:'',  lifeTime:'10',  price:'400000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mOAstanby'] = { mid:'601',  name:'mOAstanby',  title:'長時間席を離れるときにはOA機器をスタンバイモードにする',  easyness:'1',  refCons:'consOAsum',  titleShort:'スタンバイモード',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'パソコンを動作状態や、画面ロック状態で動かしていると、多くの電気を消費します。すぐに復帰ができるスタンバイモードが充実してきており、少し離れるときには、スタンバイモードを活用するようにしてください。パソコンにログインした状態で席を離れると、セキュリティ的にも問題があるので、気をつけて下さい。',   lifestyle:'1',   season:'wss' };
		defMeasures['mOAsavemode'] = { mid:'602',  name:'mOAsavemode',  title:'コピー機やプリンタの節電モードを活用する',  easyness:'1',  refCons:'consOAsum',  titleShort:'コピー機節電モード',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'コピー機やプリンタは、待機時にも多くの電気を消費している場合があります。機種により、節電モードが設定できることがあり、活用をしてください。ただし、立ち上がりに多少時間がかかる場合があります。',   lifestyle:'',   season:'wss' };
		defMeasures['mOAconsent'] = { mid:'603',  name:'mOAconsent',  title:'使っていない機器のコンセントから抜いておく',  easyness:'1',  refCons:'consOAsum',  titleShort:'コンセント抜く',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mOAtoilettemplature'] = { mid:'604',  name:'mOAtoilettemplature',  title:'温水便座の温度設定を控えめにする',  easyness:'1',  refCons:'consOAsum',  titleShort:'便座温度設定',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mOAtoiletcover'] = { mid:'605',  name:'mOAtoiletcover',  title:'温水便座の不使用時はふたを閉める',  easyness:'1',  refCons:'consOAsum',  titleShort:'便座ふた',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'',   lifestyle:'1',   season:'wss' };
		defMeasures['mCRecodrive'] = { mid:'801',  name:'mCRecodrive',  title:'エコドライブを実践する',  easyness:'1',  refCons:'consCRsum',  titleShort:'エコドライブ',  joyfull:'',  level:'',  figNum:'',  lifeTime:'',  price:'',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'停車中はなるべくアイドリングストップをしたり、発進時にふんわりスタートする（5秒間かけて時速20km程度まで加速する）ことにより、燃費を1割程度向上させることができます。まわりの車を見ながら、加減速の少ない運転するなどエコドライブをすることで、安全運転にもつながります。',   lifestyle:'',   season:'wss' };
		defMeasures['mCRreplace'] = { mid:'802',  name:'mCRreplace',  title:'エコカーに買い替える',  easyness:'2',  refCons:'consCR',  titleShort:'車買い替え',  joyfull:'エコカーに買いかえる',  level:'',  figNum:'21',  lifeTime:'8',  price:'1800000',  roanShow:'',  standardType:'普及型',  hojoGov:'エコカーの導入にあたっては、「減税」のメリットが得られます。',  advice:'ハイブリッド車や電気自動車以外にも、技術改善により、既存の燃料消費が半分程度で済む低燃費車が開発されて販売されています。購入時には燃費を考慮して選んで下さい。',   lifestyle:'',   season:'wss' };
		defMeasures['mCRreplaceElec'] = { mid:'803',  name:'mCRreplaceElec',  title:'電気自動車を導入する',  easyness:'1',  refCons:'consCR',  titleShort:'電気自動車',  joyfull:'電気自動車にする',  level:'',  figNum:'',  lifeTime:'7',  price:'3000000',  roanShow:'',  standardType:'',  hojoGov:'',  advice:'ガソリンの代わりに充電式電池に電気をため、エンジンの代わりにモーターを回して走ります。エンジンに比べて効率が高く、十分実用的な車として販売がされています。ただし充電スタンドはまだ少なく、充電に時間がかかるため、夜間に充電しておくと便利です。',   lifestyle:'',   season:'wss' };

		

		//【３】入力・変数の設定
			//0	cons 画面・分野
			//1	title 設問
			//2	unit 単位
			//3	text 表示内容
			//4	inputType 入力方法   text / radio定義 / sel定義 / check定義
			//5	right テキスト右詰=1
			//6	postfix 入力処理
			//7	nodata -1のとき表示(-1)
			//8	varType 保存形式
			//9	min
			//10	max
		
		defInput['i012'] = {  cons:'consTotal',  title:'対策として重視する視点',  unit:'',  text:'どんな対策を優先的に表示しますか', inputType:'sel012', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel012']= [ '選んで下さい', 'CO2削減優先', '光熱費削減優先', '取り組みやすさ考慮', '取り組みやすさ優先', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel012']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i001'] = {  cons:'consTotal',  title:'業種',  unit:'',  text:'業種を選んで下さい', inputType:'sel001', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel001']= [ '選んで下さい', '事務所', 'スーパー', 'コンビニエンスストア', 'ほか小売・卸業', '飲食店', '旅館・ホテル', '学校', '病院', '工場', 'その他', '', '', '', '', '' ]; 			defSelectData['sel001']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '', '', '', '', '' ]; 
		defInput['i002'] = {  cons:'consTotal',  title:'営業時間',  unit:'時間/日',  text:'営業日の営業時間を選んで下さい', inputType:'sel002', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel002']= [ '選んで下さい', '6時間', '8時間', '9時間', '10時間', '11時間', '12時間', '13時間', '14時間', '15時間', '16時間', '18時間', '20時間', '24時間', '', '' ]; 			defSelectData['sel002']= [ '-1', '6', '8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '24', '', '' ]; 
		defInput['i003'] = {  cons:'consTotal',  title:'週営業日',  unit:'日/週',  text:'週の営業日を選んで下さい', inputType:'sel003', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel003']= [ '選んで下さい', '3日', '4日', '5日', '6日', '7日', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel003']= [ '-1', '3', '4', '5', '6', '7', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i004'] = {  cons:'consTotal',  title:'建物の構造',  unit:'',  text:'木造ですか鉄骨・鉄筋ですか', inputType:'sel004', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel004']= [ '選んで下さい', '木造', '鉄骨・鉄筋', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel004']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i005'] = {  cons:'consTotal',  title:'延床面積',  unit:'m2',  text:'延床面積をお答え下さい', inputType:'sel005', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel005']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel005']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i007'] = {  cons:'consHTsum',  title:'暖房する期間',  unit:'ヶ月',  text:'よく暖房を使う期間', inputType:'sel007', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel007']= [ '選んで下さい', '暖房をしない', '1ヶ月', '2ヶ月', '3ヶ月', '4ヶ月', '5ヶ月', '6ヶ月', '8ヶ月', '10ヶ月', '', '', '', '', '', '' ]; 			defSelectData['sel007']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', '', '', '', '', '', '' ]; 
		defInput['i008'] = {  cons:'consCOsum',  title:'冷房する期間',  unit:'ヶ月',  text:'よく冷房を使う期間', inputType:'sel008', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel008']= [ '選んで下さい', '暖房をしない', '1ヶ月', '2ヶ月', '3ヶ月', '4ヶ月', '5ヶ月', '6ヶ月', '8ヶ月', '10ヶ月', '', '', '', '', '', '' ]; 			defSelectData['sel008']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', '', '', '', '', '', '' ]; 
		defInput['i009'] = {  cons:'consTotal',  title:'客席数',  unit:'席',  text:'（飲食店の場合）客席数をお答え下さい', inputType:'sel009', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel009']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel009']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i010'] = {  cons:'consTotal',  title:'客室数',  unit:'室',  text:'（旅館・ホテルの場合）客室数をお答え下さい', inputType:'sel010', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel010']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel010']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i011'] = {  cons:'consTotal',  title:'職住一体ですか',  unit:'',  text:'職住一体ですか', inputType:'sel011', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel011']= [ '選んで下さい', '住居部分を含む', '事業分のみ', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel011']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i021'] = {  cons:'consTotal',  title:'都道府県',  unit:'',  text:'都道府県', inputType:'sel021', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel021']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel021']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i022'] = {  cons:'consTotal',  title:'太陽光の設置',  unit:'',  text:'太陽光発電装置を設置していますか', inputType:'sel022', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel022']= [ '選んで下さい', 'していない', 'している', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel022']= [ '-1', '0', '1', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i023'] = {  cons:'consTotal',  title:'太陽光のサイズ',  unit:'kW',  text:'太陽光発電装置のサイズも選んで下さい。', inputType:'sel023', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel023']= [ '選んで下さい', 'していない', 'している（～3kW）', 'している（4kW)', 'している（5kW)', 'している（6～10kW)', 'している（10kW以上）', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel023']= [ '-1', '0', '3', '4', '5', '8', '11', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i024'] = {  cons:'consTotal',  title:'太陽光発電の設置年',  unit:'',  text:'太陽光発電を設置した年', inputType:'sel024', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel024']= [ '選んで下さい', '2010年度以前', '2011-2012年度', '2013年度', '2014年度', '2015年度以降', '設置していない', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel024']= [ '-1', '2010', '2011', '2013', '2014', '2015', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i025'] = {  cons:'consEnergy',  title:'テナント料金に冷暖房代が含まれるか',  unit:'',  text:'テナント料金に冷暖房代が含まれるか', inputType:'sel025', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel025']= [ '選んで下さい', '空調はすべて共益費から出ている', '共益費による空調に加えて、独自で空調を設置している', '空調はすべて自前で払っている', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel025']= [ '-1', '0', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i026'] = {  cons:'consEnergy',  title:'電力会社',  unit:'',  text:'電力会社を選んでください', inputType:'sel026', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel026']= [ '選んで下さい', '北海道電力', '東北電力', '東京電力', '中部電力', '北陸電力', '関西電力', '中部電力', '四国電力', '九州電力', '沖縄電力', 'そのほか', '', '', '', '' ]; 			defSelectData['sel026']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '', '', '', '' ]; 
		defInput['i034'] = {  cons:'consEnergy',  title:'電気契約の種類',  unit:'',  text:'主な電力契約の種類を選んで下さい', inputType:'sel034', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel034']= [ '選んで下さい', '従量電灯A', '従量電灯BC', '時間帯別', '低圧', '低圧総合', '高圧', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel034']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i027'] = {  cons:'consEnergy',  title:'電気契約容量：従量電灯分',  unit:'kVA',  text:'従量電灯を使っている場合、契約容量を記入してください', inputType:'sel027', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel027']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel027']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i028'] = {  cons:'consEnergy',  title:'電気契約容量：従量時間帯契約',  unit:'kVA',  text:'時間帯契約を使っている場合、契約容量を記入してください', inputType:'sel028', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel028']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel028']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i029'] = {  cons:'consEnergy',  title:'電気契約容量：低圧電力分',  unit:'kW',  text:'低圧電力(200～400V）を使っている場合、契約容量を記入してください', inputType:'sel029', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel029']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel029']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i030'] = {  cons:'consEnergy',  title:'電気契約容量：低圧総合電力分',  unit:'kW',  text:'低圧総合電力(200～400Vで時間帯契約を含むもの）を使っている場合、契約容量を記入してください', inputType:'sel030', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel030']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel030']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i031'] = {  cons:'consEnergy',  title:'電気契約容量：高圧電力分',  unit:'kW',  text:'高圧電力(6600V）を使っている場合、契約容量を記入してください', inputType:'sel031', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel031']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel031']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i032'] = {  cons:'consEnergy',  title:'ガス種類',  unit:'',  text:'ガスの種類を選んでください', inputType:'sel032', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel032']= [ '選んで下さい', '都市ガス', 'LPガス', 'ガスを使わない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel032']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i033'] = {  cons:'consEnergy',  title:'重油の種類',  unit:'',  text:'重油の種類を選んでください', inputType:'sel033', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel033']= [ '選んで下さい', 'A重油', 'B・C重油', '重油は使用しない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel033']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i041'] = {  cons:'consEnergy',  title:'平均の月電気代',  unit:'円/月',  text:'平均の月電気代', inputType:'sel041', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel041']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel041']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i042'] = {  cons:'consEnergy',  title:'平均の月ガス代',  unit:'円/月',  text:'平均の月ガス代', inputType:'sel042', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel042']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel042']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i043'] = {  cons:'consEnergy',  title:'平均の月灯油代',  unit:'円/月',  text:'平均の月灯油代', inputType:'sel043', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel043']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel043']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i044'] = {  cons:'consEnergy',  title:'平均の月ガソリン代',  unit:'円/月',  text:'平均の月ガソリン代', inputType:'sel044', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel044']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel044']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i045'] = {  cons:'consEnergy',  title:'平均の月重油料金',  unit:'円/月',  text:'平均の月重油料金', inputType:'sel045', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel045']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel045']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i051'] = {  cons:'consEnergy',  title:'平均の月電気消費量',  unit:'kWh/月',  text:'平均の月電気消費量', inputType:'sel051', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel051']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel051']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i052'] = {  cons:'consEnergy',  title:'平均の月ガス消費量',  unit:'m3/月',  text:'平均の月ガス消費量', inputType:'sel052', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel052']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel052']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i053'] = {  cons:'consEnergy',  title:'平均の月灯油消費量',  unit:'L/月',  text:'平均の月灯油消費量', inputType:'sel053', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel053']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel053']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i054'] = {  cons:'consEnergy',  title:'平均の月ガソリン消費量',  unit:'L/月',  text:'平均の月ガソリン消費量', inputType:'sel054', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel054']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel054']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i055'] = {  cons:'consEnergy',  title:'平均の月重油消費量',  unit:'L/月',  text:'平均の月重油消費量', inputType:'sel055', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel055']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel055']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i056'] = {  cons:'consElecTime',  title:'時間帯電気消費量',  unit:'kWｈ/時',  text:'時間帯電気消費量', inputType:'sel056', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel056']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel056']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i061'] = {  cons:'consSeason',  title:'月電気代',  unit:'円/月',  text:'月電気代', inputType:'sel061', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel061']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel061']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i062'] = {  cons:'consSeason',  title:'月ガス代',  unit:'円/月',  text:'月ガス代', inputType:'sel062', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel062']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel062']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i063'] = {  cons:'consSeason',  title:'月灯油代',  unit:'円/月',  text:'月灯油代', inputType:'sel063', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel063']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel063']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i064'] = {  cons:'consSeason',  title:'月ガソリン代',  unit:'円/月',  text:'月ガソリン代', inputType:'sel064', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel064']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel064']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i065'] = {  cons:'consSeason',  title:'月重油料金',  unit:'円/月',  text:'月重油料金', inputType:'sel065', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel065']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel065']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i071'] = {  cons:'consMonth',  title:'月電気代',  unit:'円/月',  text:'月電気代', inputType:'sel071', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel071']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel071']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i072'] = {  cons:'consMonth',  title:'月ガス代',  unit:'円/月',  text:'月ガス代', inputType:'sel072', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel072']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel072']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i073'] = {  cons:'consMonth',  title:'月灯油代',  unit:'円/月',  text:'月灯油代', inputType:'sel073', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel073']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel073']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i074'] = {  cons:'consMonth',  title:'月ガソリン代',  unit:'円/月',  text:'月ガソリン代', inputType:'sel074', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel074']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel074']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i075'] = {  cons:'consMonth',  title:'月重油料金',  unit:'円/月',  text:'月重油料金', inputType:'sel075', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel075']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel075']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i081'] = {  cons:'consMonth',  title:'月電気消費量',  unit:'kWh/月',  text:'月電気消費量', inputType:'sel081', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel081']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel081']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i082'] = {  cons:'consMonth',  title:'月ガス消費量',  unit:'m3/月',  text:'月ガス消費量', inputType:'sel082', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel082']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel082']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i083'] = {  cons:'consMonth',  title:'月灯油消費量',  unit:'L/月',  text:'月灯油消費量', inputType:'sel083', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel083']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel083']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i084'] = {  cons:'consMonth',  title:'月ガソリン消費量',  unit:'L/月',  text:'月ガソリン消費量', inputType:'sel084', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel084']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel084']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i085'] = {  cons:'consMonth',  title:'月重油消費量',  unit:'L/月',  text:'月重油消費量', inputType:'sel085', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel085']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel085']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i091'] = {  cons:'consRM',  title:'部屋名',  unit:'',  text:'部屋や用途区分ができるエリアの名前を記入してください', inputType:'sel091', right:'', postfix:'', demand:'', varType:'String', min:'', max:'', defaultValue:''}; 			defSelectValue['sel091']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel091']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i092'] = {  cons:'consRM',  title:'床面積',  unit:'m2',  text:'そのエリアの面積をお答え下さい(m2)', inputType:'sel092', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel092']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel092']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i093'] = {  cons:'consRM',  title:'主な用途',  unit:'',  text:'そのエリア・部屋の主な用途をお答え下さい', inputType:'sel093', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel093']= [ '選んで下さい', '事務所・控室', '来客者用・店舗', '倉庫・バックヤード', '工場', 'その他', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel093']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i101'] = {  cons:'consHWsum',  title:'暖房・温水用熱源機の種類',  unit:'',  text:'温水暖房もしくは給湯用の熱源機の種類を選んで下さい', inputType:'sel101', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel101']= [ '選んで下さい', '電熱', '電気ヒートポンプ', 'ガス', 'ガスコジェネ', '灯油', '重油', '太陽熱', '薪', 'ない', '', '', '', '', '', '' ]; 			defSelectData['sel101']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ]; 
		defInput['i102'] = {  cons:'consHWsum',  title:'客室への風呂設置',  unit:'',  text:'客室に浴室が設置されていますか', inputType:'sel102', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:''}; 			defSelectValue['sel102']= [ '選んで下さい', 'すべてある', '半分程度ある', '一部ある', 'ない', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel102']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i103'] = {  cons:'consHWsum',  title:'大浴場',  unit:'',  text:'大浴場はありますか', inputType:'sel103', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel103']= [ '選んで下さい', 'ある', 'ない', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel103']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i104'] = {  cons:'consHWsum',  title:'シャワー利用者数',  unit:'人/日',  text:'シャワーの利用者数', inputType:'sel104', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel104']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel104']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i105'] = {  cons:'consHWsum',  title:'調理の食事提供数',  unit:'食/日',  text:'何食提供をしていますか', inputType:'sel105', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel105']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel105']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i201'] = {  cons:'consCOsum',  title:'空調設定区分',  unit:'',  text:'中央での一括管理ですか、部屋ごとに設定ができますか', inputType:'sel201', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel201']= [ '選んで下さい', '中央管理', '部屋での設定', '併用可能', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel201']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i202'] = {  cons:'consCOsum',  title:'空調設定操作場所',  unit:'',  text:'温度操作は、部屋でできますか', inputType:'sel202', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel202']= [ '選んで下さい', '全館一括', '個別設定', '併用可能', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel202']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i203'] = {  cons:'consHTsum',  title:'全体の暖房熱源',  unit:'',  text:'全体の暖房熱源', inputType:'sel203', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel203']= [ '選んで下さい', 'エアコン', '電気熱暖房', 'ガス', '灯油', '重油', '薪・ペレット', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel203']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i204'] = {  cons:'consCOsum',  title:'全体の冷房の熱源',  unit:'',  text:'全体の冷房の熱源', inputType:'sel204', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel204']= [ '選んで下さい', '電気', 'ガス', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel204']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i205'] = {  cons:'consHTsum',  title:'全体の暖房管理温度',  unit:'℃',  text:'全体の暖房管理温度', inputType:'sel205', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel205']= [ '選んで下さい', '使わない', '18℃', '19℃', '20℃', '21℃', '22℃', '23℃', '24℃', '25℃', '26℃以上', '', '', '', '', '' ]; 			defSelectData['sel205']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ]; 
		defInput['i206'] = {  cons:'consCOsum',  title:'全体の冷房管理温度',  unit:'℃',  text:'全体の冷房管理温度', inputType:'sel206', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel206']= [ '選んで下さい', '24℃以下', '25℃', '26℃', '27℃', '28℃', '29℃', '30℃', '使わない', '', '', '', '', '', '', '' ]; 			defSelectData['sel206']= [ '-1', '24', '25', '26', '27', '28', '29', '30', '0', '', '', '', '', '', '', '' ]; 
		defInput['i211'] = {  cons:'consHT',  title:'暖房管理温度',  unit:'℃',  text:'暖房管理温度', inputType:'sel211', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel211']= [ '選んで下さい', '使わない', '18℃', '19℃', '20℃', '21℃', '22℃', '23℃', '24℃', '25℃', '26℃以上', '', '', '', '', '' ]; 			defSelectData['sel211']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ]; 
		defInput['i212'] = {  cons:'consHT',  title:'暖房器具',  unit:'',  text:'暖房器具', inputType:'sel212', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel212']= [ '選んで下さい', 'エアコン', '電気熱暖房', 'ガス', '灯油', '重油', '薪・ペレット', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel212']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i213'] = {  cons:'consHT',  title:'補助暖房の熱源',  unit:'',  text:'補助暖房の熱源', inputType:'sel213', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel213']= [ '選んで下さい', '電気ヒータ', 'ガス', '灯油', '使わない', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel213']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i214'] = {  cons:'consCO',  title:'冷房管理温度',  unit:'℃',  text:'冷房管理温度', inputType:'sel214', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel214']= [ '選んで下さい', '24℃以下', '25℃', '26℃', '27℃', '28℃', '29℃', '30℃', '使わない', '', '', '', '', '', '', '' ]; 			defSelectData['sel214']= [ '-1', '24', '25', '26', '27', '28', '29', '30', '0', '', '', '', '', '', '', '' ]; 
		defInput['i215'] = {  cons:'consCo',  title:'エアコンの定格消費電力（kW)',  unit:'kW',  text:'複数台ある場合には、合計の最大定格消費電力を記入してください。', inputType:'sel215', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel215']= [ '選んで下さい', '持っていない', '1年未満', '3年未満', '5年未満', '7年未満', '10年未満', '15年未満', '20年未満', '20年以上', '', '', '', '', '', '' ]; 			defSelectData['sel215']= [ '-1', '0', '1', '2', '4', '6', '9', '13', '18', '25', '', '', '', '', '', '' ]; 
		defInput['i216'] = {  cons:'consCo',  title:'エアコンの使用年数',  unit:'年',  text:'エアコンの使用年数', inputType:'sel216', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel216']= [ '選んで下さい', '持っていない', '1年未満', '3年未満', '5年未満', '7年未満', '10年未満', '15年未満', '20年未満', '20年以上', '', '', '', '', '', '' ]; 			defSelectData['sel216']= [ '-1', '0', '1', '2', '4', '6', '9', '13', '18', '25', '', '', '', '', '', '' ]; 
		defInput['i217'] = {  cons:'consCO',  title:'夏の西日',  unit:'',  text:'夏に西日が窓にあたりますか', inputType:'sel217', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel217']= [ '選んで下さい', 'よく入る', '少しはいる', 'あまり入らない', '対策済み', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel217']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i218'] = {  cons:'consCO',  title:'部屋の上が屋根',  unit:'',  text:'この部屋の上が屋根面にあたりますか', inputType:'sel218', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel218']= [ '選んで下さい', 'はい', 'いいえ', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel218']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i219'] = {  cons:'consHT',  title:'夜間にはカーテンやブラインドを閉めていますか',  unit:'',  text:'夜間にはカーテンやブラインドを閉めていますか', inputType:'sel219', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel219']= [ '選んで下さい', 'はい', 'いいえ', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel219']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i231'] = {  cons:'consCOsum',  title:'店舗の冷暖房時の入り口の開放対策',  unit:'',  text:'店舗の冷暖房時の入り口の開放対策', inputType:'sel231', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel231']= [ '選んで下さい', '開けっ放し', '自動ドア', 'のれん等を設置', '閉めている', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel231']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i232'] = {  cons:'consCOsum',  title:'室外機のパイプの断熱が適切にされている',  unit:'',  text:'室外機のパイプの断熱が適切にされている', inputType:'sel232', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel232']= [ '選んで下さい', 'はい', 'いいえ', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel232']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i233'] = {  cons:'consCOsum',  title:'春秋の季節、冷房と暖房の両方を稼働させている時がありますか',  unit:'',  text:'春秋の季節、冷房と暖房の両方を稼働させている時がありますか', inputType:'sel233', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel233']= [ '選んで下さい', 'ある', 'ない', 'わからない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel233']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i234'] = {  cons:'consCOsum',  title:'循環水ポンプはインバータ式ですか',  unit:'',  text:'循環水ポンプはインバータ式ですか', inputType:'sel234', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel234']= [ '選んで下さい', 'はい', 'いいえ', 'わからない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel234']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i235'] = {  cons:'consCOsum',  title:'負荷に応じてボイラーや冷凍機の数の調整いて運転していますか',  unit:'',  text:'負荷に応じてボイラーや冷凍機の数の調整いて運転していますか', inputType:'sel235', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel235']= [ '選んで下さい', 'はい', 'いいえ', 'わからない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel235']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i501'] = {  cons:'consLIsum',  title:'主に使う照明器具',  unit:'',  text:'主に使う照明器具', inputType:'sel501', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel501']= [ '選んで下さい', '蛍光灯（太管）', 'Hf蛍光灯', 'LED', '白熱灯・ハロゲン灯', '水銀灯', 'セラミックメタルハライド', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel501']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i502'] = {  cons:'consLIsum',  title:'補助で使う照明器具',  unit:'',  text:'補助で使う照明器具', inputType:'sel502', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel502']= [ '選んで下さい', '蛍光灯（太管）', 'Hf蛍光灯', 'LED', '白熱灯・ハロゲン灯', '水銀灯', 'セラミックメタルハライド', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel502']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i503'] = {  cons:'consLIsum',  title:'平均照明時間',  unit:'時間/日',  text:'照明の利用時間を選んで下さい', inputType:'sel503', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel503']= [ '選んで下さい', '使わない', '1時間', '2時間', '3時間', '4時間', '6時間', '8時間', '10時間', '12時間', '16時間', '20時間', '24時間', '', '', '' ]; 			defSelectData['sel503']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '10', '12', '16', '20', '24', '', '', '' ]; 
		defInput['i515'] = {  cons:'consLI',  title:'照明の場所',  unit:'',  text:'照明を設置している部屋・エリアなどを記入してください', inputType:'sel515', right:'', postfix:'', demand:'4', varType:'String', min:'', max:'', defaultValue:''}; 			defSelectValue['sel515']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel515']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i511'] = {  cons:'consLI',  title:'照明器具',  unit:'',  text:'同じ部屋でも照明器具ごとに別に記入します。同じ時期に導入した器具をまとめて記入してください。', inputType:'sel511', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:''}; 			defSelectValue['sel511']= [ '選んで下さい', '蛍光灯（太管）', 'Hf蛍光灯', 'LED', '白熱灯・ハロゲン灯', '水銀灯', 'セラミックメタルハライド', 'センサー付き照明', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel511']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '', '', '', '', '', '', '', '' ]; 
		defInput['i512'] = {  cons:'consLI',  title:'照明器具の消費電力',  unit:'W',  text:'照明器具の消費電力', inputType:'sel512', right:'', postfix:'', demand:'2', varType:'Number', min:'', max:'', defaultValue:''}; 			defSelectValue['sel512']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel512']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i513'] = {  cons:'consLI',  title:'照明器具の数',  unit:'器',  text:'照明器具の数', inputType:'sel513', right:'', postfix:'', demand:'3', varType:'Number', min:'', max:'', defaultValue:''}; 			defSelectValue['sel513']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel513']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i514'] = {  cons:'consLI',  title:'照明時間',  unit:'時間/日',  text:'照明の利用時間を選んで下さい', inputType:'sel514', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel514']= [ '選んで下さい', '使わない', '1時間', '2時間', '3時間', '4時間', '6時間', '8時間', '10時間', '12時間', '16時間', '20時間', '24時間', '', '', '' ]; 			defSelectData['sel514']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '10', '12', '16', '20', '24', '', '', '' ]; 
		defInput['i516'] = {  cons:'consLI',  title:'使用開始時刻',  unit:'',  text:'使用開始時刻', inputType:'sel516', right:'', postfix:'', demand:'5', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel516']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel516']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i517'] = {  cons:'consLI',  title:'使用終了時刻',  unit:'',  text:'使用終了時刻', inputType:'sel517', right:'', postfix:'', demand:'6', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel517']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel517']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i531'] = {  cons:'consOAsum',  title:'昼休み時間帯の照明中止',  unit:'',  text:'昼休み時間帯の照明中止', inputType:'sel531', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel531']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel531']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i532'] = {  cons:'consOAsum',  title:'窓際など明るい部分の照明停止',  unit:'',  text:'窓際など明るい部分の照明停止', inputType:'sel532', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel532']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel532']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i601'] = {  cons:'consOAsum',  title:'デスクトップパソコン台数',  unit:'台',  text:'常時利用しているデスクトップ型パソコンの台数を記入してください', inputType:'sel601', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel601']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel601']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i602'] = {  cons:'consOAsum',  title:'ノートパソコン台数',  unit:'台',  text:'常時利用しているノート型パソコンの台数を記入してください', inputType:'sel602', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel602']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel602']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i603'] = {  cons:'consOAsum',  title:'プリンタ・コピー機台数',  unit:'台',  text:'常時利用しているプリンタ・コピー機の台数を記入してください', inputType:'sel603', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel603']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel603']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i604'] = {  cons:'consOAsum',  title:'サーバールーム',  unit:'',  text:'サーバールームはありますか', inputType:'sel604', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel604']= [ '選んで下さい', 'ある', 'ない', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel604']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i621'] = {  cons:'consOAsum',  title:'非使用時のパソコンの休止設定の徹底',  unit:'',  text:'非使用時のパソコンの休止設定の徹底', inputType:'sel621', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel621']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel621']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i622'] = {  cons:'consOAsum',  title:'プリンタ・コピー機の休止モード活用',  unit:'',  text:'プリンタ・コピー機の休止モード活用', inputType:'sel622', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel622']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel622']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i699'] = {  cons:'consOAsum',  title:'事務機器の定格消費電力合計(kW)',  unit:'kW',  text:'事務機器の定格消費電力合計(kW)', inputType:'sel699', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel699']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel699']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i701'] = {  cons:'consRFsum',  title:'家庭用冷凍冷蔵庫台数',  unit:'台',  text:'家庭用冷凍冷蔵庫台数', inputType:'sel701', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel701']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel701']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i711'] = {  cons:'consRFsum',  title:'業務用冷蔵庫台数',  unit:'台',  text:'業務用冷蔵庫台数', inputType:'sel711', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel711']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel711']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i712'] = {  cons:'consRFsum',  title:'業務用冷凍庫台数',  unit:'台',  text:'業務用冷凍庫台数', inputType:'sel712', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel712']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel712']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i713'] = {  cons:'consRFsum',  title:'冷蔵ショーケース（扉あり）台数',  unit:'台',  text:'冷蔵ショーケース（扉あり）台数', inputType:'sel713', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel713']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel713']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i714'] = {  cons:'consRFsum',  title:'冷蔵ショーケース（扉なし）台数',  unit:'台',  text:'冷蔵ショーケース（扉なし）台数', inputType:'sel714', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel714']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel714']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i715'] = {  cons:'consRFsum',  title:'冷凍ショーケース（扉あり）台数',  unit:'台',  text:'冷凍ショーケース（扉あり）台数', inputType:'sel715', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel715']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel715']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i716'] = {  cons:'consRFsum',  title:'冷凍ショーケース（扉なし）台数',  unit:'台',  text:'冷凍ショーケース（扉なし）台数', inputType:'sel716', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel716']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel716']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i717'] = {  cons:'consRFsum',  title:'冷凍平台台数',  unit:'台',  text:'冷凍平台台数', inputType:'sel717', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel717']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel717']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i721'] = {  cons:'consRFsum',  title:'夜間のショーケースへの断熱カバーの設置',  unit:'',  text:'夜間のショーケースへの断熱カバーの設置', inputType:'sel721', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel721']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel721']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i722'] = {  cons:'consRFsum',  title:'スリットカーテンの設置',  unit:'',  text:'スリットカーテンの設置', inputType:'sel722', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel722']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel722']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i723'] = {  cons:'consRFsum',  title:'防露ヒーターコントローラー導入',  unit:'',  text:'防露ヒーターコントローラー導入', inputType:'sel723', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel723']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel723']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i724'] = {  cons:'consRFsum',  title:'冷気の吹きし口、吸い込み口の清掃と確保',  unit:'',  text:'冷気の吹きし口、吸い込み口の清掃と確保', inputType:'sel724', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel724']= [ '選んで下さい', 'している', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel724']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i731'] = {  cons:'consRF',  title:'冷蔵庫の種類',  unit:'',  text:'冷蔵庫の種類', inputType:'sel731', right:'', postfix:'', demand:'4', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel731']= [ '選んで下さい', '家庭用冷蔵庫', '業務用冷蔵庫', '業務用冷凍庫', '冷蔵ショーケース', '冷凍ショーケース', '冷蔵平台ショーケース', '冷凍平台ショーケース', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel731']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '', '', '', '', '', '', '', '' ]; 
		defInput['i736'] = {  cons:'consRF',  title:'扉の有無',  unit:'',  text:'（ショーケースの場合）扉がついていますか', inputType:'sel736', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel736']= [ '選んで下さい', 'ある', 'ない', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel736']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i732'] = {  cons:'consRF',  title:'使用年数',  unit:'年',  text:'使用年数', inputType:'sel732', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel732']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel732']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i733'] = {  cons:'consRF',  title:'台数',  unit:'台',  text:'同じ規格・購入年のショーケース・冷蔵庫の場合には、まとめて記入できます', inputType:'sel733', right:'', postfix:'', demand:'3', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel733']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel733']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i734'] = {  cons:'consRF',  title:'定格内容量（L)',  unit:'リットル',  text:'定格内容量（L)', inputType:'sel734', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel734']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel734']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i799'] = {  cons:'consRF',  title:'定格消費電力(kW)',  unit:'kW',  text:'定格消費電力(kW)', inputType:'sel799', right:'', postfix:'', demand:'1', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel799']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel799']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i801'] = {  cons:'consOTsum',  title:'その他の機器概要',  unit:'',  text:'その他の機器', inputType:'', right:'', postfix:'', demand:'', varType:'String', min:'', max:'', defaultValue:''}; 			defSelectValue['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i811'] = {  cons:'consOT',  title:'機器の名前',  unit:'',  text:'その他の機器', inputType:'', right:'', postfix:'', demand:'4', varType:'String', min:'', max:'', defaultValue:''}; 			defSelectValue['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i899'] = {  cons:'consOT',  title:'定格消費電力(kW)',  unit:'kW',  text:'定格消費電力(kW)', inputType:'sel899', right:'', postfix:'', demand:'1', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel899']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel899']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i812'] = {  cons:'consOT',  title:'台数',  unit:'台',  text:'台数', inputType:'sel812', right:'', postfix:'', demand:'3', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel812']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel812']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i813'] = {  cons:'consOT',  title:'使用時の1日使用時間',  unit:'時間/日',  text:'使用時の1日使用時間', inputType:'sel813', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel813']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel813']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i814'] = {  cons:'consOT',  title:'使用頻度',  unit:'日/年',  text:'使用頻度', inputType:'sel814', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel814']= [ '選んで下さい', '毎日', '週5日', '2日に1日', '週2日', '週1日', '月2-3日', '月1日', '2ヶ月に1日', '3-4ヶ月に1日', '年2日', '年1日', '', '', '', '' ]; 			defSelectData['sel814']= [ '-1', '365', '270', '180', '100', '50', '30', '12', '6', '4', '2', '1', '', '', '', '' ]; 
		defInput['i815'] = {  cons:'consOT',  title:'使用開始時刻',  unit:'',  text:'使用開始時刻', inputType:'sel815', right:'', postfix:'', demand:'5', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel815']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel815']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i816'] = {  cons:'consOT',  title:'使用終了時刻',  unit:'',  text:'使用終了時刻', inputType:'sel816', right:'', postfix:'', demand:'6', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel816']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel816']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
								
		defInput['i901'] = {  cons:'consCRsum',  title:'乗用車の保有台数',  unit:'台',  text:'乗用車の保有台数', inputType:'sel901', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel901']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel901']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i902'] = {  cons:'consCRsum',  title:'スクータ・バイクの保有台数',  unit:'台',  text:'スクータ・バイクの保有台数', inputType:'sel902', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel902']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel902']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i903'] = {  cons:'consCRsum',  title:'軽トラック・バンの保有台数',  unit:'台',  text:'軽トラック・バンの保有台数', inputType:'sel903', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel903']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel903']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i904'] = {  cons:'consCRsum',  title:'ディーゼルトラックの保有台数',  unit:'台',  text:'ディーゼルトラックの保有台数', inputType:'sel904', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel904']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel904']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i911'] = {  cons:'consCRsum',  title:'低炭素乗用車の保有台数',  unit:'台',  text:'低炭素乗用車の保有台数', inputType:'sel911', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel911']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel911']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i912'] = {  cons:'consCRsum',  title:'低炭素軽トラックの保有台数',  unit:'台',  text:'低炭素軽トラックの保有台数', inputType:'sel912', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel912']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel912']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i913'] = {  cons:'consCRsum',  title:'低炭素トラックの保有台数',  unit:'台',  text:'低炭素トラックの保有台数', inputType:'sel913', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel913']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel913']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i914'] = {  cons:'consCRsum',  title:'エコドライブ講習の定期的実施',  unit:'',  text:'エコドライブ講習の定期的実施', inputType:'sel914', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel914']= [ '選んで下さい', '全員にしている', '一部している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel914']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i911'] = {  cons:'consCR',  title:'車の種類',  unit:'',  text:'車の種類', inputType:'sel911', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel911']= [ '選んで下さい', '乗用車', 'スクータ・バイク', '軽トラック・バン', '2tトラック', '4tトラック', '10tトラック', 'バス', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel911']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '', '', '', '', '', '', '', '' ]; 
		defInput['i912'] = {  cons:'consCR',  title:'車の燃費',  unit:'',  text:'車の燃費', inputType:'sel912', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel912']= [ '選んで下さい', '6km/L以下', '7-9km/L', '10-12km/L', '13-15km/L', '16-20km/L', '21-26km/L', '27-35km/L', '36km/L以上', '', '', '', '', '', '', '' ]; 			defSelectData['sel912']= [ '-1', '6', '8', '11', '14', '18', '23', '30', '40', '', '', '', '', '', '', '' ]; 
		defInput['i913'] = {  cons:'consCR',  title:'この車種の台数',  unit:'台',  text:'この車種の台数', inputType:'sel913', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:''}; 			defSelectValue['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i914'] = {  cons:'consCR',  title:'エコタイヤを使っていますか',  unit:'',  text:'エコタイヤを使っていますか', inputType:'sel914', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel914']= [ '選んで下さい', 'はい', 'いいえ', 'わからない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel914']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i921'] = {  cons:'consCRtrip',  title:'行き先',  unit:'',  text:'よく出かける行き先', inputType:'sel921', right:'', postfix:'', demand:'', varType:'String', min:'', max:'', defaultValue:''}; 			defSelectValue['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i922'] = {  cons:'consCRtrip',  title:'頻度',  unit:'',  text:'どの程度車で行きますか', inputType:'sel922', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel922']= [ '選んで下さい', '毎日', '週5回', '週2～3回', '週1回', '月に2回', '月1回', '２ヶ月に1回', '年2-3回', '年1回', '', '', '', '', '', '' ]; 			defSelectData['sel922']= [ '-1', '365', '250', '120', '50', '25', '12', '6', '2', '1', '', '', '', '', '', '' ]; 
		defInput['i923'] = {  cons:'consCRtrip',  title:'片道距離',  unit:'km',  text:'片道距離', inputType:'sel923', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel923']= [ '選んで下さい', '1km', '2km', '3km', '5km', '10km', '20km', '30km', '50km', '100km', '200km', '400km', '600km以上', '', '', '' ]; 			defSelectData['sel923']= [ '-1', '1', '2', '3', '5', '10', '20', '30', '50', '100', '200', '400', '700', '', '', '' ]; 
		defInput['i924'] = {  cons:'consCRtrip',  title:'使用する車',  unit:'',  text:'どの車を主に使いますか', inputType:'sel924', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel924']= [ '選んで下さい', '1台目', '2台目', '3台目', '4台目', '5台目', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel924']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i931'] = {  cons:'consCRsum',  title:'アイドリングストップ',  unit:'',  text:'長時間の停車でアイドリングストップをしていますか', inputType:'sel931', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel931']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel931']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i932'] = {  cons:'consCRsum',  title:'急加速や急発進',  unit:'',  text:'急加速や急発進をしないようにしていますか', inputType:'sel932', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel932']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel932']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i933'] = {  cons:'consCRsum',  title:'加減速の少ない運転',  unit:'',  text:'加減速の少ない運転', inputType:'sel933', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel933']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel933']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i934'] = {  cons:'consCRsum',  title:'早めのアクセルオフ',  unit:'',  text:'早めのアクセルオフ', inputType:'sel934', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel934']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel934']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i935'] = {  cons:'consCRsum',  title:'道路交通情報の活用',  unit:'',  text:'道路交通情報の活用', inputType:'sel935', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel935']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel935']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i936'] = {  cons:'consCRsum',  title:'不要な荷物',  unit:'',  text:' 不要な荷物は積まずに走行', inputType:'sel936', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel936']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel936']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i937'] = {  cons:'consCRsum',  title:'カーエアコンの温度調節',  unit:'',  text:'カーエアコンの温度・風量をこまめに調節していますか', inputType:'sel937', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel937']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel937']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		defInput['i938'] = {  cons:'consCRsum',  title:'暖機運転',  unit:'',  text:'寒い日に暖機運転をしていますか', inputType:'sel938', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel938']= [ '選んで下さい', '1000円', '2000円', '3000円', '5000円', '7000円', '1万円', '1万2000円', '1万5000円', '2万円', '3万円', 'それ以上', '', '', '', '' ]; 			defSelectData['sel938']= [ '-1', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '', '' ]; 
		defInput['i939'] = {  cons:'consCRsum',  title:'タイヤの空気圧',  unit:'',  text:'タイヤの空気圧を適切に保つよう心がけていますか', inputType:'sel939', right:'', postfix:'', demand:'', varType:'Number', min:'', max:'', defaultValue:'-1'}; 			defSelectValue['sel939']= [ '選んで下さい', 'いつもしている', '時々している', 'していない', '', '', '', '', '', '', '', '', '', '', '', '' ]; 			defSelectData['sel939']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ]; 
		
//ここまでの範囲のデータを別ファイルから読み込む　--------------------------

//時刻設定
		defSelectValue['sel815']= [ '選んで下さい', '0時', '1時', '2時', '3時', '4時', '5時', '6時', '7時', '8時', '9時', '10時', '11時', '12時', '13時', '14時', '15時', '16時', '17時', '18時', '19時', '20時', '21時', '22時', '23時', '24時' ]; 
		defSelectData['sel815']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24' ]; 
		defSelectValue['sel816'] = defSelectValue['sel815'];
		defSelectData['sel816'] = defSelectData['sel815'];
		defSelectValue['sel516'] = defSelectValue['sel815'];
		defSelectData['sel516'] = defSelectData['sel815'];
		defSelectValue['sel517'] = defSelectValue['sel815'];
		defSelectData['sel517'] = defSelectData['sel815'];

//都道府県設定用
		defSelectValue['sel021'] = [ "選んで下さい", "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島", "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川", "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜",  "静岡", "愛知", "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山", "鳥取", "島根", "岡山", "広島", "山口", "徳島", "香川", "愛媛", "高知", "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄" ];
		defSelectData['sel021']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47' ]; 
		//defSelectValue['sel022'] = [ "選んで下さい", "北部", "南部"];
		//defSelectData['sel022'] = [ "-1", "1", "2"];

//平均算出時に条件として考慮する項目
		this.defCalcAverage = [ "i001", "i005", "i021"];

//対策の提案重み付け方法選択
		this.measuresSortChange = "i012";	//変数名
		this.measuresSortTarget = [ 
			"co2ChangeOriginal",
			"co2ChangeOriginal",
			"costTotalChangeOriginal",
			"co2ChangeW1Original",
			"co2ChangeW2Original"
		];
		
//簡易入力設定
		this.defEasyQues = [
			{	title:"簡易入力",
				cname:"easy01",
				ques: [
'i001',
'i002',
'i003',
'i005',
'i021',
'i034',
'i029',
'i031',
'i041',
'i042',
'i044',
'i203',
'i204',
'i007',
'i008',
'i205',
'i206',
'i601',
'i602',
'i701',
'i713',
'i714',
'i715',
'i716',
'i717'
]
			}
		];
		
//質問の順番の配列（使う場合）
		this.defQuesOrder = [ 
'i001',
'i002',
'i003',
'i005',
'i021',
'i034',
'i029',
'i031',
'i041',
'i042',
'i044',
'i203',
'i204',
'i007',
'i008',
'i205',
'i206',
'i601',
'i602',
'i701',
'i713',
'i714',
'i715',
'i716',
'i717'
		];

		//実装化
		this.defMeasures = defMeasures;
		this.defInput = defInput;
		this.defSelectValue = defSelectValue;
		this.defSelectData = defSelectData;
		this.defEquipment = defEquipment;
		this.defEquipmentSize = defEquipmentSize;

	}
};



﻿// シナリオによってarea内の修正をする場合
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




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consRM
* 部屋設定
* 
* @author Yasufumi SUZUKI 	2016/06/09
*/

D6.consRM = D6.object( D6.ConsBase );
DC = D6.consRM;

//初期設定値
DC.init = function() {
	//構造設定
	this.consName = "consRM";			//分野コード
	this.consCode = "";						//うちわけ表示のときのアクセス変数
	this.title = "";						//分野名として表示される名前
	this.orgCopyNum = 1;					//初期複製数（consCodeがない場合にコピー作成）
	this.addable = "エリア";		//追加可能
	this.sumConsName = "";					//集約先の分野コード
	this.sumCons2Name = "consTotal";		//関連の分野コード
	this.inputDisp = "consTotal";			//入力欄を表示する分野コード
	this.groupID = "2";						//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "エリア目";			//呼び方
	this.inputGuide = "部屋・エリアの名前について。冷暖房のエリア名としても使われます。";		//入力欄でのガイド

	this.measureName = [
	];
	this.consAddSet = [
		"consHT",
		"consCO"
	];
};
DC.init();


//暖房消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去

};


//対策計算
DC.calcMeasure = function() {
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsTotal
* 全体の消費量
* 
* @author Yasufumi SUZUKI 	2011/01/17 diagnosis5
*								2011/05/06 actionscript3
*/

D6.consTotal = D6.object( D6.ConsBase );
DC = D6.consTotal;


//初期設定値
DC.init = function() {
	this.averagePriceElec;

	this.seasonConsPattern = [ 1.4, 1, 1.2 ];	//業種ごとに設定

	//構造設定
	this.consName = "consTotal";	//分野コード
	this.consCode = "TO";			//うちわけ表示のときのアクセス変数
	this.title = "全体";			//分野名として表示される名前
	this.orgCopyNum = 0;			//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "";			//集約先の分野コード
	this.sumCons2Name = "";			//関連の分野コード
	this.groupID = "9";				//うちわけ番号
	this.color = "#a9a9a9";		//表示の色}
	this.inputGuide = "全体のエネルギーの使い方について";		//入力欄でのガイド

	this.measureName = [ 
		"mTOcontracthigh",
		"mTOcontracthome",
		"mTOcontractequip",
		"mTOcontractbreaker",
		"mTOcontractintegrated",
		"mTOdemand",
		"mTOreducetranse",
		"mTOpeakgenerator",
		"mTOpeakcut"
	];
};
DC.init();

//Documentからの変換
DC.paramSet = function() {
	this.business =this.input( "i001", 1 );				//業種
	this.floor = this.input( "i005", D6.area.businessParams[this.business].floor );	
			//床面積 m2
	this.workTime = this.input( "i002", D6.area.businessParams[this.business].workTime );	
			//業務時間
	this.workDay = this.input( "i003", D6.area.businessParams[this.business].workDay );	
			//業務日

	this.workTimeRatio = this.workTime / D6.area.businessParams[this.business].workTime;
	this.workDayRatio = this.workDay / D6.area.businessParams[this.business].workDay;
	
	//契約
	this.contract = this.input('i034',3);	//'電気契約の種類',
	this.baseJuryo = this.input('i027',-1);	//'電気契約容量：従量電灯分',
	this.baseTime = this.input('i028',-1);	//'電気契約容量：従量時間帯契約',
	this.baseLow = this.input('i029',-1);	//'電気契約容量：低圧電力分',
	this.baseTotal = this.input('i030',-1);	//'電気契約容量：低圧総合電力分',
	this.baseHigh = this.input('i031',-1);	//'電気契約容量：高圧電力分',
	if ( this.contract == 1 ) {
		this.kw = 0;
	} else {
		this.kw = Math.max( this.baseTime,this.baseTotal,this.baseLow,this.baseHigh,10 );
	}

	//太陽光
	this.solarSet =this.input( "i022", 0 );			//太陽光発電の設置　あり=1
	this.solarKw =this.input( "i023", 0 );			//太陽光発電の設置容量(kW)
	this.solarYear =this.input( "i024", 0 );		//太陽光発電の設置年

	//月平均の入力のパターン
	this.priceEle =this.priceandcons( "i051", "i041", "electricity" );
	if ( this.priceEle == -1 ){
		this.priceEle = D6.Unit.consToCost( D6.area.businessParams[this.business].energy 
							* this.floor 
							* this.workTimeRatio
							* this.workDayRatio
							/ D6.Unit.jules.electricity / 12 
						,"electricity", 1, 0 );			//月電気代
	}

	this.priceEleWinter =this.input( "i0611", -1 );	//電気料金（冬）
	this.priceEleSpring =this.input( "i0612", -1 );	//電気料金（春秋）
	this.priceEleSummer =this.input( "i0613", -1 );	//電気料金（夏）
	
	this.priceGasWinter =this.input( "i0621", -1 );	//ガス料金（冬）
	this.priceGasSpring =this.input( "i0622", -1 );	//ガス料金（春秋）
	this.priceGasSummer =this.input( "i0623", -1 );	//ガス料金（夏）

	this.priceKerosWinter =this.input( "i0631", -1 );	//灯油料金（冬）
	this.priceKerosSpring =this.input( "i0632", -1 );	//灯油料金（春秋）
	this.priceKerosSummer =this.input( "i0633", -1 );	//灯油料金（夏）

	//ガス代
	this.priceGas =this.input( "i042",0 );				//月ガス代

	this.houseType =this.input( "i004", -1 );			//戸建て集合
	this.heatEquip =this.input( "i231", -1 );			//主な暖房機器

	this.priceKeros =this.input( "i043", 0 );		//月灯油代0（円)

	this.priceCar =this.input( "i044",0 );			//月車燃料代

	this.equipHWType =this.input( "i101", 1 );			//給湯器の種類

	this.generateEleUnit = D6.area.unitPVElectricity;	//地域別の値を読み込む
		
	//季節別の光熱費の入力のパターン（初期値　-1:無記入）
	this.seasonPrice =  [ [ this.priceEleWinter, this.priceEleSpring, this.priceEleSummer ],		//電気
						[ this.priceGasWinter, this.priceGasSpring, this.priceGasSummer ],			//ガス
						[ this.priceKerosWinter, this.priceKerosSpring, this.priceKerosSummer ], 	//灯油
						[ -1, -1, -1 ] 	//ガソリン
						];

	//毎月の消費量の入力のパターン（初期値　-1：無記入）
	this.monthlyPrice = [ [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
						[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
						[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
						[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ] ];
	var ene = ["electricity", "gas" ,"kerosene", "car" ];
	for ( var i=0 ; i<4 ; i++ ){
		for ( var m=1 ; m<=12 ; m++ ){
			this.monthlyPrice[i][m-1] = parseInt( this.priceandcons( "i08" + (i+1) + ("" + m),
															"i07" + (i+1) + ("" + m),
															ene[i] ) );
		}
	}
};

//消費量の計算
DC.calc = function( ){

	this.clear();			//結果の消去
	var ret;

	//入力値の読み込み
	this.paramSet();

	//季節係数の読込（全エネルギー）
	var seasonConsPattern = D6.area.getSeasonParamCommon();

	//電気の推計
	ret = D6.Monthly.seasonCalc( this.priceEle, this.seasonPrice[0], this.monthlyPrice[0], seasonConsPattern.electricity, "electricity" );
	this.priceEle = ret.ave;
	this.seasonPrice["electricity"] = ret.season;
	this.monthlyPrice["electricity"] = ret.monthly;

	//平均電気代
	var def = D6.area.elecPrice[this.contract];
	averagePriceElec =　( def[1] + def[2] ) / 2;

	//基本料金
	var priceBase = def[4];

	//太陽光発電量
	var generateEle = this.generateEleUnit * this.solarKw / 12;

	if ( this.solarKw > 0 ) {
		//this.grossElectricity = D6.area.calcEleCons( this.priceEle, this.kw, this.contract );
		this.grossElectricity = D6.Unit.costToCons( this.priceEle, "electricity", this.contract, this.kw );
		this.electricity = this.grossElectricity - generateEle;
	} else {
		//this.electricity = D6.area.calcEleCons( this.priceEle, this.kw, this.contract );
		this.electricity = D6.Unit.costToCons( this.priceEle, "electricity", this.contract, this.kw );
		this.grossElectricity = this.electricity;
	}

	//ガス
	ret = D6.Monthly.seasonCalc( this.priceGas, this.seasonPrice[1], this.monthlyPrice[1], seasonConsPattern.gas, "gas" );
	this.priceGas = ret.ave;
	this.seasonPrice["gas"] = ret.season;
	this.monthlyPrice["gas"] = ret.monthly;

	this.gas = ( this.priceGas -D6.Unit.priceBase.gas ) 
											/D6.Unit.price.gas;
	if ( this.gas < 0 ) this.gas = 0;

	//灯油
	ret = D6.Monthly.seasonCalc( this.priceKeros, this.seasonPrice[2], this.monthlyPrice[2], seasonConsPattern.kerosene, "kerosene" );
	this.priceKeros = ret.ave;
	this.seasonPrice["kerosene"] = ret.season;
	this.monthlyPrice["kerosene"] = ret.monthly;
	this.kerosene = this.priceKeros / D6.Unit.price.kerosene;

	//ガソリン
	ret = D6.Monthly.seasonCalc( this.priceCar, this.seasonPrice[3], this.monthlyPrice[3], seasonConsPattern.car, "car" );
	this.priceCar = ret.ave;
	this.seasonPrice["car"] = ret.season;
	this.monthlyPrice["car"] = ret.monthly;
	this.car = this.priceCar / D6.Unit.price.car;

	//重油
};


//対策計算
DC.calcMeasure = function( ) {
	if ( this.contract == 4 ){
		this.measures["mTOcontracthigh"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", 6, this.kw );		
		//低圧契約から高圧契約に変更する
		this.measures["mTOcontracthome"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", 3, this.kw );		
		//低圧契約から従量電灯契約に変更する
		this.measures["mTOcontractintegrated"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", 5, this.kw );		
		//低圧＋従量電灯から、低圧総合電力に変更する
		this.measures["mTOcontractbreaker"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", this.contract, this.kw* 0.8 );		
		//負荷設備量ではなく、契約主開閉器（ブレーカー）による契約に変更する
		this.measures["mTOcontractequip"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", this.contract, this.kw* 0.9 );		
		//使っていない機器分の契約更新をする
	}
	if ( this.contract == 4 || this.contract == 5 || this.contract == 6 ){
		this.measures["mTOdemand"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", this.contract, this.kw* 0.9 );		
		//デマンドコントロールを行う
		this.measures["mTOreducetranse"].calcReduceRate(0.01);	//変圧器の負荷を集約し、稼働台数を減らす
		this.measures["mTOpeakgenerator"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", this.contract, this.kw -3 );		
		//電力ピーク時間帯の自家発電装置の導入(3kVA)
		this.measures["mTOpeakcut"].costUnique = D6.Unit.consToCost( this.electricity, "electricity", this.contract, this.kw * 0.95 );		
		//電力ピーク時間帯に、電気利用を抑制する
	}

};


DC.priceandcons = function( consid, priceid, target ){
	var price = -1;
	if ( target == "electricity") {
		if ( this.input( consid, -1 ) == -1 ) {
			price = this.input( priceid, -1 );
		} else {
			price = D6.area.calcElePrice(this.input( consid, -1 ), this.kw, this.contract );
		}
	} else {
		if ( this.input( consid, -1 ) == -1 ) {
			price = this.input( priceid, -1 );
		} else {
			price = this.input( consid, -1 ) * D6.Unit.price[target] + D6.Unit.priceBase[target];
		}
	}

	return price;
};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consEnergy
* 全体エネルギー概要入力設定
* 
* @author Yasufumi SUZUKI 	2016/06/09
*/

D6.consEnergy = D6.object( D6.ConsBase );
DC = D6.consEnergy;

//初期設定値
DC.init = function() {

	//構造設定
	this.consName = "consEnergy";			//分野コード
	this.consCode = "";						//うちわけ表示のときのアクセス変数
	this.title = "全般エネルギー設定";				//分野名として表示される名前
	this.orgCopyNum = 0;					//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "";					//集約先の分野コード
	this.sumCons2Name = "";					//関連の分野コード
	this.inputDisp = "consTotal";			//入力欄を表示する分野コード(入力欄としてのみ使用)
	this.groupID = "0";						//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "";					//呼び方
	this.inputGuide = "エネルギーの基本設定の使い方について";		//入力欄でのガイド

	this.measureName = [
	];
	this.partConsName = [		//	このクラスを増加させたときに、あわせて増加するクラス
	];
};
DC.init();


//消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去
};


//対策計算
DC.calcMeasure = function() {
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consSeason
* シーズン設定
* 
* @author Yasufumi SUZUKI 	2016/06/09
*/

D6.consSeason = D6.object( D6.ConsBase );
DC = D6.consSeason;

//初期設定値
DC.init = function() {
	this.titleList = ["","冬","春秋","夏"];

	//構造設定
	this.consName = "consSeason";			//分野コード
	this.consCode = "";						//うちわけ表示のときのアクセス変数
	this.title = "";						//分野名として表示される名前
	this.orgCopyNum = 3;					//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "";					//集約先の分野コード
	this.sumCons2Name = "consTotal";		//関連の分野コード
	this.inputDisp = "consTotal";			//入力欄を表示する分野コード
	this.groupID = "2";						//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "";					//呼び方
	this.inputGuide = "季節ごとのエネルギーの使い方、1ヶ月あたりの光熱費。";		//入力欄でのガイド

	this.measureName = [
	];
	this.partConsName = [
	];
};
DC.init();


//消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去
};


//対策計算
DC.calcMeasure = function() {
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consMonth
* 月・シーズン設定
* 
* @author Yasufumi SUZUKI 	2016/06/09
*/

D6.consMonth = D6.object( D6.ConsBase );
DC = D6.consMonth;

//初期設定値
DC.init = function() {
	//構造設定
	this.consName = "consMonth";			//分野コード
	this.consCode = "";						//うちわけ表示のときのアクセス変数
	this.title = "";						//分野名として表示される名前
	this.orgCopyNum = 12;					//初期複製数（consCodeがない場合にコピー作成）
		//1-12月
	this.sumConsName = "";					//集約先の分野コード
	this.sumCons2Name = "consTotal";		//関連の分野コード
	this.inputDisp = "consTotal";			//入力欄を表示する分野コード
	this.groupID = "2";						//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "月";					//呼び方
	this.inputGuide = "月ごとのエネルギー消費量と光熱費";		//入力欄でのガイド

	this.measureName = [
	];
	this.partConsName = [
	];
};
DC.init();


//暖房消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去
	this.title = this.subID + "月";
};


//対策計算
DC.calcMeasure = function() {
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsHWsum
* 給湯全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 給湯への展開
*								2011/10/21 給湯簡易計算を実装
*/

D6.consHWsum = D6.object( D6.ConsBase );
DC = D6.consHWsum;


//初期設定値
DC.init = function() {
	//構造設定
	this.consName = "consHWsum";		//分野コード
	this.consCode = "HW";				//うちわけ表示のときのアクセス変数
	this.title = "給湯";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "1";					//うちわけ番号
	this.color = "#ffb700";			//表示の色
	this.inputGuide = "給湯の使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
	];

	this.waterTemp = 18;				//水の温度(初期)
	this.hotWaterTemp = 42;				//湯沸かしの温度
	this.tabWaterLitter = 160;			//貯湯量(200Lの8割）
	this.showerWaterLitterUnit = 10;	//1分あたりのシャワー量
	this.showerWaterMinutes = 10;		//標準の1人シャワー時間
	this.otherWaterLitter = 50;			//その他のお湯量
//	this.showerWaterLitter;				//シャワーのお湯量
	this.tankLossWatt = 100;			//貯湯タンクからのロス

	this.performanceGas = 0.73;			//通常機種の効率
	this.performanceEcojozu = 0.877;	//潜熱回収型の効率
	this.performanceElec = 0.8;			//電気温水器の効率
	this.performanceEcocute = 3;		//エコキュートの効率
	this.performanceEnefarmEle = 0.289;	//エネファームの発電効率
	this.performanceEnefarmHW = 0.33;	//エネファームの熱効率


	this.reduceRateSaveMode = 0.2;		//節約モードでの削減率
	this.reduceRateSolar = 0.4;			//太陽熱温水器での削減率
	this.reduceRateSolarSystem = 0.5;	//ソーラーシステムでの削減率

	this.reduceRateKeepStop;
	
};
DC.init();



//お湯消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2

	this.person =this.input( "i010", 
			( this.business == 6 ? Math.round(this.floor/20) + 1 : 0 ) );
			//客室数

	this.equipType =this.input( "i101", -1 );			//給湯器の種類
	this.eachbath =this.input( "i102", -1 );			//客室への風呂設置
	this.bigbath =this.input( "i103", 2 );				//大浴場
	
	this.showerperson =this.input( "i104",		
			( this.business == 8 ? Math.round(this.floor/20) + 1 : 0 ) );
			//シャワー利用人数
	this.dinnerperson =this.input( "i105",		
			( this.business == 8 ? Math.round(this.floor/10) + 1 :
			( this.business == 5 ? this.floor * 2 : 0 ) ) );
			//食事利用人数（食数）

	this.otherWaterLitter = 
			( this.business == 8 ? ( Math.round(this.floor/10) + 1 ) * 100 : 100 );
			//その他のお湯
			
	//給湯器の推計
	if ( !this.equipType || this.equipType <= 0 ) {
		if ( D6.consShow["TO"].priceGas == 0 ) {
			if ( D6.consShow["TO"].priceKeros > 30000 ) {
				this.equipType = 3;
			} else {
				this.equipType = 5;
			}
		} else {
			this.equipType = 1;
		}
	}

	//水温の設定
	this.waterTemp = D6.area.getWaterTemplature();

	//食器洗いのお湯量(L/日)
	this.dishwashLitter = this.dinnerperson * 20;

	//シャワーの湯量(L/日)
	this.showerWaterLitter = this.showerperson * this.showerWaterMinutes * this.showerWaterLitterUnit;

	//給湯リットル（L/日)
	this.allLitter = ( this.person * this.tabWaterLitter
						+ this.showerWaterLitter
						+ this.otherWaterLitter 
						+ this.dishwashLitter
						);
	//給湯量（加温エネルギー量 kcal/月）
	this.heatEnergy = this.allLitter * ( this.hotWaterTemp - this.waterTemp ) * 365 / 12;
	this.endEnergy = this.heatEnergy;

	//貯湯エネルギー（加温エネルギー量 kcal/月）
	this.tanklossEnergy = this.tankLossWatt / 1000 * D6.Unit.calorie.electricity * 365 / 12;
	//標準値（保温を止めた場合のガス・電気温水器の効率向上）
	//reduceRateKeepStop = reduceRateKeepStopGas;

	switch ( this.equipType ) {
		case 1:
			//ガス給湯器
			this.mainSource = "gas";
			this[this.mainSource] = this.heatEnergy / this.performanceGas 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 2:
			//エコジョーズ
			this.mainSource = "gas";
			this[this.mainSource] = this.heatEnergy / this.performanceEcojozu 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 3:
			//灯油給湯器
			this.mainSource = "kerosene";
			this[this.mainSource] = this.heatEnergy / this.performanceGas 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 4:
			//エコフィール
			this.mainSource = "kerosene";
			this[this.mainSource] = this.heatEnergy / this.performanceEcojozu 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 5:
			//電気温水器
			this.mainSource = "nightelectricity";
				this[this.mainSource] = ( this.heatEnergy + this.tanklossEnergy )
						/ this.performanceElec / D6.Unit.calorie[this.mainSource] ;
			break;
		case 6:
			//エコキュート
			this.mainSource = "nightelectricity";
			this[this.mainSource] = ( this.heatEnergy + this.tanklossEnergy ) 
						/ this.performanceEcocute / D6.Unit.calorie[this.mainSource];
			//エコキュートだけ効率向上が違う
			//reduceRateKeepStop = reduceRateKeepStopEle;
			break;
		case 7:
		case 8:
		default:
			this.mainSource = "gas";
			this.gas = this.heatEnergy / this.performanceEcojozu 
						/ D6.Unit.calorie.gas;
	}
};


//対策計算
DC.calcMeasure = function() {
};


//給湯負荷についても割戻しをする必要がある（初期状態の割戻し）
DC.calcAdjustStrategy = function( energyAdj ){
	this.heatEnergy *= energyAdj[this.mainSource];
	this.tanklossEnergy *= energyAdj[this.mainSource];
	this.endEnergy *= energyAdj[this.mainSource];
};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* D6.ConsCOsum
* 冷房全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 冷房クラスに変換
*								2011/10/21 冷房簡易計算を実装
* 								2016/04/12 js
*/

D6.consCOsum = D6.object( D6.ConsBase );
DC = D6.consCOsum;


//初期設定値
DC.init = function() {
	this.coolLoadUnit_Wood = 220/3;			//標準冷房負荷（W/m2）
	this.coolLoadUnit_Steel = 145/3;		//標準冷房負荷鉄筋住宅の場合（W/m2）
	this.apf = 4;							//エアコンAPF

	this.reduceRateSunCut = 0.1;			//日射カットによる消費削減率

	//構造設定
	this.consName = "consCOsum";			//分野コード
	this.consCode = "CO";					//うちわけ表示のときのアクセス変数
	this.title = "冷房";					//分野名として表示される名前
	this.orgCopyNum = 0;					//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "consTotal";			//集約先の分野コード
	this.sumCons2Name = "consACsum";		//関連の分野コード
	this.groupID = "2";						//うちわけ番号
	this.color = "#0000ff";				//表示の色
	this.inputGuide = "全体の冷房の使い方について";		//入力欄でのガイド

};
DC.init();

//冷房消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	//全体なので、部屋毎の設定は読み込まない
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2
	this.workDay = D6.consShow["TO"].workDay;			//週日数

	this.buidType = this.input( "i004", 1 );		//木造・鉄筋
	this.coolTime  = D6.consShow["TO"].workTime;	//冷房時間
	this.coolTemp  = this.input( "i216", 27 );		//冷房設定温度
	this.coolMonth  = this.input( "i008", 6 );		//冷房期間
	this.loadBusiness = 
			(this.business == 5 ? 3 : 1 );
			//事業形態による重み付け
	var coolKcal = this.calcCoolLoad() * this.loadBusiness  * this.workDay / 7;

	//年平均値への換算（季節分割をしている場合にはここでするべきではない）
	coolKcal *= this.coolMonth * 30 / 12;

	this.electricity = coolKcal / this.apf / D6.Unit.calorie.electricity;
	//月の消費電力量　kWh/月

	/*
	//季節別の光熱費より、負荷計算のほうが適切
	var season = D6.consShow["TO"].seasonPrice;
	//電気
	this.electricity = (season[0][2] - season[0][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.electricity;
	if ( this.electricity < 0 ) this.electricity = 0;
	//gas
	this.gas = ( season[1][2] - season[1][1] ) * D6.area.seasonMonth.winter / 12 / D6.Unit.price.gas;
	//灯油
	this.kerosene = (season[2][2] - season[2][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.kerosene;
	*/

};


//対策計算 consP
DC.calcMeasure = function() {
};


//冷房負荷計算 kcal/月
//
//		cons.buidType : 建物の形態
//		cons.floot : 延べ床面積(m2)
//		cons.heatArea : 冷暖房範囲(-)
DC.calcCoolLoad = function()
{
	var energyLoad = 0;
	this.coolArea = 0.3;

	var coolLoadUnit = 0;				//冷房負荷原単位　kcal/m2/hr
	if ( this.buidType == 1 ) 
	{
		coolLoadUnit = this.coolLoadUnit_Wood;
	} else {
		coolLoadUnit = this.coolLoadUnit_Steel;
	}

	var coolArea_m2;				//冷房面積 m2
	coolArea_m2 = this.floor * this.coolArea;

	var coolTime;					//冷房時間（時間）
	coolTime = this.coolTime;

	//冷房係数
	var coolMonth = D6.area.seasonMonth.summer;
	var coolFactor = D6.area.getCoolFactor( coolMonth, coolTime );

	var coefTemp;					//設定温度による負荷係数
	coefTemp = ( 27 - this.coolTemp ) / 10 + 1;

	energyLoad = coolLoadUnit * coolFactor[0] *  coolArea_m2 * coolTime * 30 * coefTemp;

	return energyLoad;

};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* D6.ConsCO
* 部屋冷房消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 冷房クラスに変換
*								2011/10/21 冷房簡易計算を実装
* 								2016/04/12 js
*/

D6.consCO = D6.object( D6.consCOsum );
DC = D6.consCO;


//初期設定値
DC.init = function() {

	//構造設定
	this.consName = "consCO";			//分野コード
	this.consCode = "";					//うちわけ表示のときのアクセス変数
	this.title = "冷房";				//分野名として表示される名前
	this.orgCopyNum = 1;				//初期複製数（consCodeがない場合にコピー作成）
	this.addable = "冷暖房するエリア";		//追加可能
	this.sumConsName = "consCOsum";		//集約先の分野コード
	this.sumCons2Name = "consAC";		//関連の分野コード
	this.groupID = "2";					//うちわけ番号
	this.color = "#0000ff";				//表示の色
	this.countCall = "エリア目";			//呼び方
	this.inputGuide = "部屋・エリアごとの冷房の使い方について";		//入力欄でのガイド

	this.measureName = [ 
		"mCOtemplature",
		"mCOroof",
		"mCObrind",
		"mCOoutunitsolar",
		"mCOcurtain",
		"mCOwindow"
	];

};
DC.init();

//冷房消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	//全体なので、部屋毎の設定は読み込まない
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = this.input( "i092" + this.subID, this.sumCons.floor/2 );	//床面積 m2

	this.buidType = this.input( "i004", 1 );		//木造・鉄筋
	this.coolTime  = this.input( "i002", 8 );		//冷房時間
	this.coolTemp  = this.input( "i214" + this.subID, 27 );		//冷房設定温度
	this.sunWest  = this.input( "i217" + this.subID, 2 );		//西日
	this.coolMonth  = this.input( "i008", 6 );		//冷房期間

	var coolKcal = this.calcCoolLoad();

	//年平均値への換算（季節分割をしている場合にはここでするべきではない）
	coolKcal *= this.coolMonth * 30 / 12;

	this.electricity = coolKcal / this.apf / D6.Unit.calorie.electricity;
	//月の消費電力量　kWh/月

	/*
	//季節別の光熱費より、負荷計算のほうが適切
	var season = D6.consShow["TO"].seasonPrice;
	//電気
	this.electricity = (season[0][2] - season[0][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.electricity;
	if ( this.electricity < 0 ) this.electricity = 0;
	//gas
	this.gas = ( season[1][2] - season[1][1] ) * D6.area.seasonMonth.winter / 12 / D6.Unit.price.gas;
	//灯油
	this.kerosene = (season[2][2] - season[2][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.kerosene;
	*/

};


//対策計算 consP
DC.calcMeasure = function() {
	if ( this.coolTemp <= 27 ) {
		this.measures["mCOtemplature"].calcReduceRate(0.1* (20 - this.coolTemp ) );	//	冷房の設定温度を控えめにする
	}
	this.measures["mCOroof"].calcReduceRate(0.01);	//	屋根面に表面反射塗料を塗る
	if ( this.sunWest <= 2 && this.sunWest >= 1 ){
		this.measures["mCObrind"].calcReduceRate(0.03 * (3-this.sunWest));	//	冷房時にブラインドを閉める
		this.measures["mCOcurtain"].calcReduceRate(0.02 * (3-this.sunWest));	//	冷房時に日射を遮る
	}
	this.measures["mCOoutunitsolar"].calcReduceRate(0.02);	//	冷房時に室外機が直射日光に当たらないようにする
	this.measures["mCOwindow"].calcReduceRate(0.05);	//	外気を活用して空調を止める

};


﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsHTsum
* 暖房全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 暖房クラスに変換
*								2011/10/21 暖房簡易計算を実装
*/


D6.consHTsum = D6.object( D6.ConsBase );
DC = D6.consHTsum;


//初期設定値
DC.init = function() {
	//構造設定
	this.consName = "consHTsum";				//分野コード
	this.consCode = "HT";						//うちわけ表示のときのアクセス変数
	this.title = "暖房";						//分野名として表示される名前
	this.orgCopyNum = 0;						//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "consTotal";				//集約先の分野コード
	this.sumCons2Name = "consACsum";			//関連の分野コード
	this.groupID = "2";							//うちわけ番号
	this.color = "#ff0000";					//表示の色
	this.inputGuide = "全体の暖房の使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
	];

	this.heatLoadUnit_Wood = 220/3 * 1.25 * 0.82;		//標準暖房負荷（W/m2）
	this.heatLoadUnit_Steel = 145/3 * 1.25 * 0.82;		//標準暖房負荷鉄筋住宅の場合（W/m2）
	this.apf = 3;									//エアコンAPF
	this.apfMax = 4.5;							//エアコン最高機種APF

	this.reduceRateInsulation = 0.082;			//断熱シートでの削減率
	this.reduceRateDouble = 0.124;				//ペアガラスでの削減率
	this.reduceRateUchimado = 0.14;				//内窓での削減率
	this.reduceRateFilterCool= 0.05;			//フィルター掃除での冷房削減率

	this.reduceRateFilter= 0.12;				//フィルター掃除での削減率
	this.reduceRateDanran= 0.303;				//家族だんらんでの削減率

	//他でも使う変数
	this.heatMcal;
	this.heatACCalcMcal;

};
DC.init();

//暖房消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2
	this.workDay = D6.consShow["TO"].workDay;			//週日数
	this.heatTime = D6.consShow["TO"].workTime;			//暖房時間

	this.heatArea  = 0.3;							//冷暖房エリア
	this.heatEquip =this.input( "i203", -1 );		//暖房機器
	this.heatTemp  =this.input( "i205", 22 );		//暖房設定温度
	this.heatMonth  = this.input( "i007", 4 );		//冷房期間

	//熱量計算
	var heatKcal = this.calcHeatLoad() * this.workDay / 7;

	if ( this.heatEquip == 4 ){
		this.kerosene = heatKcal / D6.Unit.calorie.kerosene * D6.area.seasonMonth.winter  *30 / 12;
	} else if ( this.heatEquip == 3 ){
		this.gas = heatKcal / D6.Unit.calorie.gas * D6.area.seasonMonth.winter  *30 / 12;
	} else {
		this.electricity = heatKcal / this.apf / D6.Unit.calorie.electricity * D6.area.seasonMonth.winter  *30 / 12;		
	}

	/*
	//季節別の光熱費より、負荷計算のほうが適切
	var season = D6.consShow["TO"].seasonPrice;
	//電気
	this.electricity = (season[0][0] - season[0][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.electricity;
	if ( this.electricity < 0 ) this.electricity = 0;
	//gas
	this.gas = ( season[1][0] - season[1][1] ) * D6.area.seasonMonth.winter / 12 / D6.Unit.price.gas;
	//灯油
	this.kerosene = (season[2][0] - season[2][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.kerosene;
	*/
	
	this.endEnergy = heatKcal;

};

//対策計算
DC.calcMeasure = function() {
};


//暖房消費量計算（他の分野計算後の消費量再計算）
// consP がデータ保持の配列,cons.consShowは他の消費量配列
//
DC.calc2nd = function( ) {
};

//暖房負荷計算 kcal/月
//
//		cons.houseType : 建物の形態
//		cons.floor : 延べ床面積(m2)
//		cons.heatArea : 冷暖房範囲比率(-) 
DC.calcHeatLoad = function(){
	var energyLoad = 0;
	
	var heatLoadUnit;				//暖房負荷原単位　kcal/m2/hr
	if ( this.houseType == 1 ) 
	{
		heatLoadUnit = this.heatLoadUnit_Wood;
	} else {
		heatLoadUnit = this.heatLoadUnit_Steel;
	}

	var heatArea_m2;				//暖房面積 m2
	heatArea_m2 = this.floor * this.heatArea;
	if ( this.heatArea > 0.05 ) {
		heatArea_m2 = Math.max( heatArea_m2, 13 );		//最低13m2（約8畳）
	}

	var heatTime;					//暖房時間（時間）
	heatTime = this.heatTime;

	//暖房係数
	var heatMonth = this.heatMonth;
	var heatFactor =D6.area.getHeatFactor( heatMonth, heatTime );

	var coefTemp;					//設定温度による負荷係数
	coefTemp = ( this.heatTemp - 20 ) / 10 + 1;

	energyLoad = heatLoadUnit * heatFactor[1] * heatArea_m2 * heatTime * 30 * coefTemp;

	return energyLoad;
};


//暖房負荷についても割戻しをする必要がある
DC.calcAdjustStrategy = function( energyAdj ){
	this.calcACkwh *= energyAdj[this.mainSource];
	this.endEnergy *= energyAdj[this.mainSource];
};



﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consHT
* 部屋暖房消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 暖房クラスに変換
*								2011/10/21 暖房簡易計算を実装
*/


D6.consHT = D6.object( D6.consHTsum );
DC = D6.consHT;


//初期設定値
DC.init = function() {
	//他でも使う変数
	this.heatMcal;
	this.heatACCalcMcal;

	//構造設定
	this.consName = "consHT";			//分野コード
	this.consCode = "";					//うちわけ表示のときのアクセス変数
	this.title = "暖房";				//分野名として表示される名前
	this.orgCopyNum = 1;				//初期複製数（consCodeがない場合にコピー作成）
	this.addable = "冷暖房するエリア";		//追加可能
	this.sumConsName = "consHTsum";		//集約先の分野コード
	this.sumCons2Name = "consAC";		//関連の分野コード
	this.groupID = "2";					//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "エリア目";			//呼び方
	this.inputGuide = "部屋・エリアごとの暖房の使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
		"mACreplace",
		"mHTtemplature",
		"mHTnothalogen",
		"mHTwindow",
		"mHTbrind"
	];
};
DC.init();

//暖房消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = this.input( "i092" + this.subID, 50 );	//床面積 m2

	this.heatArea  = 0.3;								//冷暖房エリア
	this.heatEquip =this.input( "i212" + this.subID, -1 );		//暖房機器
	this.heatTemp  =this.input( "i211" + this.subID, 22 );		//暖房設定温度
	this.subEquip  =this.input( "i213" + this.subID, -1 );	//補助器具
	this.blind  =this.input( "i219" + this.subID, -1 );	//カーテンを閉める
	
	//熱量計算
	var heatKcal = this.calcHeatLoad();

	if ( this.heatEquip == 3 ){
		this.kerosene = heatKcal / D6.Unit.calorie.kerosene * D6.area.seasonMonth.winter  *30 / 12;
	} else if ( this.heatEquip == 2 ){
		this.gas = heatKcal / D6.Unit.calorie.gas * D6.area.seasonMonth.winter  *30 / 12;
	} else {
		this.electricity = heatKcal / this.apf / D6.Unit.calorie.electricity * D6.area.seasonMonth.winter  *30 / 12;		
	}

	/*
	//季節別の光熱費より、負荷計算のほうが適切
	var season = D6.consShow["TO"].seasonPrice;
	//電気
	this.electricity = (season[0][0] - season[0][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.electricity;
	if ( this.electricity < 0 ) this.electricity = 0;
	//gas
	this.gas = ( season[1][0] - season[1][1] ) * D6.area.seasonMonth.winter / 12 / D6.Unit.price.gas;
	//灯油
	this.kerosene = (season[2][0] - season[2][1] )*	D6.area.seasonMonth.winter / 12 / D6.Unit.price.kerosene;
	*/
	
	this.endEnergy = heatKcal;

};

//対策計算
DC.calcMeasure = function() {
	if ( this.heatTemp >= 21 ) {
		this.measures["mHTtemplature"].calcReduceRate(0.1 * ( this.heatTemp - 20 ) );	//	暖房の設定温度を控えめにする
	}
	if ( this.subEquip == 1 ){
		this.measures["mHTnothalogen"].calcReduceRate(0.2);	//	ハロゲンヒータなどの暖房を使わない
	}
	this.measures["mHTwindow"].calcReduceRate(0.04);	//	外気を活用して空調を止める
	if ( this.blind != 1 ) {
		this.measures["mHTbrind"].calcReduceRate(0.02);	//	暖房時は夕方以降はブラインドを閉める
	}

};


//暖房消費量計算（他の分野計算後の消費量再計算）
// consP がデータ保持の配列,cons.consShowは他の消費量配列
//
DC.calc2nd = function( ) {
};

//暖房負荷計算 kcal/月
//
//		cons.houseType : 建物の形態
//		cons.houseSize : 延べ床面積(m2) 係数(1)
//		cons.heatArea : 冷暖房範囲(-)   部屋面積(m2)
DC.calcHeatLoad = function(){
	var energyLoad = 0;
	this.houseSize = this.floor;
	
	var heatLoadUnit;				//暖房負荷原単位　kcal/m2/hr
	if ( this.houseType == 1 ) 
	{
		heatLoadUnit = this.heatLoadUnit_Wood;
	} else {
		heatLoadUnit = this.heatLoadUnit_Steel;
	}

	var heatArea_m2;				//暖房面積 m2
	heatArea_m2 = this.houseSize * this.heatArea;
	if ( this.heatArea > 0.05 ) {
		heatArea_m2 = Math.max( heatArea_m2, 13 );		//最低13m2（約8畳）
	}

	var heatTime;					//暖房時間（時間）
	heatTime = this.heatTime;

	//暖房係数
	var heatMonth =D6.area.seasonMonth.winter;
	var heatFactor =D6.area.getHeatFactor( heatMonth, heatTime );

	var coefTemp;					//設定温度による負荷係数
	coefTemp = ( this.heatTemp - 20 ) / 10 + 1;

	energyLoad = heatLoadUnit * heatFactor[1] * heatArea_m2 * heatTime * 30 * coefTemp;

	return energyLoad;
};


//暖房負荷についても割戻しをする必要がある
DC.calcAdjustStrategy = function( energyAdj ){
	this.calcACkwh *= energyAdj[this.mainSource];
	this.endEnergy *= energyAdj[this.mainSource];
};



﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consAC
* 部屋の冷暖房消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 暖房クラスに変換
*								2011/10/21 暖房簡易計算を実装
*/

D6.consACsum = D6.object( D6.ConsBase );
DC = D6.consACsum;

//初期設定値
DC.init = function() {
	//構造設定
	this.consName = "consACsum";			//分野コード
	this.consCode = "";						//うちわけ表示のときのアクセス変数
	this.title = "空調";					//分野名として表示される名前
	this.orgCopyNum = 0;					//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "";					//集約先の分野コード
	this.sumCons2Name = "";					//関連の分野コード
	this.groupID = "2";						//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "";					//呼び方
	this.inputGuide = "空調全般について";		//入力欄でのガイド

	this.measureName = [
		"mACfilter",
		"mACairinflow",
		"mACarea",
		"mACheatcool",
		"mACcurtain",
		"mACbackyarddoor",
		"mACfrontdoor",
		"mACclosewindow",
		"mACstopcentral",
		"mACinsulationpipe"
		];
};
DC.init();


//暖房消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去

	this.floor = D6.consShow["TO"].floor;				//床面積 m2

	//１部屋目の設定を読み込む
	this.acYear  = this.input( "i2151", 6 );	//エアコン使用年数
	this.acPerf  = this.input( "i2161", 2 );	//エアコン省エネ型1　でない2
	this.acFilter  = this.input( "i2171",　-1 );	//フィルター掃除
	this.door  = this.input( "i2311" ,　-1 );	//扉の状態

	this.centralcontrol  = this.input( "i201" ,　-1 );	//全館空調
	this.roomset  = this.input( "i202" ,　-1 );	//部屋設定

	this.coolmonth  = this.input( "i008" ,　6 );	//冷房期間
	this.heatmonth  = this.input( "i007" ,　4 );	//暖房期間

};

DC.calc2nd = function( ) {
	//冷房と暖房の加算
	this.acHeat = D6.consListByName["consHTsum"][0];
	this.acCool = D6.consListByName["consCOsum"][0];
	this.copy( this.acHeat );
	this.add( this.acCool );

	//分割同士の結合の場合には自動化できないのでここで定義する
	this.partCons[0] = this.acHeat;
	this.partCons[1] = this.acCool;
};

//対策計算
DC.calcMeasure = function() {
	this.measures["mACfilter"].calcReduceRateWithParts(0.05,this.partCons);	//	フィルターの掃除をする
	this.measures["mACairinflow"].calcReduceRateWithParts(0.03,this.partCons);	//	空気取り入れ量を必要最小に押さえる
	if ( this.floor > 50 ) {
		this.measures["mACarea"].calcReduceRateWithParts(0.10,this.partCons);	//	使用していないエリアの空調を停止する		
	}
	if ( this.coolmonth + this.heatmonth > 9 ){
		this.measures["mACheatcool"].calcReduceRateWithParts(0.03 * (this.coolmonth + this.heatmonth - 9 ),this.partCons);	//	暖房と冷房を同時に使用しないようにする
	}
	if ( this.door == 1 ) {
		this.measures["mACcurtain"].calcReduceRateWithParts(0.04,this.partCons);	//	店舗の開放された入り口に透明カーテンをとりつける
		this.measures["mACfrontdoor"].calcReduceRateWithParts(0.1,this.partCons);	//	冷暖房時は店舗の入り口の扉を閉めておく
		this.measures["mACbackyarddoor"].calcReduceRateWithParts(0.05,this.partCons);	//	搬入口やバックヤードの扉を閉める
	}
	this.measures["mACclosewindow"].calcReduceRateWithParts(0.02,this.partCons);	//	冷暖房機の空調運転開始時に、外気の取り入れをカットする

	if ( this.centralcontrol != 2 || this.roomset != 2 ){
		this.measures["mACstopcentral"].calcReduceRateWithParts(0.12,this.partCons);	//	セントラル空調をやめて、ユニット式のエアコンにする
	}
	this.measures["mACinsulationpipe"].calcReduceRateWithParts(0.02,this.partCons);	//	室外機のパイプの断熱をしなおす
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consAC
* 部屋の冷暖房消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/09/05 暖房クラスに変換
*								2011/10/21 暖房簡易計算を実装
*/

D6.consAC = D6.object( D6.ConsBase );
DC = D6.consAC;

//初期設定値
DC.init = function() {
	//構造設定
	this.consName = "consAC";				//分野コード
	this.consCode = "";						//うちわけ表示のときのアクセス変数
	this.title = "部屋空調";					//分野名として表示される名前
	this.orgCopyNum = 1;					//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "";					//集約先の分野コード
	this.sumCons2Name = "";					//関連の分野コード
	this.inputDisp = "consCO";				//入力欄を表示する分野コード
	this.groupID = "2";						//うちわけ番号
	this.color = "#ff0000";				//表示の色
	this.countCall = "部屋目";				//呼び方
	this.inputGuide = "";					//入力欄でのガイド
	
	//対策の関連定義
	this.measureName = [
//		"mACreplaceHeat",
		"mACreplace"
	];
	
	//これが定義されている場合には、分割を明確に定義する
	this.consAddSet = [
		"consCO",
		"consHT"
	];

};
DC.init();


//冷暖房消費量計算
//
DC.calc = function() {
	this.clear();			//結果の消去

	this.acYear  = this.input( "i215" + this.subID, 6 );	//エアコン使用年数
	this.acPerf  = this.input( "i216" + this.subID, 2 );	//エアコン省エネ型1　でない2
	this.acFilter  = this.input( "i217" + this.subID,　-1 );	//フィルター掃除

	if ( this.subID != 0 ){
		this.mesTitlePrefix = this.subID + "部屋目";
	}

};

DC.calc2nd = function( ) {
	//冷房と暖房の加算
	this.acHeat = D6.consListByName["consHT"][this.subID];
	this.acCool = D6.consListByName["consCO"][this.subID];
	this.copy( this.acHeat );
	this.add( this.acCool );
	
};

//対策計算
DC.calcMeasure = function() {
	var mes;	//よく使う場合

/*
	//mACreplace（暖房は変えない）
	if ( !this.isSelected( "mACreplaceHeat" ) ){
*/
		mes = this.measures["mACreplace"];
		mes.copy( this );
		if ( this.acHeat.heatEquip == 1 ) {
			//暖房をエアコンでしている場合
			mes.electricity = this.electricity * this.acHeat.apf / this.acHeat.apfMax;
			//分割評価
			mes["consHT"] = D6.object( D6.Energy );
			mes["consHT"].copy( this.acHeat );
			mes["consHT"].electricity = this.acHeat.electricity * this.acHeat.apf / this.acHeat.apfMax;
		} else {
			mes.electricity -= this.acCool.electricity * ( 1 - this.acHeat.apf / this.acHeat.apfMax );
		}
		//分割評価
		mes["consCO"] = D6.object( D6.Energy );
		mes["consCO"].copy( this.acCool );
		mes["consCO"].electricity = this.acCool.electricity * this.acHeat.apf / this.acHeat.apfMax;
		
		if ( this.acHeat.heatArea > 0.3 
			&& this.acHeat.houseSize > 60 
		) {
			var num = Math.round( Math.max( this.acHeat.houseSize * this.acHeat.heatArea, 25 ) / 25 );
			mes.priceNew = num * mes.def["price"];
		}
/*
	}

	//mACreplaceHeat
	mes = this.measures["mACreplaceHeat"];
	mes.clear();
	mes["consHT"] = D6.object( D6.Energy );
	mes["consHT"].copy( this.acHeat );
	mes["consHT"].electricity = this.acHeat.endEnergy /　this.acHeat.apfMax　/ D6.Unit.calorie.electricity;

	mes["consCO"] = D6.object( D6.Energy );
	mes["consCO"].copy( this.acCool );
	mes["consCO"].electricity = this.acCool.electricity * this.acHeat.apf / this.acHeat.apfMax;

	mes.electricity = mes["consHT"].electricity + mes["consCO"].electricity;
	if ( this.heatArea > 0.3 
		&& this.houseSize > 60 
	) {
		mes.priceNew = Math.round( Math.max( this.houseSize * this.heatArea , 25 ) / 25 ) * mes.def["price"];
	}
*/
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsRFsum
* 冷蔵庫全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 冷蔵庫簡易計算を実装
*								2012/08/27 switchに変更
*/


D6.consRFsum = D6.object( D6.ConsBase );
DC = D6.consRFsum;


//初期設定値
DC.init = function() {
	this.home = 600;				//標準年間消費電力量 kWh
	this.homeAdvanced = 240;		//最新型年間消費電力量 kWh
	this.com = 1000;				//標準年間消費電力量 kWh
	this.comAdvanced = 700;			//最新型年間消費電力量 kWh
	this.comFreezer = 2000;				//標準年間消費電力量 kWh
	this.comFreezerAdvanced = 1500;		//最新型年間消費電力量 kWh
	this.show = 2000;					//標準年間消費電力量 kWh
	this.showAdvanced = 1500;			//最新型年間消費電力量 kWh

	this.consRefFreezer = 3;			//冷蔵庫に対する冷凍庫の消費比
	this.consRefOpen = 2;			//扉なしの場合の消費比率
	this.consRefStock = 0.7;		//平台の場合の消費比率

	this.reduceRateNightCover = 0.05;	//ナイトカバーによる削減率
	this.reduceRateWall = 0.1;			//壁から離すことによる削減率
	this.reduceRateTemplature = 0.12;	//温度を控えめにすることによる削減率
	this.reduceRateChange = 0.5;		//新型機種にすることによる削減率

	//構造設定
	this.consName = "consRFsum";		//分野コード
	this.consCode = "RF";				//うちわけ表示のときのアクセス変数
	this.title = "冷蔵庫";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "3";					//うちわけ番号
	this.color = "#a0ffa0";				//表示の色
	//this.residueCalc = "no";			//残余の計算：最初は台数で計算する
	this.inputGuide = "全体の冷蔵庫の使い方について";		//入力欄でのガイド

	this.measureName = [ 
		"mRFnight",
		"mRFslit",
		"mRFcontroler",
		"mRFdoor",
		"mRFflow",
		"mRFicecover",
		"mRFiceflat"
	];
};
DC.init();

//冷蔵庫消費量計算
DC.calc = function( ) {
	this.clear();			//結果の消去
	//入力値の読み込み
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2

	this.cHome =this.input( "i701", 1 );		//家庭用冷蔵庫台数
	this.cCom =this.input( "i711", 
			(this.business == 5 ? Math.round(this.floor / 100 ) + 1 : 0 ) );
			//業務用冷蔵庫台数
	this.cComFreezer =this.input( "i712",
			(this.business == 5 ? Math.round(this.floor / 300 ) + 1 : 0 ) );
			//業務用冷凍庫台数
	this.cShow =this.input( "i713",
			(this.business == 3 ? 10 : 
			(this.business == 2 ? Math.round(this.floor / 50 ) + 1 : 0 ) ) );
			//扉ありショーケース台数
	this.cShowOpen =this.input( "i714",	
			(this.business == 3 ? 5 : 
			(this.business == 2 ? Math.round(this.floor / 20 ) + 1 : 0 ) ) );
			//扉なしショーケース台数
	this.cShowFreezer =this.input( "i715",
			(this.business == 3 ? 4 : 
			(this.business == 2 ? Math.round(this.floor / 100 ) + 1 : 0 ) ) );
			//扉あり冷凍ショーケース台数
	this.cShowFreezerOpen =this.input( "i716", 0 );	//扉なし冷凍ショーケース台数
	this.cStockFreezer =this.input( "i717",	
			(this.business == 3 ? 2 : 
			(this.business == 2 ? Math.round(this.floor / 100 ) + 1 : 0 ) ) );
			//扉なし冷凍平台台数
	
	this.nightCover =this.input( "i721", -1 );	//ナイトカバー
	this.curtain = this.input('i722',-1);	//'スリットカーテンの設置',
	this.controler = this.input('i723',-1);	//'防露ヒーターコントローラー導入',
	this.cleaning = this.input('i724',-1);	//'冷気の吹き出し口、吸い込み口の清掃と吸い込み口の確保',

	this.electricity = this.cHome * this.home / 12;
	this.electricity += this.cCom * this.com / 12;
	this.electricity += this.cComFreezer * this.comFreezer / 12;
	this.electricity += this.cShow * this.show / 12;
	this.eleOpen = this.cShowOpen * this.show * this.consRefOpen / 12;
	this.electricity += this.eleOpen;
	this.electricity += this.cShowFreezer * this.show * this.consRefFreezer / 12;
	this.eleOpenFreezer = this.cShowFreezerOpen * this.show * this.consRefFreezer * this.consRefOpen / 12;
	this.electricity += this.eleOpenFreezer;
	this.eleStockFreezer = this.cStockFreezer * this.show * this.consRefFreezer * this.consRefStock / 12;
	this.electricity += this.eleStockFreezer;
};


//対策計算
DC.calcMeasure = function( ) {
	if (this.nightCover != 1 ) {
		this.measures["mRFnight"].calcReduceRate(this.reduceRateNightCover * this.eleOpen / this.electricity );		//冷蔵庫へのナイトカバーの設置
		this.measures["mRFicecover"].calcReduceRate(this.reduceRateNightCover * this.eleOpenFreezer / this.electricity);	//	冷凍ナイトカバーの設置
	}
	if ( this.curtain != 1 ){
		this.measures["mRFslit"].calcReduceRate(0.2 * this.eleOpen / this.electricity);		//スリットカーテン設置
	}
	if ( this.controler != 1 ){
		this.measures["mRFcontroler"].calcReduceRate(0.1);	//防露ヒーターコントローラー導入
	}
	this.measures["mRFdoor"].calcReduceRate(0.1* this.eleOpen / this.electricity);		//	スライド扉設置
	this.measures["mRFflow"].calcReduceRate(0.1* ( this.eleOpen + this.eleOpenFreezer + this.eleStockFreezer )/ this.electricity);		//	冷気の吹き出し口、吸い込み口の清掃と吸い込み口の確保
	this.measures["mRFiceflat"].calcReduceRate(0.6 * this.eleOpenFreezer / this.electricity );	//	冷凍ケースを平台型に変更

};



﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsRFsum
* 冷蔵庫消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 冷蔵庫簡易計算を実装
*								2012/08/27 switchに変更
*/


D6.consRF = D6.object( D6.consRFsum );
DC = D6.consRF;


//初期設定値
DC.init = function() {
	
	//構造設定
	this.consName = "consRF";			//分野コード
	this.consCode = "";					//うちわけ表示のときのアクセス変数
	this.title = "冷蔵庫";				//分野名として表示される名前
	this.orgCopyNum = 1;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.addable = "冷蔵庫";				//追加可能
	this.sumConsName = "consRFsum";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "3";					//うちわけ番号
	this.color = "#a0ffa0";			//表示の色
	this.countCall = "機種目";			//呼び方
	this.inputGuide = "個別の冷蔵庫・ショーケースについて";		//入力欄でのガイド

	//対策の関連定義
	this.measureName = [
];
	
};
DC.init();

//冷蔵庫消費量計算
DC.calc = function( ) {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.type = this.input( "i731" + this.subID, -1 );		//冷蔵庫タイプ
	this.year = this.input( "i732" + this.subID, -1 );		//冷蔵庫使用年数
	this.size = this.input( "i734" + this.subID, -1 );		//冷蔵庫	内容量
	this.kW = this.input( "i735" + this.subID, -1 );		//冷蔵庫	消費電力kW

	if ( this.subID != 0 ){
		this.mesTitlePrefix = this.subID + this.countCall;
	}

	this.reduceRateChange = this.consYearAdvanced / this.consYear;
	//買い替えによる削減率


};


//対策計算
DC.calcMeasure = function( ) {
	
};



﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* D6.consCKsum
* 調理全体消費量
* 
* @author Yasufumi SUZUKI 	2011/11/04 diagnosis5
*/

D6.consCKsum = D6.object( D6.ConsBase );
DC = D6.consCKsum;

//初期設定値
DC.init = function() {

	//構造設定
	this.consName = "consCKsum";		//分野コード
	this.consCode = "CK";				//うちわけ表示のときのアクセス変数
	this.title = "調理";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "4";					//うちわけ番号
	this.color = "#ffe4b5";				//表示の色
	this.residueCalc = "no";			//残余の計算
	this.inputGuide = "調理について";		//入力欄でのガイド

	this.measureName = [];

};
DC.init();


//調理消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2

	this.seat =this.input( "i009", 
			(this.business == 5 ? Math.round(this.floor / 5 ) + 1 : 0 ) );	
			//座席数
	if ( D6.consShow["TO"].gas > 0 ) {
		this.gas = this.seat * 0.5 * 30;
	} else {
		this.electricity = this.seat * 5 * 30;
	}
};


//対策計算
DC.calcMeasure = function() {
};


﻿/**
* Home-Eco Diagnosis for ActionScript3
* 
* ConsLIsum: ConsLIsum Class
* 照明全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 照明簡易計算を実装
*/

D6.consLIsum = D6.object( D6.ConsBase );
DC = D6.consLIsum;


//初期設定値
DC.init =function() {
	this.lightTime = 6;					//標準照明時間6時間
	this.performanceLED = 100;			//LED  lm/W
	this.performanceHF = 80;			//HF  lm/W
	this.performanceFlueciend = 60;		//蛍光灯  lm/W
	this.preformanceBulb = 15;			//電球 lm/W

	this.outdoorWatt = 150;				//センサー屋外式の消費電力(W)
	this.outdoorTime = 0.5;				//センサー屋外式の時間（時間）
	this.sensorWatt = 2;				//センサーの消費電力（W)
	
	//構造設定
	this.consName = "consLIsum";		//分野コード
	this.consCode = "LI";				//うちわけ表示のときのアクセス変数
	this.title = "照明";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "6";					//うちわけ番号
	this.color = "#ffff00";				//表示の色
	this.inputGuide = "全体の照明の使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
	];
};
DC.init();

//照明消費量計算
DC.calc = function( ) {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2
	this.workDay = D6.consShow["TO"].workDay;			//週日数
	this.lightTime =this.input( "i002",		
			(this.business == 3 ? 24 :
			(this.business == 2 ? 12 : 6 ) ) );
			//業務（照明）時間
	this.lightType =this.input( "i501", 1 );		//照明の種類
	var consUnit = 50;		//照明消費電力W/m2床面積	
	if ( this.lightType == 1 ){
		consUnit = 50;
	}
	//月の消費電力量　kWh/月
	this.electricity = 50 * this.floor * this.lightTime / 2 * this.workDay / 7 * 30 /1000;
};

//対策計算
DC.calcMeasure = function() {
	if ( !(this.lightType == 4 || this.lightType == 6 ) 
			|| this.watt < 20 
	) {
	} else {
	}

};


﻿/**
* Home-Eco Diagnosis for ActionScript3
* 
* consLI: consLI Class
* 部屋照明消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 照明簡易計算を実装
*/

D6.consLI = D6.object( D6.consLIsum );
DC = D6.consLI;

//初期設定値
DC.init =function() {
	
	//構造設定
	this.consName = "consLI";		//分野コード
	this.consCode = "";				//うちわけ表示のときのアクセス変数
	this.title = "";				//分野名として表示される名前
	this.orgCopyNum = 1;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.addable = "照明機器";		//追加可能
	this.sumConsName = "consLIsum";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "6";					//うちわけ番号
	this.color = "#ffff00";				//表示の色
	this.countCall = "ヶ所目";			//呼び方
	this.inputGuide = "部屋・エリア・機器ごとの照明の使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
		"mLIcull", //	蛍光管の間引きをする
		"mLInotbulb", //	シャンデリア照明を使わない
		"mLILED", //	従来型蛍光灯を省エネ型に付け替える
		"mLImercu2LED", //	水銀灯をLEDに取り替える
		"mLIspot2LED", //	スポットライトをLEDタイプに変える
		"mLIbulb2LED", //	電球・ハロゲン照明をLEDに
		"mLItask", //	手元照明を設置して全体照明を控える
		"mLIarea", //	
		"mLIwindowswitch", //	窓側照明の回路をつくり、昼間に消す
		"mLIemargency", //	避難誘導灯を省エネ型に付け替える
		"mLInoperson", //	不在時の消灯を徹底する
		"mLInotuse", //	不要な場所の消灯をする
		"mLInotusearea" //	使用していないエリアの消灯をする

	];
};
DC.init();

//照明消費量計算
DC.calc = function( ) {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.lightType =this.input( "i511" + this.subID, -1 );	//照明の種類
	this.watt =this.input( "i512" + this.subID, 0 );		//照明の消費電力
	this.num =this.input( "i513" + this.subID, 1 );			//照明器具の数
	this.lightTime =this.input( "i514" + this.subID, D6.consShow["LI"].lightTime );		//照明時間

	//月の消費電力量　kWh/月
	this.electricity = this.watt * this.num * this.lightTime * 30 /1000;
};


//対策計算
DC.calcMeasure = function() {
	if ( this.subID == 0 && this.electriity < this.sumCons.electricity * 0.6 ) return;
	
	this.measures['mLIcull'].calcReduceRate(0.13); // 蛍光管の間引きをする
	if ( this.type == 4 || this.type == 6 ) {
		this.measures['mLInotbulb'].calcReduceRate(0.9); // シャンデリア照明を使わない
	}
	if ( this.type == 1 ) {
		this.measures['mLILED'].calcReduceRate(0.5); // 従来型蛍光灯をLEDに付け替える
		this.measures['mLIhf'].calcReduceRate(0.3); // 従来型蛍光灯を省エネ型に付け替える
	}
	if ( this.type == 5 ) {
		this.measures['mLImercu2LED'].calcReduceRate(0.5); // 水銀灯をLEDに取り替える
	}
	if ( this.type == 4 ) {
		this.measures['mLIspot2LED'].calcReduceRate(0.8); // スポットライトをLEDタイプに変える
		this.measures['mLIbulb2LED'].calcReduceRate(0.8); // 電球・ハロゲン照明をLEDに取り替える
	}
	if ( this.business == 1 ){
		this.measures['mLItask'].calcReduceRate(0.1); // 手元照明を設置して全体照明を控える
		this.measures['mLIarea'].calcReduceRate(0.2); // 日中に明るいエリアの照明を消す
		this.measures['mLIwindowswitch'].calcReduceRate(0.2); // 窓側照明の回路をつくり、昼間に消す
	}
	this.measures['mLIemargency'].calcReduceRate(0.01); // 避難誘導灯を省エネ型に付け替える
	this.measures['mLInoperson'].calcReduceRate(0.1); // 不在時の消灯を徹底する
	this.measures['mLInotuse'].calcReduceRate(0.1); // 不要な場所の消灯をする
	this.measures['mLInotusearea'].calcReduceRate(0.1); // 使用していないエリアの消灯をする

};


﻿/**
* Home-Eco Diagnosis for ActionScript3
* 
* ConsOTsum: ConsOTsum Class
* その他機器消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 照明簡易計算を実装
*/

D6.consOTsum = D6.object( D6.ConsBase );
DC = D6.consOTsum;


//初期設定値
DC.init =function() {
	this.lightTime = 6;					//標準照明時間6時間
	this.performanceLED = 100;			//LED  lm/W
	this.performanceHF = 80;			//HF  lm/W
	this.performanceFlueciend = 60;		//蛍光灯  lm/W
	this.preformanceBulb = 15;			//電球 lm/W

	this.outdoorWatt = 150;				//センサー屋外式の消費電力(W)
	this.outdoorTime = 0.5;				//センサー屋外式の時間（時間）
	this.sensorWatt = 2;				//センサーの消費電力（W)
	
	//構造設定
	this.consName = "consOTsum";		//分野コード
	this.consCode = "OT";				//うちわけ表示のときのアクセス変数
	this.title = "機器";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "6";					//うちわけ番号
	this.color = "#ffff00";				//表示の色
	this.residueCalc = "no";			//残余の計算
	this.inputGuide = "その他機器の使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
	];
};
DC.init();

//機器消費量計算
DC.calc = function( ) {
	this.clear();			//結果の消去

};

//対策計算
DC.calcMeasure = function() {

};


﻿/**
* Home-Eco Diagnosis for ActionScript3
* 
* consOT: consOT Class
* その他機器消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 照明簡易計算を実装
*/

D6.consOT = D6.object( D6.consOTsum );
DC = D6.consOT;

//初期設定値
DC.init =function() {
	
	//構造設定
	this.consName = "consOT";		//分野コード
	this.consCode = "";				//うちわけ表示のときのアクセス変数
	this.title = "";				//分野名として表示される名前
	this.orgCopyNum = 1;			//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.addable = "その他機器";		//追加可能
	this.sumConsName = "consOTsum";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "6";					//うちわけ番号
	this.color = "#ffff00";				//表示の色
	this.countCall = "機種目";			//呼び方
	this.inputGuide = "機器ごとの使い方について";		//入力欄でのガイド
	
	this.measureName = [ 
	];
};
DC.init();

//照明消費量計算
DC.calc = function( ) {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.kw = this.input('i899'+this.subID,0);	//'定格消費電力(kW)',
	this.num = this.input('i812'+this.subID,1);	//'台数',
	this.time = this.input('i813'+this.subID,0);	//'使用時の1日使用時間',
	this.useinyear = this.input('i814'+this.subID,0);	//'使用頻度',

	//月の消費電力量　kWh/月
	this.electricity = this.kw * this.num * this.time * this.useinyear / 12;
};


//対策計算
DC.calcMeasure = function() {

};


﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsOAsum
* OA機器全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*								2011/10/21 テレビ簡易計算を実装
*								2012/08/27 switch形式に変更
*/

D6.consOAsum = D6.object( D6.ConsBase );
DC = D6.consOAsum;


//初期設定値
DC.init = function() {
	this.wattDesktop = 150;					//W
	this.wattNotebook = 20;					//W
	this.wattPrinter = 200;					//W
	this.wattServerRoom = 5000;					//W

	this.reduceRateRadio = 0.8;			//ラジオにすることによる削減率
	this.reduceRateBright = 0.2;		//明るさを調整することによる削減率

	//構造設定
	this.consName = "consOAsum";		//分野コード
	this.consCode = "OA";				//うちわけ表示のときのアクセス変数
	this.title = "OA機器";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にはこの分のコピーが作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "7";					//うちわけ番号
	this.color = "#00ff00";			//表示の色
	this.inputGuide = "OA機器の使い方について";		//入力欄でのガイド

	this.measureName = [ 
		"mOAstanby",
		"mOAsavemode",
		"mOAconsent",
		"mOAtoilettemplature",
		"mOAtoiletcover"
	];
};
DC.init();

//OA消費量計算
DC.calc = function() {

	this.clear();			//結果の消去

	//入力値の読み込み
	this.business = D6.consShow["TO"].business;			//業種
	this.floor = D6.consShow["TO"].floor;				//床面積 m2
	this.workTime = D6.consShow["TO"].workTime;			//業務時間
	this.workDay = D6.consShow["TO"].workDay;			//週日数

	this.desktop = this.input('i601',
			Math.round(( this.business==1 ? 1 : 0.1) * this.floor / 50 ) );	
			//'デスクトップパソコン台数',
	this.notebook = this.input('i602',
			Math.round(( this.business==1 ? 5 : 0.5) * this.floor / 50 ) );	
			//'ノートパソコン台数',
	this.printer = this.input('i603',
			Math.round(( this.business==1 ? 1 : 0.1) * this.floor / 50 ) );	
			//'プリンタ・コピー機台数',
	this.serverRoom = this.input('i604',2);	//'サーバールーム',
	this.pcStop = this.input('i621',-1);	//'非使用時のパソコンの休止設定の徹底',
	this.printerStop = this.input('i622',-1);	//'プリンタ・コピー機の休止モード活用',

	//月の消費電力量　kWh/月
	var calckwh = this.workTime * this.workDay / 7 * 30 /1000;
	this.elecDesktop = this.desktop * this.wattDesktop * calckwh;
	this.elecNotebook = this.notebook * this.wattNotebook * calckwh;
	this.elecPrinter = this.printer * this.wattPrinter * calckwh;
	
	this.electricity = this.elecDesktop + this.elecNotebook + this.elecPrinter
				+ ( this.serverRoom == 1 ? this.wattServerRoom * 24 : 0 ) * 30 / 1000;
				
};



//対策計算
DC.calcMeasure = function( ) {
	this.measures["mOAstanby"].calcReduceRate( 0.1 * (this.elecDesktop +this.elecNotebook)/ this.electricity );	
		//	長時間席を離れるときにはOA機器をスタンバイモードにする
	this.measures["mOAsavemode"].calcReduceRate(0.1 * this.elecPrinter / this.electricity );	
		//	コピー機の節電モードを活用するs
	this.measures["mOAconsent"].calcReduceRate(0.02);	//	使っていない機器のコンセントから抜いておく
	this.measures["mOAtoilettemplature"].calcReduceRate(0.01);	//	温水便座の温度設定を控えめにする
	this.measures["mOAtoiletcover"].calcReduceRate(0.01);	//	温水便座の不使用時はふたを閉める
};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsCR
* 自家用車消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
* 								2016/04/12 js
*/


D6.consCRsum = D6.object( D6.ConsBase );
DC = D6.consCRsum;


//初期設定値
DC.init = function() {
	this.performanceNow = 10;			//保有機種の燃費
	this.performanceNew = 25;			//高性能機種の燃費
	this.publicRate = 0.6;				//公共交通が使える率
	this.walkRate = 0.2;				//徒歩自転車が使える率

	this.reduceRateEcoDrive = 0.15;		//エコドライブの削減率
	this.reduceRatePublic = 0.7;		//公共交通の削減率（バスを想定）
	this.reduceRateHalf = 0.5;			//交通半減による削減率


	//構造設定
	this.consName = "consCRsum";			//分野コード
	this.consCode = "CR";					//うちわけ表示のときのアクセス変数
	this.title = "移動輸送";				//分野名として表示される名前
	this.orgCopyNum = 0;				//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "consTotal";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "8";					//うちわけ番号
	this.color = "#ee82ee";			//表示の色
	this.countCall = "";			//呼び方
	this.inputGuide = "車両の使い方について";		//入力欄でのガイド

	this.measureName = [ 
		"mCRecodrive"
	];

};
DC.init();

//車消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.car = D6.consShow["TO"].car;
	//移動先からの加算でのみ追加する
};


DC.calc2nd = function( ) {

};


//車対策計算
DC.calcMeasure = function() {
	this.measures["mCRecodrive"].calcReduceRate(0.1);	//		エコドライブを実践する

};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsCR
* 自家用車消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
* 								2016/04/12 js
*/


D6.consCR = D6.object( D6.consCRsum );
DC = D6.consCR;


//初期設定値
DC.init = function() {

	//構造設定
	this.consName = "consCR";			//分野コード
	this.consCode = "";					//うちわけ表示のときのアクセス変数
	this.title = "車両";				//分野名として表示される名前
	this.orgCopyNum = 1;				//初期複製数（consCodeがない場合にコピー作成）
	this.addable = "車両";				//追加可能
	this.sumConsName = "";				//集約先の分野コード
	this.sumCons2Name = "consCRsum";	//関連の分野コード
	this.groupID = "8";					//うちわけ番号
	this.color = "#ee82ee";			//表示の色
	this.countCall = "台目";			//呼び方
	this.inputGuide = "保有する車ごとの性能・使い方について";		//入力欄でのガイド
	
	//対策の関連定義
	this.measureName = [
		"mCRreplace",
		"mCRreplaceElec"
		];
};
DC.init();

//車消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.carType = this.input( "i911"　+ this.subID , 1 );	//車種類
	this.performance = this.input( "i912"　+ this.subID , 12 );//車燃費
	this.user = this.input( "i913"　+ this.subID , this.subID　+ "台目" );	//車利用者
	this.ecoTier = this.input( "i914"　+ this.subID , 3 );	//エコタイヤ

	if ( this.subID != 0 ){
		this.mesTitlePrefix = this.user;
	}

	//移動先からの加算でのみ追加する
};


DC.calc2nd = function( ) {

	//if ( this.subID == 0 ) return;
	var trsum = 0;
	var carnum = D6.consListByName["consCR"].length;
	var tripnum = D6.consListByName["consCRtrip"].length;
	for ( i=1 ; i<tripnum ; i++ ){
		trsum += D6.consListByName["consCRtrip"][i].car;
	}
	if ( trsum == 0 ){
		if ( this.subID == 0 ){
			this.car = this.sumCons2.car;
		} else {
			//移動先の割合がない場合には、1台目が半分、次が残りの半分。最後の車が残りを得る
			this.car *= Math.pow( 0.5, this.subID );
			if ( this.subID == carnum-1 ) {
				this.car *= 2;
			}
		}
	} else {
		//移動先の割合で、ガソリン消費量を割り振られているこの比率を拡大する
		this.car *= this.sumCons2.car / trsum;
	}
	this.car  = 0; 	//160620 一時的
};


//車対策計算
DC.calcMeasure = function() {
//	if ( this.subID == 0 && this.car == this.sumCons.car ) return;

	this.measures["mCRreplace"].calcReduceRate( (this.performanceNew - this.performanceNow ) / this.performanceNew );
	this.measures["mCRreplaceElec"].calcReduceRate( (this.performanceNew - this.performanceNow ) / this.performanceNew );

};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* consCRtrip
* 自家用車全体消費量
* 
* @author Yasufumi SUZUKI 	2011/01/21 diagnosis5
*								2011/05/06 actionscript3
*								2011/08/23 strategyとして整理
*/

D6.consCRtrip = D6.object( D6.consCRsum );
DC = D6.consCRtrip;


//初期設定値
DC.init = function() {

	//構造設定
	this.consName = "consCRtrip";		//分野コード
	this.consCode = "";					//うちわけ表示のときのアクセス変数
	this.title = "移動";				//分野名として表示される名前
	this.orgCopyNum = 1;				//初期複製数（consCodeがない場合にコピー作成）
	this.sumConsName = "consCRsum";		//集約先の分野コード
	this.sumCons2Name = "";				//関連の分野コード
	this.groupID = "8";					//うちわけ番号
	this.color = "#ee82ee";			//表示の色
	this.countCall = "ヶ所目";			//呼び方
	this.addable = "移動先";
	this.inputGuide = "移動先ごとの車等の使い方について";		//入力欄でのガイド
	
	//対策の関連定義
	this.measureName = [
];

};
DC.init();

//移動消費量計算
DC.calc = function() {
	this.clear();			//結果の消去

	//入力値の読み込み
	this.dist =this.input( "i921" + this.subID, this.subID + "ヶ所目" );//行き先
	this.frequency =this.input( "i922" + this.subID, 250 );		//頻度
	this.km =this.input( "i923" + this.subID, 0 );				//距離
	this.carID =this.input( "i924" + this.subID, 1 );			//使用する車

	if ( this.subID != 0 ){
		this.mesTitlePrefix = this.dist;
	}

	//車の燃費
	this.performance = D6.consListByName["consCR"][this.carID].performance;
	
	//this.car = this.km * 2 * this.frequency / 12 / this.performance;
		//ガソリン量　L/月
	
	//関連する車を加算する
	D6.consListByName["consCR"][this.carID].car += this.car;

};

DC.calc2nd = function( ) {
	//残渣の場合の処理
	if ( this.subID == 0 ){
		this.car = this.sumCons.car;
		var cons = D6.consListByName[this.consName];
		for( var i=1 ; i< cons.length ; i++ ){
			this.car -= cons[i].car;
		}
	}
	this.car  = 0; 	//160620 一時的

};

//車対策計算
DC.calcMeasure = function( ){
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
 * setscenario()				initialize diagnosis structure by scenario file
 * addMeasureEachCons()			add measure definition
 * addConsSetting()				add consumption definition 
 * calcCons()					calculate consumption
 * calcConsAdjust()				adjust consumption
 * calcMeasures()				calculate measure
 * calcMeasuresLifestyle()		calculate all measures and select lifestyle
 * calcMeasuresNotLifestyle()	calculate all measures and select not lifestyle
 * calcMeasuresOne()			calculate in temporal selection
 * measureAdd()					set select flag and not calculate 
 * calcMaxMeasuresList()		automatic select max combination 
 * calcAverage()				get avearage consumption
 * inSet()						input data setter
 * getGid()						get group id
 * getCommonParameters()		result common parameters
 * rankIn100()					get rank				
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
var D6 = D6||{};

//instances
D6.consList = [];					//consumption full list
D6.consListByName = [];				//consumption list by consname
D6.consShow = [];					//major consumption list by conscode
D6.measureList = [];				//measure list
D6.monthly = [];					//monthly energy
D6.resMeasure = [];					//result of measures list

D6.mesCount = 0;					//count of measures
D6.consCount = 0;					//count of consumptions

D6.average = { consList:""
				};					//average of consumptions 
	
D6.isOriginal = true;					//in case of no measure is selected
D6.sortTarget = "co2ChangeOriginal";	//by which measureas are sorted, changeable by input


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
	var i,j,k;
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
	var cname;

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
					consList[D6.consCount].setsubID( j );
					
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
		for( var i in D6.scenario.defEasyQues[0].ques ) {
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
	

// calcCons() -------------------------------------------------------
//		calculate consumption in consumption instance
// 
D6.calcCons = function() {
	var i,j;
	var ci;

	//area parameters set
	this.area.setCalcBaseParams();

	//pre calculation such as common parameters setting
	for ( i=0 ; i<D6.consList.length ; i++ ) {
		this.consList[i].precalc();
	}
		
	//calculate each consumption at first time
	for ( i=0 ; i<D6.consList.length ; i++ ) {
		this.consList[i].calc();
		this.consList[i].calcCO2();
	}

	//calculate 2nd step 
	for ( i=0 ; i<this.consList.length ; i++ ) {
		this.consList[i].calc2nd();
		this.consList[i].calcCO2();	
	}

	//adjust among each consumption
	this.calcConsAdjust();

	//calculate cost and energy
	for ( i=0 ; i<this.consList.length ; i++ ) {
		this.consList[i].calcCost();
		this.consList[i].calcJules();
		//set as original value, which is in case of no selection
		if ( this.isOriginal ) {
			this.consList[i].co2Original = this.consList[i].co2;
			this.consList[i].costOriginal = this.consList[i].cost;
			this.consList[i].julesOriginal = this.consList[i].jules;
		}
	}
};
	

//calcConsAdjust() --------------------------------------------------
//		adjust among each consumption
//		called from calcCons()
D6.calcConsAdjust = function() {		
	var ci, i, j;
	var consNum;
	var consSum;
	var energySum = D6.object( D6.Energy );
	D6.energyAdj = D6.object(D6.Energy);	//adjust parameters by energy
	var singleArray = true;
	var lastname = "";
		
	// calculate sum of part side consumptions of each consumption exclude total one
	for ( ci in this.consShow ) {
		consSum = this.consShow[ci];

		if ( consSum.consName != "consTotal" ) {
			energySum.clear();
				
			if ( consSum.partCons.length >= 1 ) {
				// countable consumption
				lastname = consSum.partCons[0].consName;
				for ( i=1 ; i<consSum.partCons.length ; i++ ) {
					// sum from 1 not 0. #0 is residue
					energySum.add( consSum.partCons[i] );

					//check if different consName. true:different, false:same
					if ( lastname != consSum.partCons[i].consName) {
						singleArray = false;
					}
				}
				energySum.calcCO2();

				if ( consSum.residueCalc == "no") {
					// refrigerator pattern : each consumption is important
					consSum.copy( energySum );
					consSum.add( consSum.partCons[0] );
					consSum.calcCO2();
				} else {
					// top down pattern : group consumption is important 
					if ( energySum.co2 > consSum.co2 ) {
						//in case of sumup is bigger than sumCons divide each cons
						for ( i=1 ; i<=consNum ; i++ ) {
							consSum.partCons[i].multiply( consSum.co2 / energySum.co2 );
						}
						consSum.partCons[0].clear();
					} else {
						//calculate residue
						if ( singleArray ) {
							//set residue to partCons[0]
							energySum.sub( consSum );
							energySum.multiply( -1 );
							consSum.partCons[0].copy( energySum );
						} else {
							//not to set partCons[0], because #0 is not residue 
							consSum.copy( energySum );
							consSum.add( consSum.partCons[0] );
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
	for ( ci in this.consShow ){
		if ( ci != "TO" ) {
			for ( j in D6.Unit.co2 ){
				energySum[j] += this.consShow[ci][j];
			}
		}
	}

	//parameters existence of extinct total data
	var nodataTotal = this.consShow["TO"].noConsData;
		
	//residue is more than 10% of electricity
	energySum.electricity += this.consShow["TO"].electricity * 0.1;
		
	//execute adjust
	energyAdj = [];
	if ( !nodataTotal ) {
		//in case of exist in total consumption
		for ( j in D6.Unit.co2 ){
			if ( energySum[j] == 0 ) {
				this.energyAdj[j] = 1;
			} else {
				// adjust is less than triple and more than 0.3 times
				this.energyAdj[j] = Math.max( 0.3, Math.min( 3, this.consShow["TO"][j] / energySum[j] ) );
			}
		}

		//execute adjust
		for ( ci in this.consList ){
			if ( this.consList[ci].consName != "consTotal" ) {
				this.consList[ci].calcAdjust( this.energyAdj );
			}
		}

	} else {
		//no total value
		for ( j in D6.Unit.co2 ){
			if ( j == "electricity" ){
				if( this.consShow["TO"][j] < energySum[j] ) {
					this.consShow["TO"][j] = energySum[j];
				}
			} else {
				this.consShow["TO"][j] = energySum[j];
			}
		}
		this.consShow["TO"].calcCO2();
	}
};



// calcMeasures(gid)  calculate all measures -----------------------------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
// once clear selected measures, and set select and calculate one by one
//
D6.calcMeasures = function( gid ) {
	var ret;
	var calcfg = false;
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
	if ( D6.debugMode ) {
		console.log( "measure calculate in d6.js calcMeasures() --- " );
		console.log( ret2 );
	}
	return ret2;
};


// calcMeasuresLifestyle(gid)  
//		calculate all measures and select lifestyle --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
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
	

// calcMeasuresNotLifestyle(gid)  
//		calculate all measures and select not lifestyle --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
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


// calcMeasuresOne(gid)  
//		calculate all measures in temporal selection --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array include mesID,groupID and lifestyle
//
// called by calcMeasures
//
D6.calcMeasuresOne = function( gid ) {
	var ret;								//return
	var topList;							//list of measures id
	var selectList;							//list of selected measures id
	var i;

	var sortTarget = this.sortTarget;		//sort target
	ret = new Array();
	topList = new Array();
	selectList = new Array();

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

// clearSelectedMeasures(gid)  clear all selection and calculate all --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
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

	
// calcMaxMeasuresList(gid)
//		automatic select max combination measures --------
//
// parameters
//		gid		groupid, -1 is total
//		count	max selected number
// return
//		measure array defined in calcMeasuresOne
//
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
	if( typeof(count) == "undefined" || count<1 ) count = 15;
		
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
				if ( measureList[j].selected != true 		//skip already selected
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
	ret = calcMeasures(gid);
	ret.sumCO2 = sumCO2;
	ret.sumCOST = sumCOST;

	return ret;
};



// calcAverage()  get avearage consumption ------------------
//
// parameters
//		none
// return
//		none
//
// set D6.average.consList[]
//
D6.calcAverage = function(){
	D6.averageMode = true;			//not use input parameters
	this.calcCons();				//and calculate, then get average

	this.average.consList = {};
	for( var c in this.consShow ) {
		this.average.consList[c] = {};
		this.average.consList[c].co2 = this.consShow[c].co2;
		this.average.consList[c].cost = this.consShow[c].cost;
		this.average.consList[c].jules = this.consShow[c].jules;
		this.average.consList[c].title = this.consShow[c].title;
	}
	D6.averageMode = false;	
};

	
// inSet(id, val)  input data setter ------------------
//
// parameters
//		id		input id, permit include equip/room code 'ixxxyy'
//		val		input value
//
D6.inSet = function ( id, val ){
	var inpIdDef = id.substr( 0,4 );
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

	
// getGid(consName)  getter group id of consumption ------------------
//
// parameters
//		consName	consumption name
// retrun
//		groupID		0-9
//
D6.getGid  = function( consName ) {
	return D6.logicList[consName].groupID;
};
	

// getTargetConsList(consName)  getter consumption object ------------------
//
// parameters
//		consName	consumption name
// retrun
//		consumption object / object array
//
D6.getTargetConsList  = function( consName )
{
	var i,c=0;
	var target = new Array();
	var ret;

	if ( consName != "" ) {
		for ( i=0 ; i<this.consList.length ; i++ ) {
			if ( this.consList[i].consName == consName ) {
				target[c++] = this.consList[i];
			}
		}
		if ( target.length == 1 ) {
			//in case of single
			ret = target[0];
		} else {
			//in case of array
			ret = target;
		}
	}
	return ret;
};

	
// getCommonParameters()  getter common result parameters such as co2 ------------------
//
// retrun
//		co2,cost
//
D6.getCommonParameters = function(){
	var ret = [];
	ret.co2Original = D6.consListByName["consTotal"][0].co2Original;
	ret.co2 = D6.consListByName["consTotal"][0].co2;
	ret.costOriginal = D6.consListByName["consTotal"][0].costOriginal;
	ret.cost = D6.consListByName["consTotal"][0].cost;
		
	return ret;
};


// rankIn100(ratio)  calculate rank by ratio to average ------------------
//
// parameters
//		ratio	ratio to average
// return
//		rank 1-100
//
D6.rankIn100 = function( ratio ){
	var ret;
	var lognum;

	var width = 0.5;		// set diffusion parameter

	if ( ratio <= 0 ) {
		//in case of minus
		ratio = 0.1;
	}
	lognum = Math.log( ratio );

	if ( lognum < -width ) {
		// rank 1-10
		ret = Math.max( 1, Math.round( ( lognum + 1 ) / width * 10 ) );
	} else if ( lognum < width ) {
		// rank 11-90
		ret = Math.round(( lognum + width ) / ( width * 2) * 80 + 10 );
	} else {
		// rank 91-100
		ret = Math.min( 100, Math.round( ( lognum - width ) / ( width * 2) * 10 ) + 90 );
	}
	return ret;
};

	
// toHalfWidth(strVal)  change double width charactor------------------
//
// parameters
//		strVal	original value
// return
//		halfVal replaced value
//
D6.toHalfWidth = function(strVal){
	if ( !strVal ) return strVal;
	var halfVal = strVal.replace(/[！-～]/g,
		function( tmpStr ) {
		// shift charactor code
			return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
		}
	);
	return halfVal;
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

