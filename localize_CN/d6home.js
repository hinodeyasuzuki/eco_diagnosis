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
D6.getInputPage(consName, subName)		create input page (input.js)
				consName: consumption code name
				subName: sub category of consumption name

D6.getAllResult(consName)			get total result 
				consName: consumption code name
				
D6.showItemizeGraph(consCode, sort )	get itemized graph data
				consCode: consumption short code
				sort: target 

D6.createDemandSumupPage()				get demand value
D6.createDemandLogPage()
D6.demandGraph()						get demand graph

D6.getMeasureComment(id)				comment of measure
				id:measureID
D6.modalHtml( id, ret )				measure detail data to show dialog	
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

//TODO new result 180304 ==================================
//
//	command.command			text
//	command.action_list		array
//	command.return_list		array
//	command.return_text		1:return text 0:not
//
//	for node.js as JSON
//
//	result.command			command to call
//  result.errormessage		error message if not null 
//	result.monthly
//	result.itemize
//	result.measure
//	result.detail
//
// make html at ay generator



//resolve D6 -------------------------------------
var D6 = D6||{};


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
			D6.viewparam.ode = param.ode;
			D6.viewparam.focusMode = param.focusMode;
			D6.viewparam.countfix_pre_after = param.countfix_pre_after;
			
			//set debug mode
			if ( param.debugMode && param.debugMode == 1 ){
				D6.debugMode = true;
			} else {
				D6.debugMode = false;
			}

			//initialize datasets
			D6.constructor(param.prohibitQuestions, param.allowedQuestions, param.defInput);

			// set file data
			if ( typeof(param.rdata) != "undefined" && param.rdata ) {
				try {
					D6.doc.loadDataSet( decodeURIComponent(escape(atob(param.rdata))) );
				} catch(e){
					//console.log("load data error");
				}
			}
			
			//calculation
			D6.calculateAll();

			//get initial page as consTotal
			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.getAllResult( "consTotal" );

			//create input componets
			result.inputPage = D6.getInputPage(param.consName,param.subName);

			//button selection
			result.quesone = D6.getFirstQues(param.consName,param.subName);

			//debug
			if ( D6.debugMode ) {
				console.log( "d6 construct value ----" );
				console.log( D6 );
			}

			break;

		case "addandstart":
			//change structure such as number of equipments
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
			D6.calculateAll();

			//#0 page is basic question
			var showName = D6.consListByName[param.consName][0].sumConsName;

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.getAllResult(showName );

			//create input components
			result.inputPage = D6.getInputPage(showName,param.subName);

			break;

		case "tabclick" :
			//menu selected / main cons change		

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.getAllResult(param.consName);

			//create input componets
			result.inputPage = D6.getInputPage(param.consName, param.subName);

			//button selection
			result.quesone = D6.getFirstQues(param.consName, param.subName);

			break;

		case "subtabclick" :
			//create input componets / sub cons change
			result.inputPage = D6.getInputPage(param.consName, param.subName);
			result.subName = param.subName;
			break;

		case "inchange" :
			//in case of changing input value, recalc.
			D6.inSet(param.id,param.val);
			if ( param.id == D6.scenario.measuresSortChange ){
				D6.sortTarget =  D6.scenario.measuresSortTarget[param.val < 0 ? 0:param.val];
			}
			D6.calculateAll();

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.getAllResult();	//show result 
			break;

		case "inchange_only" :
			//in case of changing input value.
			D6.inSet(param.id,param.val);
			result = "ok";
			break;

		case "quesone_next" : 
			result.quesone = D6.getNextQues();
			break;
			
		case "quesone_prev" : 
			result.quesone = D6.getPrevQues();
			break;
			
		case "quesone_set" : 
			D6.inSet(param.id,param.val);
			result.quesone = D6.getNextQues();
			break;
			
		case "recalc" :
			//only recalc no graph data
			D6.calculateAll();

			result = D6.getAllResult(param.consName);
			
			//create input componets
			result.inputPage = D6.getInputPage(param.consName,param.subName);
			break;

		case "pagelist" :
			//create itemize list
			result.inputPage = D6.getInputPage(param.consName,param.subName);
			break;
			
		case "measureadd" :
		case "measureadd_comment" :
			//add measure to select list 
			D6.measureAdd( param.mid );
			D6.calcMeasures(-1);

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.getAllResult();
			break;

		case "measuredelete" :
			//delete measure from select list
			D6.measureDelete( param.mid  );
			D6.calcMeasures(-1);

			//result.graphItemize, result.graphMonthly, result.average, result.cons, result.measure
			result = D6.getAllResult();
			break;

		case "graphchange" :
			//change graph
			result.itemize_graph = D6.getItemizeGraph("", param.graph);
			break;

		case "evaluateaxis" :
			//calc evaluate axis point
			result.evaluateAxis = D6.getEvaluateAxisPoint("", param.subName);
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
			result.demandin = D6.getInputDemandSumup();
			result.demandlog = D6.getInputDemandLog();
			result.graphDemand = D6.getDemandGraph();
			break;
			
		case "inchange_demand" :
			D6.inSet(param.id,param.val);
			result.graphDemand = D6.getDemandGraph();
			break;
			
		case "modal" :
			//ay detail information about measure, modal dialog
			var id =param.mid;
			result.measure_detail = D6.getMeasureDetail( id );	
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
			result.inputPage = D6.getInputPage(param.consName,param.subName);
			break;

		case "getqueslist" :
			//return question list
			result.queslist = D6.getQuesList();
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
			result = D6.getAllResult();
			
			//create input components
			result.inputPage = D6.getInputPage(param.consName,param.subName);
			
			//calc evaluate axis point
			result.evaluateAxis = D6.getEvaluateAxisPoint("", param.subName);
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
	costToCons : function( cost, energy_name, elecType, kw )
	{
		if(typeof kw === 'undefined') kw = 0;
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
		5, //8,1,32,25	'上海',
		1, //-11,-23, 29, 18"長春",		//1　旭川 -3,-13, 26,17
		2, //2,-10,31,22"北京",			//2	札幌 -1,-7, 27,19
		2, //3,-4, 28,23"青島",
		3, //6,-5, 32,23 "鄭州",		//3 宇都宮 8,-3, 31, 22
		2, //2, -11, 29, 16 "蘭州",
		5, //8,1,32,25	'上海',			//5 東京 10, 1, 31, 23
		5, //9,5, 35,25"重慶",
		2, //-2,-16,33,16 "敦煌",
		4, //7,-10, 23,10"拉萨",　夏が涼しい	//4	軽井沢 2,-9, 26,16
		6, //15, 2, 24,16 "昆明",　夏が涼しい	//6 高千穂 9,-1, 30, 21
		7, //18,10,33,25 "広州",				//7 那覇 20, 15, 32, 27
		7, //21,15,33,25 "海口"
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

	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //東京都区部
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //札幌市
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //札幌市
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //札幌市
	[ [ 1.1498, 1.2742, 1.934, 1.0276 ], [ 0.9069, 0.9497, 0.6857, 0.9587 ], [ 0.9555, 0.7183, 0.2786, 1.032 ] ],   //宇都宮市
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //札幌市
	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //東京都区部
	[ [ 1.1218, 1.3846, 2.4812, 1.0011 ], [ 0.8666, 0.9201, 0.393, 0.8726 ], [ 1.0599, 0.6203, 0.0368, 1.2109 ] ],   //東京都区部
	[ [ 1.149, 1.1094, 1.8254, 0.9243 ], [ 0.9482, 0.9876, 0.8169, 1.0159 ], [ 0.8876, 0.8749, 0.2047, 1.0743 ] ],   //札幌市
	[ [ 1.1301, 1.3407, 2.324, 0.9201 ], [ 0.8464, 0.9429, 0.4949, 0.9414 ], [ 1.0826, 0.6409, 0.0765, 1.2042 ] ],   //奈良市
	[ [ 1.1301, 1.3407, 2.324, 0.9201 ], [ 0.8464, 0.9429, 0.4949, 0.9414 ], [ 1.0826, 0.6409, 0.0765, 1.2042 ] ],   //奈良市
	[ [ 0.8457, 1.1222, 1.5081, 0.9201 ], [ 0.9351, 0.9941, 0.8528, 0.9802 ], [ 1.3139, 0.847, 0.5678, 1.1395 ] ],   //那覇市
	[ [ 0.8457, 1.1222, 1.5081, 0.9201 ], [ 0.9351, 0.9941, 0.8528, 0.9802 ], [ 1.3139, 0.847, 0.5678, 1.1395 ] ]   //那覇市

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
		//とりあえず単価をかけあわせる 地域等により変更することが望ましい
		ret = cons * D6.Unit.jules[energy_name]/1000000;

		return ret;
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

	//is this measure selected?
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

D6 = D6 || {};

D6.calcMonthly = function( ave, season, monthly, seasonPatternP, energyCode ) {
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
 * d6_get.js 
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
D6.getAllResult = function(consName){
		var ret = [];
		if ( consName ) {
			if ( !D6.logicList[consName] ) consName = "consTotal";
			this.nowConsPageName = consName;
		}
		consName = this.nowConsPageName;
		
		//get consCode
		var consCode = D6.consListByName[consName][0].consCode;

		//create collective result
		ret.common = D6.getCommonParameters();
		
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
D6.getAverage = function ( consCode ){
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
	};
	
	//average compare result 
D6.getAverage_graph = function()
	{		
		var ret = [];
		ret.cost = [];
		ret.co2 = [];

		//	co2[1], cost[1] average
		ret.cost[1] = D6.area.averageCostEnergy;
		ret.co2[1] = D6.area.averageCO2Energy;
		ret.co2[1].total = ret.co2[1].electricity + ret.co2[1].gas + ret.co2[1].kerosene + ret.co2[1].car;

		//  co2[0], cost[0] user
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
	};

	//itemized value
	// parameter
	// 		consCode : consumption category
	// result
	//		ret[nowConsCode] : itemized data for table( all items )
	//
D6.getItemize = function (consCode){
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
	};

	
	//itemize graph data set
	// parameters
	//		consCode: consumption code
	//		sort:sort target (co2,energy,money)
	// result
	//		itemized co2 graph data
D6.getItemizeGraph = function ( consCode, sort ){
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
	};

	//CO2 itemize array
	//
	// return
	//		consObject array ( [0] is consTotal ) only for graph
	//		
D6.dataItemize = function()
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
	};


	//monthly graph data
	//
	// return
	//		ret.data[]	graph data
	//		ret.yaxis	title
D6.getMonthly  = function ( ){
		var ret = [];
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
		
		var month = [];
		var ri = 0;
		var e;
		for ( var m=1 ; m<=12 ; m++ ){
			for ( e=0 ; e<ene1.length ;e++ ){
				if ( !D6.consShow["TO"].monthlyPrice[ene1[e].ene] ) continue;
				month[ri] = [];
				month[ri]["month"] = m;
				month[ri][show.title] = Math.round(D6.consShow["TO"].monthlyPrice[ene1[e].ene][m-1]/show.divide*show.round)/show.round;
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
D6.getGid  = function( consName ) {
	return D6.logicList[consName].groupID;
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
		var tmax = 0;
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
			
			if ( maxpoint <thispoint ) {
				maxpoint = thispoint;
				maxname = weight.title;
			}
			if ( minpoint > thispoint - weightone * 2 ) {
				minpoint = thispoint - weightone * 2;
				minname = weight.title;
			}
			point += thispoint;
		}
		retall[i][0] = point / (pointfull==0 ? 1 :pointfull) * 100;
		retall[i][1] = maxname;
		retall[i][2] = minname;
	}
	return retall;
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
	}
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
D6.getNextQues = function()
{
	nowQuesID++;
	nowQuesCode =  quesOrder[nowQuesID];
		return this.getQues(nowQuesCode);
};

//getPrevQues() --------------------------------------------
//		return previous question data, for smartphone
D6.getPrevQues = function()
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
D6.getQues = function( id ){
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
	if ( nowQuesID+1 > quesOrder.length ) {
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
 * 								2016/11/23 divided from js
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
D6.getMeasureDetail= function( mesid ) {
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


//get Measures data
// consName
// maxPrice		not show over than this price
// notSelected 	1:only not select
D6.getMeasure = function( consName, maxPrice, notSelected )
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
D6.getDemandGraph  = function ( ){
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
D6.getInputDemandSumup = function() {
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
D6.getInputDemandLog = function() {
	var ret = [];
	for ( var t=0 ; t<24 ; t++ ){
		ret[t] = this.createComboBox( "i056" + (t+1), true );
	}
	return ret;
};
	

﻿/*  2017/12/16  version 1.0
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
 

D6.scenario =
{
	//list of scenario
	defCons : [],
	defMeasures : [],
	defEquipment : [],
	defEquipmentSize : [],
	defInput : [],
	defSelectValue : [],
	defSelectData : [],

	//series of questions 
	defQuesOrder : [],

	// getLogicList() -------------------------------------------
	//		construct consumption class and set to logicList[]
	// return
	//		logicList[]
	getLogicList : function() {
		var logicList = new Array();
		
		// in case of create new consumption class, write here to use in D6
		// in some case, the order is important
		logicList["consTotal"] = 	D6.consTotal;
		logicList["consEnergy"] = 	D6.consEnergy;
		logicList["consSeason"] = 	D6.consSeason;
		logicList["consHWsum"] = 	D6.consHWsum;
		logicList["consHWshower"] = D6.consHWshower;
		logicList["consHWtub"] = 	D6.consHWtub;
		logicList["consHWdresser"] = D6.consHWdresser;
		logicList["consHWdishwash"] = D6.consHWdishwash;
		logicList["consHWtoilet"] = D6.consHWtoilet;
		logicList["consCOsum"] = 	D6.consCOsum;
		logicList["consACcool"] = 	D6.consACcool;
		logicList["consHTsum"] = 	D6.consHTsum;
		logicList["consHTcold"] = 	D6.consHTcold;
		logicList["consACheat"] = 	D6.consACheat;
		logicList["consAC"] = 		D6.consAC;
		logicList["consRFsum"] = 	D6.consRFsum;
		logicList["consRF"] = 		D6.consRF;
		logicList["consLIsum"] = 	D6.consLIsum;
		logicList['consLI'] = 		D6.consLI;
		logicList["consTVsum"] = 	D6.consTVsum;
		logicList["consTV"] = 		D6.consTV;
		logicList["consDRsum"] = 	D6.consDRsum;
		logicList["consCRsum"] = 	D6.consCRsum;
		logicList["consCR"] = 		D6.consCR;
		logicList["consCRtrip"] = 	D6.consCRtrip;
		logicList["consCKpot"] = 	D6.consCKpot;
		logicList["consCKcook"] = 	D6.consCKcook;
		logicList["consCKrice"] = 	D6.consCKrice;
		logicList["consCKsum"] = 	D6.consCKsum;

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
	setDefs : function() {
		var defMeasures = [];
		var defInput = [];
		var defSelectValue = [];
		var defSelectData = [];
		var defQuesOrder = [];
		var defEquipment = [];
		var defEquipmentSize = [];

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

			// copy and paste from EXCEL sheet under
			
		defMeasures['mTOsolar'] = { mid:"1",  name:"mTOsolar",  title:"太陽光発電を設置する",  easyness:"0.5",  refCons:"consTotal",  titleShort:"太陽光発電", level:"",  figNum:"25",  lifeTime:"20",  price:"400000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mTOhems'] = { mid:"2",  name:"mTOhems",  title:"HEMS装置を設置する",  easyness:"1",  refCons:"consTotal",  titleShort:"HEMS装置", level:"",  figNum:"3",  lifeTime:"20",  price:"200000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mTOsolarSmall'] = { mid:"3",  name:"mTOsolarSmall",  title:"ベランダに太陽光パネルを置く",  easyness:"2",  refCons:"consTotal",  titleShort:"ベランダ太陽光", level:"",  figNum:"25",  lifeTime:"10",  price:"50000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWecocute'] = { mid:"101",  name:"mHWecocute",  title:"給湯器をエコキュートに買い換える",  easyness:"2",  refCons:"consHWsum",  titleShort:"エコキュート", level:"",  figNum:"8",  lifeTime:"10",  price:"400000",  roanShow:"1",  standardType:"電気温水器",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWecojoze'] = { mid:"102",  name:"mHWecojoze",  title:"給湯器をエコジョーズ（潜熱回収型）に買い換える",  easyness:"2",  refCons:"consHWsum",  titleShort:"エコジョーズ", level:"",  figNum:"10",  lifeTime:"10",  price:"200000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWecofeel'] = { mid:"103",  name:"mHWecofeel",  title:"給湯器をエコフィール（潜熱回収型）に買い換える",  easyness:"1",  refCons:"consHWsum",  titleShort:"エコフィール", level:"",  figNum:"10",  lifeTime:"10",  price:"250000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWenefarm'] = { mid:"105",  name:"mHWenefarm",  title:"給湯器をエネファーム（燃料電池）に買い換える",  easyness:"0.5",  refCons:"consHWsum",  titleShort:"エネファーム", level:"5",  figNum:"10",  lifeTime:"10",  price:"1200000",  roanShow:"1",  standardType:"エコジョーズ",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWsolarHeater'] = { mid:"106",  name:"mHWsolarHeater",  title:"太陽熱温水器（自然循環式）を設置して利用する",  easyness:"1",  refCons:"consHWsum",  titleShort:"太陽熱温水器", level:"",  figNum:"9",  lifeTime:"10",  price:"400000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWsolarSystem'] = { mid:"107",  name:"mHWsolarSystem",  title:"ソーラーシステム（強制循環式）を設置して利用する",  easyness:"1",  refCons:"consHWsum",  titleShort:"ソーラーシステム", level:"",  figNum:"9",  lifeTime:"10",  price:"600000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWshowerHead'] = { mid:"108",  name:"mHWshowerHead",  title:"節水シャワーヘッドを取り付けて利用する",  easyness:"5",  refCons:"consHWshower",  titleShort:"節水シャワーヘッド", level:"",  figNum:"11",  lifeTime:"10",  price:"2000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWshowerTime'] = { mid:"109",  name:"mHWshowerTime",  title:"シャワーの利用を1人1日1分短くする",  easyness:"4",  refCons:"consHWshower",  titleShort:"シャワー1人1分短縮", level:"",  figNum:"11",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWshowerTime30'] = { mid:"110",  name:"mHWshowerTime30",  title:"シャワーの利用時間を3割短くする",  easyness:"3",  refCons:"consHWshower",  titleShort:"シャワー3割短縮", level:"",  figNum:"11",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWkeep'] = { mid:"111",  name:"mHWkeep",  title:"風呂に家族が続けて入り追い焚きをしない",  easyness:"3",  refCons:"consHWtub",  titleShort:"風呂の保温をしない", level:"",  figNum:"12",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWsaveMode'] = { mid:"112",  name:"mHWsaveMode",  title:"エコキュートを「節約モード」に設定する",  easyness:"3",  refCons:"consHWsum",  titleShort:"給湯節約モード", level:"",  figNum:"8",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWstopAutoKeep'] = { mid:"113",  name:"mHWstopAutoKeep",  title:"自動保温を続けるのでなく、次の人が入る直前に沸かし直す",  easyness:"3",  refCons:"consHWtub",  titleShort:"自動保温をしない", level:"",  figNum:"12",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWinsulation'] = { mid:"114",  name:"mHWinsulation",  title:"断熱型の浴槽にリフォームする",  easyness:"1",  refCons:"consHWtub",  titleShort:"断熱浴槽", level:"",  figNum:"12",  lifeTime:"10",  price:"600000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWonlyShower'] = { mid:"115",  name:"mHWonlyShower",  title:"夏場はシャワーだけですませて浴槽にお湯を張らない",  easyness:"3",  refCons:"consHWtub",  titleShort:"夏に浴槽のお湯をためない", level:"",  figNum:"11",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWdishTank'] = { mid:"116",  name:"mHWdishTank",  title:"食器洗いでお湯を流しっぱなしにしない",  easyness:"2",  refCons:"consHWdishwash",  titleShort:"食器流し洗い", level:"",  figNum:"13",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWdishWater'] = { mid:"117",  name:"mHWdishWater",  title:"水が冷たくない時期には水で食器を洗う",  easyness:"2",  refCons:"consHWdishwash",  titleShort:"食器水洗い", level:"",  figNum:"13",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCKdishWasher'] = { mid:"118",  name:"mCKdishWasher",  title:"食器洗い乾燥機を使う",  easyness:"2",  refCons:"consHWdishwash",  titleShort:"食器洗浄機", level:"",  figNum:"15",  lifeTime:"10",  price:"80000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWtap'] = { mid:"119",  name:"mHWtap",  title:"台所・洗面所に節湯水栓を設置する",  easyness:"2",  refCons:"consHWsum",  titleShort:"節湯水栓", level:"",  figNum:"13",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWreplaceToilet5'] = { mid:"120",  name:"mHWreplaceToilet5",  title:"節水トイレを設置する",  easyness:"1",  refCons:"consHWtoilet",  titleShort:"節水トイレ", level:"",  figNum:"19",  lifeTime:"10",  price:"30000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWreplaceToilet'] = { mid:"121",  name:"mHWreplaceToilet",  title:"瞬間式の温水洗浄便座に買い替える",  easyness:"1",  refCons:"consHWtoilet",  titleShort:"瞬間式便座", level:"",  figNum:"19",  lifeTime:"10",  price:"30000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHWtemplatureToilet'] = { mid:"122",  name:"mHWtemplatureToilet",  title:"保温便座の温度設定を下げる",  easyness:"3",  refCons:"consHWtoilet",  titleShort:"便座温度調節", level:"",  figNum:"19",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHWcoverTilet'] = { mid:"123",  name:"mHWcoverTilet",  title:"保温洗浄便座のふたをしめる",  easyness:"3",  refCons:"consHWtoilet",  titleShort:"便座のふたを閉める", level:"",  figNum:"19",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mACreplace'] = { mid:"201",  name:"mACreplace",  title:"エアコンを省エネ型に買い替える",  easyness:"1",  refCons:"consAC",  titleShort:"省エネエアコン", level:"",  figNum:"1",  lifeTime:"10",  price:"160000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mACreplaceHeat'] = { mid:"202",  name:"mACreplaceHeat",  title:"エアコンを省エネ型に買い替え、エアコンで暖房する",  easyness:"2",  refCons:"consAC",  titleShort:"省エネエアコン＋暖房", level:"",  figNum:"1",  lifeTime:"10",  price:"160000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mACchangeHeat'] = { mid:"203",  name:"mACchangeHeat",  title:"暖房をエアコンでする",  easyness:"2",  refCons:"consACheat",  titleShort:"エアコン暖房", level:"",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTchangeHeat'] = { mid:"204",  name:"mHTchangeHeat",  title:"家の暖房をエアコンでする",  easyness:"1",  refCons:"consHTsum",  titleShort:"エアコン暖房", level:"",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCOsunCut'] = { mid:"205",  name:"mCOsunCut",  title:"冷房で、すだれ等を使い日射をカットする",  easyness:"4",  refCons:"consCOsum",  titleShort:"冷房日射カット", level:"",  figNum:"1",  lifeTime:"5",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCOtemplature'] = { mid:"206",  name:"mCOtemplature",  title:"冷房の温度設定を控えめ（28℃）にする",  easyness:"3",  refCons:"consACcool",  titleShort:"冷房設定温度", level:"",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTtemplature'] = { mid:"207",  name:"mHTtemplature",  title:"厚着をして暖房の温度設定を控えめ（20℃）にする",  easyness:"3",  refCons:"consACheat",  titleShort:"暖房設定温度", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTwindowSheet'] = { mid:"208",  name:"mHTwindowSheet",  title:"暖房時に、窓用の断熱シートを貼る",  easyness:"3",  refCons:"consACheat",  titleShort:"窓断熱シート", level:"",  figNum:"4",  lifeTime:"3",  price:"3000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTdouble'] = { mid:"209",  name:"mHTdouble",  title:"窓・サッシを複層ガラスにする",  easyness:"1",  refCons:"consACheat",  titleShort:"複層ガラス", level:"5",  figNum:"4",  lifeTime:"30",  price:"100000",  roanShow:"",  standardType:"",  subsidy :"家の窓全体の断熱工事をする場合、工事にかかった費用に応じて、固定資産税の控除や、ローン残高に応じた所得税控除の制度があります。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTlowe'] = { mid:"210",  name:"mHTlowe",  title:"窓・サッシを樹脂枠low-Eガラスにする",  easyness:"1",  refCons:"consACheat",  titleShort:"樹脂枠low-Eガラス", level:"",  figNum:"4",  lifeTime:"30",  price:"150000",  roanShow:"",  standardType:"",  subsidy :"家の窓全体の断熱工事をする場合、工事にかかった費用に応じて、固定資産税の控除や、ローン残高に応じた所得税控除の制度があります。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTuchimado'] = { mid:"211",  name:"mHTuchimado",  title:"内窓をとりつける",  easyness:"2",  refCons:"consACheat",  titleShort:"内窓", level:"5",  figNum:"4",  lifeTime:"30",  price:"60000",  roanShow:"",  standardType:"",  subsidy :"家の窓全体の断熱工事をする場合、工事にかかった費用に応じて、固定資産税の控除や、ローン残高に応じた所得税控除の制度があります。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTdoubleGlassAll'] = { mid:"212",  name:"mHTdoubleGlassAll",  title:"全ての部屋の窓ガラスを複層ガラスに置き換える",  easyness:"1",  refCons:"consHTsum",  titleShort:"全居室を複層ガラスに", level:"",  figNum:"4",  lifeTime:"30",  price:"100000",  roanShow:"",  standardType:"",  subsidy :"家の窓全体の断熱工事をする場合、工事にかかった費用に応じて、固定資産税の控除や、ローン残高に応じた所得税控除の制度があります。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTuchimadoAll'] = { mid:"213",  name:"mHTuchimadoAll",  title:"全ての部屋に内窓をとりつける",  easyness:"1",  refCons:"consHTsum",  titleShort:"全居室を内窓に", level:"",  figNum:"4",  lifeTime:"30",  price:"100000",  roanShow:"",  standardType:"",  subsidy :"家の窓全体の断熱工事をする場合、工事にかかった費用に応じて、固定資産税の控除や、ローン残高に応じた所得税控除の制度があります。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTloweAll'] = { mid:"214",  name:"mHTloweAll",  title:"全ての部屋の窓・サッシを樹脂枠low-Eガラスにする",  easyness:"1",  refCons:"consHTsum",  titleShort:"全居室を樹脂枠low-Eガラスに", level:"",  figNum:"4",  lifeTime:"30",  price:"150000",  roanShow:"",  standardType:"",  subsidy :"家の窓全体の断熱工事をする場合、工事にかかった費用に応じて、固定資産税の控除や、ローン残高に応じた所得税控除の制度があります。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mACfilter'] = { mid:"215",  name:"mACfilter",  title:"エアコンのフィルターを掃除する",  easyness:"2",  refCons:"consACheat",  titleShort:"フィルター掃除", level:"5",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTtime'] = { mid:"216",  name:"mHTtime",  title:"暖房の使用時間を1時間短くする",  easyness:"3",  refCons:"consACheat",  titleShort:"暖房1時間短縮", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTpartialHeating'] = { mid:"217",  name:"mHTpartialHeating",  title:"こたつやホットカーペットを活用して、部屋暖房を控える",  easyness:"2",  refCons:"consACheat",  titleShort:"こたつ・ホットカーペット", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTceiling'] = { mid:"218",  name:"mHTceiling",  title:"暖房時に天井の暖気をかきまぜる",  easyness:"2",  refCons:"consACheat",  titleShort:"サーキュレータ", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTareaLimit'] = { mid:"219",  name:"mHTareaLimit",  title:"暖房時に部屋のドアやふすまを閉め、暖房範囲を小さくする",  easyness:"2",  refCons:"consACheat",  titleShort:"暖房範囲", level:"5",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTdanran'] = { mid:"220",  name:"mHTdanran",  title:"家族だんらんで一部屋で過ごすようにする",  easyness:"3",  refCons:"consHTsum",  titleShort:"家族だんらん", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTbiomass'] = { mid:"221",  name:"mHTbiomass",  title:"薪ストーブ（ペレットストーブ）を導入する",  easyness:"1",  refCons:"consACheat",  titleShort:"薪・ペレットストーブ", level:"",  figNum:"3",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mHTcentralNotUse'] = { mid:"222",  name:"mHTcentralNotUse",  title:"セントラルヒーティングで使っていない部屋の設定温度を下げる",  easyness:"2",  refCons:"consHTsum",  titleShort:"未使用部屋の暖房温度", level:"5",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mHTkanki'] = { mid:"223",  name:"mHTkanki",  title:"全熱交換換気装置を設置する",  easyness:"1",  refCons:"consHTsum",  titleShort:"全熱交換換気", level:"",  figNum:"3",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mPTstopPot'] = { mid:"301",  name:"mPTstopPot",  title:"電気ポットで保温をしない",  easyness:"2",  refCons:"consCKpot",  titleShort:"ポット保温しない", level:"",  figNum:"17",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mPTstopPotNight'] = { mid:"302",  name:"mPTstopPotNight",  title:"外出時や夜間に電気ポットの保温を止める",  easyness:"3",  refCons:"consCKpot",  titleShort:"夜間保温停止", level:"",  figNum:"17",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mPTstopRiceCooker'] = { mid:"303",  name:"mPTstopRiceCooker",  title:"炊飯ジャーの保温をやめる",  easyness:"3",  refCons:"consCKrice",  titleShort:"ジャー保温", level:"",  figNum:"18",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mPTreplacePot'] = { mid:"304",  name:"mPTreplacePot",  title:"省エネタイプの電気ポットに買い替える",  easyness:"2",  refCons:"consCKpot",  titleShort:"省エネ電気ポット", level:"",  figNum:"17",  lifeTime:"",  price:"",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mCKflame'] = { mid:"305",  name:"mCKflame",  title:"鍋から炎がはみ出さないようにする",  easyness:"2",  refCons:"consCKcook",  titleShort:"調理炎調整", level:"",  figNum:"14",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mDRsolar'] = { mid:"401",  name:"mDRsolar",  title:"晴れた日は衣類乾燥機や乾燥機能を使わずに天日乾燥させる",  easyness:"2",  refCons:"consDRsum",  titleShort:"天日干し", level:"",  figNum:"16",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mDRheatPump'] = { mid:"402",  name:"mDRheatPump",  title:"ヒートポンプ式の衣類乾燥ができる洗濯機に買い替える",  easyness:"1",  refCons:"consDRsum",  titleShort:"ヒートポンプ乾燥", level:"",  figNum:"16",  lifeTime:"10",  price:"140000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mLIceilingLED'] = { mid:"501",  name:"mLIceilingLED",  title:"蛍光灯器具をLEDシーリングライトに付け替える",  easyness:"4",  refCons:"consLI",  titleShort:"LEDライト", level:"",  figNum:"6",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"蛍光灯",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mLILED'] = { mid:"502",  name:"mLILED",  title:"LEDに付け替える",  easyness:"2",  refCons:"consLI",  titleShort:"LED電球", level:"",  figNum:"5",  lifeTime:"40000h",  price:"2000",  roanShow:"",  standardType:"電球",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mLIsensor'] = { mid:"503",  name:"mLIsensor",  title:"人感センサー式に付け替える",  easyness:"2",  refCons:"consLI",  titleShort:"センサー照明", level:"",  figNum:"5",  lifeTime:"10",  price:"",  roanShow:"",  standardType:"電球",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mLItime'] = { mid:"504",  name:"mLItime",  title:"照明を使う時間を1時間短くする",  easyness:"3",  refCons:"consLI",  titleShort:"照明短縮", level:"",  figNum:"6",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mLIoff'] = { mid:"505",  name:"mLIoff",  title:"部屋を出るときに照明を消す",  easyness:"4",  refCons:"consLI",  titleShort:"照明消灯", level:"",  figNum:"6",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mTVreplace'] = { mid:"601",  name:"mTVreplace",  title:"省エネ性能の高いテレビに買い替える",  easyness:"2",  refCons:"consTV",  titleShort:"省エネテレビ購入", level:"",  figNum:"7",  lifeTime:"10",  price:"40000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mTVradio'] = { mid:"602",  name:"mTVradio",  title:"テレビの時間の半分をラジオにする",  easyness:"1",  refCons:"consTVsum",  titleShort:"ラジオ", level:"",  figNum:"7",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mTVtime'] = { mid:"603",  name:"mTVtime",  title:"テレビを点ける時間を1日1時間短くする",  easyness:"3",  refCons:"consTV",  titleShort:"テレビ短縮", level:"",  figNum:"7",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mTVbright'] = { mid:"604",  name:"mTVbright",  title:"テレビの画面を明るすぎないよう調整する",  easyness:"2",  refCons:"consTV",  titleShort:"テレビ明るさ調節", level:"",  figNum:"7",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mRFreplace'] = { mid:"701",  name:"mRFreplace",  title:"冷蔵庫を省エネ型に買い替える",  easyness:"2",  refCons:"consRF",  titleShort:"省エネ冷蔵庫", level:"",  figNum:"2",  lifeTime:"10",  price:"150000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mRFstop'] = { mid:"702",  name:"mRFstop",  title:"冷蔵庫のうち１台を止める",  easyness:"2",  refCons:"consRF",  titleShort:"冷蔵庫停止", level:"",  figNum:"2",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mRFwall'] = { mid:"703",  name:"mRFwall",  title:"冷蔵庫を壁から離す",  easyness:"4",  refCons:"consRF",  titleShort:"冷蔵庫位置", level:"",  figNum:"2",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mRFtemplature'] = { mid:"704",  name:"mRFtemplature",  title:"冷蔵庫の温度設定を控えめにする",  easyness:"4",  refCons:"consRF",  titleShort:"冷蔵温度", level:"",  figNum:"2",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCRreplace'] = { mid:"801",  name:"mCRreplace",  title:"エコカーに買い替える",  easyness:"2",  refCons:"consCR",  titleShort:"車買い替え", level:"",  figNum:"21",  lifeTime:"8",  price:"1800000",  roanShow:"",  standardType:"普及型",  subsidy :"エコカーの導入にあたっては、「減税」のメリットが得られます。",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mCRreplaceElec'] = { mid:"802",  name:"mCRreplaceElec",  title:"電気自動車を導入する",  easyness:"1",  refCons:"consCR",  titleShort:"電気自動車", level:"",  figNum:"21",  lifeTime:"7",  price:"3000000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
		defMeasures['mCRecoDrive'] = { mid:"803",  name:"mCRecoDrive",  title:"アイドリングストップなどエコドライブに心がける",  easyness:"3",  refCons:"consCRsum",  titleShort:"エコドライブ", level:"",  figNum:"21",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCRtrain'] = { mid:"804",  name:"mCRtrain",  title:"鉄道やバスなど公共交通機関を利用する",  easyness:"2",  refCons:"consCRtrip",  titleShort:"公共交通", level:"",  figNum:"22",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCR20percent'] = { mid:"805",  name:"mCR20percent",  title:"車の利用を2割止める",  easyness:"1",  refCons:"consCRtrip",  titleShort:"車の利用2割減", level:"",  figNum:"22",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mCRwalk'] = { mid:"806",  name:"mCRwalk",  title:"近くの場合には車でなく、自転車や徒歩で行く",  easyness:"2",  refCons:"consCRtrip",  titleShort:"自転車や徒歩", level:"",  figNum:"22",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};
		defMeasures['mPTstopPlug'] = { mid:"901",  name:"mPTstopPlug",  title:"コンセントからプラグを抜き、待機電力を減らす",  easyness:"3",  refCons:"consTotal",  titleShort:"待機電力", level:"",  figNum:"20",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"1",   season:"wss"};

		

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
		
			// copy and paste from EXCEL sheet under

		defInput["i010"] = {  cons:"consTotal",  title:"対策として重視する視点",  unit:"",  text:"どんな対策を優先的に表示しますか", inputType:"sel010", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel010"]= [ "選んで下さい", "CO2削減優先", "光熱費削減優先", "取り組みやすさ考慮", "取り組みやすさ優先", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel010']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i001"] = {  cons:"consTotal",  title:"家族人数",  unit:"人",  text:"あなたを含めて、いっしょに住んでいる人数を選んで下さい。", inputType:"sel001", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"2",d12t:"2",d12p:"1",d13t:"1",d13p:"0",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel001"]= [ "選んで下さい", "1人", "2人", "3人", "4人", "5人", "6人", "7人", "8人", "9人以上", "", "", "", "", "", "" ];			defSelectData['sel001']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', '', '', '', '', '' ];
		defInput["i002"] = {  cons:"consTotal",  title:"集合戸建て",  unit:"",  text:"お住いは、戸建てですか、集合住宅ですか", inputType:"sel002", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"2",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel002"]= [ "選んで下さい", "戸建て", "集合", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel002']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i003"] = {  cons:"consTotal",  title:"家の広さ",  unit:"m2",  text:"家の延べ床面積で、いちばん近い数値を選んで下さい。", inputType:"sel003", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"150",d11p:"0",d12t:"100",d12p:"1",d13t:"0",d13p:"2",d1w:"3",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel003"]= [ "選んで下さい", "15m2", "30m2", "50m2", "70m2", "100m2", "120m2", "150m2", "200m2以上", "", "", "", "", "", "", "" ];			defSelectData['sel003']= [ '-1', '15', '30', '50', '70', '100', '120', '150', '220', '', '', '', '', '', '', '' ];
		defInput["i004"] = {  cons:"consTotal",  title:"家の所有",  unit:"",  text:"持ち家ですか、賃貸ですか", inputType:"sel004", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel004"]= [ "選んで下さい", "持ち家", "賃貸", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel004']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i005"] = {  cons:"consTotal",  title:"階数",  unit:"",  text:"何階建てですか、集合住宅の場合何階ですか", inputType:"sel005", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel005"]= [ "選んで下さい", "平屋建て", "2階建て", "3階以上", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel005']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i006"] = {  cons:"consTotal",  title:"天井が屋根面（最上階）か",  unit:"",  text:"天井が屋根面（最上階）ですか", inputType:"sel006", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel006"]= [ "選んで下さい", "最上階（上は屋根）", "最上階でない（上に部屋がある）", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel006']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i007"] = {  cons:"consTotal",  title:"屋根の日当たり",  unit:"",  text:"屋根の日当たりはいいですか", inputType:"sel007", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"3",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel007"]= [ "選んで下さい", "とてもよい", "よい", "ときどき陰る", "よくない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel007']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i008"] = {  cons:"consTotal",  title:"居室数",  unit:"部屋",  text:"居室数", inputType:"sel008", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"8",d11p:"0",d12t:"5",d12p:"1",d13t:"1",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel008"]= [ "選んで下さい", "1部屋", "2部屋", "3部屋", "4部屋", "5部屋", "6部屋", "7部屋", "8部屋以上", "", "", "", "", "", "", "" ];			defSelectData['sel008']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ];
		defInput["i009"] = {  cons:"consTotal",  title:"築年数",  unit:"年",  text:"建築年代", inputType:"sel009", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel009"]= [ "選んで下さい", "5年未満", "5-10年未満", "10-20年未満", "20年以上", "わからない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel009']= [ '-1', '3', '7', '13', '30', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i021"] = {  cons:"consTotal",  title:"都道府県",  unit:"",  text:"お住まいの都道府県を選んで下さい。", inputType:"sel021", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i022"] = {  cons:"consTotal",  title:"詳細地域",  unit:"",  text:"都道府県内の気候が違う場合の地域", inputType:"sel022", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i023"] = {  cons:"consTotal",  title:"都市部か郊外か",  unit:"",  text:"お住いは公共交通の便はいい地域ですか", inputType:"sel023", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel023"]= [ "選んで下さい", "便利", "どちらかと言えば便利", "どちらかといえば不便", "不便", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel023']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i041"] = {  cons:"consTotal",  title:"窓の断熱性能",  unit:"",  text:"窓の断熱性能", inputType:"sel041", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"5",d21p:"0",d22t:"4",d22p:"1",d23t:"0",d23p:"2",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel041"]= [ "選んで下さい", "樹脂枠三重ガラス", "樹脂枠low-Eガラス", "樹脂アルミ複合/樹脂枠二重ガラス", "アルミ枠二重ガラス", "アルミ枠単板ガラス", "わからない", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel041']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i042"] = {  cons:"consTotal",  title:"壁面の断熱材の厚さ",  unit:"",  text:"断熱材の厚さはどの程度ですか", inputType:"sel042", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"100",d11p:"2",d12t:"50",d12p:"1",d13t:"",d13p:"",d1w:"2",d1d:"1", d21t:"100",d21p:"2",d22t:"50",d22p:"1",d23t:"",d23p:"",d2w:"3",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel042"]= [ "選んで下さい", "グラスウール200mm相当", "グラスウール150mm相当", "グラスウール100mm相当", "グラスウール50mm相当", "グラスウール30mm相当", "入っていない", "わからない", "", "", "", "", "", "", "", "" ];			defSelectData['sel042']= [ '-1', '200', '150', '100', '50', '30', '10', '-1', '', '', '', '', '', '', '', '' ];
		defInput["i043"] = {  cons:"consTotal",  title:"窓の断熱リフォーム",  unit:"",  text:"窓の断熱リフォームをしましかたか", inputType:"sel043", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"1",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel043"]= [ "選んで下さい", "全面的にした", "一部した", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel043']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i044"] = {  cons:"consTotal",  title:"壁天井断熱リフォーム",  unit:"",  text:"壁・天井・床などの断熱リフォームをしましたか", inputType:"sel044", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"1",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel044"]= [ "選んで下さい", "全面的にした", "一部した", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel044']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i051"] = {  cons:"consEnergy",  title:"太陽光の設置",  unit:"",  text:"太陽光発電装置を設置していますか", inputType:"sel051", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"1",d11p:"2",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"4",d1d:"0", d21t:"1",d21p:"2",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"4",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel051"]= [ "選んで下さい", "していない", "している", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel051']= [ '-1', '0', '1', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i052"] = {  cons:"consEnergy",  title:"太陽光のサイズ",  unit:"kW",  text:"設置している太陽光発電装置のサイズを選んで下さい。", inputType:"sel052", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"5",d11p:"2",d12t:"2",d12p:"1",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"5",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel052"]= [ "選んで下さい", "していない", "している（～3kW）", "している（4kW)", "している（5kW)", "している（6～10kW)", "している（10kW以上）", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel052']= [ '-1', '0', '3', '4', '5', '8', '11', '', '', '', '', '', '', '', '', '' ];
		defInput["i053"] = {  cons:"consEnergy",  title:"太陽光発電の設置年",  unit:"",  text:"太陽光発電を設置した年はいつですか", inputType:"sel053", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel053"]= [ "選んで下さい", "2010年度以前", "2011-2012年度", "2013年度", "2014年度", "2015年度", "2016年度", "2017年度以降", "設置していない", "", "", "", "", "", "", "" ];			defSelectData['sel053']= [ '-1', '2010', '2011', '2013', '2014', '2015', '2016', '2017', '9999', '', '', '', '', '', '', '' ];
		defInput["i054"] = {  cons:"consEnergy",  title:"灯油を使っていますか",  unit:"",  text:"灯油を使っていますか", inputType:"sel054", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel054"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel054']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i061"] = {  cons:"consEnergy",  title:"電気代",  unit:"円",  text:"1ヶ月のおおよその電気代を選んでください。", inputType:"sel061", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"15000",d11p:"0",d12t:"10000",d12p:"1",d13t:"0",d13p:"2",d1w:"3",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel061"]= [ "選んで下さい", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "", "" ];			defSelectData['sel061']= [ '-1', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '', '' ];
		defInput["i062"] = {  cons:"consEnergy",  title:"売電金額",  unit:"円",  text:"太陽光発電で1ヶ月あたりどのくらい電気を売ることができますか。", inputType:"sel062", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel062"]= [ "選んで下さい", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "", "" ];			defSelectData['sel062']= [ '-1', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '', '' ];
		defInput["i063"] = {  cons:"consEnergy",  title:"ガス代",  unit:"円",  text:"1ヶ月のおおよそのガス代を選んで下さい。", inputType:"sel063", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel063"]= [ "選んで下さい", "オール電化（使わない）", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "" ];			defSelectData['sel063']= [ '-1', '0', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '' ];
		defInput["i064"] = {  cons:"consEnergy",  title:"灯油購入量",  unit:"円",  text:"1ヶ月あたりのおおよその灯油使用量を選んでください。", inputType:"sel064", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel064"]= [ "選んで下さい", "使わない", "2ヶ月で1缶（9L)", "月1缶（18L)", "月2缶（36L)", "月3缶（54L)", "週1缶（72L)", "5日で1缶（108L)", "週2缶（144L)", "週3缶（216L)", "それ以上", "", "", "", "", "" ];			defSelectData['sel064']= [ '-1', '0', '900', '1800', '3600', '5400', '7200', '10800', '14400', '21600', '30000', '', '', '', '', '' ];
		defInput["i065"] = {  cons:"consEnergy",  title:"練炭購入量",  unit:"円",  text:"1ヶ月あたりのおおよその練炭購入量を選んでください。", inputType:"sel065", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel065"]= [ "選んで下さい", "使わない", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "" ];			defSelectData['sel065']= [ '-1', '0', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '' ];
		defInput["i066"] = {  cons:"consEnergy",  title:"地域熱供給",  unit:"円",  text:"暖房用の地域熱供給はありますか", inputType:"sel066", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel066"]= [ "選んで下さい", "使わない", "使っている", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel066']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i072"] = {  cons:"consEnergy",  title:"ホームタンクの容量",  unit:"",  text:"ホームタンクが設置されている場合はその容量を選んでください", inputType:"sel072", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel072"]= [ "選んで下さい", "100L", "200L", "300L", "400L", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel072']= [ '-1', '100', '200', '300', '400', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i073"] = {  cons:"consEnergy",  title:"灯油ホームタンク回数",  unit:"",  text:"灯油のホームタンクに年間に入れる回数を選んでください", inputType:"sel073", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel073"]= [ "選んで下さい", "年3回以下", "年4-6回", "年7-10回", "年11-15回", "年16-20回", "年21回以上", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel073']= [ '-1', '3', '5', '8', '12', '18', '24', '', '', '', '', '', '', '', '', '' ];
		defInput["i074"] = {  cons:"consEnergy",  title:"上下水道代",  unit:"円",  text:"1ヶ月あたりのおおよその上下水道代を選んでください。", inputType:"sel074", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel074"]= [ "選んで下さい", "500円", "1000円", "1500円", "2000円", "3000円", "4000円", "5000円", "7000円", "1万円", "1万5000円", "それ以上", "", "", "", "" ];			defSelectData['sel074']= [ '-1', '500', '1000', '1500', '2000', '3000', '4000', '5000', '7000', '10000', '15000', '20000', '', '', '', '' ];
		defInput["i075"] = {  cons:"consEnergy",  title:"車燃料代",  unit:"円",  text:"おおよその1ヶ月のガソリン代（軽油代）を選んで下さい。家族全員分になります。", inputType:"sel075", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel075"]= [ "選んで下さい", "使わない", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "" ];			defSelectData['sel075']= [ '-1', '0', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '' ];
		defInput["i081"] = {  cons:"consEnergy",  title:"電力会社",  unit:"",  text:"電力会社を選んでください", inputType:"sel081", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel081"]= [ "選んで下さい", "北海道電力", "東北電力", "東京電力", "中部電力", "北陸電力", "関西電力", "中部電力", "四国電力", "九州電力", "沖縄電力", "そのほか", "", "", "", "" ];			defSelectData['sel081']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '', '', '', '' ];
		defInput["i082"] = {  cons:"consEnergy",  title:"電気契約",  unit:"",  text:"電気の契約種類を選んでください", inputType:"sel082", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel082"]= [ "選んで下さい", "通常の家庭用（従量）", "時間帯別契約", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel082']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i083"] = {  cons:"consEnergy",  title:"ガス種類",  unit:"",  text:"ガスの種類を選んでください", inputType:"sel083", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel083"]= [ "選んで下さい", "都市ガス", "LPガス", "ガスを使わない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel083']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i091"] = {  cons:"consSeason",  title:"電気代",  unit:"円",  text:"1ヶ月のおおよその電気代を選んでください。", inputType:"sel091", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel091"]= [ "選んで下さい", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "", "" ];			defSelectData['sel091']= [ '-1', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '', '' ];
		defInput["i092"] = {  cons:"consSeason",  title:"売電金額",  unit:"円",  text:"太陽光発電で1ヶ月あたりどのくらい電気を売ることができますか。", inputType:"sel092", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel092"]= [ "選んで下さい", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "", "" ];			defSelectData['sel092']= [ '-1', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '', '' ];
		defInput["i093"] = {  cons:"consSeason",  title:"ガス代",  unit:"円",  text:"1ヶ月のおおよそのガス代を選んで下さい。", inputType:"sel093", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel093"]= [ "選んで下さい", "オール電化（使わない）", "1000円", "2000円", "3000円", "5000円", "7000円", "1万円", "1万2000円", "1万5000円", "2万円", "3万円", "それ以上", "", "", "" ];			defSelectData['sel093']= [ '-1', '0', '1000', '2000', '3000', '5000', '7000', '10000', '12000', '15000', '20000', '30000', '40000', '', '', '' ];
		defInput["i094"] = {  cons:"consSeason",  title:"灯油購入量",  unit:"円",  text:"1ヶ月あたりのおおよその灯油使用量を選んでください。", inputType:"sel094", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel094"]= [ "選んで下さい", "使わない", "2ヶ月で1缶（9L)", "月1缶（18L)", "月2缶（36L)", "月3缶（54L)", "週1缶（72L)", "5日で1缶（108L)", "週2缶（144L)", "週3缶（216L)", "それ以上", "", "", "", "", "" ];			defSelectData['sel094']= [ '-1', '0', '900', '1800', '3600', '5400', '7200', '10800', '14400', '21600', '30000', '', '', '', '', '' ];
		defInput["i101"] = {  cons:"consHWsum",  title:"給湯器の種類",  unit:"",  text:"お風呂のお湯を沸かす給湯器は、どんな機器ですか。", inputType:"sel101", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"6",d21p:"2",d22t:"3",d22p:"0",d23t:"2",d23p:"1",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel101"]= [ "選んで下さい", "ガス給湯器", "エコジョーズ（ガス潜熱回収型）", "灯油給湯器", "エコフィール（灯油潜熱回収型）", "電気温水器", "エコキュート（電気）", "エコウィル（コジェネ）", "エネファーム（燃料電池）", "薪", "", "", "", "", "", "" ];			defSelectData['sel101']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', '', '', '', '', '' ];
		defInput["i102"] = {  cons:"consHWsum",  title:"太陽熱温水器",  unit:"",  text:"太陽熱温水器を利用していますか", inputType:"sel102", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"1",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"3",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"3",d31p:"0",d32t:"1",d32p:"2",d33t:"",d33p:"",d3w:"2",d3d:"0"}; 			defSelectValue["sel102"]= [ "選んで下さい", "利用している", "時々利用している", "利用していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel102']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i103"] = {  cons:"consHWtub",  title:"風呂沸かし日数（夏以外）",  unit:"日/週",  text:"お風呂を沸かすのは、1週間に何日くらいですか。", inputType:"sel103", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"5",d31p:"0",d32t:"2",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			defSelectValue["sel103"]= [ "選んで下さい", "お湯をためない", "週1日", "週2日", "2日に1回程度", "週5～6日", "毎日", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel103']= [ '-1', '0', '1', '2', '3.5', '5.5', '7', '', '', '', '', '', '', '', '', '' ];
		defInput["i104"] = {  cons:"consHWtub",  title:"風呂沸かし日数（夏）",  unit:"日/週",  text:"夏場にお風呂を沸かすのは、1週間に何日くらいですか。", inputType:"sel104", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"5",d31p:"0",d32t:"2",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			defSelectValue["sel104"]= [ "選んで下さい", "お湯をためない", "週1日", "週2日", "2日に1回程度", "週5～6日", "毎日", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel104']= [ '-1', '0', '1', '2', '3.5', '5.5', '7', '', '', '', '', '', '', '', '', '' ];
		defInput["i105"] = {  cons:"consHWshower",  title:"シャワー時間(夏以外）",  unit:"分/日",  text:"家族全員でシャワーを使う時間は、1日何分くらいですか。平均的には1人5分程度です。", inputType:"sel105", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"40",d11p:"0",d12t:"20",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"40",d31p:"0",d32t:"20",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			defSelectValue["sel105"]= [ "選んで下さい", "使わない", "5分", "10分", "15分", "20分", "30分", "40分", "60分", "90分", "120分", "", "", "", "", "" ];			defSelectData['sel105']= [ '-1', '0', '5', '10', '15', '20', '30', '40', '60', '90', '120', '', '', '', '', '' ];
		defInput["i106"] = {  cons:"consHWshower",  title:"シャワー時間(夏）",  unit:"分/日",  text:"夏場に家族全員でシャワーを使う時間は、1日何分くらいですか。", inputType:"sel106", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"40",d11p:"0",d12t:"20",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"40",d31p:"0",d32t:"20",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			defSelectValue["sel106"]= [ "選んで下さい", "使わない", "5分", "10分", "15分", "20分", "30分", "40分", "60分", "90分", "120分", "", "", "", "", "" ];			defSelectData['sel106']= [ '-1', '0', '5', '10', '15', '20', '30', '40', '60', '90', '120', '', '', '', '', '' ];
		defInput["i107"] = {  cons:"consHWtub",  title:"お湯はりの高さ",  unit:"",  text:"お湯はりの高さ", inputType:"sel107", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"8",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"2",d3d:"0"}; 			defSelectValue["sel107"]= [ "選んで下さい", "肩までつかる程度", "半身浴", "お湯をはらない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel107']= [ '-1', '8', '4', '0', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i108"] = {  cons:"consHWtub",  title:"浴槽の保温時間",  unit:"時間",  text:"風呂の保温を1日何時間していますか", inputType:"sel108", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"4",d32p:"1",d33t:"0",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel108"]= [ "選んで下さい", "していない", "3時間", "6時間", "10時間", "16時間", "24時間", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel108']= [ '-1', '0', '3', '6', '10', '16', '24', '', '', '', '', '', '', '', '', '' ];
		defInput["i109"] = {  cons:"consHWtub",  title:"身体を洗うときのお湯は",  unit:"",  text:"浴槽にためてあるときは浴槽のお湯を使いますか", inputType:"sel109", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel109"]= [ "選んで下さい", "浴槽のお湯を使う", "半々くらい", "シャワーを使う", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel109']= [ '-1', '10', '5', '2', '0', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i110"] = {  cons:"consHWtub",  title:"風呂の追い焚き方法",  unit:"割",  text:"追い焚きはどのようにしていますか", inputType:"sel110", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"0"}; 			defSelectValue["sel110"]= [ "選んで下さい", "常に自動で追い焚きをしている", "必要に応じて追い焚きをする", "必要に応じて注ぎ湯をする", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel110']= [ '-1', '10', '5', '5', '0', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i111"] = {  cons:"consHWtub",  title:"風呂のお湯が少なくなったとき",  unit:"割",  text:"浴槽のお湯が少なくなったときにどうしますか", inputType:"sel111", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel111"]= [ "選んで下さい", "常に自動でたし湯される", "必要に応じて注ぎ湯をする", "少ないままで入る", "その時どきで対応する", "わからない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel111']= [ '-1', '10', '5', '0', '5', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i112"] = {  cons:"consHWshower",  title:"シャワーのお湯が出るまで",  unit:"秒",  text:"最初にお湯が出てくるまでの時間はどのくらいですか", inputType:"sel112", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"20",d21p:"0",d22t:"10",d22p:"1",d23t:"0",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel112"]= [ "選んで下さい", "すぐにお湯が出る", "5秒くらい待つ", "10秒くらい待つ", "20秒くらいまつ", "1分弱待つ", "わからない", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel112']= [ '-1', '3', '5', '10', '20', '50', '20', '', '', '', '', '', '', '', '', '' ];
		defInput["i113"] = {  cons:"consHWdishwash",  title:"食器洗いでのお湯の利用",  unit:"",  text:"食器洗いで、お湯を使わずに水を使うようにしていますか", inputType:"sel113", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel113"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel113']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i114"] = {  cons:"consHWdresser",  title:"洗面でのお湯使用期間",  unit:"ヶ月",  text:"洗面でのお湯使用期間", inputType:"sel114", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"5",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"0"}; 			defSelectValue["sel114"]= [ "選んで下さい", "お湯を使わない", "2ヶ月", "4ヶ月", "6ヶ月", "8ヶ月", "10ヶ月", "12ヶ月", "", "", "", "", "", "", "", "" ];			defSelectData['sel114']= [ '-1', '0', '2', '4', '6', '8', '10', '12', '', '', '', '', '', '', '', '' ];
		defInput["i115"] = {  cons:"consHWdishwash",  title:"食器洗いでのお湯使用期間",  unit:"ヶ月",  text:"食器洗いでのお湯使用期間", inputType:"sel115", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel115"]= [ "選んで下さい", "お湯を使わない", "食器洗い機使用", "2ヶ月", "4ヶ月", "6ヶ月", "8ヶ月", "10ヶ月", "12ヶ月", "", "", "", "", "", "", "" ];			defSelectData['sel115']= [ '-1', '0', '99', '2', '4', '6', '8', '10', '12', '', '', '', '', '', '', '' ];
		defInput["i116"] = {  cons:"consHWshower",  title:"節水シャワーヘッド",  unit:"",  text:"節水シャワーヘッドを使っていますか", inputType:"sel116", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"2",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel116"]= [ "選んで下さい", "使っている", "使っていない", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel116']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i117"] = {  cons:"consHWtub",  title:"浴槽・ユニットバス",  unit:"",  text:"ユニットバスですか。また浴槽は断熱型ですか", inputType:"sel117", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"0",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel117"]= [ "選んで下さい", "断熱浴槽のユニットバス", "ユニットバス", "ユニットバスでない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel117']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i131"] = {  cons:"consHWtoilet",  title:"便座の保温",  unit:"",  text:"便座の保温をしていますか", inputType:"sel131", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"2",d32t:"2",d32p:"1",d33t:"1",d33p:"0",d3w:"1",d3d:"0"}; 			defSelectValue["sel131"]= [ "選んで下さい", "通年している", "夏以外している", "冬のみしている", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel131']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i132"] = {  cons:"consHWtoilet",  title:"便座の温度設定",  unit:"",  text:"便座の温度設定はどうしていますか", inputType:"sel132", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"0",d32t:"3",d32p:"1",d33t:"2",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel132"]= [ "選んで下さい", "高め", "ふつう", "低め", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel132']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i133"] = {  cons:"consHWtoilet",  title:"瞬間式保温便座",  unit:"",  text:"瞬間式の保温便座ですか", inputType:"sel133", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel133"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel133']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i134"] = {  cons:"consHWtoilet",  title:"便座のふたを閉める",  unit:"",  text:"使用後に便座のふたを閉めていますか", inputType:"sel134", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"2",d31p:"0",d32t:"1",d32p:"2",d33t:"",d33p:"1",d3w:"1",d3d:""}; 			defSelectValue["sel134"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel134']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i201"] = {  cons:"consHTsum",  title:"暖房する範囲",  unit:"",  text:"よく暖房をする範囲は、家全体のどのくらいになりますか。", inputType:"sel201", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"1",d11p:"0",d12t:"0.5",d12p:"1",d13t:"0",d13p:"2",d1w:"1",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel201"]= [ "選んで下さい", "家全体", "家の半分くらい", "家の一部", "1部屋のみ", "部屋の暖房をしない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel201']= [ '-1', '1', '0.5', '0.25', '0.1', '0.02', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i202"] = {  cons:"consHTsum",  title:"主に使う暖房器具",  unit:"",  text:"部屋を暖めるために最もよく使う暖房器具のエネルギー源は何ですか。床暖房の場合は熱源で選んでください。", inputType:"sel202", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"6",d11p:"0",d12t:"5",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"6",d21p:"0",d22t:"5",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"5",d31p:"2",d32t:"2",d32p:"0",d33t:"1",d33p:"1",d3w:"2",d3d:"0"}; 			defSelectValue["sel202"]= [ "選んで下さい", "エアコン", "電気熱暖房", "ガス", "灯油", "薪・ペレットストーブ", "こたつやホットカーペットのみ", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel202']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i203"] = {  cons:"consHTsum",  title:"補助的に使う暖房器具",  unit:"",  text:"補助的に使う暖房器具", inputType:"sel203", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel203"]= [ "選んで下さい", "エアコン", "電気熱暖房", "ガス", "灯油", "薪・ペレットストーブ", "こたつやホットカーペットのみ", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel203']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
		defInput["i204"] = {  cons:"consHTsum",  title:"暖房時間",  unit:"時間",  text:"冬に暖房は1日に何時間くらい使いますか。", inputType:"sel204", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"24",d11p:"0",d12t:"0",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel204"]= [ "選んで下さい", "使わない", "1時間", "2時間", "3時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "" ];			defSelectData['sel204']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
		defInput["i205"] = {  cons:"consHTsum",  title:"暖房設定温度",  unit:"℃",  text:"暖房をするときには何℃に設定しますか。設定できない場合はおよそ何℃になっていますか。", inputType:"sel205", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"23",d11p:"0",d12t:"21",d12p:"1",d13t:"0",d13p:"2",d1w:"3",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"23",d31p:"0",d32t:"21",d32p:"1",d33t:"0",d33p:"2",d3w:"3",d3d:"0"}; 			defSelectValue["sel205"]= [ "選んで下さい", "使わない", "18℃", "19℃", "20℃", "21℃", "22℃", "23℃", "24℃", "25℃", "26℃以上", "", "", "", "", "" ];			defSelectData['sel205']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
		defInput["i206"] = {  cons:"consHTsum",  title:"暖房する期間",  unit:"ヶ月",  text:"暖房する期間", inputType:"sel206", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel206"]= [ "選んで下さい", "暖房をしない", "1ヶ月", "2ヶ月", "3ヶ月", "4ヶ月", "5ヶ月", "6ヶ月", "8ヶ月", "10ヶ月", "", "", "", "", "", "" ];			defSelectData['sel206']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', '', '', '', '', '', '' ];
		defInput["i211"] = {  cons:"consACheat",  title:"部屋の名前",  unit:"",  text:"部屋の名前", inputType:"", right:"", postfix:"", nodata:"", varType:"String", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i212"] = {  cons:"consACheat",  title:"部屋の広さ",  unit:"m2",  text:"冷暖房する部屋の広さを答えてください。吹き抜けがある場合には、その分を2倍してください。", inputType:"sel212", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel212"]= [ "選んで下さい", "4畳半", "6畳", "8畳", "10畳", "12畳", "15畳", "20畳", "25畳", "30畳", "40畳", "", "", "", "", "" ];			defSelectData['sel212']= [ '-1', '7.3', '10', '13', '16', '19.5', '24', '33', '41', '49', '65', '', '', '', '', '' ];
		defInput["i213"] = {  cons:"consACheat",  title:"窓ガラスの大きさ",  unit:"m2",  text:"サッシや窓のガラスの大きさを、その部屋の合計として答えてください。", inputType:"sel213", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel213"]= [ "選んで下さい", "小窓（90×120）", "腰窓（120×180）", "2枚掃き出し窓（180×180）", "4枚掃き出し窓（180×360）", "掃き出し6枚相当（180×540）", "掃き出し8枚相当（180×720）", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel213']= [ '-1', '1.1', '2.2', '3.3', '6.5', '9.7', '13', '', '', '', '', '', '', '', '', '' ];
		defInput["i214"] = {  cons:"consACheat",  title:"窓ガラスの種類",  unit:"w/m2K",  text:"窓ガラスの種類", inputType:"sel214", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"4",d21p:"2",d22t:"3",d22p:"1",d23t:"",d23p:"",d2w:"1",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel214"]= [ "選んで下さい", "1枚ガラス", "アルミ複層ガラス", "アルミ以外枠複層ガラス", "二重窓", "low-e複層ガラス", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel214']= [ '-1', '6', '3.5', '2.5', '2.5', '1.5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i215"] = {  cons:"consACcool",  title:"エアコンの使用年数",  unit:"年",  text:"エアコンの使用年数", inputType:"sel215", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel215"]= [ "選んで下さい", "持っていない", "1年未満", "3年未満", "5年未満", "7年未満", "10年未満", "15年未満", "20年未満", "20年以上", "", "", "", "", "", "" ];			defSelectData['sel215']= [ '-1', '0', '1', '2', '4', '6', '9', '13', '18', '25', '', '', '', '', '', '' ];
		defInput["i216"] = {  cons:"consACcool",  title:"エアコン性能",  unit:"",  text:"エアコンを購入したときには、省エネ型を選びましたか", inputType:"sel216", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"0",d12t:"1",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"2",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel216"]= [ "選んで下さい", "はい", "いいえ", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel216']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i217"] = {  cons:"consACcool",  title:"エアコンのフィルター掃除",  unit:"",  text:"エアコンのフィルター掃除をしていますか", inputType:"sel217", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"2",d31p:"0",d32t:"1",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"0"}; 			defSelectValue["sel217"]= [ "選んで下さい", "している", "していない", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel217']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i231"] = {  cons:"consACheat",  title:"主に使う暖房器具",  unit:"",  text:"部屋を暖めるために最もよく使う暖房器具のエネルギー源は何ですか。床暖房の場合は熱源で選んでください。", inputType:"sel231", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel231"]= [ "選んで下さい", "エアコン", "電気熱暖房", "ガス", "灯油", "薪・ペレットストーブ", "こたつやホットカーペットのみ", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel231']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i232"] = {  cons:"consACheat",  title:"補助的に使う暖房器具",  unit:"",  text:"補助的に使う暖房器具", inputType:"sel232", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel232"]= [ "選んで下さい", "エアコン", "電気熱暖房", "ガス", "灯油", "薪・ペレットストーブ", "こたつやホットカーペットのみ", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel232']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
		defInput["i233"] = {  cons:"consACheat",  title:"暖房時間",  unit:"時間",  text:"冬に暖房は1日に何時間くらい使いますか。", inputType:"sel233", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel233"]= [ "選んで下さい", "使わない", "1時間", "2時間", "3時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "" ];			defSelectData['sel233']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
		defInput["i234"] = {  cons:"consACheat",  title:"暖房設定温度",  unit:"℃",  text:"暖房をするときには何℃に設定しますか。設定できない場合はおよそ何℃になっていますか。", inputType:"sel234", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel234"]= [ "選んで下さい", "使わない", "18℃", "19℃", "20℃", "21℃", "22℃", "23℃", "24℃", "25℃", "26℃以上", "", "", "", "", "" ];			defSelectData['sel234']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
		defInput["i235"] = {  cons:"consACheat",  title:"暖房する期間",  unit:"ヶ月",  text:"暖房する期間", inputType:"sel235", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel235"]= [ "選んで下さい", "暖房をしない", "1ヶ月", "2ヶ月", "3ヶ月", "4ヶ月", "5ヶ月", "6ヶ月", "8ヶ月", "10ヶ月", "", "", "", "", "", "" ];			defSelectData['sel235']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', '', '', '', '', '', '' ];
		defInput["i236"] = {  cons:"consACheat",  title:"加湿器の使用期間",  unit:"ヶ月",  text:"加湿器の使用期間", inputType:"sel236", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel236"]= [ "選んで下さい", "加湿をしない", "1ヶ月", "2ヶ月", "3ヶ月", "4ヶ月", "5ヶ月", "6ヶ月", "", "", "", "", "", "", "", "" ];			defSelectData['sel236']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '' ];
		defInput["i237"] = {  cons:"consACheat",  title:"断熱シートの設置",  unit:"",  text:"冬場の厚手のカーテン・断熱シートの設置", inputType:"sel237", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel237"]= [ "選んで下さい", "している", "していない", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel237']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i238"] = {  cons:"consACheat",  title:"部屋を戸で締め切れますか",  unit:"",  text:"部屋を戸で締め切れますか", inputType:"sel238", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel238"]= [ "選んで下さい", "できる", "できない", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel238']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i239"] = {  cons:"consACheat",  title:"吹き抜け",  unit:"",  text:"吹き抜けもしくは、部屋から階段で上階に上がれますか", inputType:"sel239", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel239"]= [ "選んで下さい", "ある", "ない", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel239']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i240"] = {  cons:"consACheat",  title:"部屋のしきりによる暖房面積の削減",  unit:"",  text:"部屋のしきりによる暖房面積の削減", inputType:"sel240", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel240"]= [ "選んで下さい", "できない", "2割減", "3～4割減", "半減", "6～7割減", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel240']= [ '-1', '0', '2', '3', '5', '7', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i241"] = {  cons:"consACheat",  title:"電気ストーブの使用時間",  unit:"",  text:"電気ストーブ・オイルヒータの使用時間", inputType:"sel241", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel241"]= [ "選んで下さい", "使わない", "1時間", "2時間", "3時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "" ];			defSelectData['sel241']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
		defInput["i242"] = {  cons:"consACheat",  title:"部屋の寒さ",  unit:"",  text:"その部屋は暖房は効きますか", inputType:"sel242", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel242"]= [ "選んで下さい", "暖房すると寒さは感じない", "やや寒い", "なかなか暖まらない", "暖房しても寒い", "暖房はしない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel242']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i243"] = {  cons:"consHTsum",  title:"窓の結露の有無",  unit:"",  text:"窓の結露はありますか", inputType:"sel243", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel243"]= [ "選んで下さい", "よく結露する", "少し結露する", "ほとんど結露しない", "結露しない", "わからない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel243']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i244"] = {  cons:"consHTsum",  title:"押入れなどの壁面の結露",  unit:"",  text:"押入れなどの壁面の結露はありますか", inputType:"sel244", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel244"]= [ "選んで下さい", "よく結露する", "少し結露する", "ほとんど結露しない", "結露しない", "わからない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel244']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i245"] = {  cons:"consHTsum",  title:"朝方寒さを感じること",  unit:"ヶ月",  text:"最も実感できる寒さを選んで下さい", inputType:"sel245", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel245"]= [ "選んで下さい", "寒さで朝起きるのがつらい", "手足が冷たい", "窓に霜がつく", "部屋で息が白く曇る", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel245']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i246"] = {  cons:"consHTsum",  title:"朝方の寒さが始まる時期",  unit:"",  text:"朝方の寒さはいつからですか", inputType:"sel246", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel246"]= [ "選んで下さい", "10月上旬", "10月下旬", "11月上旬", "11月下旬", "12月上旬", "12月下旬", "1月上旬", "1月下旬", "", "", "", "", "", "", "" ];			defSelectData['sel246']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ];
		defInput["i247"] = {  cons:"consHTsum",  title:"朝方の寒さが終わる時期",  unit:"",  text:"朝方の寒さはいつまでですか", inputType:"sel247", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel247"]= [ "選んで下さい", "2月上旬", "2月下旬", "3月上旬", "3月下旬", "4月上旬", "4月下旬", "5月上旬", "5月下旬", "", "", "", "", "", "", "" ];			defSelectData['sel247']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ];
		defInput["i248"] = {  cons:"consHTsum",  title:"厚着の工夫",  unit:"",  text:"暖房をつけるまえにまず厚着をするよう心がけていますか", inputType:"sel248", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"1"}; 			defSelectValue["sel248"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel248']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i249"] = {  cons:"consHTsum",  title:"不在部屋の暖房",  unit:"",  text:"人がいない部屋を暖房しないようにしていますか", inputType:"sel249", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"4",d11p:"2",d12t:"3",d12p:"1",d13t:"",d13p:"",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"2",d32t:"3",d32p:"1",d33t:"",d33p:"",d3w:"2",d3d:"1"}; 			defSelectValue["sel249"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel249']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i261"] = {  cons:"consCOsum",  title:"冷房時間",  unit:"時間",  text:"夏に冷房は1日に何時間くらい使いますか。", inputType:"sel261", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"24",d31p:"0",d32t:"8",d32p:"1",d33t:"",d33p:"",d3w:"1",d3d:"1"}; 			defSelectValue["sel261"]= [ "選んで下さい", "使わない", "1時間", "2時間", "3時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "" ];			defSelectData['sel261']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
		defInput["i262"] = {  cons:"consCOsum",  title:"冷房時間帯",  unit:"",  text:"主にいつの時間帯に冷房を使いますか", inputType:"sel262", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel262"]= [ "選んで下さい", "使わない", "朝", "昼", "夕方", "夜", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel262']= [ '-1', '0', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i263"] = {  cons:"consCOsum",  title:"冷房設定温度",  unit:"℃",  text:"冷房をするときには何℃に設定しますか。", inputType:"sel263", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"28",d11p:"2",d12t:"25",d12p:"1",d13t:"",d13p:"",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"28",d31p:"2",d32t:"25",d32p:"1",d33t:"",d33p:"",d3w:"1",d3d:"1"}; 			defSelectValue["sel263"]= [ "選んで下さい", "24℃以下", "25℃", "26℃", "27℃", "28℃", "29℃", "30℃", "使わない", "", "", "", "", "", "", "" ];			defSelectData['sel263']= [ '-1', '24', '25', '26', '27', '28', '29', '30', '0', '', '', '', '', '', '', '' ];
		defInput["i264"] = {  cons:"consCOsum",  title:"冷房する期間（除湿含む）",  unit:"ヶ月",  text:"冷房する期間（除湿含む）", inputType:"sel264", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel264"]= [ "選んで下さい", "冷房をしない", "1ヶ月", "2ヶ月", "3ヶ月", "4ヶ月", "5ヶ月", "6ヶ月", "", "", "", "", "", "", "", "" ];			defSelectData['sel264']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '' ];
		defInput["i265"] = {  cons:"consCOsum",  title:"部屋の暑さ",  unit:"",  text:"その部屋は暑いですか", inputType:"sel265", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel265"]= [ "選んで下さい", "冷房すると暑さは感じない", "やや暑い", "なかなか涼しくならなお", "冷房しても暑い", "冷房はしない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel265']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i266"] = {  cons:"consCOsum",  title:"日射流入の有無",  unit:"",  text:"夏の朝や夕方に日光が部屋に入りますか", inputType:"sel266", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel266"]= [ "選んで下さい", "よく入る", "少しはいる", "入らない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel266']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i267"] = {  cons:"consCOsum",  title:"日射カット",  unit:"",  text:"西日や朝日が入ると部屋が暑くなります。日射が入らないように工夫していますか", inputType:"sel267", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"4",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"1"}; 			defSelectValue["sel267"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel267']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i268"] = {  cons:"consCOsum",  title:"扇風機利用",  unit:"",  text:"扇風機を活用するなどしてエアコンをなるべく使わないようにしていますか", inputType:"sel268", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"1"}; 			defSelectValue["sel268"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel268']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i271"] = {  cons:"consACcool",  title:"冷房時間",  unit:"時間",  text:"夏に冷房は1日に何時間くらい使いますか。", inputType:"sel271", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"4",d32p:"1",d33t:"0",d33p:"2",d3w:"1",d3d:"1"}; 			defSelectValue["sel271"]= [ "選んで下さい", "使わない", "1時間", "2時間", "3時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "" ];			defSelectData['sel271']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
		defInput["i272"] = {  cons:"consACcool",  title:"冷房時間帯",  unit:"",  text:"主にいつの時間帯に冷房を使いますか", inputType:"sel272", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel272"]= [ "選んで下さい", "使わない", "朝", "昼", "夕方", "夜", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel272']= [ '-1', '0', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i273"] = {  cons:"consACcool",  title:"冷房設定温度",  unit:"℃",  text:"冷房をするときには何℃に設定しますか。", inputType:"sel273", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel273"]= [ "選んで下さい", "24℃以下", "25℃", "26℃", "27℃", "28℃", "29℃", "30℃", "使わない", "", "", "", "", "", "", "" ];			defSelectData['sel273']= [ '-1', '24', '25', '26', '27', '28', '29', '30', '0', '', '', '', '', '', '', '' ];
		defInput["i274"] = {  cons:"consACcool",  title:"冷房する期間（除湿含む）",  unit:"ヶ月",  text:"冷房する期間（除湿含む）", inputType:"sel274", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel274"]= [ "選んで下さい", "冷房をしない", "1ヶ月", "2ヶ月", "3ヶ月", "4ヶ月", "5ヶ月", "6ヶ月", "", "", "", "", "", "", "", "" ];			defSelectData['sel274']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '' ];
		defInput["i275"] = {  cons:"consACcool",  title:"部屋の暑さ",  unit:"",  text:"その部屋は暑いですか", inputType:"sel275", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel275"]= [ "選んで下さい", "冷房すると暑さは感じない", "やや暑い", "なかなか涼しくならなお", "冷房しても暑い", "冷房はしない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel275']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i276"] = {  cons:"consACcool",  title:"日射流入の有無",  unit:"",  text:"夏の朝や夕方に日光が部屋に入りますか", inputType:"sel276", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel276"]= [ "選んで下さい", "よく入る", "少しはいる", "入らない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel276']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i277"] = {  cons:"consACcool",  title:"日射カット",  unit:"",  text:"西日や朝日が入ると部屋が暑くなります。日射が入らないように工夫していますか", inputType:"sel277", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel277"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel277']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i278"] = {  cons:"consACcool",  title:"扇風機利用",  unit:"",  text:"扇風機を活用するなどしてエアコンをなるべく使わないようにしていますか", inputType:"sel278", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel278"]= [ "選んで下さい", "常にしている", "だいたいしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel278']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i281"] = {  cons:"consHTcold",  title:"セントラルヒーティング",  unit:"",  text:"セントラルヒーティングですか", inputType:"sel281", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel281"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel281']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i282"] = {  cons:"consHTcold",  title:"セントラル熱源",  unit:"",  text:"セントラルヒーティングの熱源は", inputType:"sel282", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel282"]= [ "選んで下さい", "灯油", "電気", "電気（ヒートポンプ）", "ガス", "ハイブリッド（ヒートポンプ＋ガス）", "地域熱供給", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel282']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i283"] = {  cons:"consHTcold",  title:"セントラル専用熱源",  unit:"",  text:"セントラルの熱源機と風呂の熱源は別ですか", inputType:"sel283", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel283"]= [ "選んで下さい", "セントラル専用", "風呂と共用", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel283']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i284"] = {  cons:"consHTcold",  title:"セントラル暖房期間",  unit:"",  text:"セントラル暖房を使う期間は", inputType:"sel284", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel284"]= [ "選んで下さい", "使わない", "1ヶ月", "2ヶ月", "3ヶ月", "4ヶ月", "5ヶ月", "6ヶ月", "8ヶ月", "", "", "", "", "", "", "" ];			defSelectData['sel284']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '', '', '', '', '', '', '' ];
		defInput["i285"] = {  cons:"consHTsum",  title:"熱交換換気",  unit:"",  text:"熱交換式の換気ですか", inputType:"sel285", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"0",d12t:"1",d12p:"2",d13t:"",d13p:"",d1w:"1",d1d:"0", d21t:"2",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel285"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel285']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i286"] = {  cons:"consHTcold",  title:"ロードヒーティング",  unit:"",  text:"ロードヒーティングを使っていますか", inputType:"sel286", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel286"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel286']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i287"] = {  cons:"consHTcold",  title:"ロードヒーティング熱源",  unit:"",  text:"ロードヒーティングの熱源", inputType:"sel287", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel287"]= [ "選んで下さい", "灯油", "電気", "電気（ヒートポンプ）", "ガス", "ハイブリッド（ヒートポンプ＋ガス）", "地域熱供給", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel287']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i288"] = {  cons:"consHTcold",  title:"ロードヒーティング面積",  unit:"",  text:"ロードヒーティング面積", inputType:"sel288", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel288"]= [ "選んで下さい", "1坪（3m2)", "2坪（7m2)", "3坪（10m2)", "5坪（15m2)", "10坪（30m2)", "15坪（50m2)", "20坪（65m2)", "30坪（100m2)", "", "", "", "", "", "", "" ];			defSelectData['sel288']= [ '-1', '3', '7', '10', '15', '30', '50', '65', '100', '', '', '', '', '', '', '' ];
		defInput["i289"] = {  cons:"consHTcold",  title:"ロードヒーティング利用頻度",  unit:"",  text:"ロードヒーティング利用頻度", inputType:"sel289", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel289"]= [ "選んで下さい", "年2-3日", "月に1日くらい", "月に2〜3日", "週に2〜3日", "センサーで常時ON", "センサーなしで常時ON", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel289']= [ '-1', '2', '6', '12', '30', '50', '100', '', '', '', '', '', '', '', '', '' ];
		defInput["i290"] = {  cons:"consHTcold",  title:"ルーフヒーティングの利用",  unit:"",  text:"ルーフヒーティングを使っていますか", inputType:"sel290", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel290"]= [ "選んで下さい", "はい", "いいえ", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel290']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i291"] = {  cons:"consHTcold",  title:"ルーフヒーティングの対象面積",  unit:"",  text:"ルーフヒーティングの対象面積", inputType:"sel291", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel291"]= [ "選んで下さい", ":樋のまわりのみ", "屋根面全体", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel291']= [ '-1', '10', '30', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i292"] = {  cons:"consHTcold",  title:"ルーフヒーティングの熱源",  unit:"",  text:"ルーフヒーティングの熱源", inputType:"sel292", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel292"]= [ "選んで下さい", "灯油", "電気", "電気（ヒートポンプ）", "ガス", "コジェネ（ガス）", "コジェネ（灯油）", "地域熱供給", "", "", "", "", "", "", "", "" ];			defSelectData['sel292']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i293"] = {  cons:"consHTcold",  title:"ルーフヒーティングの利用頻度",  unit:"",  text:"ルーフヒーティングを使う頻度は", inputType:"sel293", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel293"]= [ "選んで下さい", "年2-3日", "月に1日くらい", "月に2〜3日", "週に2〜3日", "センサーで常時ON", "センサーなしで常時ON", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel293']= [ '-1', '2', '6', '15', '30', '50', '100', '', '', '', '', '', '', '', '', '' ];
		defInput["i294"] = {  cons:"consHTcold",  title:"融雪槽の利用",  unit:"",  text:"融雪槽の利用", inputType:"sel294", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel294"]= [ "選んで下さい", "はい", "いいえ", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel294']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i295"] = {  cons:"consHTcold",  title:"融雪槽の熱源",  unit:"",  text:"融雪槽の熱源", inputType:"sel295", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel295"]= [ "選んで下さい", "灯油", "電気", "電気（ヒートポンプ）", "ガス", "コジェネ（ガス）", "コジェネ（灯油）", "地域熱供給", "", "", "", "", "", "", "", "" ];			defSelectData['sel295']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i401"] = {  cons:"consDRsum",  title:"衣類乾燥機の利用頻度",  unit:"",  text:"洗濯の乾燥機や乾燥機能を使っていますか。使っている場合にはどの程度使うのか選んで下さい。", inputType:"sel401", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"5",d11p:"0",d12t:"3",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel401"]= [ "選んで下さい", "使わない", "月1～3回", "週1～2回", "2日に1回", "毎日", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel401']= [ '-1', '5', '4', '3', '2', '1', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i402"] = {  cons:"consDRsum",  title:"乾燥機の種類",  unit:"",  text:"乾燥機の種類", inputType:"sel402", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel402"]= [ "選んで下さい", "電気(ヒートポンプ式）", "電気", "ガス", "わからない", "持っていない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel402']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i403"] = {  cons:"consDRsum",  title:"洗濯の頻度",  unit:"",  text:"洗濯機の使い方はどうですか", inputType:"sel403", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel403"]= [ "選んで下さい", "毎日何回も洗濯機を回す", "毎日2回程度洗濯機を回す", "毎日1回洗濯機を回す", "汚れ物がたまったら洗濯機を回す", "わからない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel403']= [ '-1', '4', '2', '1', '0.5', '1', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i411"] = {  cons:"consDRsum",  title:"掃除機の強弱",  unit:"",  text:"掃除機の強弱の設定はどうしていますか", inputType:"sel411", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel411"]= [ "選んで下さい", "ほとんど強で使っている", "場所により使い分けている", "基本、弱で使っている", "設定がない", "わからない", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel411']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i412"] = {  cons:"consDRsum",  title:"掃除機利用",  unit:"分/日",  text:"掃除機を１日にどの程度使いますか", inputType:"sel412", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel412"]= [ "選んで下さい", "ほとんど使わない", "5分", "10分", "15分", "30分", "1時間", "ロボット掃除機を使用", "わからない", "", "", "", "", "", "", "" ];			defSelectData['sel412']= [ '-1', '0', '5', '10', '15', '30', '60', '11', '12', '', '', '', '', '', '', '' ];
		defInput["i501"] = {  cons:"consLIsum",  title:"リビングの照明",  unit:"W",  text:"リビングの照明器具には、主に何を使っていますか。", inputType:"sel501", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"3",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"1",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel501"]= [ "選んで下さい", "白熱電球", "蛍光灯", "LED", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel501']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i502"] = {  cons:"consLIsum",  title:"不在部屋の照明",  unit:"",  text:"人がいない部屋の照明は消していますか", inputType:"sel502", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"2",d12t:"2",d12p:"1",d13t:"",d13p:"",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"2",d32t:"2",d32p:"1",d33t:"",d33p:"",d3w:"1",d3d:"1"}; 			defSelectValue["sel502"]= [ "選んで下さい", "全てつける", "つけっぱなしの場所もある", "ほとんど消している", "消している", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel502']= [ '-1', '10', '6', '2', '0', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i511"] = {  cons:"consLI",  title:"照明の場所",  unit:"",  text:"", inputType:"sel511", right:"1", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel511"]= [ "選んで下さい", "玄関", "門灯", "廊下", "トイレ", "脱衣所", "風呂", "居室", "", "", "", "", "", "", "", "" ];			defSelectData['sel511']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '', '', '', '', '' ];
		defInput["i512"] = {  cons:"consLI",  title:"照明の種類",  unit:"",  text:"", inputType:"sel512", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel512"]= [ "選んで下さい", "白熱電球", "電球形蛍光灯", "蛍光灯", "細管蛍光灯", "LED", "センサー式ライト", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel512']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
		defInput["i513"] = {  cons:"consLI",  title:"1球（本）の消費電力",  unit:"W",  text:"", inputType:"sel513", right:"1", postfix:"Number", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel513"]= [ "選んで下さい", "5W", "10W", "15W", "20W", "30W", "40W", "60W", "80W", "100W", "", "", "", "", "", "" ];			defSelectData['sel513']= [ '-1', '5', '10', '15', '20', '30', '40', '60', '80', '100', '', '', '', '', '', '' ];
		defInput["i514"] = {  cons:"consLI",  title:"球数・本数",  unit:"球・本",  text:"中に複数ある場合、何球・何本ありますか", inputType:"sel514", right:"1", postfix:"Number", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel514"]= [ "選んで下さい", "1球・本", "2球・本", "3球・本", "4球・本", "6球・本", "8球・本", "10球・本", "15球・本", "20球・本", "30球・本", "", "", "", "", "" ];			defSelectData['sel514']= [ '-1', '1', '2', '3', '4', '6', '8', '10', '15', '20', '30', '', '', '', '', '' ];
		defInput["i515"] = {  cons:"consLI",  title:"照明の使用時間",  unit:"時間/日",  text:"1日に何時間使いますか", inputType:"sel515", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel515"]= [ "選んで下さい", "使わない", "1時間", "2時間", "3時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "" ];			defSelectData['sel515']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
		defInput["i601"] = {  cons:"consTVsum",  title:"テレビの時間",  unit:"時間",  text:"家にある全てのテレビの合計で、１日に何時間点けていますか。テレビゲームの時間も含めて下さい。", inputType:"sel601", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel601"]= [ "選んで下さい", "使わない", "2時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "32時間", "40時間", "", "", "", "", "" ];			defSelectData['sel601']= [ '-1', '0', '2', '4', '6', '8', '12', '16', '24', '32', '40', '', '', '', '', '' ];
		defInput["i631"] = {  cons:"consTV",  title:"テレビのサイズ",  unit:"インチ",  text:"テレビのサイズ", inputType:"sel631", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel631"]= [ "選んで下さい", "持っていない", "20インチ未満", "20～30インチ", "30～40インチ", "40～50インチ", "50～65インチ", "65インチ以上", "", "", "", "", "", "", "", "" ];			defSelectData['sel631']= [ '-1', '0', '18', '25', '35', '45', '60', '70', '', '', '', '', '', '', '', '' ];
		defInput["i632"] = {  cons:"consTV",  title:"テレビの使用年数",  unit:"年",  text:"テレビの使用年数", inputType:"sel632", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel632"]= [ "選んで下さい", "持っていない", "1年未満", "3年未満", "5年未満", "7年未満", "10年未満", "15年未満", "20年未満", "20年以上", "", "", "", "", "", "" ];			defSelectData['sel632']= [ '-1', '0', '1', '2', '4', '6', '9', '13', '18', '25', '', '', '', '', '', '' ];
		defInput["i633"] = {  cons:"consTV",  title:"テレビの時間",  unit:"年",  text:"テレビの使用年数", inputType:"sel633", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel633"]= [ "選んで下さい", "使わない", "2時間", "4時間", "6時間", "8時間", "12時間", "16時間", "24時間", "", "", "", "", "", "", "" ];			defSelectData['sel633']= [ '-1', '0', '2', '4', '6', '8', '12', '16', '24', '', '', '', '', '', '', '' ];
		defInput["i701"] = {  cons:"consRFsum",  title:"冷蔵庫の台数",  unit:"台",  text:"冷蔵庫を何台使っていますか。ストッカー（冷凍庫）も1台と数えて下さい。", inputType:"sel701", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"0",d12t:"0",d12p:"2",d13t:"",d13p:"",d1w:"1",d1d:"2", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"2",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"2"}; 			defSelectValue["sel701"]= [ "選んで下さい", "持っていない", "1台", "2台", "3台", "4台", "5台", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel701']= [ '-1', '0', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '' ];
		defInput["i711"] = {  cons:"consRF",  title:"冷蔵庫の使用年数",  unit:"年",  text:"冷蔵庫の使用年数", inputType:"sel711", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel711"]= [ "選んで下さい", "持っていない", "1年未満", "3年未満", "5年未満", "7年未満", "10年未満", "15年未満", "20年未満", "20年以上", "", "", "", "", "", "" ];			defSelectData['sel711']= [ '-1', '0', '0', '2', '4', '6', '8', '12', '17', '25', '', '', '', '', '', '' ];
		defInput["i712"] = {  cons:"consRF",  title:"冷蔵庫の種類",  unit:"",  text:"冷蔵庫の種類", inputType:"sel712", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel712"]= [ "選んで下さい", "冷凍冷蔵庫", "冷凍庫（ストッカー）", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel712']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i713"] = {  cons:"consRF",  title:"定格内容量",  unit:"",  text:"定格内容量", inputType:"sel713", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel713"]= [ "選んで下さい", "100L未満", "101-200リットル", "201-300リットル", "301-400リットル", "401-500リットル", "501リットル以上", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel713']= [ '-1', '80', '150', '250', '350', '450', '550', '', '', '', '', '', '', '', '', '' ];
		defInput["i714"] = {  cons:"consRF",  title:"冷蔵庫温度設定",  unit:"",  text:"温度設定はどうしていますか", inputType:"sel714", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"1",d32t:"3",d32p:"2",d33t:"0",d33p:"1",d3w:"1",d3d:"1"}; 			defSelectValue["sel714"]= [ "選んで下さい", "強", "中", "弱", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel714']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i715"] = {  cons:"consRF",  title:"中身のつめすぎ",  unit:"",  text:"つめすぎないように心がけていますか", inputType:"sel715", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel715"]= [ "選んで下さい", "気をつけている", "あまりできていない", "できていない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel715']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i716"] = {  cons:"consRF",  title:"壁からすきまを開けた設置",  unit:"",  text:"側面・裏面に5cm程度のすきまをあけていますか", inputType:"sel716", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel716"]= [ "選んで下さい", "できている", "できていない", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel716']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i801"] = {  cons:"consCKcook",  title:"コンロの熱源",  unit:"",  text:"コンロの熱源は", inputType:"sel801", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel801"]= [ "選んで下さい", "ガス", "電気(IHなど）", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel801']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i802"] = {  cons:"consCKcook",  title:"調理の頻度",  unit:"割",  text:"調理の頻度", inputType:"sel802", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel802"]= [ "選んで下さい", "しない", "週１食以下", "週に2-3食", "1日1食", "1日2食", "1日3食", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel802']= [ '-1', '0', '1', '2', '4', '7', '10', '', '', '', '', '', '', '', '', '' ];
		defInput["i811"] = {  cons:"consCKrice",  title:"ジャーの保温",  unit:"",  text:"炊飯ジャーの保温をしていますか", inputType:"sel811", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel811"]= [ "選んで下さい", "していない", "6時間程度している", "12時間程度している", "ほぼ24時間している", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel811']= [ '-1', '0', '6', '12', '24', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i821"] = {  cons:"consCKpot",  title:"ポットの保温",  unit:"",  text:"ポットの保温をしていますか", inputType:"sel821", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10",d11p:"0",d12t:"4",d12p:"1",d13t:"0",d13p:"2",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"4",d32p:"1",d33t:"0",d33p:"2",d3w:"1",d3d:"1"}; 			defSelectValue["sel821"]= [ "選んで下さい", "していない", "6時間程度している", "12時間程度している", "ほぼ24時間している", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel821']= [ '-1', '0', '6', '12', '24', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i822"] = {  cons:"consCKpot",  title:"電気ポットの省エネ性",  unit:"",  text:"電気ポットは省エネタイプですか", inputType:"sel822", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel822"]= [ "選んで下さい", "はい", "いいえ", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel822']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i901"] = {  cons:"consCRsum",  title:"車の保有台数",  unit:"",  text:"車の保有台数", inputType:"sel901", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"4",d11p:"0",d12t:"2",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel901"]= [ "選んで下さい", "持っていない", "1台", "2台", "3台", "4台", "5台以上", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel901']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i902"] = {  cons:"consCRsum",  title:"スクータ・バイクの保有台数",  unit:"",  text:"スクータ・バイクの保有台数", inputType:"sel902", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel902"]= [ "選んで下さい", "持っていない", "1台", "2台", "3台", "4台", "5台以上", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel902']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i911"] = {  cons:"consCR",  title:"車の種類",  unit:"",  text:"車の種類", inputType:"sel911", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel911"]= [ "選んで下さい", "軽自動車", "小型車", "バン", "3ナンバー", "電気自動車", "バイク・スクータ", "大型バイク", "", "", "", "", "", "", "", "" ];			defSelectData['sel911']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '', '', '', '', '', '', '', '' ];
		defInput["i912"] = {  cons:"consCR",  title:"車の燃費",  unit:"",  text:"車の燃費", inputType:"sel912", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"30",d11p:"2",d12t:"15",d12p:"1",d13t:"",d13p:"",d1w:"2",d1d:"1", d21t:"30",d21p:"2",d22t:"15",d22p:"1",d23t:"",d23p:"",d2w:"2",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel912"]= [ "選んで下さい", "6km/L以下", "7-9km/L", "10-12km/L", "13-15km/L", "16-20km/L", "21-26km/L", "27-35km/L", "36km/L以上", "", "", "", "", "", "", "" ];			defSelectData['sel912']= [ '-1', '6', '8', '11', '14', '18', '23', '30', '40', '', '', '', '', '', '', '' ];
		defInput["i913"] = {  cons:"consCR",  title:"車の主な利用者",  unit:"",  text:"だれの車ですか。もしくは呼び方があれば記入してください。", inputType:"", right:"", postfix:"", nodata:"", varType:"String", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i914"] = {  cons:"consCR",  title:"エコタイヤの使用",  unit:"",  text:"エコタイヤを使っていますか", inputType:"sel914", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel914"]= [ "選んで下さい", "はい", "いいえ", "わからない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel914']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i921"] = {  cons:"consCRtrip",  title:"行き先",  unit:"",  text:"よく出かける行き先", inputType:"", right:"", postfix:"", nodata:"", varType:"String", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i922"] = {  cons:"consCRtrip",  title:"頻度",  unit:"",  text:"どの程度車で行きますか", inputType:"sel922", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel922"]= [ "選んで下さい", "毎日", "週5回", "週2～3回", "週1回", "月に2回", "月1回", "２ヶ月に1回", "年2-3回", "年1回", "", "", "", "", "", "" ];			defSelectData['sel922']= [ '-1', '365', '250', '120', '50', '25', '12', '6', '2', '1', '', '', '', '', '', '' ];
		defInput["i923"] = {  cons:"consCRtrip",  title:"片道距離",  unit:"km",  text:"片道距離", inputType:"sel923", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel923"]= [ "選んで下さい", "1km", "2km", "3km", "5km", "10km", "20km", "30km", "50km", "100km", "200km", "400km", "600km以上", "", "", "" ];			defSelectData['sel923']= [ '-1', '1', '2', '3', '5', '10', '20', '30', '50', '100', '200', '400', '700', '', '', '' ];
		defInput["i924"] = {  cons:"consCRtrip",  title:"使用する車",  unit:"",  text:"どの車を主に使いますか", inputType:"sel924", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel924"]= [ "選んで下さい", "1台目", "2台目", "3台目", "4台目", "5台目", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel924']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i931"] = {  cons:"consCRsum",  title:"アイドリングストップ",  unit:"",  text:"長時間の停車でアイドリングストップをしていますか", inputType:"sel931", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel931"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel931']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i932"] = {  cons:"consCRsum",  title:"急加速や急発進",  unit:"",  text:"急加速や急発進をしないようにしていますか", inputType:"sel932", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel932"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel932']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i933"] = {  cons:"consCRsum",  title:"加減速の少ない運転",  unit:"",  text:"加減速の少ない運転", inputType:"sel933", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel933"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel933']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i934"] = {  cons:"consCRsum",  title:"早めのアクセルオフ",  unit:"",  text:"早めのアクセルオフ", inputType:"sel934", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel934"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel934']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i935"] = {  cons:"consCRsum",  title:"道路交通情報の活用",  unit:"",  text:"道路交通情報の活用", inputType:"sel935", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel935"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel935']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i936"] = {  cons:"consCRsum",  title:" 不要な荷物を積まない",  unit:"",  text:" 不要な荷物は積まずに走行", inputType:"sel936", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel936"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel936']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i937"] = {  cons:"consCRsum",  title:"カーエアコンの温度調節",  unit:"",  text:"カーエアコンの温度・風量をこまめに調節していますか", inputType:"sel937", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel937"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel937']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i938"] = {  cons:"consCRsum",  title:"暖機運転せずに走行する",  unit:"",  text:"寒い日に暖機運転をしていますか", inputType:"sel938", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			defSelectValue["sel938"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel938']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i939"] = {  cons:"consCRsum",  title:"タイヤの空気圧のチェック",  unit:"",  text:"タイヤの空気圧を適切に保つよう心がけていますか", inputType:"sel939", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel939"]= [ "選んで下さい", "いつもしている", "時々している", "していない", "", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel939']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i221"] = {  cons:"consCOsum",  title:"エアコンの性能",  unit:"",  text:"エアコンの省エネ性能は良いですか（1級ですか）", inputType:"sel221", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel221"]= [ "選んで下さい", "とてもよい", "ふつう", "あまりよくない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel221']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i121"] = {  cons:"consHWsum",  title:"温水器の性能",  unit:"",  text:"温水器の省エネ性能は良いですか。（1級ですか）", inputType:"sel121", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel121"]= [ "選んで下さい", "とてもよい", "ふつう", "あまりよくない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel121']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i621"] = {  cons:"consTVsum",  title:"テレビの性能",  unit:"",  text:"テレビの省エネ性能は良いですか。（1級ですか）", inputType:"sel621", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel621"]= [ "選んで下さい", "とてもよい", "ふつう", "あまりよくない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel621']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i421"] = {  cons:"consDRsum",  title:"洗濯機の性能",  unit:"",  text:"洗濯機の省エネ性能は良いですか。（1級ですか）", inputType:"sel421", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel421"]= [ "選んで下さい", "とてもよい", "ふつう", "あまりよくない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel421']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		defInput["i721"] = {  cons:"consRFsum",  title:"冷蔵庫の性能",  unit:"",  text:"冷蔵庫の省エネ性能は良いですか。（1級ですか）", inputType:"sel721", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			defSelectValue["sel721"]= [ "選んで下さい", "とてもよい", "ふつう", "あまりよくない", "わからない", "", "", "", "", "", "", "", "", "", "", "" ];			defSelectData['sel721']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
		

		// prefecture definition ----------------------------------------------------
		defSelectValue['sel021'] = [ "選んで下さい", "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島", "茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川", "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜",  "静岡", "愛知", "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山", "鳥取", "島根", "岡山", "広島", "山口", "徳島", "香川", "愛媛", "高知", "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄" ];
		defSelectData['sel021']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47' ]; 
		defSelectValue['sel022'] = [ "選んで下さい", "北部", "南部"];
		defSelectData['sel022'] = [ "-1", "1", "2"];

		// input list which impact average 
		this.defCalcAverage = [ "i001", "i005", "i021"];

		// evaluation method of measures
		this.measuresSortChange = "i010";	// input code
		this.measuresSortTarget = [ 
			"co2ChangeOriginal",
			"co2ChangeOriginal",
			"costTotalChangeOriginal",
			"co2ChangeW1Original",
			"co2ChangeW2Original"
		];

		//additional question list definition. this can be changed by focus.js
		this.defEasyQues = [
			{	title:"簡易入力",
				cname:"easy01",
				ques: [
					'i021', 'i001', 'i002', 'i003', 'i051', 'i061', 'i063',
					'i064', 'i075', 'i101', 'i103', 'i105', 'i116', 'i201', 'i202',
					'i204', 'i205', 'i263', 'i501', 'i601', 'i701', 'i010'
				]
			},
			{	title:"行動チェック入力",
				cname:"action01",
				ques: [
					'i502', 'i501', 'i621', 'i601',
					'i205', 'i041', 'i237', 'i263', 
					'i061', 'i003', 'i001',
					'i105', 'i106', 'i116', 'i121',
					'i421', 'i721', 'i821'
				]
			}
		];
		
		
		//series of questions default
		this.defQuesOrder = [ 
			'i010',
			'i021',
			'i001',
			'i002',
			'i003',
			'i051',
			'i061',
			'i063',
			'i064',
			'i075',
			'i101',
			'i103',
			'i105',
			'i116',
			'i201',
			'i202',
			'i204',
			'i205',
			'i263',
			'i501',
			'i601',
			'i701'
		];

		// copy to D6 class instance
		this.defMeasures = defMeasures;
		this.defInput = defInput;
		this.defSelectValue = defSelectValue;
		this.defSelectData = defSelectData;
		this.defEquipment = defEquipment;
		this.defEquipmentSize = defEquipmentSize;

	}
};



﻿/*  2017/12/16  version 1.0
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
D6.consTotal = D6.object( D6.ConsBase );

//initialize setting
D6.consTotal.init = function() {
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

	//construction setting
	this.consName = "consTotal";   		//code name of this consumption 
	this.consCode = "TO";           	//short code to access consumption, only set main consumption user for itemize
    this.title = "全体";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "9";					//number code in items
	this.color = "#a9a9a9";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "";				//code name of consumption sum up include this
	this.sumCons2Name = "";	//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "地域や家の基本情報について";

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

	this.priceEleSell =this.input( "i062", 0 );					//sell electricity
				
	//gas
	this.priceGas =this.input( "i063"
			,D6.area.averageCostEnergy.gas );					//gas fee
	this.priceGasSpring =this.input( "i0932" ,-1 );
	this.priceGasSummer =this.input( "i0933" ,-1 );
	this.priceGasWinter =this.input( "i0931" ,-1 );

	this.houseType =this.input( "i002", -1 );					//type of house
	this.houseSize =this.input( "i003", 
			( this.person == 1 ? 60 : (80 + this.person * 10) ) );
																//floor size

	this.heatEquip =this.input( "i202", -1 );					//main heat equipment

	//kerosene
	this.priceKerosSpring =this.input( "i0942" ,-1 );
	this.priceKerosSummer =this.input( "i0943" ,-1 );
	this.priceKerosWinter =this.input( "i0941" ,-1 );
	

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
			,D6.area.averageCostEnergy.car );					//gasoline

	this.equipHWType = this.input( "i101", 1 );					//type of heater

	this.generateEleUnit = D6.area.unitPVElectricity;			//area parameters of PV generate

	//set seasonal fee
	this.seasonPrice =  {
			electricity :	[ this.priceEleWinter, this.priceEleSpring, this.priceEleSummer ],		//電気
			gas :			[ this.priceGasWinter, this.priceGasSpring, this.priceGasSummer ],		//ガス
			kerosene:		[ this.priceKeros, this.priceKerosSpring,this.priceKerosSummer ], 		//灯油
//			coal :			[ -1, -1,-1 ], 
//			hotwater :		[ -1, -1,-1 ],
			car :			[ -1, -1,-1 ] 
	};

	//monthly pattern  -1:no input
	this.monthlyPrice = {
			electricity :	[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			gas :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			kerosene :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
//			coal :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
//			hotwater :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
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
					&& ( this.input( "i061", -1) == -1 );
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
	} else if ( this.solarYear >= 2017 &&   this.solarYear  < 2100) {
		if ( this.pvRestrict == 1 ) {
			pvSellUnitPrice = 30;
		} else {
			pvSellUnitPrice = 28;
		}
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
	var mes;

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
		mes.advice = D6.scenario.defMeasures['mTOsolar']['advice'] 
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

﻿/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.consCRsum
D6.consEnergy = D6.object( D6.ConsBase );
DC = D6.consEnergy;

DC.init = function() {
	//construction setting
	this.consName = "consEnergy";    	//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "全般エネルギー設定";	//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "0";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "家全体でのエネルギーの使い方や、1ヶ月あたりの光熱費について";

	// add instance combined to this class
	this.partConsName = [		
	];
};
DC.init();


DC.calc = function() {
	this.clear();
};

DC.calcMeasure = function() {
};




﻿/*  2017/12/15  version 1.0
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




﻿/*  2017/12/15  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consHWsum.js 
 * 
 * calculate consumption and measures related to dresser
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
D6.consHWsum = D6.object( D6.ConsBase );


//initialize-------------------------------
DC.init = function() {
	//construction setting
	this.consName = "consHWsum";   	 	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "給湯";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "給湯全般の使い方について";

	this.hwEnergy = 0;

	// parameters setting in this consumption
	this.waterTemp = 18;				//temperature of water degree-C
	this.hotWaterTemp = 42;				//hot water temperature degree-C
	this.tabWaterLitter = 200;			//tab hot water amount L
	this.showerWaterLitterUnit = 10;	//shower speed L/min
	this.reduceRateShowerHead = 0.3;	//reduce rate by saving shower head
	this.showerWaterMinutes = 5;		//shower time min/person
	this.otherWaterLitter = 50;			//other amount of hot water L/day
	this.tankLossWatt = 100;			//keep tank hot energy
	this.tabTemplatureDown = 2;			//temperature down in tab water degree-C/hour
	this.tabTemplatureInsulationDown = 0.5;	//temperature down in insulated tab degree-C/hour

	this.performanceGas = 0.73;			//efficient of ordinal gas heater
	this.performanceEcojozu = 0.877;	//efficient of good gas heater
	this.performanceElec = 0.8;			//efficient of electric heater
	this.performanceEcocute = 3;		//efficient of heat pump heater
	this.performanceEnefarmEle = 0.289;	//efficient of electricity generation of co-generator
	this.performanceEnefarmHW = 0.33;	//efficient of heat supply of co-generator
	this.performanceKeepWithTank = 0.6;	//efficient of keep tab temperature with stock hot water
	
	this.reduceRateSaveMode = 0.2;		//reduce rate to use electric heater with saving mode
	this.reduceRateSolar = 0.4;			//reduce rate to use solar heater
	this.reduceRateSolarSystem = 0.5;	//reduce rate to use solar heating system

	this.warmerElec_kWh_y = 200;		//hot seat of toilet kWh/year
	this.water_m3_d = 0.1;				//water use for toilet m3/person/day

	this.reduceRateKeepStop;
};
DC.init();	// initialize when this class is loaded


//change Input data to local value 
DC.precalc = function() {
	this.clear();

	// use answers for calclation
	this.person =this.input( "i001", 3 );				//person number
	this.housetype =this.input( "i002", 1 );			//structure of house
	this.prefecture =this.input( "i021", 13 );			//prefecture
	this.heatArea = D6.area.getHeatingLevel(this.prefecture);	//heating level
	this.tabDayWeek =this.input( "i103", 
		( this.heatArea == 1 || this.heatArea == 6 ? 2 : 6 )
	);													//use tab day day/week
	this.tabDayWeekSummer =this.input( "i104", 2 );		//use tab day in summer day/week
	this.showerMinutes =this.input( "i105"
			, this.showerWaterMinutes * this.person );	//shower time min/day
	this.showerMinutesSummer =this.input( "i106"
			, this.showerWaterMinutes * this.person );	//shower time in summer min/day
	this.savingShower =this.input( "i116", -1 );		//saving shower head 
	this.tabKeepHeatingTime =this.input( "i108"
			, (this.person > 1 ? 3 : 0 ) );				//keep time to tab hot hour/day
	this.keepMethod =this.input( "i110", 5 );			//keep hot method 
	this.tabInsulation =this.input( "i117", -1 );		//tab insulation
	this.tabHeight =this.input( "i107", 8 );			//height of tab hot water 0-10
	
	this.equipType = this.input( "i101", -1 );			//type of heater
	this.priceGas = D6.consShow["TO"].priceGas;			//gas fee yen/month
	this.priceKeros = D6.consShow["TO"].priceKeros;		//kerosene price yen/month

	this.dresserMonth = this.input( "i114", 4 );		//months of use hot water for dresser month
	this.dishWashMonth = this.input( "i115", 4 );		//months of use hot water for dish wash month / 99 is machine
	this.dishWashWater = this.input( "i113", 3 );		//use cold water for dish wash 1every day - 4 not
	this.cookingFreq = this.input( "i802", 6 );			//frequency of cooking 0-10
	
	this.keepSeason =this.input( "i131", 2 );			//use keep toilet seat hot 1:everyday - 4not use
};

// calculation of this consumption ------------------------------------
DC.calc = function() {		
	// guess equip type
	if ( this.equipType <= 0 ) {
		if ( this.priceGas == 0 ) {
			if ( this.priceKeros > 3000 ) {
				this.equipType = 3;
			} else {
				this.equipType = 5;
			}
		} else {
			this.equipType = 1;
		}
	}

	// estimate templature of tap water
	this.waterTemp = D6.area.getWaterTemplature();

	// estimate amount of hot water used as shower litter/day
	this.showerWaterLitter = 
			( this.showerMinutes * ( 12 -D6.area.seasonMonth.summer )  +
				this.showerMinutesSummer * D6.area.seasonMonth.summer ) 
				/ 12 
				* ( this.savingShower == 1  ?  1 - this.reduceRateShowerHead: 1 ) 
				* this.showerWaterLitterUnit ;

	// estimate amout of hot water used in tub	litter/day
	this.consHWtubLitter = this.tabWaterLitter * this.tabHeight  / 10 * 
					( this.tabDayWeek * ( 12 -D6.area.seasonMonth.summer ) 
						+ this.tabDayWeekSummer * D6.area.seasonMonth.summer ) / 12 / 7;
	
	// sum hot water use litter/day
	this.allLitter = ( 
						this.consHWtubLitter
						+ this.showerWaterLitter
						+ this.otherWaterLitter );

	// tap water heating energy   kcal/month
	this.heatTapEnergy = this.allLitter * ( this.hotWaterTemp - this.waterTemp ) * 365 / 12;
	
	// tab keep energy kcal/month
	this.tabKeepEnergy = this.consHWtubLitter * this.tabKeepHeatingTime *365 / 12
					*  ( ( this.tabInsulation == 1 || this.tabInsulation == 2 ) ?  tabTemplatureInsulationDown : this.tabTemplatureDown )
					/ ( ( this.equipType == 4 || this.equipType ==5 ) ? this.performanceKeepWithTank : 1 )
					* this.keepMethod / 10;

	// heating energy   kcal/month
	this.heatEnergy = this.heatTapEnergy + this.tabKeepEnergy;
	this.hwEnergy = this.heatEnergy;

	// ratio of tub
	this.consHWtubRate = this.consHWtubLitter / this.allLitter  + ( this.tabKeepEnergy / this.heatEnergy );

	// ratio of shower
	this.consHWshowerRate = this.showerWaterLitter / this.allLitter * ( this.heatTapEnergy /  this.heatEnergy );

	// ratio of dresser
	this.consHWdresserRate = this.otherWaterLitter / 2 / this.allLitter * ( this.heatTapEnergy /  this.heatEnergy )
										* this.dresserMonth / 6;

	// ratio of dish wash
	this.consHWdishwashRate = this.otherWaterLitter / 2 / this.allLitter * ( this.heatTapEnergy /  this.heatEnergy )
										* ( this.dishWashMonth == 99 ? 1 : this.dishWashMonth / 6 )
										* ( this.dishWashWater - 1 ) / 2
										* this.cookingFreq / 6;

	// estimate loss energy when stored in tank  kcal/month
	this.tanklossEnergy = this.tankLossWatt / 1000 * D6.Unit.calorie.electricity * 365 / 12;


	// Heater Equip Type
	switch ( this.equipType ) {
		case 1:
			//gas heater
			this.mainSource = "gas";
			this[this.mainSource] = this.heatEnergy / this.performanceGas 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 2:
			//high efficient gas heater
			this.mainSource = "gas";
			this[this.mainSource] = this.heatEnergy / this.performanceEcojozu 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 3:
			//kerosene heater
			this.mainSource = "kerosene";
			this[this.mainSource] = this.heatEnergy / this.performanceGas 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 4:
			//high efficient kerosene heate
			this.mainSource = "kerosene";
			this[this.mainSource] = this.heatEnergy / this.performanceEcojozu 
						/ D6.Unit.calorie[this.mainSource];
			break;
		case 5:
			//electricity heater
			this.mainSource = "electricity";
			this[this.mainSource] = ( this.heatEnergy + this.tanklossEnergy  )
						/ this.performanceElec / D6.Unit.calorie[this.mainSource];
			break;
		case 6:
			//heat pump heater
			this.mainSource = "electricity";
			this[this.mainSource] = ( this.heatEnergy + this.tanklossEnergy ) 
						/ this.performanceEcocute / D6.Unit.calorie[this.mainSource];
			break;
		case 7:
		case 8:
		default:
			this.mainSource = "gas";
			this.gas = this.heatEnergy / this.performanceEcojozu 
						/ D6.Unit.calorie.gas;
	}
	
	//toilet
	this.electricity += this.warmerElec_kWh_y / 12 * (4-this.keepSeason)/3;
	this.water += this.water_m3_d * this.person *30;
	
	//reduce rate by use shower
	this.reduceRateShowerTime = 1 / ( this.showerMinutes / this.person - 1 ) * this.consHWshowerRate;
	
	//reduce rate by stop keep hot 
	this.reduceRateTabKeep = this.tabKeepEnergy / ( this.heatEnergy *  this.consHWtubLitter / this.allLitter );
	
	//reduce rate by insulation tab 
	this.reduceRateInsulation = ( (this.tabInsulation == 1 || this.tabInsulation == 2 ) ? 0 : 
			this.reduceRateTabKeep 
					* (this.tabTemplatureDown - this.tabTemplatureInsulationDown ) / this.tabTemplatureDown );

	//reduce rate by use shower in summer
	var ssummer = this.tabDayWeekSummer * D6.area.seasonMonth.summer;
	var snsummer = this.tabDayWeek * ( 12 -D6.area.seasonMonth.summer );
	this.reduceRateStopTabSummer = ssummer / ( ssummer + snsummer );

};


// calclate measures ----------------------------------------------
//		calculate co2/cost saving related to this consumption
// parameter
//		none
// result
//		none
// set
//		calclate result in this.measures[] also link to D6.measuresList[]
DC.calcMeasure = function() {
	var goodPerformance = false;
		
	// installed good performance equipments
	if ( this.isSelected( "mHWecocute" ) 
		|| this.isSelected( "mHWecofeel" )
		//|| this.isSelected( "mHWecojoze" )
		|| this.isSelected( "mHWenefarm" )
	) {
		goodPerformance = true;
	}

	//endEnergy adjust with installed measures 170426
	var endEnergyNow = this.hwEnergy  * this.co2 / this.co2Original;
	if ( (  this.equipType == -1 
			|| this.equipType == 1
			|| this.equipType == 3 
			|| this.equipType == 5 )
		 && !goodPerformance
	) {
		//mHWecocute
		if( this.housetype == 1 ) {		
			this.measures[ "mHWecocute"] .clear();
			this.measures[ "mHWecocute" ].nightelectricity =  
					( endEnergyNow+ this.tanklossEnergy ) 
						/ this.performanceEcocute / D6.Unit.calorie.nightelectricity;
		}
		
		//mHWecofeel
		if ( this.equipType == 3 ) {
			this.measures[ "mHWecofeel" ].clear();
			this.measures[ "mHWecofeel" ].kerosene = endEnergyNow
						/ this.performanceEcojozu / D6.Unit.calorie.kerosene;
		}
			
		//mHWecojoze
		this.measures[ "mHWecojoze" ].clear();
		this.measures[ "mHWecojoze" ].gas = endEnergyNow
						/ this.performanceEcojozu / D6.Unit.calorie.gas;

		//mHWenefarm
		if( this.housetype == 1 ) {
			this.measures[ "mHWenefarm" ].clear();
			//electricity generation 
			var notCoGenerationEnergy = 500 * 1000 / 12;	//	kcal/month
			var coGenerationEnergy  = endEnergyNow - notCoGenerationEnergy;
			
			this.measures[ "mHWenefarm" ].gas = ( 
							coGenerationEnergy / this.performanceEnefarmHW 
							+ notCoGenerationEnergy / this.performanceEcojozu
						) / D6.Unit.calorie.gas;

			this.measures[ "mHWenefarm" ].electricity = - coGenerationEnergy 
						/ this.performanceEnefarmHW * this.performanceEnefarmEle 
						/ D6.Unit.calorie.electricity;
		}
	}

	//mHWsaveMode
	if ( this.equipType == 6 || this.equipType == 5  ){
		this.measures[ "mHWsaveMode" ].calcReduceRate( this.reduceRateSaveMode );
	}

	var rejectSolarSelect = false;		//can or not to install solar heater
	if ( this.isSelected( "mHWecocute" ) 
		|| this.isSelected( "mHWenefarm" )
		|| this.isSelected( "mHWsolarSystem" )
		|| this.isSelected( "mHWsolarHeater" )
	) {
		//tank type or co generation type
		rejectSolarSelect = true;
	}
		
	if ( this.equipType != 5 
		&& this.equipType != 6 
		&& !rejectSolarSelect 
		&& this.housetype == 1 
	) {
		this.measures[ "mHWsolarHeater" ].calcReduceRate( this.reduceRateSolar );
		this.measures[ "mHWsolarSystem" ].calcReduceRate( this.reduceRateSolarSystem );
	}
};

//hot water energy is also adjusted 
DC.calcAdjustStrategy = function( energyAdj ){
	this.heatEnergy *= energyAdj[this.mainSource];
	this.tanklossEnergy *= energyAdj[this.mainSource];
	this.hwEnergy *= energyAdj[this.mainSource];
};

﻿/*  2017/12/15  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consHWshower = D6.object( D6.ConsBase );

D6.consHWshower.init = function() {
	//construction setting
	this.consName = "consHWshower";    	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = " ";					//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "シャワーの使い方について";
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

﻿/*  2017/12/15  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consHWtub = D6.object( D6.ConsBase );

D6.consHWtub.init = function() {
	this.autoKeepRate = 0.5;			//reduce rate to change auto heating to demand heating

	//construction setting
	this.consName = "consHWtub";   	 	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "浴槽";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "浴槽のお湯の使い方について";

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


﻿/*  2017/12/15  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consHWdresser = D6.object( D6.ConsBase );

D6.consHWdresser.init = function(){
	//construction setting
	this.consName = "consHWdresser";    //code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "洗面";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "洗面でのお湯の使い方について";
};
D6.consHWdresser.init();

D6.consHWdresser.calc = function( ) {
	this.copy( this.sumCons );
	this.multiply( this.sumCons.consHWdresserRate );
};

D6.consHWdresser.calcMeasure = function( ) {
};

﻿/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumptionb
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.consCRsum
D6.consHWdishwash = D6.object( D6.ConsBase );

D6.consHWdishwash.init = function() {
	this.reduceRateWashTank = 0.3;			//reduction rate wash with stored water
	this.reduceRateWashNotSummer = 0.5;		//reduction rate with cold water in summer
	this.reduceRateDishWasher = 0.2;		//reduction rate with wash machine

	//construction setting
	this.consName = "consHWdishwash";  	//code name of this consumption 
	this.consCode = "HW";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "食器洗い";			//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "1";					//number code in items
	this.color = "#ffb700";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consHWsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "食器洗いの使い方について";
};
D6.consHWdishwash.init();


D6.consHWdishwash.calc = function() {
	var sumcValue = this.sumCons.value;

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
﻿/*  2017/12/15  version 1.0
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


/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

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
    this.title = "冷房";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#0000ff";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "家全体での冷房の使い方について";

};
D6.consCOsum.init();

D6.consCOsum.precalc = function() {
	this.clear();

	this.person =this.input( "i001", 3 );			//person number
	this.houseSize =this.input( "i003", 
			( this.person == 1 ? 60 : (80 + this.person * 10) ) );
													//space of house
	this.houseType = this.input( "i002", 1 );		//standalone / collective
	this.coolArea  = this.input( "i201", 0.5 );		//rate by space of cooling
	this.coolTime  = this.input( "i261", 4 );		//time
	this.coolTemp  = this.input( "i263", 27 );		//temperature
};
	
D6.consCOsum.calc = function() {
	var coolKcal = this.calcCoolLoad();

	//calc year average from seasonal average
	coolKcal *= D6.area.seasonMonth.summer / 12;

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
D6.consCOsum.calcCoolLoad = function()
{
	var energyLoad = 0;

	var coolLoadUnit = 0;				//cool load kcal/m2/hr
	if ( this.houseType == 1 ) 
	{
		coolLoadUnit = this.coolLoadUnit_Wood;
	} else {
		coolLoadUnit = this.coolLoadUnit_Steel;
	}

	var coolArea_m2;				//area of cooling m2
	coolArea_m2 = this.houseSize * this.coolArea;
	if ( this.coolArea > 0.05 ) {
		coolArea_m2 = Math.max( coolArea_m2, 13 );		//minimun 13m2
	}

	var coolTime;					//time of cooling
	coolTime = this.coolTime;

	//coefficient of cooling
	var coolMonth = D6.area.seasonMonth.summer;
	var coolFactor = D6.area.getCoolFactor( coolMonth, coolTime );

	var coefTemp;					//difference by temperature
	coefTemp = ( 27 - this.coolTemp ) / 10 + 1;

	energyLoad = coolLoadUnit * coolFactor[0] *  coolArea_m2 * coolTime * 30 * coefTemp;

	return energyLoad;

};

/*  2017/12/10  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */
 
//Inherited class of D6.consCOsum
D6.consACcool = D6.object( D6.consCOsum );

//initialize
D6.consACcool.init = function(){
	//construction setting
	this.consName = "consACcool"; 		//code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
    this.title = "部屋冷房";			//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "冷暖房する部屋";	//the name of object shown as add target
	this.groupID = "2";					//number code in items
	this.color = "#0000ff";				//color definition in graph
	this.countCall = "部屋目";			//how to point n-th equipment

    this.sumConsName = "consCOsum";		//code name of consumption sum up include this
	this.sumCons2Name = "consAC";		//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "部屋ごとの冷房の使い方について";

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
	this.coolTemp  = this.input( "i273" + this.subID, this.sumCons.coolTemp );	//templature setting (degree-C)
};

D6.consACcool.calc = function() {
	//calcurate cooling load ( kcal/month in cooling days )
	var coolKcal = this.calcCoolLoad();

	//calcurate annualy electricity from cooling season monthly one.
	coolKcal *= D6.area.seasonMonth.summer / 12;

	//monthly consumption electricity kWh/mon
	this.electricity =  coolKcal / this.ac.apf / D6.Unit.calorie.electricity;

};

//calcuration after all consumptions are calcrated
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



﻿/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consHTsum = D6.object( D6.ConsBase );

D6.consHTsum.init = function() {
	//construction setting
	this.consName = "consHTsum";    	//code name of this consumption 
	this.consCode = "HT";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "暖房";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "";			//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "家全体での暖房の使い方について";

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
		);											//heating area m2
		
	this.heatEquip =this.input( "i202", -1 );		//heagin equipment
	this.heatTime  =this.input( "i204", 
			this.heatArea == 1 ? 24 :
			this.heatArea == 2 ? 10 :
			this.heatArea == 3 ? 6 : 6
		);											//heating time
	this.heatTemp  =this.input( "i205", 21 );		//heating templature setting
	this.priceEleSpring =this.input( "i0912", -1 );	//electricity charge in spring/fall
	this.priceEleWinter =this.input( "i0911", -1 );	//elecuricity charge in winter
	this.priceGasSpring =this.input( "i0922", -1 );	//gas chage in spring/fall
	this.priceGasWinter =this.input( "i0921", -1 );	//gas chage in winter
	this.consKeros =this.input( "i064", -1 );		//consumption of kerosene
	this.hotwaterEquipType = this.input( "i101", -1 );	//hot water templature

	this.performanceWindow =this.input( "i041", -1 );	//performance of window
	this.performanceWall =this.input( "i042", -1 );	//performance of wall insulation
	this.reformWindow =this.input( "i043", -1 );	//reform to change window
	this.reformfloor =this.input( "i044", -1 );		//reform to change floor

};

D6.consHTsum.calc = function() {
	//calculate heat energy
	var heatKcal = this.calcHeatLoad();

	//covert to montly by seasonal data
	heatKcal *= D6.area.seasonMonth.winter / 12;
	this.endEnergy = heatKcal;

	//guess of heat source
	if ( this.heatEquip <= 0 ) {
		if ( this.consKeros > 0 
			||D6.area.averageCostEnergy.kerosene > 1000 
		) {
			//kersene 
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

	//calc residue
	var elecOver = 0;
	var coef = ( this.heatEquip == 1 ? this.apf : 1 );
	if ( this.heatEquip == 1 || this.heatEquip == 2 ) {
		if ( this.priceEleWinter > 0  ) {
			var priceMaxCons = this.priceEleWinter * 0.7
					/ D6.Unit.price.electricity 
					* D6.Unit.seasonMonth.winter / 12;
			if ( heatKcal / coef /D6.Unit.calorie.electricity > priceMaxCons ) {
				//in case that calculated electricity is more than fee
				var elecOver = heatKcal - priceMaxCons * coef *D6.Unit.calorie.electricity;
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
	consbyprice = ( this.priceEleWinter -this.priceEleSpring ) / D6.Unit.price.electricity;
	if ( this.priceEleSpring != -1 && this.priceEleWinter != -1) {
		if( this.hotwaterEquipType !=5 && this.hotwaterEquipType !=6 ) {
			this.electricity = ( this.electricity*2 + consbyprice ) / 3;
		}
	} else {
		this.electricity = ( this.electricity*4 + consbyprice ) / 5;		
	}

	//gas
	consbyprice = ( this.priceGasWinter -this.priceGasSpring ) / D6.Unit.price.gas;
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
	//gas fix
	if (gasover>0){
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
	
	//recalc after fix
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
		if ( this.kerosene > spaceK ) {
			//heat consumption is over gas residue
			if ( this.kerosene - spaceK 
				> spaceG *D6.Unit.calorie.gas /D6.Unit.calorie.kerosene
			) {
				//estimate heat is supplied by electricity
				this.electricity = 
						( this.kerosene - spaceK ) 
						*D6.Unit.calorie.kerosene
						/D6.Unit.calorie.electricity;
				//not over 70% of winter electricity
				this.electricity = Math.min( this.electricity,
						D6.consShow["TO"].electricity
							* D6.consShow["TO"].seasonPrice["electricity"][0]	//winter
							/ D6.consShow["TO"].priceEle
							* D6.area.seasonMonth.winter / 12
							*0.7
					);
				this.kerosene = spaceK;
				this.gas = spaceG;
			} else {
				//in case to use gas residure
				this.gas = 
					( this.kerosene - spaceK ) 
					*D6.Unit.calorie.kerosene
					/D6.Unit.calorie.gas;
			this.kerosene = spaceK;
			}
		}
	}

	//kerosene cannot find suitable usage
	if ( spaceK > 0 ) {
		this.kerosene = spaceK;
	}

	//in case of use gas hetar
	if ( this.heatEquip == 3 ) {
		if ( this.gas > spaceG ) {
			this.electricity = 
						( this.gas - spaceG ) 
						*D6.Unit.calorie.gas
						/D6.Unit.calorie.electricity;
			this.gas = spaceG;
		}
	}

	//add electricity use in toilet
	this.electricity += D6.consListByName["consHWtoilet"][
	0].electricity;
};

//calculate heat load kcal/month
//
//		cons.houseType : type of house
//		cons.houseSize : floor size(m2)
//		cons.heatSpace : heat area rate(-)   room size(m2)
D6.consHTsum.calcHeatLoad = function(){
	var energyLoad = 0;

	// heat loss when templature difference between house and outside is 20 degree-C  kcal/h/m2
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

	//heat floor/room size m2
	var heatArea_m2	= this.houseSize * this.heatSpace;
	if ( this.heatSpace > 0.05 ) {
		heatArea_m2 = Math.max( heatArea_m2, 13 );		//minimum 13m2
	}

	//heat factor by month and hours
	var heatMonth = D6.area.seasonMonth.winter;
	var heatFactor = D6.area.getHeatFactor( heatMonth, this.heatTime );

	//heat time adjust for long time use
	var heatTimeFactor = Math.min( this.heatTime, (this.heatTime - 8 ) * 0.3 + 8) / this.heatTime;

	//coefficient by templature
	var coefTemp = ( this.heatTemp - 20 ) / 10 + 1;

	energyLoad = heatLoadUnit * heatFactor[1] * heatArea_m2 * this.heatTime * heatTimeFactor * 30 * coefTemp;

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



﻿/*  2017/12/14  version 1.0
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


/*  2017/12/10  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */
 
//Inherited class of D6.consBase
D6.consAC = D6.object( D6.ConsBase );

//initialize
D6.consAC.init = function() {
	//construction setting
	this.consName = "consAC";           //code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
    this.title = "部屋空調";			//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "2";					//number code in items
	this.color = "#ff0000";				//color definition in graph
	this.countCall = "部屋目";			//how to point n-th equipment

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
	this.acFilter  = this.input( "i217" + this.subID,　-1 );	//cleaning action of filter
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
 *		ret.pr2 : price of ordninal one
 *		ret.pf1 : performance of good one
 *		ret.pf2 : performance of ordninal one
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

	return this.getEquipParameters( year, size, sizeThreshold, defEquip )
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
		mes["consACheat"].electricity = this.acHeat.endEnergy /　this.apfMax / D6.Unit.calorie.electricity;

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




﻿/*  2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consRF.js 
 * 
 * calculate consumption and measures related to refrigelator
 * total use
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 */

//Inherited class of D6.ConsBase
D6.consRFsum = D6.object( D6.ConsBase );

//initialize
D6.consRFsum.init = function() {
	//construction setting
	this.consName = "consRFsum";      	//code name of this consumption 
	this.consCode = "RF";              	//short code to access consumption, only set main consumption user for itemize
    this.title = "冷蔵庫";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.addable = "冷蔵庫";			//the name of object shown as add target
    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this
	this.groupID = "3";					//number code in items
	this.color = "#a0ffa0";				//color definition in graph

	this.residueCalc = "no";			//evaluate residue as #0 or not	no/sumup/yes

	//guide message in input page
	this.inputGuide = "家全体での冷蔵庫の使い方について";
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

	return this.getEquipParameters( year, size, sizeThreshold, defEquip )
};



﻿/*  2017/12/10  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//Inherited class of D6.consRFsum
D6.consRF = D6.object( D6.consRFsum );

//initialize
D6.consRF.init = function() {
	this.consYear = 650;                //ordinal electricity consumption per year(kWh/year)
	this.consYearAdvanced = 300;        //energy saving type (kWh/year)
	this.reduceRateWall = 0.1;          //reduction rate through make space between wall and refrigerator
	this.reduceRateTemplature = 0.12;   //reduction rate through set saving temperature
	
	//construction setting
	this.consName = "consRF";           //code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
    this.title = "冷蔵庫";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "冷蔵庫";			//the name of object shown as add target
	this.groupID = "3";					//number code in items
	this.color = "#a0ffa0";				//color definition in graph
	this.countCall = "台目";			//how to point n-th equipment

    this.sumConsName = "consRFsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "個別の冷蔵庫の使い方について";
};
D6.consRF.init();

D6.consRF.precalc = function() {
	this.clear();

	//prepare input value
	this.year = this.input( "i711" + this.subID, 8 );		//equipment year
	this.type = this.input( "i712" + this.subID, 1 );		//type
	this.size = this.input( "i713" + this.subID, 350 );		//size (L)
	this.templature = this.input( "i714" + this.subID, 4 );	//setting of temprature
	this.full = this.input( "i715" + this.subID, 4 );		//stuffing too much
	this.space = this.input( "i716" + this.subID, 3 );		//space beteween wall and refragerator
	
	var d = new Date();
	this.nowEquip = this.equip(d.getFullYear() - this.year, this.size);
	this.newEquip = this.equip(d.getFullYear(), this.size);

};

D6.consRF.calc = function( ) {
	// now consumption (kWh/year)
	this.consYear = this.nowEquip.pf2 * ( this.type == 2 ? 2 : 1 );
	
	//new type of refregerator(kWh/year)
	this.consYearAdvanced =  this.newEquip.pf1 * ( this.type == 2 ? 2 : 1 );

	//reduction rate to replace new one
	this.reduceRateChange = this.consYearAdvanced / this.consYear;

	// set 0-th equipment charactrictic to refregerator
	if ( this.subID == 0 ) {
		if ( this.input( "i7111" , -1 ) < 0  && this.input( "i7131" , -1 ) < 0 ){
			//in case of no input set 0-th data as sumup by count
			this.electricity =  this.consYear * this.count / 12;
		} else {
			this.electricity = 0;
		}
		return;
	}

	if ( this.subID > 0 && 
		this.input( "i711" + this.subID, -1 ) < 0 && 
		this.input( "i713" + this.subID, -1 ) < 0 
	){
		//not calculate of no input
		return;
	}

	//monthly electricity consumption (kWh/month)
	this.electricity =  this.consYear / 12;	

	//fix in case of stuffing too much
	this.electricity = this.electricity 
				* ( this.full ==3 ? 1.1 : ( this.full == 1 ? 0.9 : 1 ) );
		
	//fix in case of no space
	this.electricity = this.electricity 
				* ( this.space ==1 ? 0.95 : ( this.space==2 ? 1.05 : 1 ) );

	//fix by templature
	this.electricity = this.electricity 
				* ( this.templature ==1 ? 1.1 : ( this.templature==3 ? 0.95 : 1 ) );
	
};


D6.consRF.calcMeasure = function( ) {
	//mRFreplace
	this.measures["mRFreplace"].calcReduceRate( this.reduceRateChange );

	//mRFtemplature
	if ( this.templature != 3 ) {
		this.measures["mRFtemplature"].calcReduceRate( this.reduceRateTemplature );
	}

	//mRFwall
	if ( this.space != 1 ){
		this.measures["mRFwall"].calcReduceRate( this.reduceRateWall );
	}

	//mRFstop
	if ( this.count > 1 ) {
		if ( this.subID == 0 ){
			//in case of rough estimation
			this.measures["mRFstop"].calcReduceRate( 1 / this.count );
		} else {
			this.measures["mRFstop"].electricity = 0;
		}
	}
};



﻿/*  2017/12/15  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.ConsBase
D6.consLIsum = D6.object( D6.ConsBase );

D6.consLIsum.init =function() {
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

	//construction setting
	this.consName = "consLIsum";   		//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "照明";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "照明する部屋";		//add message
	this.groupID = "6";					//number code in items
	this.color = "#ffff00";				//color definition in graph
	this.countCall = "部屋目";			//how to point n-th equipment
	this.residueCalc = "sumup";			//calculate method	no/sumup/yes

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "家全体での照明の使い方について";

};
D6.consLIsum.init();


D6.consLIsum.precalc = function(){
	this.clear();

	this.person =this.input( "i001", 3 );			//person
	this.lightType =this.input( "i501", 2 );		//living light　1bulb 2fluorescent 3LED
	this.otherRate =this.input( "i502", 3 );		//other room light use
	this.houseSize =D6.consShow["TO"].houseSize;	//floor size
};

D6.consLIsum.calc = function( ) {
	//living consumption　kWh/month
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


﻿/*  2017/12/15  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */
 
//Inherited class of D6.consLIsum
D6.consLI = D6.object( D6.consLIsum );

D6.consLI.init = function() {
	//construction setting
	this.consName = "consLI";   		//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "照明";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "照明する部屋";		//add message
	this.groupID = "6";					//number code in items
	this.color = "#ffff00";				//color definition in graph
	this.countCall = "部屋目";			//how to point n-th equipment

    this.sumConsName = "consLIsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "個別部屋の照明の使い方について";
};
D6.consLI.init();

D6.consLI.precalc = function( ) {
	this.clear();

	// room name
	var roomNames = [ '', '玄関', '門灯', '廊下', 'トイレ', '脱衣所', '風呂', '居室' ];
	this.rid = this.input("i511" + this.subID, 0);					//room ID
	this.mesTitlePrefix = this.rid ? roomNames[this.rid] 
			: this.mesTitlePrefix;									//set room name

	this.type =this.input( "i512" + this.subID, 2 );				//type of light
	this.watt =this.input( "i513" + this.subID, -1 );				//electricity W/tube
	this.num =this.input( "i514" + this.subID, 0 );					//tube number
	this.time =this.input( "i515" + this.subID, this.lightTime );	//time to use　hour/day

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
	this.electricity = this.watt * this.time * this.num / 1000 * 365　/ 12;	

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
	var mes;
	
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

﻿/*  2017/12/16  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//Inherited class of D6.consTVsum
D6.consTVsum = D6.object( D6.ConsBase );


//初期設定値
D6.consTVsum.init = function() {
	this.watt = 100;					//electricity consumption default W

	this.reduceRateRadio = 0.5;			//reduce rate by change to radio
	this.reduceRateBright = 0.2;		//reduce rate by change brightness

	//construction setting
	this.consName = "consTVsum";    	//code name of this consumption 
	this.consCode = "TV";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "テレビ";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "テレビ";			//the name of object shown as add target
	this.groupID = "7";					//number code in items
	this.color = "#00ff00";				//color definition in graph
	this.countCall = "台目";			//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this
	this.residueCalc = "sumup";			//calculate type of residue	no/sumup/yes

	//guide message in input page
	this.inputGuide = "家全体のテレビの使い方について";
};
D6.consTVsum.init();

D6.consTVsum.calc = function() {
	this.useTime =this.input( "i601", 8.5 );	//time to use hour

	//electiricy　kWh/month
	this.electricity =  this.watt / 1000 * this.useTime * 30;	
};

D6.consTVsum.calc2nd = function() {
	var electricity = this.electricity;	 		//backup
	this.clear();

	//add each terevition
	for( var id in this.partCons ) {
		this.add( this.partCons[id] );
	}
	
	//use total electricity if sum of TV is smaller
	if ( electricity > this.electricity ){
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
D6.consTVsum.equip = function( year, size ) {
	var sizeThreshold = [ 20, 30, 40, 50, 60, 120 ];	//last is maxsize

	//definition of equip [size][year][code]
	//	code: pf1,pf2 performance 1 is good one
	//				pr1,pr2 price 1 is good one
	var defEquip = {
		20 : {
			1900 : { "pf1" : 100, "pf2" : 150, "pr1" : 500000, "pr2" : 400000 } ,
			1995 : { "pf1" : 50, "pf2" : 100, "pr1" : 50000, "pr2" : 40000 } ,
			2005 : { "pf1" : 40, "pf2" : 80, "pr1" : 40000, "pr2" : 30000 } ,
			2015 : { "pf1" : 30, "pf2" : 50, "pr1" : 30000, "pr2" : 25000 } ,
			2030 : { "pf1" : 20, "pf2" : 30, "pr1" : 30000, "pr2" : 25000 } 
		},
		30 : {
			1900 : { "pf1" : 150, "pf2" : 300, "pr1" : 500000, "pr2" : 400000 } ,
			1995 : { "pf1" : 80, "pf2" : 150, "pr1" : 80000, "pr2" : 60000 } ,
			2005 : { "pf1" : 50, "pf2" : 100, "pr1" : 50000, "pr2" : 40000 } ,
			2015 : { "pf1" : 40, "pf2" : 60, "pr1" : 40000, "pr2" : 35000 } ,
			2030 : { "pf1" : 30, "pf2" : 40, "pr1" : 40000, "pr2" : 35000 } 
		},
		40 : {
			1900 : { "pf1" : 400, "pf2" : 500, "pr1" : 500000, "pr2" : 400000 } ,
			1995 : { "pf1" : 300, "pf2" : 500, "pr1" : 200000, "pr2" : 150000 } ,
			2005 : { "pf1" : 100, "pf2" : 200, "pr1" : 120000, "pr2" : 100000 } ,
			2015 : { "pf1" : 60, "pf2" : 120, "pr1" : 100000, "pr2" : 80000 } ,
			2030 : { "pf1" : 40, "pf2" : 80, "pr1" : 80000, "pr2" : 70000 } 
		},
		50 : {
			1900 : { "pf1" : 500, "pf2" : 700, "pr1" : 500000, "pr2" : 400000 } ,
			1995 : { "pf1" : 500, "pf2" : 700, "pr1" : 400000, "pr2" : 300000 } ,
			2005 : { "pf1" : 200, "pf2" : 400, "pr1" : 200000, "pr2" : 180000 } ,
			2015 : { "pf1" : 100, "pf2" : 200, "pr1" : 140000, "pr2" : 120000 } ,
			2030 : { "pf1" : 80, "pf2" : 160, "pr1" : 100000, "pr2" : 90000 } 
		},
		60 : {
			1900 : { "pf1" : 500, "pf2" : 700, "pr1" : 500000, "pr2" : 400000 } ,
			1995 : { "pf1" : 500, "pf2" : 700, "pr1" : 500000, "pr2" : 400000 } ,
			2005 : { "pf1" : 250, "pf2" : 500, "pr1" : 400000, "pr2" : 300000 } ,
			2015 : { "pf1" : 120, "pf2" : 200, "pr1" : 180000, "pr2" : 160000 } ,
			2030 : { "pf1" : 100, "pf2" : 180, "pr1" : 160000, "pr2" : 150000 } 
		},
		120 : {
			1900 : { "pf1" : 500, "pf2" : 700, "pr1" : 500000, "pr2" : 400000 } ,
			1995 : { "pf1" : 500, "pf2" : 700, "pr1" : 500000, "pr2" : 400000 } ,
			2005 : { "pf1" : 350, "pf2" : 500, "pr1" : 400000, "pr2" : 300000 } ,
			2015 : { "pf1" : 200, "pf2" : 400, "pr1" : 180000, "pr2" : 160000 } ,
			2030 : { "pf1" : 180, "pf2" : 250, "pr1" : 160000, "pr2" : 150000 } 
		}
	};

	return this.getEquipParameters( year, size, sizeThreshold, defEquip );
};


D6.consTVsum.calcMeasure = function( ) {
	//mTVradio
	this.measures["mTVradio"].calcReduceRate( this.reduceRateRadio );

};



﻿/*  2017/12/16  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 */

//Inherited class of D6.consTVsum
D6.consTV = D6.object( D6.consTVsum );


D6.consTV.init = function() {
	//construction setting
	this.consName = "consTV";           //code name of this consumption 
	this.consCode = "";                 //short code to access consumption, only set main consumption user for itemize
    this.title = "テレビ";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.addable = "テレビ";			//the name of object shown as add target
	this.groupID = "7";					//number code in items
	this.color = "#00ff00";				//color definition in graph
	this.countCall = "台目";			//how to point n-th equipment

    this.sumConsName = "consRFsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "個別のテレビの使い方について";
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

	//electricity　kWh/month
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


﻿/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.ConsBase
D6.consDRsum = D6.object( D6.ConsBase );

D6.consDRsum.init = function() {
	this.whWash = 100;					// only wash wh/day in case of 3 persons
	this.whDry = 1000;					// use dry wh/day in case of 3 persons

	this.reduceRateHeatPump = 0.65;		//reduce rate by heatpump type
	this.res2Freq = [ 0, 1, 0.5, 0.2, 0.07, 0 ];

	//construction setting
	this.consName = "consDRsum";    	//code name of this consumption 
	this.consCode = "DR";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "掃除洗濯";			//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "5";					//number code in items
	this.color = "#00ffff";				//color definition in graph

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "掃除機、洗濯機や衣類乾燥機の使い方について";
};
D6.consDRsum.init();


D6.consDRsum.precalc = function( cons ) {
	this.clear();

	this.dryUse = this.input( "i401", 0 );		//use dryer or not
	this.person = D6.consShow["TO"].person;		//person number
};

D6.consDRsum.calc = function( cons ) {
	//rate of dry
	this.rateDry = ( this.whDry * this.res2Freq[this.dryUse] ) / ( this.whWash + this.whDry * this.res2Freq[this.dryUse] );

	//electricity　kWh/month
	this.electricity = ( this.whWash + this.whDry * this.res2Freq[this.dryUse] ) / 1000
									* this.person / 3 
									* 30;
};

D6.consDRsum.calcMeasure = function() {
	//mDRheatPump
	this.measures["mDRheatPump"].calcReduceRate( this.rateDry * this.reduceRateHeatPump );
	
	//mDRsolar
	this.measures["mDRsolar"].calcReduceRate( this.rateDry );
		
};


﻿/*  2017/12/14  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * consCKpot.js 
 * 
 * calculate consumption and measures related to car total
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
    this.title = "車";					//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "8";					//number code in items
	this.color = "#ee82ee";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "車・バイクの使い方について";
};
D6.consCRsum.init();

D6.consCRsum.precalc = function() {
	this.clear();

	this.priceCar = D6.consShow["TO"].priceCar;		//car charge
	this.carNum = this.input( "i901", -1 );			//number of cars
	this.car =  this.priceCar /D6.Unit.price.car;	//monthly gasoline　L/month
};

D6.consCRsum.calc = function() {
};

D6.consCRsum.calcMeasure = function( ){
	//mCRecoDrive
	this.measures["mCRecoDrive"].calcReduceRate( this.reduceRateEcoDrive );

};

﻿/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.consCRsum
D6.consCR = D6.object( D6.consCRsum );


D6.consCR.init = function() {
	//construction setting
	this.consName = "consCR";    		//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "車両";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "8";					//number code in items
	this.color = "#ee82ee";				//color definition in graph
	this.countCall = "台目";			//how to point n-th equipment

	//consCR is sub aggrigation, consCRtrip is connected to  consCRsum
    this.sumConsName = "";				//code name of consumption sum up include this
	this.sumCons2Name = "consCRsum";	//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "保有する車ごとの性能・使い方について";
};
D6.consCR.init();

D6.consCR.precalc = function() {
	this.clear();
	
	this.carType = 		this.input( "i911"　+ this.subID , 1 );	//type of car
	this.performance = 	this.input( "i912"　+ this.subID , 12 );//performance km/L

	// car user
	this.user = 		this.input( "i913"　+ this.subID , this.subID　+ this.countCall );	
	this.ecoTier = 		this.input( "i914"　+ this.subID , 3 );	//eco tier

};

D6.consCR.calc = function() {
};

D6.consCR.calc2nd = function( ) {
	//calc by trip
	var trsum = 0;	
	var carnum = D6.consListByName["consCR"].length;
	var tripnum = D6.consListByName["consCRtrip"].length;
	for ( i=1 ; i<tripnum ; i++ ){
		trsum += D6.consListByName["consCRtrip"][i].car;
	}
	if ( trsum == 0 ){
		if ( this.subID == 0 ){
			//residure
			this.car = this.sumCons2.car;
		} else {
			//in case of no residue
			this.car *= Math.pow( 0.5, this.subID );
			if ( this.subID == carnum-1 ) {
				this.car *= 2;
			}
		}
	} else {
		//recalculate by rate of destination consumption, and calculated by gasoline
		this.car *= this.sumCons2.car / trsum;
	}
};


D6.consCR.calcMeasure = function() {
	//mCRreplace
	this.measures["mCRreplace"].calcReduceRate( (this.performanceNew - this.performanceNow ) / this.performanceNew );

	//mCRreplaceElec
	this.measures["mCRreplaceElec"].clear();
	this.measures["mCRreplaceElec"].electricity = this.performanceNow * this.car / this.performanceElec;

};

﻿/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.consCRsum
D6.consCRtrip = D6.object( D6.consCRsum );

//初期設定値
D6.consCRtrip.init = function() {
	//construction setting
	this.consName = "consCRtrip";    		//code name of this consumption 
	this.consCode = "";            		//short code to access consumption, only set main consumption user for itemize
    this.title = "移動";				//consumption title name
	this.orgCopyNum = 1;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "8";					//number code in items
	this.color = "#ee82ee";				//color definition in graph
	this.countCall = "ヶ所目";			//how to point n-th equipment
	this.addable = "移動先";

    this.sumConsName = "consCRsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "移動先ごとの車等の使い方について";
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
	
	//consumption of gasoline　L/month
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

/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.ConsBase
D6.consCKpot = D6.object( D6.ConsBase );

//initialize
D6.consCKpot.init = function() {
	this.wattOrdinal = 30;				//electricity for keep hot（W)

	//construction setting
	this.consName = "consCKpot";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "保温";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consCKsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "保温器具の使い方について";
};
D6.consCKpot.init();

D6.consCKpot.precalc = function() {
	this.clear();

	//prepare input value
	this.time = this.input( "i821", 6 );		//keep hot time
	this.ecoType = this.input( "i822", 3 );		//energy level
};

D6.consCKpot.calc = function() {
	//monthly electricity consumption　kWh/month
	this.electricity = this.wattOrdinal * this.time * 30 / 1000
						* (this.ecoType == 1 ? 0.5 : 1 );
};

D6.consCKpot.calcMeasure = function() {
};


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


/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.ConsBase
D6.consCKrice = D6.object( D6.ConsBase );


//initialize
D6.consCKrice.init = function() {
	this.wattOrdinal = 30;				//electricity for keep hot（W)
	
	//construction setting
	this.consName = "consCKrice";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "炊飯";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consCKsum";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this

	//guide message in input page
	this.inputGuide = "炊飯の使い方について";
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
	//monthly electricity consumption　kWh/month
	this.electricity = this.wattOrdinal * this.time * 30 / 1000;
};

D6.consCKrice.calcMeasure = function() {
};


/*  2017/12/14  version 1.0
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
 * 
 * init()			initialize, set parameters when construction
 * precalc()		called just before calc(), input data treatment and clear consumption data
 * calc()			main formula to calculate consumption
 * calc2nd()		called just after calc(), in case of need to use other consumption data
 * calcMeasure()	main formula to calculate measures
 * 
 */

//Inherited class of D6.ConsBase
D6.consCKsum = D6.object( D6.ConsBase );

D6.consCKsum.init = function() {
	//construction setting
	this.consName = "consCKsum";    	//code name of this consumption 
	this.consCode = "CK";            	//short code to access consumption, only set main consumption user for itemize
    this.title = "調理";				//consumption title name
	this.orgCopyNum = 0;                //original copy number in case of countable consumption, other case set 0
	this.groupID = "4";					//number code in items
	this.color = "#ffe4b5";				//color definition in graph
	this.countCall = "";				//how to point n-th equipment

    this.sumConsName = "consTotal";		//code name of consumption sum up include this
	this.sumCons2Name = "";				//code name of consumption related to this
	this.residueCalc = "no";			//calculate residue

	//guide message in input page
	this.inputGuide = "調理関連の使い方について";
};
D6.consCKsum.init();


D6.consCKsum.calc = function() {
	this.clear();
};

D6.consCKsum.calcMeasure = function() {
};


/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * scenariofix.js 
 * 
 * fix area function and data between home and office
 * fix scenario.js
 * fix logic definition
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 * 								2016/04/12 ported to JavaScript
 * 
 * 
 */

// D6.scenario.areafix  fix area set by home/office
// called by diagnosis.js  just after create scenario
D6.scenario.areafix = function() {
	//set area and person to calculate average, heat load etc.
	D6.area.setCalcBaseParams = function(){
		D6.area.setPersonArea( D6.doc.data.i001, D6.doc.data.i021, D6.doc.data.i023);		
	};
	
	//get seasonal parameters
	D6.area.getSeasonParamCommon = function(){
		return D6.area.getSeasonParam(  D6.area.area  );
	};

	D6.consAC.title = "机房空调";
	D6.consAC.countCall = "个房间";

	D6.consACcool.title = "机房空调";
	D6.consACcool.addable = "房间空调";
	D6.consACcool.countCall = "个房间";
	D6.consACcool.inputGuide = "如何使用每间客房的空调";	

	D6.consACheat.title = "房间暖气";
	D6.consACheat.addable = "房间空调";
	D6.consACheat.countCall = "个房间";
	D6.consACheat.inputGuide = "如何使用每间客房间暖气";	

	D6.consCKcook.title = "烹饪";				
	D6.consCKcook.inputGuide = "如何使用烹饪重点放在炉子";

	D6.consCKpot.title = "绝热";
	D6.consCKpot.inputGuide = "如何使用隔热装置";

	D6.consCKrice.title = "饭";
	D6.consCKrice.inputGuide = "如何使用火炉";

	D6.consCKsum.title = "做饭";
	D6.consCKsum.inputGuide = "如何使用烹饪相关";

	D6.consCOsum.title = "空调";
	D6.consCOsum.inputGuide = "如何使用空调在整个房子";
	
	D6.consCR.title = "车辆";
	D6.consCR.addable = "车辆";
	D6.consCR.countCall = "车";
	D6.consCR.inputGuide = "关于性能和每一辆汽车的使用将举行";

	D6.consCRsum.title = "车辆";
	D6.consCRsum.inputGuide = "如何使用汽车，自行车";

	D6.consCRtrip.title = "运动";
	D6.consCRtrip.countCall = "两个地";
	D6.consCRtrip.addable = "目的地";
	D6.consCRtrip.inputGuide = "如何使用汽车等各个目的地";
	
	D6.consDRsum.title = "洗衣机・干衣机";
	D6.consDRsum.inputGuide = "掃吸尘器，如何使用洗衣机和干衣机";

	D6.consEnergy.title = "通用能源集";
	D6.consEnergy.inputGuide = "在整个房子的使用和能源，每月水电费";
	
	D6.consHTcold.title = "在寒冷的气候";
	D6.consHTcold.inputGuide = "如何使用在寒冷气候下的加热";

	D6.consHTsum.title = "供暖";
	D6.consHTsum.inputGuide = "如何使用整个房子的供暖";

	D6.consHWdishwash.title = "洗涤";
	D6.consHWdishwash.inputGuide = "如何使用洗碗机";

	D6.consHWdresser.title = "洗";
	D6.consHWdresser.inputGuide = "洗如何在盆地用热水";

	D6.consHWshower.title = "淋浴";
	D6.consHWshower.inputGuide = "如何使用淋浴";

	D6.consHWsum.title = "热水器";
	D6.consHWsum.inputGuide = "如何使用热水供应一般";

	D6.consHWtoilet.title = "厕所";
	D6.consHWtoilet.inputGuide = "如何使用花露水和隔热";

	D6.consHWtub.title = "浴缸";
	D6.consHWtub.inputGuide = "如何使用热水浴缸";

	D6.consLI.addable = "房间照亮";
	D6.consLI.countCall = "个房间";
	D6.consLI.inputGuide = "如何使用单个房间的照明";

	D6.consLIsum.title = "照明";
	D6.consLIsum.inputGuide = "如何使用整个房子的采光";
	
	D6.consRF.title = "冰箱";
	D6.consRF.addable = "冰箱";
	D6.consRF.countCall = "台";
	D6.consRF.inputGuide = "如何使用个人冰箱";

	D6.consRFsum.title = "冰箱";
	D6.consRFsum.inputGuide = "使用在整个房子的冰箱";

	D6.consSeason.inputGuide = "对于每月的水电费每个季节。请近似值填写。";
	
	D6.consTotal.title = "整体";
	D6.consTotal.inputGuide = "有关地区和房子的基本信息";
	
	D6.consTV.title = "电视";
	D6.consTV.addable = "电视";
	D6.consTV.countCall = "台";
	D6.consTV.inputGuide = "如何使用个性化的电视";

	D6.consTVsum.title = "电视";
	D6.consTVsum.inputGuide = "如何使用电视的全屋";

	
	D6.scenario.defMeasures['mTOsolar'] = { mid:"1",  name:"mTOsolar",  title:"安装太阳能光伏板",  easyness:"0.5",  refCons:"consTotal",  titleShort:"太阳能发电", level:"",  figNum:"25",  lifeTime:"20",  price:"400000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"太阳能发电设备上没有诸如电动机之类的部件，只要安装太阳能板就能发电。因此使用寿命长，维修简单。其中的交直流转换器需要每十年更换一次。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mTOhems'] = { mid:"2",  name:"mTOhems",  title:"安装家庭智能控制系统",  easyness:"1",  refCons:"consTotal",  titleShort:"安装家庭智能控制系统", level:"",  figNum:"3",  lifeTime:"20",  price:"200000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"HEMS(家庭能源管理系统)是家用的电量测量系统。帮助用户精确掌握家电的每小时耗电量，也可以对空调等家电进行自动控制，达到节电目的。该系统可为用户提供有关家电的耗电方式的信息，节电小窍门。用户可根据系统所显示的图表查看家庭的高耗电时间段，寻找耗电原因。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mTOsolarSmall'] = { mid:"3",  name:"mTOsolarSmall",  title:"将太阳能发电板安装在阳光照射充足的地方",  easyness:"2",  refCons:"consTotal",  titleShort:"太阳能发电板", level:"",  figNum:"25",  lifeTime:"10",  price:"50000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"这里提到的太阳能设备不是安装在屋顶上，而是可放置在阳台上为照明供电的可移动式小型面板。相关产品可在市场上买到，用户也可以自己动手制作。材料可在网上或建材市场买到。就像在晴天晒被褥一样，可通过日照给电池充电，再对充电获取的电力加以利用。但在阴天等阳光不足的条件下可能无法供电。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWecocute'] = { mid:"101",  name:"mHWecocute",  title:"使用高效节能的热水器",  easyness:"2",  refCons:"consHWsum",  titleShort:"高效节能的热水器", level:"",  figNum:"8",  lifeTime:"10",  price:"400000",  roanShow:"1",  standardType:"電気温水器",  subsidy :"",  advice:"Eco-cute（冷媒热泵式电气热水器）上带有类似空调室外机的设备，因此可利用户外空气中的热能来烧开水，比电热水器效果增加3倍以上。推荐给家庭人口多，每天都必须泡澡的家庭使用。另外，可根据日常的用水方式设置节约模式，还可以更加节能。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWecojoze'] = { mid:"102",  name:"mHWecojoze",  title:"使用高效节能的煤气热水器",  easyness:"2",  refCons:"consHWsum",  titleShort:"高效节能的煤气热水器", level:"",  figNum:"10",  lifeTime:"10",  price:"200000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"Eco-jouzu（潜热回收型热水器）可回收散失的水蒸气中的热量，和现有的燃气热水器相比效率增加10%。体积与现有的燃气热水器几乎相等，只是为了回收热量的缘故体积稍大一些，另外该热水器带有引水导管，引出回收热气时产生的水分。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWecofeel'] = { mid:"103",  name:"mHWecofeel",  title:"###not show##使用高效节能的热水器",  easyness:"1",  refCons:"consHWsum",  titleShort:"高效节能的热水器", level:"",  figNum:"10",  lifeTime:"10",  price:"250000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"Eco-feel（潜热回收型热水器）可回收散失的水蒸气中的热量，和现有的煤油热水器相比效率增加10%。体积与现有的煤油热水器几乎相等，只是为了回收热量的缘故体积稍大一些，该热水器也带有引水管，引出回收热气时产生的水分。类似的使用燃气的设备称为Eco-jouzu。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWenefarm'] = { mid:"105",  name:"mHWenefarm",  title:"###not show#使用高效节能的热水器",  easyness:"0.5",  refCons:"consHWsum",  titleShort:"高效节能的热水器", level:"5",  figNum:"10",  lifeTime:"10",  price:"1200000",  roanShow:"1",  standardType:"エコジョーズ",  subsidy :"",  advice:"Ene-farm使用燃料电池边发电边烧开水，效率很高。所生产的电力不但可供家庭消费，发电产生的余热还可以洗澡水的形式储存起来使用。更适用于用电量大烧水量大的家庭，节能效果显著。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWsolarHeater'] = { mid:"106",  name:"mHWsolarHeater",  title:"安装太阳能热水器",  easyness:"1",  refCons:"consHWsum",  titleShort:"太阳能热水器", level:"",  figNum:"9",  lifeTime:"10",  price:"400000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"在温暖月份的晴天，仅用太阳能就可以烧开泡澡用水。在冬季可以将太阳能加热过的水再加热后使用，大幅削减烧洗澡水的能耗。因为构造比较简单，可将洗澡水烧开，降低碳排放量，在世界各地都被广泛采用。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWsolarSystem'] = { mid:"107",  name:"mHWsolarSystem",  title:"安装太阳能系统",  easyness:"1",  refCons:"consHWsum",  titleShort:"太阳能系统", level:"",  figNum:"9",  lifeTime:"10",  price:"600000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"由于这款热水器的蓄水槽是放置在地面，而不是被摆放在屋顶，因此不会增加屋顶的负荷。在气温较高的晴天，仅用太阳能就可以烧开泡澡用水。在冬天可以将太阳能加热过的水再加热后使用，大幅削减烧洗澡水的能耗。因为构造比较简单，供热效果好，在世界各地都被广泛采用。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWshowerHead'] = { mid:"108",  name:"mHWshowerHead",  title:"使用节水花洒",  easyness:"5",  refCons:"consHWshower",  titleShort:"节水花洒", level:"",  figNum:"11",  lifeTime:"10",  price:"2000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"这款花洒的头部是可更换的。节水花洒的出水孔设计得比较小，因此水势强大。另外还带有止水按钮。它可以节约30%左右水量。在电器店或者网上可以买。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWshowerTime'] = { mid:"109",  name:"mHWshowerTime",  title:"每个人每天少淋浴一分钟",  easyness:"4",  refCons:"consHWshower",  titleShort:"每个人每天少淋浴一分钟", level:"",  figNum:"11",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"淋浴的耗电量很大，持续出水状态下的耗电量相当于300台电视机用电量。即使停用很短时间，也能够达到省电效果。可在涂抹浴液时关闭水流，注意减少用水时间。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWshowerTime30'] = { mid:"110",  name:"mHWshowerTime30",  title:"减少30%的淋浴时间",  easyness:"3",  refCons:"consHWshower",  titleShort:"减少30%的淋浴时间", level:"",  figNum:"11",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"淋浴的耗电量很大，持续出水状态下的耗电量相当于300台电视机用电量。即使停用很短时间，也能够达到省电效果。可在涂抹浴液时关闭水流，注意减少用水时间。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWkeep'] = { mid:"111",  name:"mHWkeep",  title:"###not show#为了不要再加热，家人都连续不断洗澡",  easyness:"3",  refCons:"consHWtub",  titleShort:"不要再烧洗澡水", level:"",  figNum:"12",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"洗澡水温度过低时，需要将洗澡水从浴缸取出，送到热水器进行再次加热。送水过程会导致水温降低，消耗更多电量。所以让家人一个紧接一个洗澡，不使用二次加热功能，可以达到节能效果。另外，通过给浴缸加上盖板，也可以防止水温快速降低。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWsaveMode'] = { mid:"112",  name:"mHWsaveMode",  title:"###not show#将热水器设置为节能模式",  easyness:"3",  refCons:"consHWsum",  titleShort:"将热水器设置为节能模式", level:"",  figNum:"8",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"Eco-cute（冷媒热泵式电气热水器）可以设定夜晚的烧开水量。如果因为担心不够用而额外多烧水，在保温状态下会增加热量损失。在正常使用的情况下，尤其是日常使用不存在不够用的问题时，通过设置节约模式，达到节能目的。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWstopAutoKeep'] = { mid:"113",  name:"mHWstopAutoKeep",  title:"#####如果洗澡完后没人继续洗澡，不要自动保温，而即将有人洗澡之前再加热",  easyness:"3",  refCons:"consHWtub",  titleShort:"不要自动保温", level:"",  figNum:"12",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"自动保温模式下，由于浴缸里的水会被不断的输送到屋外的热水器去加热，造成了管道部分的热量浪费。可以让家人一个接一个的去泡澡，这样就无需设置保温。如果大家的洗澡时间不一样，可以在泡澡前进行再次加热，节约能源。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWinsulation'] = { mid:"114",  name:"mHWinsulation",  title:"#####改装绝热型浴缸",  easyness:"1",  refCons:"consHWtub",  titleShort:"绝热型浴缸", level:"",  figNum:"12",  lifeTime:"10",  price:"600000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"现在越来越多浴缸配备了发泡沫苯乙烯等阻热材料的盖板，防止水温快速下降。虽然用户需要对浴缸进行改造，但改造后可以避免水温下降，不需要二次加热。由于改造成一体化浴室，整个浴室内的热量不会轻易散失。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWonlyShower'] = { mid:"115",  name:"mHWonlyShower",  title:"#####夏天浴缸不要放满热水，泡淋浴就够",  easyness:"3",  refCons:"consHWtub",  titleShort:"夏天泡淋浴", level:"",  figNum:"11",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"给浴缸加满水相当于10～20分钟的淋浴时间。如果不使用自动充水设备，只用浴缸里的水洗澡的家庭，水量反倒多，可和淋浴同时使用的话使用浴缸的水量会减少。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWdishTank'] = { mid:"116",  name:"mHWdishTank",  title:"冲洗餐具的时候，请不要一直开着水龙头",  easyness:"2",  refCons:"consHWdishwash",  titleShort:"不要流水一直冲洗餐具 ", level:"",  figNum:"13",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"在用洗涤剂洗碗时停用热水，请尽可能想办法缩短开水龙头的时间。先用旧布擦拭油腻部分再用水洗会更快捷。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWdishWater'] = { mid:"117",  name:"mHWdishWater",  title:"水温可以接受的季节，请使用冷水冲洗餐具蔬果",  easyness:"2",  refCons:"consHWdishwash",  titleShort:"洗餐具使用冷水", level:"",  figNum:"13",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"在气温较高的季节，不用热水也可以充分洗净餐具。比如洗碗使用10分钟热水仅相当于使用电水壶烧三壶水的能耗。先用旧布擦拭油腻部分再用水洗会更快捷。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCKdishWasher'] = { mid:"118",  name:"mCKdishWasher",  title:"使用洗碗机",  easyness:"2",  refCons:"consHWdishwash",  titleShort:"洗碗机", level:"",  figNum:"15",  lifeTime:"10",  price:"80000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"与使用流动的热水洗碗相比，洗碗机因为是蓄水式洗碗，所以更加节能。直接用冷水洗碗比洗碗机更节能。因此手工洗碗也是节能的好方法。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWtap'] = { mid:"119",  name:"mHWtap",  title:"在厨房和洗手间安装节水水龙头",  easyness:"2",  refCons:"consHWsum",  titleShort:"节水水龙头", level:"",  figNum:"13",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"使用新型水龙头，比如伸手出水型的感应式龙头，或者冷热混水型龙头（必须向左拧才会出热水），用起来都很方便，但可以减少20%以上的热水用量。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWreplaceToilet5'] = { mid:"120",  name:"mHWreplaceToilet5",  title:"安装节水型座便器",  easyness:"1",  refCons:"consHWtoilet",  titleShort:"节水型座便器", level:"",  figNum:"19",  lifeTime:"10",  price:"30000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"虽然需要施工更换坐便器，但用水量可比普通座便器减少一半以上。水费会大幅度降低。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWreplaceToilet'] = { mid:"121",  name:"mHWreplaceToilet",  title:"使用瞬间温水式马桶",  easyness:"1",  refCons:"consHWtoilet",  titleShort:"瞬间温水式马桶", level:"",  figNum:"19",  lifeTime:"10",  price:"30000",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"新产品具有节能功能，比如在我打开盖子的瞬间升温的类型，它需要较少的电力消耗。请选择节能的全年用电量，这显示在目录中作为参考。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHWtemplatureToilet'] = { mid:"122",  name:"mHWtemplatureToilet",  title:"降低保温马桶温度",  easyness:"3",  refCons:"consHWtoilet",  titleShort:"设定马桶温度", level:"",  figNum:"19",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"时间不冷或关闭隔热，您可以通过设置温度设置为较低的节约能源。应用在马桶座盖，这将是很难感觉到寒冷。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHWcoverTilet'] = { mid:"123",  name:"mHWcoverTilet",  title:"关保温马桶盖",  easyness:"3",  refCons:"consHWtoilet",  titleShort:"关保温马桶盖", level:"",  figNum:"19",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"如果您离开该国提出的马桶座圈的盖，热量可能逃走隔热，功耗也会增加。当您完成使用时，它会通过关闭盖子节约能源。如果没有寒冷，也导致节能，你不想要的温暖。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mACreplace'] = { mid:"201",  name:"mACreplace",  title:"使用一级能耗的空调",  easyness:"1",  refCons:"consAC",  titleShort:"一级能耗的空调", level:"",  figNum:"1",  lifeTime:"10",  price:"160000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"买换空调的时候，推荐选择一级能耗空调。供暖性能更高，与使用燃气或煤油的取暖设备相比，减少了二氧化碳排放。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mACreplaceHeat'] = { mid:"202",  name:"mACreplaceHeat",  title:"使用节能空调取暖功能要不要加“开集中供暖之前”",  easyness:"2",  refCons:"consAC",  titleShort:"节能空调取暖", level:"",  figNum:"1",  lifeTime:"10",  price:"160000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"现在有很多一级能耗空调使用的是户外空气中的热量，与使用燃气或煤油的取暖设备相比，减少了二氧化碳排放。买换空调的时候，请选择一级能耗空调。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mACchangeHeat'] = { mid:"203",  name:"mACchangeHeat",  title:"使用空调取暖功能要不要加“开集中供暖之前”",  easyness:"2",  refCons:"consACheat",  titleShort:"空调取暖", level:"",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"由于空调取暖使用的是户外空气中的热量，与使用燃气或煤油的取暖设备相比，可大幅减少二氧化碳排放。但使用空调取暖时，暖风必须吹到地板才能达到取暖效果，所以建议设定强风模式或者使用扇子扇风。另外，最近的新型空调都增加了吹热地板的功能，推荐使用。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTchangeHeat'] = { mid:"204",  name:"mHTchangeHeat",  title:"使用空调取暖功能要不要加“开集中供暖之前”",  easyness:"1",  refCons:"consHTsum",  titleShort:"空调取暖", level:"",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"空调采暖会使用室外空气中的热量，与燃气或煤油供暖相比，可大幅减少二氧化碳的排放，削减采暖费用。但使用空调取暖时，暖风必须吹到地板才能达到取暖效果，所以建议设定强风模式或使用扇子扇风。另外，最近的新型空调都增加了吹热地板的功能，推荐使用。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCOsunCut'] = { mid:"205",  name:"mCOsunCut",  title:"夏天，开空调时，用遮光帘隔热",  easyness:"4",  refCons:"consCOsum",  titleShort:"遮光帘", level:"",  figNum:"1",  lifeTime:"5",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"开空调时如果阳光照入室内，就好像窗户边上放了个烤炉一样。遮蔽阳光会更节能，更凉快。使用普通窗帘会导致窗户内侧的窗帘被烤热，因此推荐使用百叶窗或竹帘。另外，如果从5月份开始种植苦瓜、牵牛花、丝瓜等植物，夏天会形成美丽的“绿色窗帘”，使人舒适度夏。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCOtemplature'] = { mid:"206",  name:"mCOtemplature",  title:"夏天空调调到26度",  easyness:"3",  refCons:"consACcool",  titleShort:"空调设定26度（夏天）", level:"",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"夏季的空调推荐温度为26度以上。设置温度的目标是“不热就行”而不是“越凉快越好”。因为暑热感觉有个体差异，设置温度时无需勉强，也可以多使用电扇、或少穿些衣服。开窗通风、风铃的声音都会使人感觉凉爽。空调温度每调高1度，就可以减少约10%的二氧化碳排放量。可以在夏季快结束时早些停用空调，达到减排效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTtemplature'] = { mid:"207",  name:"mHTtemplature",  title:"冬天空调取暖不要高于20度",  easyness:"3",  refCons:"consACheat",  titleShort:"空调设定20度（冬天）", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"冬天的空调推荐温度为20度以下。设置温度的目标是“不冷就行”而不是“越热越好”。因为寒冷感觉有个体差异，设置温度时无需勉强，还可以在家多穿衣服，吃容易让身体发热的饭食。空调温度每调低1度，就可以减少约10%的二氧气化碳排放量。可以在冬季快结束时提前停用暖气设备，达到减排效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTwindowSheet'] = { mid:"208",  name:"mHTwindowSheet",  title:"开空调取暖时，将绝热材料贴在窗户上",  easyness:"3",  refCons:"consACheat",  titleShort:"窗户贴绝热材料", level:"",  figNum:"4",  lifeTime:"3",  price:"3000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"绝热材料（类似气泡膜那样的材料）在网上或者家装市场上可以买到。清洁窗户并喷雾后，直接将绝热材料贴在窗户，不仅绝热还防止结露。使窗外吹进的冷风变得柔和，令人感到更舒适。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTdouble'] = { mid:"209",  name:"mHTdouble",  title:"将单层窗户更换为多层窗",  easyness:"1",  refCons:"consACheat",  titleShort:"多层窗", level:"5",  figNum:"4",  lifeTime:"30",  price:"100000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"取暖时室内热气容易从窗户或者窗框散失，将单层玻璃更换为双层玻璃可以减少一半的热量损失。不仅节能，还可以防止结露。使窗外吹进的冷风变得柔和，令人感到更舒适。针对不同房屋结构有不同的解决方案。具体请咨询装修公司或者自然之友低碳家庭实验室。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTlowe'] = { mid:"210",  name:"mHTlowe",  title:"将窗户更换为low-E玻璃，窗框换树脂制品",  easyness:"1",  refCons:"consACheat",  titleShort:"low-E玻璃，树脂窗框", level:"",  figNum:"4",  lifeTime:"30",  price:"150000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"取暖时室内热气容易从窗户或者窗框散失，将普通双层玻璃更换为low-E玻璃，将窗框更换为树脂制品可减少一半的热量散失。与一般的双层玻璃相比，low-E玻璃绝热性能高，减少了从窗框散失出去的热气，不仅绝热而且防止结露。针对不同房屋结构有不同的解决方案。具体请咨询装修公司或者自然之友低碳家庭实验室。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTuchimado'] = { mid:"211",  name:"mHTuchimado",  title:"安装内部窗户听说中国的情况，想改换使用多层玻璃，将原来的单层玻璃打掉后重新安装多层玻璃，不加另一个玻璃，是不是？如果这话没错，我觉得不要这个推荐方式",  easyness:"2",  refCons:"consACheat",  titleShort:"多层窗", level:"5",  figNum:"4",  lifeTime:"30",  price:"60000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"取暖时室内热气容易从窗户或者窗框散失。可在现有窗户或窗框内侧增加一个“内窗”，解决此类问题。内窗安装费便宜，一个小时即可完成施工，有防止结露和防盗效果。具体请咨询装修公司或者自然之友低碳家庭实验室。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTdoubleGlassAll'] = { mid:"212",  name:"mHTdoubleGlassAll",  title:"将家里所有的窗户都更换为多层玻璃",  easyness:"1",  refCons:"consHTsum",  titleShort:"所有的房间使用多层玻璃", level:"",  figNum:"4",  lifeTime:"30",  price:"100000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"取暖时热气从窗户或者窗框容易出去。将单层玻璃更换为双层玻璃可以减少一半的热量散失。不仅节能而且防止结露。使窗外吹进的冷风变得柔和，减少冬季早晨的风寒感觉。针对不同房屋结构有不同的解决方案。具体请咨询装修公司或者自然之友低碳家庭实验室。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTuchimadoAll'] = { mid:"213",  name:"mHTuchimadoAll",  title:"家里所有的窗户安装内部窗户听说中国的情况，想改换使用多层玻璃，将原来的单层玻璃打掉后重新安装多层玻璃，不加另一个玻璃，是不是？如果这话没错，我觉得不要这个推荐方式",  easyness:"1",  refCons:"consHTsum",  titleShort:"所有的房间安装内部窗户", level:"",  figNum:"4",  lifeTime:"30",  price:"100000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"取暖时室内热气容易从窗户或者窗框散失。可在现有窗户或窗框内侧增加一个“内窗”，解决此类问题。内窗安装费便宜，一个小时即可完成施工，有防止结露和防盗效果。使窗外吹进的冷风变得柔和，减少冬季早晨的风寒感觉。具体请咨询装修公司或者自然之友低碳家庭实验室。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTloweAll'] = { mid:"214",  name:"mHTloweAll",  title:"将家里所有的窗户都更换为low-E玻璃和树脂窗框",  easyness:"1",  refCons:"consHTsum",  titleShort:"所有的房间使用low-E玻璃和树脂窗框", level:"",  figNum:"4",  lifeTime:"30",  price:"150000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"取暖时热气从窗户或者窗框容易出去。将单层玻璃窗更换为low-E玻璃窗，将窗框更换为树脂产品可减少一半的热量散失。low-E玻璃窗与普通双层玻璃窗相比，绝热性能高，而且可以减少从窗框流失的热气。不仅节能还防止结露。从窗外吹进的冷风会变得柔和，减少冬季早晨的风寒感觉。针对不同家庭有不同的解决方案，具体请咨询装修公司或者自然之友低碳家庭实验室。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mACfilter'] = { mid:"215",  name:"mACfilter",  title:"清洁空调过滤器",  easyness:"2",  refCons:"consACheat",  titleShort:"清洁过滤器", level:"5",  figNum:"1",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"推荐一个月清洗一次空调过滤器。过滤网堵塞了会导致送风强度减弱，降低空调供暖效率。厨房或靠近厨房的房间容易沾上油污，过滤网很容易脏，所以需要仔细清洁。有些新款空调已经带有了过滤网自动清洁功能。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTtime'] = { mid:"216",  name:"mHTtime",  title:"缩短空调使用时间要不要加“开集中供暖之前”",  easyness:"3",  refCons:"consACheat",  titleShort:"缩短空调使用时间", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"人们一般容易长时间的开空调取暖，建议房间变暖后关闭空调。也可以在临睡或外出前30分钟关闭空调。没人的房间开空调非常浪费，请尽量避免这种情况。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTpartialHeating'] = { mid:"217",  name:"mHTpartialHeating",  title:"为了少用空调，使用电热地毯或日式取暖桌中国都没有或很少哈",  easyness:"2",  refCons:"consACheat",  titleShort:"电热地毯和日式取暖桌", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"使用取暖桌或电热地毯只加热身体周边的温度，耗电量比较小。这时把空调采暖温度调低，也不会降低体感舒适度。假如在空调取暖的房间里建有通风结构或复式结构的楼梯，这种结构很容易造成热气流上升，好不容易加热的空气跑到屋顶，降低了室内增温效率。针对这样的房间可考虑使用地暖，另外还可以穿袜子，多穿衣服来应对。使用电热地毯时将铝膜绝热材料铺在地板和垫子的中间，给取暖桌配备厚被子，都可以达到省电效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTceiling'] = { mid:"218",  name:"mHTceiling",  title:"取暖时循环上面的空气",  easyness:"2",  refCons:"consACheat",  titleShort:"循环空气", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"空调取暖时，天棚温度经常比地板温度高出5～10度。用扇子、空气循环设备、电风扇等向上吹风加速空气流动，使屋顶的暖空气回流到地面，增加舒适度。穿袜子或多穿衣服也可达到保暖效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTareaLimit'] = { mid:"219",  name:"mHTareaLimit",  title:"取暖时关门，缩小供暖范围",  easyness:"2",  refCons:"consACheat",  titleShort:"缩小供暖范围", level:"5",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"房间面积越大取暖用电量越高，因此用推拉门、隔断门将房间分隔成较小的空间，即便使用小功率取暖设备也可以达到效果。相反带有通风结构的房间或层高很高的房间，就需要更多的供暖。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTdanran'] = { mid:"220",  name:"mHTdanran",  title:"一家人聚在一个房间取暖",  easyness:"3",  refCons:"consHTsum",  titleShort:"一家人聚在一个房间取暖", level:"",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"如果家里每个人都待在自己的房间里，那么每个房间都需要开灯开空调。大家聚在一个房间里可以减少空调、照明的使用量。因此可以尝试都聚在一个房间里娱乐休息，达到节能目标。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTbiomass'] = { mid:"221",  name:"mHTbiomass",  title:"使用木柴取暖炉（颗粒壁炉）在中国有吗？ 日本也很少哈",  easyness:"1",  refCons:"consACheat",  titleShort:"木柴取暖炉（颗粒壁炉）", level:"",  figNum:"3",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mHTcentralNotUse'] = { mid:"222",  name:"mHTcentralNotUse",  title:"不使用的集中供暖设定低温",  easyness:"2",  refCons:"consHTsum",  titleShort:"集中供暖设定低温", level:"5",  figNum:"3",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"如果你使用集中供暖，无人的房间也会有供暖。完全关闭无人房间的供暖又可能带来结露、冻结的问题。可以给无人房间设置一个较低温度以减少浪费。有人房间的暖气推荐温度是20度。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mHTkanki'] = { mid:"223",  name:"mHTkanki",  title:"安装全热交换器",  easyness:"1",  refCons:"consHTsum",  titleShort:"全热交换器", level:"",  figNum:"3",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"换气设备导致了暖气的流失。选择可回收热量减少流失量的换气设备，可大幅度减少热气损失。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mPTstopPot'] = { mid:"301",  name:"mPTstopPot",  title:"不使用电水壶保温中国流行保温性电水壶吗？",  easyness:"2",  refCons:"consCKpot",  titleShort:"不使用电水壶保温", level:"",  figNum:"17",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"电水壶在保温时会额外消耗电量。请根据需要烧水或使用保温杯。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mPTstopPotNight'] = { mid:"302",  name:"mPTstopPotNight",  title:"出门时或夜间不使用电水壶保温中国流行保温性电水壶吗？",  easyness:"3",  refCons:"consCKpot",  titleShort:"夜间关闭电水壶保温功能", level:"",  figNum:"17",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"外出或夜间等长时间不使用热水时，关闭电水壶的电源也可以节能。关闭电饭锅、坐便器的的保温功能也同样可以达到节能效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mPTstopRiceCooker'] = { mid:"303",  name:"mPTstopRiceCooker",  title:"不使用电饭煲保温",  easyness:"3",  refCons:"consCKrice",  titleShort:"不使用电饭煲保温", level:"",  figNum:"18",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"加热饭菜时，用微波炉加热比用电饭锅保温更加省电。长时间保温可能导致米饭变色，常温保温的米饭会更好吃。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mPTreplacePot'] = { mid:"304",  name:"mPTreplacePot",  title:"使用节能电水壶中国流行保温性电水壶吗？",  easyness:"2",  refCons:"consCKpot",  titleShort:"节能电水壶", level:"",  figNum:"17",  lifeTime:"",  price:"",  roanShow:"",  standardType:"既存型",  subsidy :"",  advice:"市场上有带有类似保温瓶隔热结构的电水壶，可降低保温时的用电量。购买时可参考店家提供的产品保温耗电量信息。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mCKflame'] = { mid:"305",  name:"mCKflame",  title:"火焰不要超出锅外围",  easyness:"2",  refCons:"consCKcook",  titleShort:"调整火焰", level:"",  figNum:"14",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"烧菜时火焰超出锅外围不仅带来燃气浪费，也不能缩短烧菜时间。请注意调节火焰大小。合理的烧菜步骤也可以减少煤气消费量。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mDRsolar'] = { mid:"401",  name:"mDRsolar",  title:"晴天不用干衣机，在阳光下暴晒",  easyness:"2",  refCons:"consDRsum",  titleShort:"在阳光下曝晒", level:"",  figNum:"16",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"洗衣机的烘干功能虽然方便，但耗电量却是洗衣时的10倍以上。尽量不用烘干功能，直接在阳光下晾晒可达到节能效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mDRheatPump'] = { mid:"402",  name:"mDRheatPump",  title:"使用热泵式洗衣干衣机",  easyness:"1",  refCons:"consDRsum",  titleShort:"热泵式洗衣干衣机", level:"",  figNum:"16",  lifeTime:"10",  price:"140000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"在衣物烘干机或带有烘干功能的洗衣机设备中，有一种热泵式烘干机，耗电量只是普通烘干机的一半，使用热泵式烘干机可以减少电费支出。但由于烘干本身就是高能耗功能，所以最好是不使用烘干功能，改为阳光下晾晒。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mLIceilingLED'] = { mid:"501",  name:"mLIceilingLED",  title:"将荧光灯更换为LED灯",  easyness:"4",  refCons:"consLI",  titleShort:"LED灯", level:"",  figNum:"6",  lifeTime:"20",  price:"",  roanShow:"",  standardType:"蛍光灯",  subsidy :"",  advice:"LED灯的节能性好，经久耐用。没有虫子进入灯罩的问题，可节省清洁时间。安装LED灯时需要去除原来的照明灯具，因为可以继续使用原有灯具的插座，所以不需要请专业技工，使用LED灯还可以调节灯光颜色和亮度。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mLILED'] = { mid:"502",  name:"mLILED",  title:"改为使用LED",  easyness:"2",  refCons:"consLI",  titleShort:"LED灯", level:"",  figNum:"5",  lifeTime:"40000h",  price:"2000",  roanShow:"",  standardType:"電球",  subsidy :"",  advice:"安装LED灯时可直接使用原有白炽灯的插座，因此可以在更换灯泡时直接把原来的白炽灯换为LED灯。这样可减少80%的耗电量，使用寿命是原来的40倍以上。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mLIsensor'] = { mid:"503",  name:"mLIsensor",  title:"使用人体感应灯这是日本独特情况。晚上为了防止小偷，开门口的灯泡。但我觉得中国版不需要。",  easyness:"2",  refCons:"consLI",  titleShort:"人体感应灯", level:"",  figNum:"5",  lifeTime:"10",  price:"",  roanShow:"",  standardType:"電球",  subsidy :"",  advice:"住宅大门口的照明，和一直亮着灯相比，来人时亮灯的防范效果更好。而且开灯时间短，可以大幅减少耗电量。在走廊里也可以设置这样的人体感应灯，仅在人通过时亮灯，非常实用有效。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mLItime'] = { mid:"504",  name:"mLItime",  title:"减少开灯时间",  easyness:"3",  refCons:"consLI",  titleShort:"减少开灯时间", level:"",  figNum:"6",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"只要开灯就会耗电，所以勤关灯就可以节能。离开房间时随手关灯是好习惯。开着灯睡觉也容易影响睡眠，不利于身体健康。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mLIoff'] = { mid:"505",  name:"mLIoff",  title:"出门时关灯",  easyness:"4",  refCons:"consLI",  titleShort:"熄灯", level:"",  figNum:"6",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"离开房间时随手关灯，哪怕还会回来。毕竟只要开灯就会费电，所以随手关灯，举手之劳就可以更加节能。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mTVreplace'] = { mid:"601",  name:"mTVreplace",  title:"改为使用节能电视",  easyness:"2",  refCons:"consTV",  titleShort:"节能电视", level:"",  figNum:"7",  lifeTime:"10",  price:"40000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"最近电视机的节能性越来越高，同样尺寸的电视机，新产品的耗电量只有老产品的一半，购买时请尽量选择年均电费更低的产品。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mTVradio'] = { mid:"602",  name:"mTVradio",  title:"不用看电视而听收音机",  easyness:"1",  refCons:"consTVsum",  titleShort:"收音机", level:"",  figNum:"7",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"收音机的耗电量只有电视的1%～10%。如果你是因为无聊才开着电视的话，可以把一半时间换成收音机或CD机试试。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mTVtime'] = { mid:"603",  name:"mTVtime",  title:"缩短看电视时间",  easyness:"3",  refCons:"consTV",  titleShort:"缩短看电视时间", level:"",  figNum:"7",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"先想好要看哪个节目，看完后立刻关电视。一直开着电视，就会一个接一个节目的看下去。用电视机打游戏也容易玩很长时间，可以试试减少时间。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mTVbright'] = { mid:"604",  name:"mTVbright",  title:"将电视屏幕要调暗",  easyness:"2",  refCons:"consTV",  titleShort:"调节电视亮度", level:"",  figNum:"7",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"新出的电视机有调节屏幕亮度的功能。电视机在销售时一般屏幕会被调得很亮，直接放在家里用会过于刺眼，并且耗电量高。调暗屏幕可减少20%～40%的耗电量。有些新产品自带亮度感应器，可自动调节亮度。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mRFreplace'] = { mid:"701",  name:"mRFreplace",  title:"使用节能冰箱",  easyness:"2",  refCons:"consRF",  titleShort:"节能冰箱", level:"",  figNum:"2",  lifeTime:"10",  price:"150000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"与以前的冰箱相比，现在的节能型冰箱的耗电量只有过去的一半。购买时请选择一级能耗产品。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mRFstop'] = { mid:"702",  name:"mRFstop",  title:"停用另一个冰箱",  easyness:"2",  refCons:"consRF",  titleShort:"使用一个冰箱", level:"",  figNum:"2",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"如果你同时使用2台以上的冰箱，请停用1台。小型冰箱的耗电量和大型冰箱是差不多的。闲置在那里可能会让你感到可惜，但只要开着就会给环境带来负担，因此建议减少使用。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mRFwall'] = { mid:"703",  name:"mRFwall",  title:"从墙离开冰箱",  easyness:"4",  refCons:"consRF",  titleShort:"从墙离开冰箱", level:"",  figNum:"2",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"放置冰箱时一般要和墙壁间隔5厘米。因为冰箱需要从侧面或顶部散热，如果紧贴墙壁，不利于散热，还会增加10%的耗电量。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mRFtemplature'] = { mid:"704",  name:"mRFtemplature",  title:"冰箱内温度不要调太低",  easyness:"4",  refCons:"consRF",  titleShort:"调节冰箱温度", level:"",  figNum:"2",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"冰箱具有温控功能，从强到中，从中到弱，每调低1档都能减少约10%的耗电量。但食品腐败程度也会加快。如果没有太大问题，可以适当调节温度达到节能效果。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCRreplace'] = { mid:"801",  name:"mCRreplace",  title:"出了电动汽车以外，随着技术提高，",  easyness:"2",  refCons:"consCR",  titleShort:"节能车", level:"",  figNum:"21",  lifeTime:"8",  price:"1800000",  roanShow:"",  standardType:"普及型",  subsidy :"",  advice:"除了混合动力汽车、电动汽车以外，随着技术进步，新上市的低燃油型汽车的耗油量仅为原来的的一半，推荐购买。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mCRreplaceElec'] = { mid:"802",  name:"mCRreplaceElec",  title:"改为使用电动汽车",  easyness:"1",  refCons:"consCR",  titleShort:"电动汽车", level:"",  figNum:"21",  lifeTime:"7",  price:"3000000",  roanShow:"",  standardType:"",  subsidy :"",  advice:"电动汽车使用充电式电池存储电力，用发动机替代汽车引擎来驱动汽车，和汽车引擎相比效率高，实用性好。但目前充电站不够普及，充电时间长，因此推荐在夜间充电。",   lifestyle:"",   season:"wss"};
	D6.scenario.defMeasures['mCRecoDrive'] = { mid:"803",  name:"mCRecoDrive",  title:"车子没有行进的情况下，熄火",  easyness:"3",  refCons:"consCRsum",  titleShort:"节能驾驶", level:"",  figNum:"21",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"等红绿灯时熄火节省燃油，平缓启动汽车，可减少10%的能耗。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCRtrain'] = { mid:"804",  name:"mCRtrain",  title:"使用地铁、公交车等公共交通",  easyness:"2",  refCons:"consCRtrip",  titleShort:"公共交通", level:"",  figNum:"22",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"如果只是2公里左右的短距离且天气状况好时，推荐骑自行车或步行前往，还有益于身体健康。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCR20percent'] = { mid:"805",  name:"mCR20percent",  title:"减少20%的汽车使用率",  easyness:"1",  refCons:"consCRtrip",  titleShort:"少开车", level:"",  figNum:"22",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"开车需要更多能耗，不是特别必须的情况下，建议减少用车。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mCRwalk'] = { mid:"806",  name:"mCRwalk",  title:"去附近不用开车，骑自行车或走路",  easyness:"2",  refCons:"consCRtrip",  titleShort:"骑车或走路", level:"",  figNum:"22",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"如果只是2公里左右的短距离且天气状况好时，推荐骑自行车或步行前往，还有益于身体健康。",   lifestyle:"1",   season:"wss"};
	D6.scenario.defMeasures['mPTstopPlug'] = { mid:"901",  name:"mPTstopPlug",  title:"将插头从插座里拨下，减少待机电量",  easyness:"3",  refCons:"consTotal",  titleShort:"待机电量", level:"",  figNum:"20",  lifeTime:"",  price:"",  roanShow:"",  standardType:"",  subsidy :"",  advice:"电视机、录像机、空调等在不使用时也会耗电。特别是5年前的老产品，长时间不使用时可将插头从插座拨下。注意要先用遥控器关闭空调，确认叶片停止摆动后再拔出插头。新产品的待机耗电量和从前相比已经大幅降低，不太需要这样的操作。",   lifestyle:"1",   season:"wss"};

	D6.scenario.defInput["i010"] = {  cons:"consTotal",  title:"作为对策重视的观点",  unit:"",  text:"优先考虑哪个因素？", inputType:"sel010", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel010"]= [ "请选择", "优先减少二氧化碳排放量", "优先省钱", "优先简单", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel010']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i001"] = {  cons:"consTotal",  title:"家庭人口",  unit:"人",  text:"您家一共几口人共同居住（包括您本人）", inputType:"sel001", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"2",d12t:"2",d12p:"1",d13t:"1",d13p:"0",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel001"]= [ "请选择", "1人", "2人", "3人", "4人", "5人", "6人", "7人", "8人", "9或更多的人", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel001']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', '', '', '', '', '' ];
	D6.scenario.defInput["i002"] = {  cons:"consTotal",  title:"房屋种类",  unit:"",  text:"您家是小区楼房还是独栋建筑？", inputType:"sel002", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"2",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel002"]= [ "请选择", "独栋建筑", "小区楼房", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel002']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i003"] = {  cons:"consTotal",  title:"房屋面积",  unit:"m2",  text:"您家的面积多大？请选择最接近的值。", inputType:"sel003", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"150",d11p:"0",d12t:"100",d12p:"1",d13t:"0",d13p:"2",d1w:"3",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel003"]= [ "请选择", "15平方米", "30平方米", "50平方米", "70平方米", "100平方米", "120平方米", "150平方米", "200平方米以上", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel003']= [ '-1', '15', '30', '50', '70', '100', '120', '150', '220', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i004"] = {  cons:"consTotal",  title:"拥有房屋",  unit:"",  text:"您家是自己的房屋还是租房？", inputType:"sel004", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel004"]= [ "请选择", "自己的房屋", "租房", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel004']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i005"] = {  cons:"consTotal",  title:"楼层数",  unit:"",  text:"您家一共几层？如果是楼房，您住几层？", inputType:"sel005", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel005"]= [ "请选择", "一楼", "二楼", "三楼以上", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel005']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i006"] = {  cons:"consTotal",  title:"顶楼",  unit:"",  text:"您家是在最顶层吗？", inputType:"sel006", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel006"]= [ "请选择", "是", "否", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel006']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i007"] = {  cons:"consTotal",  title:"向阳",  unit:"",  text:"阳光朝向好不好？", inputType:"sel007", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"3",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel007"]= [ "请选择", "非常好", "很好", "有时不太好", "不好", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel007']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i008"] = {  cons:"consTotal",  title:"房间数",  unit:"部屋",  text:"您家共有几个房间？", inputType:"sel008", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"8",d11p:"0",d12t:"5",d12p:"1",d13t:"1",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel008"]= [ "请选择", "1个", "2个", "3个", "4个", "5个", "6个", "7个", "8个以上", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel008']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i009"] = {  cons:"consTotal",  title:"建造年数",  unit:"年",  text:"您家房屋的建筑年代？", inputType:"sel009", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel009"]= [ "请选择", "不到5年", "5 - 10年", "10 - 20年", "20年以上", "我不知道", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel009']= [ '-1', '3', '7', '13', '30', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i021"] = {  cons:"consTotal",  title:"省份",  unit:"",  text:"请选择您所在的省份。", inputType:"sel021", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i022"] = {  cons:"consTotal",  title:"",  unit:"",  text:"", inputType:"sel022", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i023"] = {  cons:"consTotal",  title:"城区还是郊区",  unit:"",  text:"您家附近交通方便吗？", inputType:"sel023", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel023"]= [ "请选择", "很方便", "还可以", "不太方便", "不方便", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel023']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i041"] = {  cons:"consTotal",  title:"窗户隔热性",  unit:"",  text:"您家窗户的隔热性能怎么样？", inputType:"sel041", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"5",d21p:"0",d22t:"4",d22p:"1",d23t:"0",d23p:"2",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel041"]= [ "请选择", "树脂窗框与三层玻璃窗", "树脂窗框与low-E玻璃窗", "树脂（铝合成）窗框与两层玻璃窗", "铝窗框与两层玻璃窗", "铝窗框与单层玻璃窗", "我不知道", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel041']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i042"] = {  cons:"consTotal",  title:"墙隔热性",  unit:"",  text:"您家的墙面隔热材料有多少厚度？", inputType:"sel042", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"100",d11p:"2",d12t:"50",d12p:"1",d13t:"",d13p:"",d1w:"2",d1d:"1", d21t:"100",d21p:"2",d22t:"50",d22p:"1",d23t:"",d23p:"",d2w:"3",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel042"]= [ "请选择", "墙含有玻璃棉200毫米", "墙含有玻璃棉150毫米", "墙含有玻璃棉100毫米", "墙含有玻璃棉50毫米", "墙含有玻璃棉30毫米", "墙没含有玻璃棉", "我不知道", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel042']= [ '-1', '200', '150', '100', '50', '30', '10', '-1', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i043"] = {  cons:"consTotal",  title:"窗隔热装修",  unit:"",  text:"您家做过窗户隔热改造吗？", inputType:"sel043", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"1",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel043"]= [ "请选择", "已全部实施", "部分实施", "未实施", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel043']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i044"] = {  cons:"consTotal",  title:"墙隔热装修",  unit:"",  text:"您做过墙、顶棚、地板的隔热改造吗？", inputType:"sel044", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"1",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel044"]= [ "请选择", "已全部实施", "部分实施", "未实施", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel044']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i051"] = {  cons:"consEnergy",  title:"安装太阳能",  unit:"",  text:"您家安装太阳能发电设备了吗？", inputType:"sel051", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"1",d11p:"2",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"4",d1d:"0", d21t:"1",d21p:"2",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"4",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel051"]= [ "请选择", "否", "是", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel051']= [ '-1', '0', '1', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i052"] = {  cons:"consEnergy",  title:"太阳能的大小",  unit:"kW",  text:"请选择您家的太阳能发电设备的功率。", inputType:"sel052", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"5",d11p:"2",d12t:"2",d12p:"1",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"5",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel052"]= [ "请选择", "未安装", "〜3千瓦", "～4千瓦", "～5千瓦", "6〜10千瓦", "超过10千瓦", "", "", "", " ", "", "", "", "", "" ];			D6.scenario.defSelectData['sel052']= [ '-1', '0', '3', '4', '5', '8', '11', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i053"] = {  cons:"consEnergy",  title:"太阳能安装年数",  unit:"",  text:"您何时安装的太阳能发电器？", inputType:"sel053", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel053"]= [ "请选择", "2010年以前", "2011-2012年", "2013年", "2014年", "2015年", "2016年", "2017年以后", "我家没安装", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel053']= [ '-1', '2010', '2011', '2013', '2014', '2015', '2016', '2017', '9999', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i054"] = {  cons:"consEnergy",  title:"您是否用煤油",  unit:"",  text:"您家是否使用煤油？", inputType:"sel054", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel054"]= [ "请选择", "是", "否", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel054']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i061"] = {  cons:"consEnergy",  title:"电费",  unit:"円",  text:"请选择每个月的大概电费。", inputType:"sel061", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"15000",d11p:"0",d12t:"10000",d12p:"1",d13t:"0",d13p:"2",d1w:"3",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel061"]= [ "请选择", "100元以内", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "", "" ];			D6.scenario.defSelectData['sel061']= [ '-1', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '', '' ];
	D6.scenario.defInput["i062"] = {  cons:"consEnergy",  title:"电力销售费用",  unit:"円",  text:"您每个月可以卖多少太阳能发电过的电量？", inputType:"sel062", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel062"]= [ "请选择", "100元", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "", "" ];			D6.scenario.defSelectData['sel062']= [ '-1', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '', '' ];
	D6.scenario.defInput["i063"] = {  cons:"consEnergy",  title:"煤气费",  unit:"円",  text:"请选择每个月的大概煤气费。", inputType:"sel063", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel063"]= [ "请选择", "不使用", "100元以内", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "" ];			D6.scenario.defSelectData['sel063']= [ '-1', '0', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '' ];
	D6.scenario.defInput["i064"] = {  cons:"consEnergy",  title:"煤油费",  unit:"円",  text:"请选择每个月的大概煤油费。", inputType:"sel064", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel064"]= [ "请选择", "不使用", "100元", "150元", "200元", "300元", "500元", "700元", "1000元", "1500元", "更多", "", "", "", "", "" ];			D6.scenario.defSelectData['sel064']= [ '-1', '0', '100', '150', '200', '300', '500', '700', '1000', '1500', '2000', '', '', '', '', '' ];
	D6.scenario.defInput["i065"] = {  cons:"consEnergy",  title:"煤球费",  unit:"円",  text:"请选择每月大概煤球费。", inputType:"sel065", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel065"]= [ "请选择", "不使用", "100元", "150元", "200元", "300元", "500元", "700元", "1000元", "1500元", "更多", "", "", "", "", "" ];			D6.scenario.defSelectData['sel065']= [ '-1', '0', '100', '150', '200', '300', '500', '700', '1000', '1500', '2000', '', '', '', '', '' ];
	D6.scenario.defInput["i066"] = {  cons:"consEnergy",  title:"区供热的使用",  unit:"円",  text:"是否使用区域供暖", inputType:"sel066", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel066"]= [ "请选择", "不使用", "使用", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel066']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i072"] = {  cons:"consEnergy",  title:"#",  unit:"",  text:"", inputType:"sel072", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel072"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel072']= [ '-1', '100', '200', '300', '400', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i073"] = {  cons:"consEnergy",  title:"#",  unit:"",  text:"", inputType:"sel073", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel073"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel073']= [ '-1', '3', '5', '8', '12', '18', '24', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i074"] = {  cons:"consEnergy",  title:"水费",  unit:"円",  text:"请选择每个月的大概水费。", inputType:"sel074", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel074"]= [ "请选择", "40元以内", "70元", "100元", "150元", "200元", "250元", "300元", "500元", "700元", "1000元", "更多", "", "", "", "" ];			D6.scenario.defSelectData['sel074']= [ '-1', '40', '70', '100', '150', '200', '250', '300', '500', '700', '1000', '1500', '', '', '', '' ];
	D6.scenario.defInput["i075"] = {  cons:"consEnergy",  title:"车油费",  unit:"円",  text:"选择的约一个月的汽油费（轻质汽油）。", inputType:"sel075", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10000",d11p:"0",d12t:"6000",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel075"]= [ "请选择", "不使用", "100元", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "" ];			D6.scenario.defSelectData['sel075']= [ '-1', '0', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '' ];
	D6.scenario.defInput["i081"] = {  cons:"consEnergy",  title:"#",  unit:"",  text:"", inputType:"sel081", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel081"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel081']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '', '', '', '' ];
	D6.scenario.defInput["i082"] = {  cons:"consEnergy",  title:"电合同",  unit:"",  text:"", inputType:"sel082", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel082"]= [ "请选择", "普通家用（收费）", "每个时区合同", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel082']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i083"] = {  cons:"consEnergy",  title:"气体类型",  unit:"",  text:"", inputType:"sel083", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel083"]= [ "请选择", "城市燃气", "液化石油气", "不使用燃气", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel083']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i091"] = {  cons:"consSeason",  title:"电费",  unit:"円",  text:"请选择每个月的大概电费。", inputType:"sel091", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel091"]= [ "请选择", "100元以内", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "", "" ];			D6.scenario.defSelectData['sel091']= [ '-1', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '', '' ];
	D6.scenario.defInput["i092"] = {  cons:"consSeason",  title:"电力销售费用",  unit:"円",  text:"", inputType:"sel092", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel092"]= [ "请选择", "100元", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "", "" ];			D6.scenario.defSelectData['sel092']= [ '-1', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '', '' ];
	D6.scenario.defInput["i093"] = {  cons:"consSeason",  title:"煤气费",  unit:"円",  text:"请选择每个月的大概煤气费。", inputType:"sel093", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel093"]= [ "请选择", "不使用", "100元以内", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "2000元", "更多", "", "", "" ];			D6.scenario.defSelectData['sel093']= [ '-1', '0', '100', '150', '200', '300', '500', '700', '800', '1000', '1500', '2000', '3000', '', '', '' ];
	D6.scenario.defInput["i094"] = {  cons:"consSeason",  title:"煤球购买量",  unit:"円",  text:"", inputType:"sel094", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel094"]= [ "请选择", "不使用", "100元", "150元", "200元", "300元", "500元", "700元", "800元", "1000元", "1500元", "更多", "", "", "", "" ];			D6.scenario.defSelectData['sel094']= [ '-1', '0', '100', '150', '200', '300', '500', '700', '1000', '1500', '2000', '', '', '', '', '' ];
	D6.scenario.defInput["i101"] = {  cons:"consHWsum",  title:"热水器的类型",  unit:"",  text:"请选择您家的热水器类型。", inputType:"sel101", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"6",d21p:"2",d22t:"3",d22p:"0",d23t:"2",d23p:"1",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel101"]= [ "请选择", "燃气热水器", "煤气潜热回收型", "煤油热水器", "煤油潜热回收型", "电热水器", "电动热泵", "热电联产", "燃料电池", "木柴", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel101']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '', '', '', '', '', '' ];
	D6.scenario.defInput["i102"] = {  cons:"consHWsum",  title:"太阳能热水器",  unit:"",  text:"您家是否使用太阳能热水器？", inputType:"sel102", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"1",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"3",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"3",d31p:"0",d32t:"1",d32p:"2",d33t:"",d33p:"",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel102"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel102']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i103"] = {  cons:"consHWtub",  title:"#",  unit:"日/週",  text:"", inputType:"sel103", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"5",d31p:"0",d32t:"2",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel103"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel103']= [ '-1', '0', '1', '2', '3.5', '5.5', '7', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i104"] = {  cons:"consHWtub",  title:"#",  unit:"日/週",  text:"", inputType:"sel104", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"5",d31p:"0",d32t:"2",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel104"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel104']= [ '-1', '0', '1', '2', '3.5', '5.5', '7', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i105"] = {  cons:"consHWshower",  title:"淋浴时间（夏季除外）",  unit:"分/日",  text:"您家所有人一天内的淋浴时间一共是多少。（夏季除外）", inputType:"sel105", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"40",d11p:"0",d12t:"20",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"40",d31p:"0",d32t:"20",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel105"]= [ "请选择", "不使用", "5分钟", "10分钟", "15分钟", "20分钟", "30分钟", "40分钟", "60分钟", "90分钟", "120分钟", "", "", "", "", "" ];			D6.scenario.defSelectData['sel105']= [ '-1', '0', '5', '10', '15', '20', '30', '40', '60', '90', '120', '', '', '', '', '' ];
	D6.scenario.defInput["i106"] = {  cons:"consHWshower",  title:"淋浴时间（夏季）",  unit:"分/日",  text:"您家所有人一天内的淋浴时间一共是多少。（夏季）", inputType:"sel106", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"40",d11p:"0",d12t:"20",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"40",d31p:"0",d32t:"20",d32p:"1",d33t:"0",d33p:"2",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel106"]= [ "请选择", "不使用", "5分钟", "10分钟", "15分钟", "20分钟", "30分钟", "40分钟", "60分钟", "90分钟", "120分钟", "", "", "", "", "" ];			D6.scenario.defSelectData['sel106']= [ '-1', '0', '5', '10', '15', '20', '30', '40', '60', '90', '120', '', '', '', '', '' ];
	D6.scenario.defInput["i107"] = {  cons:"consHWtub",  title:"#",  unit:"",  text:"", inputType:"sel107", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"8",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel107"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel107']= [ '-1', '8', '4', '0', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i108"] = {  cons:"consHWtub",  title:"#",  unit:"時間",  text:"", inputType:"sel108", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"4",d32p:"1",d33t:"0",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel108"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel108']= [ '-1', '0', '3', '6', '10', '16', '24', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i109"] = {  cons:"consHWtub",  title:"#",  unit:"",  text:"", inputType:"sel109", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel109"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel109']= [ '-1', '10', '5', '2', '0', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i110"] = {  cons:"consHWtub",  title:"#",  unit:"割",  text:"", inputType:"sel110", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel110"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel110']= [ '-1', '10', '5', '5', '0', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i111"] = {  cons:"consHWtub",  title:"#",  unit:"割",  text:"", inputType:"sel111", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel111"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel111']= [ '-1', '10', '5', '0', '5', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i112"] = {  cons:"consHWshower",  title:"花洒需要多久热水出来",  unit:"秒",  text:"您家的花洒打开后需要多长时间出热水？", inputType:"sel112", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"20",d21p:"0",d22t:"10",d22p:"1",d23t:"0",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel112"]= [ "请选择", "立即出来热水", "等待约5秒", "等待约10秒", "等待约20秒", "等待一分钟弱", "我不知道", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel112']= [ '-1', '3', '5', '10', '20', '50', '20', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i113"] = {  cons:"consHWdishwash",  title:"洗碗时是否使用热水",  unit:"",  text:"您洗碗时会直接用凉水而不是热水吗？", inputType:"sel113", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel113"]= [ "请选择", "平常使用水", "大概使用水", "有时使用水", "平时不使用水", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel113']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i114"] = {  cons:"consHWdresser",  title:"一年中多久使用热水洗脸",  unit:"ヶ月",  text:"您一年中几个月需要用热水洗脸？", inputType:"sel114", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"5",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel114"]= [ "请选择", "不用热水洗脸", "2个月", "4个月", "6个月", "8个月", "10个月", "12个月", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel114']= [ '-1', '0', '2', '4', '6', '8', '10', '12', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i115"] = {  cons:"consHWdishwash",  title:"一年中多久使用热水碗",  unit:"ヶ月",  text:"您一年中有几个月需要用热水洗碗？", inputType:"sel115", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel115"]= [ "请选择", "不用热水洗碗", "使用洗碗机", "2个月", "4个月", "6个月", "8个月", "10个月", "12个月", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel115']= [ '-1', '0', '99', '2', '4', '6', '8', '10', '12', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i116"] = {  cons:"consHWshower",  title:"节水花洒",  unit:"",  text:"您的淋浴花洒是否为节水型花洒？", inputType:"sel116", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"2",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel116"]= [ "请选择", "是", "否", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel116']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i117"] = {  cons:"consHWtub",  title:"#",  unit:"",  text:"", inputType:"sel117", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"0",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel117"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel117']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i131"] = {  cons:"consHWtoilet",  title:"#",  unit:"",  text:"", inputType:"sel131", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"2",d32t:"2",d32p:"1",d33t:"1",d33p:"0",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel131"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel131']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i132"] = {  cons:"consHWtoilet",  title:"#",  unit:"",  text:"", inputType:"sel132", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"0",d32t:"3",d32p:"1",d33t:"2",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel132"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel132']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i133"] = {  cons:"consHWtoilet",  title:"#",  unit:"",  text:"", inputType:"sel133", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel133"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel133']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i134"] = {  cons:"consHWtoilet",  title:"#",  unit:"",  text:"", inputType:"sel134", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"2",d31p:"0",d32t:"1",d32p:"2",d33t:"",d33p:"1",d3w:"1",d3d:""}; 			D6.scenario.defSelectValue["sel134"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel134']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i201"] = {  cons:"consHTsum",  title:"取暖范围",  unit:"",  text:"您家的取暖范围大概是多少？", inputType:"sel201", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"1",d11p:"0",d12t:"0.5",d12p:"1",d13t:"0",d13p:"2",d1w:"1",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel201"]= [ "请选择", "全屋", "一半左右", "一部分", "不取暖", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel201']= [ '-1', '1', '0.5', '0.25', '0.1', '0.02', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i202"] = {  cons:"consHTsum",  title:"主要使用的取暖器",  unit:"",  text:"您家最常使用的取暖方式是什么？如果地板采暖，请选择热源。", inputType:"sel202", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"6",d11p:"0",d12t:"5",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"6",d21p:"0",d22t:"5",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"5",d31p:"2",d32t:"2",d32p:"0",d33t:"1",d33p:"1",d3w:"2",d3d:"0"}; 			D6.scenario.defSelectValue["sel202"]= [ "请选择", "空调", "电子", "煤气", "燃油", "木柴", "电热地毯", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel202']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i203"] = {  cons:"consHTsum",  title:"辅助取暖方式",  unit:"",  text:"您家的辅助取暖方式是什么？", inputType:"sel203", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel203"]= [ "请选择", "空调", "电子", "煤气", "燃油", "木柴", "电热地毯", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel203']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
	D6.scenario.defInput["i204"] = {  cons:"consHTsum",  title:"取暖时长",  unit:"時間",  text:"冬季一天的取暖时间有多少？", inputType:"sel204", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"24",d11p:"0",d12t:"0",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel204"]= [ "请选择", "不取暖", "1小时", "2小时", "3小时", "4小时", "6时间", "8时间", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel204']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
	D6.scenario.defInput["i205"] = {  cons:"consHTsum",  title:"取暖温度",  unit:"℃",  text:"您家取暖时的温度设置是多少？如果无法调节，感觉大概达到了多少度？", inputType:"sel205", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"23",d11p:"0",d12t:"21",d12p:"1",d13t:"0",d13p:"2",d1w:"3",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"23",d31p:"0",d32t:"21",d32p:"1",d33t:"0",d33p:"2",d3w:"3",d3d:"0"}; 			D6.scenario.defSelectValue["sel205"]= [ "请选择", "不取暖", "18℃", "19℃", "20℃", "21℃", "22℃", "23℃", "24℃", "25℃", "26℃以上", "", "", "", "", "" ];			D6.scenario.defSelectData['sel205']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
	D6.scenario.defInput["i206"] = {  cons:"consHTsum",  title:"一年中多久取暖",  unit:"ヶ月",  text:"您家一年中有几个月需要取暖？", inputType:"sel206", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel206"]= [ "请选择", "不取暖", "1个月", "3个月", "3个月", "6个月", "6个月", "6个月", "11个月", "12个月", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel206']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', '', '', '', '', '', '' ];
	D6.scenario.defInput["i211"] = {  cons:"consACheat",  title:"房间的名称",  unit:"",  text:"", inputType:"", right:"", postfix:"", nodata:"", varType:"String", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i212"] = {  cons:"consACheat",  title:"房间面积",  unit:"m2",  text:"请选择多大的房间开一个空调？如果房屋内部有楼梯结构，请加2倍。", inputType:"sel212", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel212"]= [ "请选择", "10平米", "12平米", "14平米", "18平米", "20平米", "25平米", "30平米", "40平米", "50平米", "60平米以上", "", "", "", "", "" ];			D6.scenario.defSelectData['sel212']= [ '-1', '7.3', '10', '13', '16', '19.5', '24', '33', '41', '49', '65', '', '', '', '', '' ];
	D6.scenario.defInput["i213"] = {  cons:"consACheat",  title:"玻璃窗尺寸",  unit:"m2",  text:"您家一个房间内的窗户面积有多少？", inputType:"sel213", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel213"]= [ "请选择", "一个小窗户（90cm×120cm）", "一个小窗户（120cm×180cm）", "2个落地式窗户（180cm×180cm）", "4个落地式窗户（180cm×360cm）", "6个落地式窗户（180cm×540cm）", "8个落地式窗户（180cm×720cm）", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel213']= [ '-1', '1.1', '2.2', '3.3', '6.5', '9.7', '13', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i214"] = {  cons:"consACheat",  title:"玻璃窗类型",  unit:"w/m2K",  text:"请选择您家窗户的类型。", inputType:"sel214", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"4",d21p:"2",d22t:"3",d22p:"1",d23t:"",d23p:"",d2w:"1",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel214"]= [ "请选择", "单层玻璃窗户", "铝制窗框多层玻璃", "非铝窗框多层玻璃窗户", "双层窗户", "low-E多层玻璃", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel214']= [ '-1', '6', '3.5', '2.5', '2.5', '1.5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i215"] = {  cons:"consACcool",  title:"空调使用年数",  unit:"年",  text:"您家的空调已经使用了多少年？", inputType:"sel215", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel215"]= [ "请选择", "未装空调", "不到一年", "1年到3年", "3年到5年", "5年到7年", "7年到10年", "10年到15年", "15年到20年", "20年以上", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel215']= [ '-1', '0', '1', '2', '4', '6', '9', '13', '18', '25', '', '', '', '', '', '' ];
	D6.scenario.defInput["i216"] = {  cons:"consACcool",  title:"空调性能",  unit:"",  text:"您购买的是节能型空调吗？", inputType:"sel216", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"0",d12t:"1",d12p:"2",d13t:"",d13p:"",d1w:"2",d1d:"0", d21t:"2",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"2",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel216"]= [ "请选择", "是", "否", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel216']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i217"] = {  cons:"consACcool",  title:"空调过滤器清洗",  unit:"",  text:"您平时打扫空调过滤器吗？", inputType:"sel217", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"2",d31p:"0",d32t:"1",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel217"]= [ "请选择", "是", "否", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel217']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i231"] = {  cons:"consACheat",  title:"主要使用的取暖器",  unit:"",  text:"您家最使用的取暖方式是什么？如果地板采暖，请选择热源。", inputType:"sel231", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel231"]= [ "请选择", "空调", "电子", "煤气", "燃油", "木柴", "电热地毯", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel231']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i232"] = {  cons:"consACheat",  title:"辅助取暖方式",  unit:"",  text:"您家的辅助取暖方式是什么？", inputType:"sel232", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel232"]= [ "请选择", "空调", "电子", "煤气", "燃油", "木柴", "电热地毯", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel232']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
	D6.scenario.defInput["i233"] = {  cons:"consACheat",  title:"空调取暖时间",  unit:"時間",  text:"冬季您家一天的取暖时间有多少？", inputType:"sel233", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel233"]= [ "请选择", "不使用", "1小时", "2小时", "3小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel233']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
	D6.scenario.defInput["i234"] = {  cons:"consACheat",  title:"空调取暖温度",  unit:"℃",  text:"空调取暖时的温度设置是多少？如果无法设置温度，感觉大概达到了多少度？", inputType:"sel234", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel234"]= [ "请选择", "不使用", "18℃", "19℃", "20℃", "21℃", "22℃", "23℃", "24℃", "25℃", "26℃以上", "", "", "", "", "" ];			D6.scenario.defSelectData['sel234']= [ '-1', '0', '18', '19', '20', '21', '22', '23', '24', '25', '26', '', '', '', '', '' ];
	D6.scenario.defInput["i235"] = {  cons:"consACheat",  title:"一年中多久使用空调取暖",  unit:"ヶ月",  text:"您家一年开多长时间空调取暖？", inputType:"sel235", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel235"]= [ "请选择", "不使用", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "8个月", "10个月", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel235']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '10', '', '', '', '', '', '' ];
	D6.scenario.defInput["i236"] = {  cons:"consACheat",  title:"一年中多久使用加湿器",  unit:"ヶ月",  text:"您家一年使用多长时间加湿器？", inputType:"sel236", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel236"]= [ "请选择", "不使用加湿器", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel236']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i237"] = {  cons:"consACheat",  title:"隔热材料",  unit:"",  text:"您家冬季会使用厚窗帘或隔热材料吗？", inputType:"sel237", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel237"]= [ "请选择", "是", "否", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel237']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i238"] = {  cons:"consACheat",  title:"房间门是否可以关上",  unit:"",  text:"您家房间的门可以关上吗？", inputType:"sel238", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel238"]= [ "请选择", "是", "否", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel238']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i239"] = {  cons:"consACheat",  title:"房间是否通顶设计",  unit:"",  text:"", inputType:"sel239", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel239"]= [ "请选择", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel239']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i240"] = {  cons:"consACheat",  title:"#",  unit:"",  text:"", inputType:"sel240", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel240"]= [ "请选择", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel240']= [ '-1', '0', '2', '3', '5', '7', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i241"] = {  cons:"consACheat",  title:"取暖电炉的使用时间",  unit:"",  text:"您家一天内使用电炉或油汀取暖器的时间有多少？", inputType:"sel241", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel241"]= [ "请选择", "不使用", "1小时", "2小时", "3小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel241']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
	D6.scenario.defInput["i242"] = {  cons:"consACheat",  title:"房间寒冷程度",  unit:"",  text:"您家取暖时感觉房间温暖吗？", inputType:"sel242", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel242"]= [ "请选择", "很暖和", "比较暖和", "有点儿冷", "很冷", "不需要取暖", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel242']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i243"] = {  cons:"consHTsum",  title:"窗户是否有结露",  unit:"",  text:"您家窗户发生结露吗？", inputType:"sel243", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel243"]= [ "请选择", "平常发生", "有时发生", "很少发生", "不发生", "我不知道", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel243']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i244"] = {  cons:"consHTsum",  title:"墙是否有结露",  unit:"",  text:"您家墙面发生结露吗？", inputType:"sel244", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel244"]= [ "请选择", "平常发生", "有时发生", "很少发生", "不发生", "我不知道", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel244']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i245"] = {  cons:"consHTsum",  title:"早上寒冷程度",  unit:"ヶ月",  text:"出现以下哪种情况时您觉得最冷？", inputType:"sel245", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel245"]= [ "请选择", "因为冷，早上醒不过来", "手与脚特别凉", "看到窗户有霜", "在房间呼出的气变成白雾", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel245']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i246"] = {  cons:"consHTsum",  title:"早上开始降温的季节",  unit:"",  text:"您觉得从何时开始能感觉到早上的寒冷？", inputType:"sel246", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel246"]= [ "请选择", "10月上旬", "10月下旬", "11月上旬", "11月下旬", "12月上旬", "12月下旬", "1月上旬", "1月下旬", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel246']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i247"] = {  cons:"consHTsum",  title:"早上结束降温的季节",  unit:"",  text:"您觉得早上的寒冷感到何时结束？", inputType:"sel247", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel247"]= [ "请选择", "2月上旬", "2月下旬", "3月上旬", "3月下旬", "4月上旬", "4月下旬", "5月上旬", "5月下旬", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel247']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i248"] = {  cons:"consHTsum",  title:"是否多穿衣服",  unit:"",  text:"您使用空调前是否会考虑先多穿衣服？", inputType:"sel248", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel248"]= [ "请选择", "平常", "有时", "偶尔", "完全不", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel248']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i249"] = {  cons:"consHTsum",  title:"无人房间的空调",  unit:"",  text:"您会关闭无人房间的空调吗", inputType:"sel249", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"4",d11p:"2",d12t:"3",d12p:"1",d13t:"",d13p:"",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"2",d32t:"3",d32p:"1",d33t:"",d33p:"",d3w:"2",d3d:"1"}; 			D6.scenario.defSelectValue["sel249"]= [ "请选择", "平常", "有时", "偶尔", "完全不", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel249']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i261"] = {  cons:"consCOsum",  title:"空调制冷时间",  unit:"時間",  text:"夏季您家一天内的空调制冷时间是多少？", inputType:"sel261", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"24",d31p:"0",d32t:"8",d32p:"1",d33t:"",d33p:"",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel261"]= [ "请选择", "不使用", "1小时", "2小时", "3小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel261']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
	D6.scenario.defInput["i262"] = {  cons:"consCOsum",  title:"空调制冷的时区",  unit:"",  text:"使用空调的主要时间段是？", inputType:"sel262", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel262"]= [ "请选择", "不使用", "早上", "白天", "傍晚", "晚上", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel262']= [ '-1', '0', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i263"] = {  cons:"consCOsum",  title:"空调制冷温度",  unit:"℃",  text:"夏季空调的设置温度是？", inputType:"sel263", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"28",d11p:"2",d12t:"25",d12p:"1",d13t:"",d13p:"",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"28",d31p:"2",d32t:"25",d32p:"1",d33t:"",d33p:"",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel263"]= [ "请选择", "24℃以下", "25℃", "26℃", "27℃", "28℃", "29℃", "30℃", "不使用", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel263']= [ '-1', '24', '25', '26', '27', '28', '29', '30', '0', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i264"] = {  cons:"consCOsum",  title:"一年中多久使用空调制冷（包含除湿功能）",  unit:"ヶ月",  text:"您家一年中需要几个月的空调制冷？（包括除湿）", inputType:"sel264", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel264"]= [ "请选择", "不使用", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel264']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i265"] = {  cons:"consCOsum",  title:"房间的热暑热程度",  unit:"",  text:"空调制冷时，感觉房间很热吗？", inputType:"sel265", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel265"]= [ "请选择", "凉快", "有点儿热", "开空调也有点儿热", "开空调也热", "不使用空调", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel265']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i266"] = {  cons:"consCOsum",  title:"是否照进房间",  unit:"",  text:"夏季的早晚时分否有阳光照进房间？", inputType:"sel266", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel266"]= [ "请选择", "照得多", "照得有点儿多", "照不进房间里", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel266']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i267"] = {  cons:"consCOsum",  title:"遮挡阳光照射",  unit:"",  text:"早晚时分如果有阳光照进房屋，房间温度会上升。您是否会采取措施防止阳光进入？", inputType:"sel267", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"4",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel267"]= [ "请选择", "平时做", "有时做", "很少做", "不做", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel267']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i268"] = {  cons:"consCOsum",  title:"是否使用电扇",  unit:"",  text:"您会尽量多用电扇少开空调吗？", inputType:"sel268", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel268"]= [ "请选择", "平时", "有时", "必很少", "不", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel268']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i271"] = {  cons:"consACcool",  title:"电扇冷却时间",  unit:"時間",  text:"夏季您家一天开几小时空调？", inputType:"sel271", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"4",d32p:"1",d33t:"0",d33p:"2",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel271"]= [ "请选择", "不使用", "1小时", "2小时", "3小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel271']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
	D6.scenario.defInput["i272"] = {  cons:"consACcool",  title:"使用电扇的时区",  unit:"",  text:"使用空调的主要时间段是？", inputType:"sel272", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel272"]= [ "请选择", "不使用", "1小时", "2小时", "3小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel272']= [ '-1', '0', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i273"] = {  cons:"consACcool",  title:"制冷温度",  unit:"℃",  text:"您家开空调制冷时，温度会调到几度？", inputType:"sel273", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel273"]= [ "请选择", "24℃以下", "25℃", "26℃", "27℃", "28℃", "29℃", "30℃", "不使用", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel273']= [ '-1', '24', '25', '26', '27', '28', '29', '30', '0', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i274"] = {  cons:"consACcool",  title:"一年中多久制冷",  unit:"ヶ月",  text:"您家一年中需要几个月的空调制冷？（包括除湿）", inputType:"sel274", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel274"]= [ "请选择", "不使用空调制冷", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel274']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i275"] = {  cons:"consACcool",  title:"房间的暑热程度",  unit:"",  text:"您觉得房间热吗？", inputType:"sel275", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel275"]= [ "请选择", "当冷却热并不感到", "有点热", "如果很酷注", "即使冷却热", "空调不", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel275']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i276"] = {  cons:"consACcool",  title:"是否照进房间",  unit:"",  text:"夏季早上或傍晚是否照进房间？", inputType:"sel276", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel276"]= [ "请选择", "照得多", "照得有点儿多", "照不进房间里", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel276']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i277"] = {  cons:"consACcool",  title:"遮挡阳光照射",  unit:"",  text:"早晚时分如果有阳光照进房屋，房间温度会上升。您是否会采取措施防止阳光进入？", inputType:"sel277", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel277"]= [ "请选择", "平时做", "有时做", "很少做", "不做", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel277']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i278"] = {  cons:"consACcool",  title:"是否使用电扇",  unit:"",  text:"您会尽量多用电扇少开空调吗？", inputType:"sel278", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel278"]= [ "请选择", "平时", "有时", "必很少", "不", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel278']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i281"] = {  cons:"consHTcold",  title:"集中供暖",  unit:"",  text:"您家是集中供暖吗？", inputType:"sel281", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel281"]= [ "请选择", "是", "否", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel281']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i282"] = {  cons:"consHTcold",  title:"集中供暖的热源",  unit:"",  text:"您家集中供暖的热源是什么？", inputType:"sel282", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel282"]= [ "请选择", "煤油", "电气", "电气（热泵）", "煤气+热泵", "区域供热", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel282']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i283"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel283", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel283"]= [ "请选择", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel283']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i284"] = {  cons:"consHTcold",  title:"集中供暖期间",  unit:"",  text:"您家的集中供暖时间段是？", inputType:"sel284", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel284"]= [ "请选择", "不使用", "1个月", "2个月", "3个月", "4个月", "5个月", "6个月", "8个月", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel284']= [ '-1', '0', '1', '2', '3', '4', '5', '6', '8', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i285"] = {  cons:"consHTsum",  title:"全热交换新风换气机",  unit:"",  text:"您家使用全热交换新风换气机吗？", inputType:"sel285", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"0",d12t:"1",d12p:"2",d13t:"",d13p:"",d1w:"1",d1d:"0", d21t:"2",d21p:"0",d22t:"1",d22p:"2",d23t:"",d23p:"",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel285"]= [ "请选择", "是", "否", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel285']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i286"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel286", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel286"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel286']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i287"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel287", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel287"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel287']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i288"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel288", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel288"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel288']= [ '-1', '3', '7', '10', '15', '30', '50', '65', '100', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i289"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel289", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel289"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel289']= [ '-1', '2', '6', '12', '30', '50', '100', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i290"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel290", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel290"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel290']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i291"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel291", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel291"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel291']= [ '-1', '10', '30', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i292"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel292", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel292"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel292']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i293"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel293", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel293"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel293']= [ '-1', '2', '6', '15', '30', '50', '100', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i294"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel294", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel294"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel294']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i295"] = {  cons:"consHTcold",  title:"#",  unit:"",  text:"", inputType:"sel295", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel295"]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel295']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i401"] = {  cons:"consDRsum",  title:"是否使用干衣机",  unit:"",  text:"您家使用干衣机或者烘干功能吗？请选择使用频率。", inputType:"sel401", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"5",d11p:"0",d12t:"3",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel401"]= [ "请选择", "不使用", "一个月1〜3次", "一周1～2次", "两天1次", "每天", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel401']= [ '-1', '5', '4', '3', '2', '1', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i402"] = {  cons:"consDRsum",  title:"烘干机的类型",  unit:"",  text:"请选择干衣机的类型。", inputType:"sel402", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel402"]= [ "请选择", "电力（热泵）", "电力", "煤气", "我不知道", "我家没有", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel402']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i403"] = {  cons:"consDRsum",  title:"洗衣机使用频率",  unit:"",  text:"请选择洗衣机的使用频率。", inputType:"sel403", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel403"]= [ "请选择", "每天使用很多次", "每天使用两次", "每天使用一次", "没洗的衣服多了才使用", "我不知道", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel403']= [ '-1', '4', '2', '1', '0.5', '1', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i411"] = {  cons:"consDRsum",  title:"真空吸尘器的强度",  unit:"",  text:"您家吸尘机的吸力强度是多少？", inputType:"sel411", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel411"]= [ "请选择", "基本上调强使用", "按脏度分别调整", "基本上调弱", "不能调整强度", "我不知道", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel411']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i412"] = {  cons:"consDRsum",  title:"吸尘器使用时间",  unit:"分/日",  text:"您每天使用多长时间吸尘器？", inputType:"sel412", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel412"]= [ "请选择", "基本上不使用", "5分钟", "10分钟", "15分钟", "30分钟", "1小时", "使用吸尘机器人", "我不知道", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel412']= [ '-1', '0', '5', '10', '15', '30', '60', '11', '12', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i501"] = {  cons:"consLIsum",  title:"客厅的照明",  unit:"W",  text:"您家客厅主要照明灯具是什么？", inputType:"sel501", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"3",d21p:"2",d22t:"2",d22p:"1",d23t:"",d23p:"",d2w:"1",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel501"]= [ "请选择", "白炽灯", "荧光灯", "LED ", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel501']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i502"] = {  cons:"consLIsum",  title:"房间没人时是否关灯",  unit:"",  text:"房间里没有人的时候，会关灯吗？", inputType:"sel502", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"2",d12t:"2",d12p:"1",d13t:"",d13p:"",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"2",d32t:"2",d32p:"1",d33t:"",d33p:"",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel502"]= [ "请选择", "都开灯", "有的房间开灯", "几乎关灯", "都关灯", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel502']= [ '-1', '10', '6', '2', '0', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i511"] = {  cons:"consLI",  title:"有照明的地方",  unit:"",  text:"您家在哪些位置有照明？", inputType:"sel511", right:"1", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel511"]= [ "请选择", "门口", "门口外", "走廊", "厕所", "更衣室", "洗澡", "客厅", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel511']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '', '', '', '', '' ];
	D6.scenario.defInput["i512"] = {  cons:"consLI",  title:"照明类型",  unit:"",  text:"请选择您家的灯具类型。", inputType:"sel512", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel512"]= [ "请选择", "白炽灯", "荧光灯", "荧光", "荧光灯管", "LED", "人体感应灯", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel512']= [ '-1', '1', '2', '3', '4', '5', '6', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i513"] = {  cons:"consLI",  title:"灯泡多少瓦特",  unit:"W",  text:"您家一个灯泡的功率有多大？", inputType:"sel513", right:"1", postfix:"Number", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel513"]= [ "请选择", "5W", "10W", "15W", "20W", "30W", "40W", "60W", "80W", "100W ", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel513']= [ '-1', '5', '10', '15', '20', '30', '40', '60', '80', '100', '', '', '', '', '', '' ];
	D6.scenario.defInput["i514"] = {  cons:"consLI",  title:"灯泡数量",  unit:"球・本",  text:"您家一共使用几个灯泡？", inputType:"sel514", right:"1", postfix:"Number", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel514"]= [ "请选择", "1个", "2个", "3个", "4个", "6个", "8个", "10个", "15个", "20个", "30个", "", "", "", "", "" ];			D6.scenario.defSelectData['sel514']= [ '-1', '1', '2', '3', '4', '6', '8', '10', '15', '20', '30', '', '', '', '', '' ];
	D6.scenario.defInput["i515"] = {  cons:"consLI",  title:"开灯时间",  unit:"時間/日",  text:"您家一天开几小时灯？", inputType:"sel515", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel515"]= [ "请选择", "不使用", "1小时", "2小时", "3小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel515']= [ '-1', '0', '1', '2', '3', '4', '6', '8', '12', '16', '24', '', '', '', '', '' ];
	D6.scenario.defInput["i601"] = {  cons:"consTVsum",  title:"看电视时间",  unit:"時間",  text:"把家里所有电视机都计算在内，您家一天一共开几小时电视？包括用电视机打游戏的时间。", inputType:"sel601", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel601"]= [ "请选择", "不看电视", "2小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "32小时", "40小时", "", "", "", "", "" ];			D6.scenario.defSelectData['sel601']= [ '-1', '0', '2', '4', '6', '8', '12', '16', '24', '32', '40', '', '', '', '', '' ];
	D6.scenario.defInput["i631"] = {  cons:"consTV",  title:"电视尺寸",  unit:"インチ",  text:"请选择您家的电视尺寸。", inputType:"sel631", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel631"]= [ "请选择", "我家没有", "20寸以下", "20〜30寸", "30〜40寸", "45〜50寸", "50～65寸", "65寸以上", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel631']= [ '-1', '0', '18', '25', '35', '45', '60', '70', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i632"] = {  cons:"consTV",  title:"电视使用年数",  unit:"年",  text:"请选择您家的电视使用年数。", inputType:"sel632", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel632"]= [ "请选择", "我家没有", "1年未满", "3年未满", "5年未满", "7年未满", "10未满年", "15年未满", "20年未满", "20年以上", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel632']= [ '-1', '0', '1', '2', '4', '6', '9', '13', '18', '25', '', '', '', '', '', '' ];
	D6.scenario.defInput["i633"] = {  cons:"consTV",  title:"看电视时间",  unit:"年",  text:"您一天看多长时间电视？", inputType:"sel633", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel633"]= [ "请选择", "不使用", "2小时", "4小时", "6小时", "8小时", "12小时", "16小时", "24小时", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel633']= [ '-1', '0', '2', '4', '6', '8', '12', '16', '24', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i701"] = {  cons:"consRFsum",  title:"冰箱的数量",  unit:"台",  text:"您家有几台冰箱。冷柜也按1台计算。", inputType:"sel701", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"2",d11p:"0",d12t:"0",d12p:"2",d13t:"",d13p:"",d1w:"1",d1d:"2", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"2",d31p:"0",d32t:"0",d32p:"2",d33t:"",d33p:"",d3w:"1",d3d:"2"}; 			D6.scenario.defSelectValue["sel701"]= [ "请选择", "我家没有", "1台", "2台", "3台", "4台", "5台", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel701']= [ '-1', '0', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i711"] = {  cons:"consRF",  title:"冰箱的使用年数",  unit:"年",  text:"您现在的冰箱已经使用了几年？", inputType:"sel711", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel711"]= [ "请选择", "我家没有", "1年未满", "3年未满", "5年未满", "7年未满", "10未满年", "15年未满", "20年未满", "20年以上", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel711']= [ '-1', '0', '0', '2', '4', '6', '8', '12', '17', '25', '', '', '', '', '', '' ];
	D6.scenario.defInput["i712"] = {  cons:"consRF",  title:"冰箱类型",  unit:"",  text:"请选择您家的冰箱类型。", inputType:"sel712", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel712"]= [ "请选择", "冰箱", "冷冻机", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel712']= [ '-1', '1', '2', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i713"] = {  cons:"consRF",  title:"冰箱的容量",  unit:"",  text:"请选择您家的冰箱容量。", inputType:"sel713", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel713"]= [ "请选择", "100升以下", "101～200升", "201～300升", "301～400升", "401～500升", "501升以上", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel713']= [ '-1', '80', '150', '250', '350', '450', '550', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i714"] = {  cons:"consRF",  title:"冰箱温度设置",  unit:"",  text:"您家冰箱内的温度设置是多少？", inputType:"sel714", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"4",d31p:"1",d32t:"3",d32p:"2",d33t:"0",d33p:"1",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel714"]= [ "请选择", "强", "中", "弱", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel714']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i715"] = {  cons:"consRF",  title:"冰箱里的空间",  unit:"",  text:"您会注意不把冰箱塞得太满吗？", inputType:"sel715", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel715"]= [ "请选择", "能注意", "有时不能注意", "完全不能注意", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel715']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i716"] = {  cons:"consRF",  title:"冰箱离墙距离",  unit:"",  text:"冰箱放置位置是否离开墙面5厘米?", inputType:"sel716", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel716"]= [ "请选择", "是", "否", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel716']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i801"] = {  cons:"consCKcook",  title:"炉的热源",  unit:"",  text:"请选择您家的灶台热源。", inputType:"sel801", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel801"]= [ "请选择", "燃气", "电气（IH等）", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel801']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i802"] = {  cons:"consCKcook",  title:"做饭频率",  unit:"割",  text:"请选择做饭频率。", inputType:"sel802", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel802"]= [ "请选择", "不做饭", "一周一次以下", "一周两、三次", "一天一次", "一天两次", "一天三次", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel802']= [ '-1', '0', '1', '2', '4', '7', '10', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i811"] = {  cons:"consCKrice",  title:"电饭锅的保温功能",  unit:"",  text:"您是否使用电饭锅的保温功能？", inputType:"sel811", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel811"]= [ "请选择", "不保温", "6个小时左右", "12个小时左右", "24个小时左右", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel811']= [ '-1', '0', '6', '12', '24', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i821"] = {  cons:"consCKpot",  title:"电水壶的保温",  unit:"",  text:"您是否使用电水壶的保温功能？", inputType:"sel821", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"10",d11p:"0",d12t:"4",d12p:"1",d13t:"0",d13p:"2",d1w:"1",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"10",d31p:"0",d32t:"4",d32p:"1",d33t:"0",d33p:"2",d3w:"1",d3d:"1"}; 			D6.scenario.defSelectValue["sel821"]= [ "请选择", "不保温", "6个小时左右", "12个小时左右", "24个小时左右", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel821']= [ '-1', '0', '6', '12', '24', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i822"] = {  cons:"consCKpot",  title:"电水壶的节能性",  unit:"",  text:"您的电水壶是否为节能型产品？", inputType:"sel822", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel822"]= [ "请选择", "是", "否", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel822']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i901"] = {  cons:"consCRsum",  title:"汽保有量",  unit:"",  text:"您家有几辆汽车？", inputType:"sel901", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"4",d11p:"0",d12t:"2",d12p:"1",d13t:"0",d13p:"2",d1w:"2",d1d:"1", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel901"]= [ "请选择", "我家没有", "一辆", "二辆", "三辆", "四辆", "五辆以上", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel901']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i902"] = {  cons:"consCRsum",  title:"电动车、摩托车的保有量",  unit:"",  text:"您家有几辆电动车或摩托车？", inputType:"sel902", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel902"]= [ "请选择", "没有", "一辆", "二辆", "三辆", "四辆", "五个或以上", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel902']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i911"] = {  cons:"consCR",  title:"汽车类型",  unit:"",  text:"请选择汽车类型。", inputType:"sel911", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel911"]= [ "请选择", "小型汽车", "小型货车", "大篷货车", "电动车", "摩托车", "大排量摩托车", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel911']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i912"] = {  cons:"consCR",  title:"汽车的耗油量",  unit:"",  text:"请选择汽车的耗油量。", inputType:"sel912", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"30",d11p:"2",d12t:"15",d12p:"1",d13t:"",d13p:"",d1w:"2",d1d:"1", d21t:"30",d21p:"2",d22t:"15",d22p:"1",d23t:"",d23p:"",d2w:"2",d2d:"1", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel912"]= [ "请选择", "6公里/ L以下", "7～9km / L", "10～12km / L", "13～15km / L", "16～20km / L", "21～26km / L", "27～35km / L", "36公里/ L以上", " ", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel912']= [ '-1', '6', '8', '11', '14', '18', '23', '30', '40', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i913"] = {  cons:"consCR",  title:"汽车的主要用户",  unit:"",  text:"在汽车的任何人。或请填写是否有打电话给你。", inputType:"", right:"", postfix:"", nodata:"", varType:"String", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue[""]= [ "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i914"] = {  cons:"consCR",  title:"轮胎是否有节能性",  unit:"",  text:"您是否使用节能轮胎？", inputType:"sel914", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel914"]= [ "请选择", "是", "否", "我不知道", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel914']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i921"] = {  cons:"consCRtrip",  title:"目的地",  unit:"",  text:"请选择您常开车去的地方。", inputType:"", right:"", postfix:"", nodata:"", varType:"String", min:"", max:"", defaultValue:"", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue[""]= [ "请选择", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['']= [ '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i922"] = {  cons:"consCRtrip",  title:"开车频率",  unit:"",  text:"请选择您的开车频率。", inputType:"sel922", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel922"]= [ "请选择", "每日", "每周5次", "每周2～3次", "每周1次", "每月2次", "每月1次", "2个月1次", "一年2～3次", "一年1次", "不开车", "", "", "", "", "" ];			D6.scenario.defSelectData['sel922']= [ '-1', '365', '250', '120', '50', '25', '12', '6', '2', '1', '', '', '', '', '', '' ];
	D6.scenario.defInput["i923"] = {  cons:"consCRtrip",  title:"单程距离",  unit:"km",  text:"请选择您开车时的大概单程距离。", inputType:"sel923", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel923"]= [ "请选择", "1公里", "2公里", "3公里", "5公里", "10公里", "20公里", "30公里", "50公里", "100公里", "200公里", "400公里", "600公里以上", "", "", "" ];			D6.scenario.defSelectData['sel923']= [ '-1', '1', '2', '3', '5', '10', '20', '30', '50', '100', '200', '400', '700', '', '', '' ];
	D6.scenario.defInput["i924"] = {  cons:"consCRtrip",  title:"开第几辆车",  unit:"",  text:"您常开第几辆车？", inputType:"sel924", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel924"]= [ "请选择", "第一辆", "第二辆", "第三辆", "第四辆", "第五辆", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel924']= [ '-1', '1', '2', '3', '4', '5', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i931"] = {  cons:"consCRsum",  title:"停车熄火",  unit:"",  text:"长时间停车时，您会关闭发动器吗？", inputType:"sel931", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel931"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel931']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i932"] = {  cons:"consCRsum",  title:"急加速与急减速",  unit:"",  text:"您开车时会注意不急加速或急启动吗？", inputType:"sel932", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel932"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel932']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i933"] = {  cons:"consCRsum",  title:"固定速度驾驶",  unit:"",  text:"您开车时会尽量减少加减速动作吗？", inputType:"sel933", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel933"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel933']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i934"] = {  cons:"consCRsum",  title:"松开油门",  unit:"",  text:"您在停车时会提前松开油门吗", inputType:"sel934", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel934"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel934']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i935"] = {  cons:"consCRsum",  title:"查看道路交通信息",  unit:"",  text:"您开车时查看道路交通信息吗？", inputType:"sel935", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel935"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel935']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i936"] = {  cons:"consCRsum",  title:"减少载重",  unit:"",  text:"您开车时会清理掉车内不需要的物品，减少载重吗？", inputType:"sel936", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel936"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel936']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i937"] = {  cons:"consCRsum",  title:"汽车空调的温度调节",  unit:"",  text:"您开车时会注意调节车内空调风量的大小吗？", inputType:"sel937", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel937"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel937']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i938"] = {  cons:"consCRsum",  title:"热车",  unit:"",  text:"在寒冷季节，您开车前会热车吗？                                                                                                                                                                                        ", inputType:"sel938", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"3",d31p:"0",d32t:"2",d32p:"1",d33t:"1",d33p:"2",d3w:"1",d3d:"0"}; 			D6.scenario.defSelectValue["sel938"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel938']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i939"] = {  cons:"consCRsum",  title:"轮胎内的气压",  unit:"",  text:"您会主意轮胎气压吗？", inputType:"sel939", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"",d11p:"",d12t:"",d12p:"",d13t:"",d13p:"",d1w:"",d1d:"", d21t:"",d21p:"",d22t:"",d22p:"",d23t:"",d23p:"",d2w:"",d2d:"", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel939"]= [ "请选择", "是", "有时", "否", "", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel939']= [ '-1', '1', '2', '3', '', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i221"] = {  cons:"consCOsum",  title:"空调能效",  unit:"",  text:"您家的空调节能性能好不好？", inputType:"sel221", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel221"]= [ "请选择", "一级", "二级", "三级", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel221']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i121"] = {  cons:"consHWsum",  title:"热水器能效",  unit:"",  text:"您家的热水器节能性能好不好？", inputType:"sel121", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel121"]= [ "请选择", "一级", "二级", "三级", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel121']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i621"] = {  cons:"consTVsum",  title:"电视能效",  unit:"",  text:"您家的电视节能性能好不好？", inputType:"sel621", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel621"]= [ "请选择", "一级", "二级", "三级", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel621']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i421"] = {  cons:"consDRsum",  title:"洗衣机能效",  unit:"",  text:"您家的洗衣机节能性能好不好？", inputType:"sel421", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel421"]= [ "请选择", "一级", "二级", "三级", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel421']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];
	D6.scenario.defInput["i721"] = {  cons:"consRFsum",  title:"冰箱能效",  unit:"",  text:"您家的冰箱节能性能好不好？", inputType:"sel721", right:"", postfix:"", nodata:"", varType:"Number", min:"", max:"", defaultValue:"-1", d11t:"3",d11p:"0",d12t:"2",d12p:"1",d13t:"1",d13p:"2",d1w:"1",d1d:"0", d21t:"3",d21p:"0",d22t:"2",d22p:"1",d23t:"1",d23p:"2",d2w:"1",d2d:"0", d31t:"",d31p:"",d32t:"",d32p:"",d33t:"",d33p:"",d3w:"",d3d:""}; 			D6.scenario.defSelectValue["sel721"]= [ "请选择", "一级", "二级", "三级", "我不知道", "", "", "", "", "", "", "", "", "", "", "" ];			D6.scenario.defSelectData['sel721']= [ '-1', '1', '2', '3', '4', '', '', '', '', '', '', '', '', '', '', '' ];

	// prefecture definition ----------------------------------------------------
	D6.scenario.defSelectValue['sel021'] = [ "请选择", 
			"长春",	
			"北京",
			"青岛",
			"郑州",
			"兰州", //5
			"上海",
			"重庆",
			"敦煌",
			"拉萨",
			"昆明",	//10
			"广州",
			"海口"
			 ];
	D6.scenario.defSelectData['sel021']= [ '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12' ]; 
	D6.scenario.defSelectValue['sel022'] = [ "请选择", "北部", "南部"];
	D6.scenario.defSelectData['sel022'] = [ "-1", "1", "2"];


};




﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsTotal
*/

DC = D6.consTotal;		//temporaly set as DC

//initialize
DC.init = function() {
	//construction definition
	this.title = "整体";
	this.inputGuide = "有关地区和房子的基本信息";

};
DC.init();

//Documentからの変換
DC.paramSet = function() {
	this.person =this.input( "i001", 3 );			//世帯人数

	//solar
	this.solarSet =this.input( "i051", 0 );					//太陽光発電の設置　あり=1
	this.solarKw =this.input( "i052", this.solarSet * 3.5 );	//太陽光発電の設置容量(kW)
	this.solarYear =this.input( "i053", 0 );				//太陽光発電の設置年
	
	//electricity
	this.priceEle = this.input( "i061"
			,D6.area.averageCostEnergy.electricity );	//月電気代
	this.priceEleSpring = this.input( "i0912" ,-1 );
	this.priceEleSummer = this.input( "i0913" ,-1 );
	this.priceEleWinter = this.input( "i0911" ,-1 );

	this.priceEleSell =this.input( "i062", 0 );		//月売電
				
	//gas
	this.priceGas =this.input( "i063"
			,D6.area.averageCostEnergy.gas );			//月ガス代
	this.priceGasSpring =this.input( "i0932" ,-1 );
	this.priceGasSummer =this.input( "i0933" ,-1 );
	this.priceGasWinter =this.input( "i0931" ,-1 );

	this.houseType =this.input( "i002", 2 );			//戸建て集合
	this.houseSize =this.input( "i003", 
			( this.person == 1 ? 60 : (80 + this.person * 10) ) );
													//家の広さ

	this.heatEquip =this.input( "i202", -1 );			//主な暖房機器

	//coal
	this.priceCoal = this.input( "i065" ,D6.area.averageCostEnergy.coal );
	this.priceCoalSpring =this.input( "i0942" ,-1 );
	this.priceCoalSummer =this.input( "i0943" ,-1 );
	this.priceCoalWinter =this.input( "i0941" ,-1 );

	this.priceHotWater = this.input( "i066" , 1 ) == 1 ? D6.area.averageCostEnergy.hotwater * this.houseSize / 100 : 0;

	if( this.priceKerosWinter == -1 ) {
		if (D6.area.averageCostEnergy.kerosene < 1000 ) {
			this.priceKeros =this.input( "i064", 0 );		//冬の月灯油代0（円)
		} else {
			this.priceKeros =this.input( "i064"
				,D6.area.averageCostEnergy.kerosene 
				/ D6.area.seasonMonth.winter * 12 );	//月灯油代標準値（円)　入力は冬
		}
	}

	this.priceCar =this.input( "i075"
			,D6.area.averageCostEnergy.car );			//月車燃料代
	this.equipHWType = this.input( "i101", 1 );			//給湯器の種類

	this.generateEleUnit = D6.area.unitPVElectricity;	//地域別の値を読み込む
		
	//灯油・ガスが無記入の場合は、平均値としてガスに灯油分を加えておく
	if (D6.area.averageCostEnergy.kerosene < 1000 ) {
		if (this.input( "i063", -1 ) < 0 			//ガスの記入がない
			&&this.input( "i0931", -1 ) < 0 
			&&this.input( "i0932", -1 ) < 0 
			&&this.input( "i0933", -1 ) < 0 
		) {
			//灯油分のエネルギーをガスに追加
			this.keros2gas =D6.area.averageCostEnergy.kerosene
					/D6.Unit.price.kerosene
					*D6.Unit.calorie.kerosene
					/D6.Unit.calorie.gas
					*D6.Unit.price.gas;
			this.priceGasSpring += this.keros2gas;
			this.priceGasWinter += this.keros2gas;				
		}
	}

	//季節別の光熱費の入力のパターン（初期値　-1:無記入）
	this.seasonPrice =  {
			electricity :	[ this.priceEleWinter, this.priceEleSpring, this.priceEleSummer ],		//電気
			gas :			[ this.priceGasWinter, this.priceGasSpring, this.priceGasSummer ],		//ガス
			kerosene:		[ this.priceKeros, this.priceKerosSpring,this.priceKerosSummer ], 		//灯油
			coal :			[ -1, -1,-1 ], 
			hotwater :		[ -1, -1,-1 ],
			car :			[ -1, -1,-1 ] 		//ガソリン
	};

	//毎月の消費量の入力のパターン（初期値　-1：無記入）
	this.monthlyPrice = {
			electricity :	[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			gas :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			kerosene :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			coal :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			hotwater :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			car :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ] 
	};
};


//消費量の計算
DC.calc = function( ){

	this.clear();			//結果の消去
	var ret;					//return values

	//入力値の読み込み
	this.paramSet();

	//季節係数の読込（全エネルギー）
	var seasonConsPattern = D6.area.getSeasonParamCommon();

	//電気の推計
	ret = D6.calcMonthly( this.priceEle, this.seasonPrice["electricity"], this.monthlyPrice["electricity"], seasonConsPattern.electricity, "electricity" );
	this.priceEle = ret.ave;
	this.seasonPrice["electricity"] = ret.season;
	this.monthlyPrice["electricity"] = ret.monthly;
		//光熱費の記入がないときには、分野の単純積み上げとする
	this.noConsData = ret.noConsData 
					&& ( this.input( "i061", -1) == -1 );
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
	
	//solar sell price 
	var pvSellUnitPrice = D6.Unit.price.sellelectricity;

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

	//coal
	ret = D6.calcMonthly( this.priceCoal, this.seasonPrice["coal"], this.monthlyPrice["coal"], seasonConsPattern.coal, "coal" );
	this.priceCoal = ret.ave;
	this.seasonPrice["coal"] = ret.season;
	this.monthlyPrice["coal"] = ret.monthly;
	
	this.coal = this.priceCoal / D6.Unit.price.coal;

	//hotwater
	ret = D6.calcMonthly( this.priceHotWater, this.seasonPrice["hotwater"], this.monthlyPrice["hotwater"], seasonConsPattern.hotwater, "hotwater" );
	this.priceHotWater = ret.ave;
	this.hotwater = this.priceHotWater / D6.Unit.price.hotwater;
	this.seasonPrice["hotwater"] = ret.season;
	this.monthlyPrice["hotwater"] = ret.monthly;

	//gasoline
	ret = D6.calcMonthly( this.priceCar, this.seasonPrice["car"], this.monthlyPrice["car"], seasonConsPattern.car, "car" );
	this.priceCar = ret.ave;
	this.seasonPrice["car"] = ret.season;
	this.monthlyPrice["car"] = ret.monthly;

	this.car = this.priceCar / D6.Unit.price.car;
	
};


//対策計算
DC.calcMeasure = function( ) {
	var mes;

	var solar_reduceVisualize = this.reduceHEMSRatio;		//モニターによる消費電力削減率
	var solar_sellPrice = 1;				//売電単価

	//mTOsolar-----------------------------------------
	mes = this.measures[ "mTOsolar" ];		//set mes
	mes.copy( this );
	
	// not installed and ( stand alone or desired )
	if ( this.solarKw == 0 
		&& ( this.houseType != 2 || this.replace_solar ) 
	) {
		// monthly generate electricity
		var solar_generate_kWh = this.generateEleUnit * this.standardSize / 12;

		// saving by generation
		var solar_priceDown = solar_generate_kWh * this.solarSaleRatio * solar_sellPrice 
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
		mes.advice = D6.scenario.defMeasures['mTOsolar']['advice'] 
			+ "<br>　标准" + this.standardSize + "kW的是该类型的计算结果。";
	}

	//mTOhems HEMS-----------------------------------------
	mes = this.measures[ "mTOhems" ];		//set mes
	mes.copy( this );
	
	//pv system is not installed  --- pv system includes visualize display
	if ( !this.isSelected( "mTOsolar" ) ) {
		mes.electricity = this.electricity * ( 1 - this.reduceHEMSRatio );
	}
	
	//mTOsolarSmall ベランダ太陽光------------------------------------------
	mes = this.measures[ "mTOsolarSmall" ];		//set mes
	mes.copy( this );
	var watt_panel = 50;			// install panel size (W)
	var eff = 0.3;						// effectiveness to roof 
	mes.electricity -= watt_panel / 1000 * eff * this.generateEleUnit / 12 ;

};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsHWsum
*/

DC = D6.consHWsum;		// short cut

//initialize-------------------------------
DC.init = function() {
	this.title = "热水器";				//consumption title for person
	this.inputGuide = "如何使用热水供应一般";		//guidance in question
	
};
DC.init();	// initialize when this class is loaded


//change Input data to local value 
DC.paramSet = function() {
	// use answers for calclation
	this.person =this.input( "i001", 3 );				//世帯人数
	this.housetype =this.input( "i002", 2 );			//戸建て集合 CN
	this.tabDayWeek =this.input( "i103", 0 );			//浴槽にためる日数 CN
	this.tabDayWeekSummer =this.input( "i104", 0 );		//浴槽にためる日数夏 CN
	this.showerMinutes =this.input( "i105"
			, this.showerWaterMinutes * this.person );	//シャワー時間（分）
	this.showerMinutesSummer =this.input( "i106"
			, this.showerWaterMinutes * this.person );	//シャワー時間（分）夏
	this.savingShower =this.input( "i116", -1 );		//節水シャワーヘッド
	this.tabKeepHeatingTime =this.input( "i108"
			, (this.person > 1 ? 3 : 0 ) );				//保温時間
	this.keepMethod =this.input( "i110", 5 );			//追い焚きの方法（割）
	this.tabInsulation =this.input( "i117", -1 );		//断熱
	this.tabHeight =this.input( "i107", 8 );			//お湯張りの高さ（割）
	
	this.equipType = this.input( "i101", -1 );			//給湯器の種類
	this.priceGas = D6.consShow["TO"].priceGas;			//月ガス代
	this.priceKeros = D6.consShow["TO"].priceKeros;		//冬の月灯油代

	this.dresserMonth = this.input( "i114", 4 );		//洗面でのお湯を使う期間（月）
	this.dishWashMonth = this.input( "i115", 4 );		//食器洗いでのお湯を使う期間（月）　99は食洗機
	this.dishWashWater = this.input( "i113", 3 );		//食器洗いで水を使うようにしているか 1いつも、4していない
	this.cookingFreq = this.input( "i802", 6 );			//調理の頻度（割）
	
	this.keepSeason =this.input( "i131", 4 );			//トイレ保温をしているか 1:通年、4していない CN
};

﻿/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsHTsum
*/

DC = D6.consHTsum;

//initialize setting
DC.init = function() {
	this.title = "供暖";
	this.inputGuide = "如何使用整个房子的供暖";
	
};
DC.init();

//change Input data to local value 
DC.precalc = function() {
	this.clear();			//clear data

	//入力値の読み込み
	this.prefecture =this.input( "i021", 6 );		//city, prefecture
	this.heatArea = D6.area.getHeatingLevel(this.prefecture);

	this.person =this.input( "i001", 3 );			//person
	this.houseType =this.input( "i002", 2 );		//standalone / apartment CN
	this.houseSize =D6.consShow["TO"].houseSize;	//home size 

	this.priceHotWater = this.input( "i066" , 1 ) == 1 ? D6.area.averageCostEnergy.hotwater * this.houseSize / 100 : 0;

	this.heatSpace  =this.input( "i201", this.heatArea < 5 ? 0.8 : 0.2 );	//part of heating CN
	this.heatEquip =this.input( "i202", -1 );		//equipment for heating
	this.heatTime  =this.input( "i204", this.heatArea < 5 ? 24 : 4 );		//heat time CN
	this.heatTemp  =this.input( "i205", 21 );		//暖房設定温度
	this.priceEleSpring =this.input( "i0912", -1 );	//電気料金（春秋）
	this.priceEleWinter =this.input( "i0911", -1 );	//電気料金（冬）
	this.priceGasWinter =this.input( "i0921", -1 );	//ガス料金（冬）
	this.consKeros =this.input( "i064", -1 );		//灯油消費量

	this.performanceWindow =this.input( "i041", -1 );	//窓の断熱性能
	this.performanceWall =this.input( "i042", -1 );	//壁の断熱性能 グラスウール換算mm
	this.reformWindow =this.input( "i043", -1 );	//窓の断熱リフォーム
	this.reformfloor =this.input( "i044", -1 );		//天井・床の断熱リフォーム
};

DC.calc = function() {
	//熱量計算
	var heatKcal = this.calcHeatLoad();

	//月平均値への換算
	heatKcal *= D6.area.seasonMonth.winter / 12;
	this.endEnergy = heatKcal;

	//熱源の推計　記入がない場合にはガスか灯油
	if ( this.heatEquip <= 0 ) {
		if ( this.consKeros > 0 
			||D6.area.averageCostEnergy.kerosene > 10 
		) {
			//灯油が標準10元以上もしくは記入がある
			this.heatEquip = 4;
		} else if ( this.priceGasWinter < 0 
				|| this.priceGasWinter > 40 
		) {
			//ガス代が一定ある
			this.heatEquip = 3;
		} else {
			//電気しか使っていない
			this.heatEquip = 1;
		}
	}

	//電気でまかないきれない分の計算
	var elecOver = 0;
	var coef = ( this.heatEquip == 1 ? this.apf : 1 );
	if ( this.heatEquip == 1 || this.heatEquip == 2 ) {
		if ( this.priceEleWinter > 0  ) {
			var priceMaxCons = this.priceEleWinter * 0.7
					/ D6.Unit.price.electricity 
					* D6.Unit.seasonMonth.winter / 12;
			if ( heatKcal / coef /D6.Unit.calorie.electricity > priceMaxCons ) {
				//価格からの最大値を超えて電気が消費されている場合
				var elecOver = heatKcal - priceMaxCons * coef *D6.Unit.calorie.electricity;
				heatKcal -= elecOver;
			}
		}
	}

	//熱源の割り振り
	this.calcACkwh = heatKcal / this.apf /D6.Unit.calorie.electricity;

	if ( this.priceHotWater > 0 ) {
		//熱供給 CN
		this.mainSource = "hotwater";
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	} else if ( this.heatEquip == 1) {
		//エアコン
		//消費電力量　kWh/月
		this.mainSource = "electricity";
		this[this.mainSource] =  this.calcACkwh;

	} else {
		if ( this.heatEquip == 2 ) {
			//電熱暖房 CN
			//消費電力量　kWh/月
			this.mainSource = "electricity";
		} else if ( this.heatEquip == 3 ) {
			//ガス暖房
			//消費ガス量　m3/月
			this.mainSource = "gas";
		} else if ( this.heatEquip == 4 ) {
			//灯油暖房
			//消費灯油量　L/月
			this.mainSource = "kerosene";
		} else if ( this.heatEquip == 7 ) {
			//温水供給
			this.mainSource = "hotwater";
		} else if ( this.heatEquip == 8 ) {
			this.mainSource = "coal";	//CN
		} else {
			//温水供給
			this.mainSource = "hotwater";
		}
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	}
	//電気で賄えない分を割りふる
	if ( elecOver > 0 ) {
		//寒い地域なら灯油
		if (D6.Unit.areaHeating <= 4 && this.priceKeros > 0 ) {
			this.kerosene =  elecOver /D6.Unit.calorie.kerosene;
		} else {
			this.gas =  elecOver /D6.Unit.calorie.gas;
		}
	}
};

//対策計算
DC.calcMeasure = function() {
	//断熱
	if ( !this.isSelected( "mHTuchimadoAll" ) && !this.isSelected( "mHTloweAll" ) && this.houseType != 2){
		this.measures["mHTdoubleGlassAll"].calcReduceRate( this.reduceRateDouble );
	}
	if (  !this.isSelected( "mHTloweAll" ) ){
		this.measures["mHTuchimadoAll"].calcReduceRate( this.reduceRateUchimado );
	}
	if (  this.houseType != 2){
		this.measures["mHTloweAll"].calcReduceRate( this.reduceRateLowe );
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

//view / Debug set. set in workercalc(start,*)
D6.viewparam = {};
D6.debugMode = false;


//constructor 
D6.constructor = function(a, b, c){
	D6.setscenario(a, b, c);
};

//calculate
D6.calculateAll = function(){
	D6.calcCons();
	D6.calcAverage();
	D6.calcMeasures(-1);
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
var D6 = D6||{};


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

	

// rankIn100(ratio)  calculate rank by ratio to average ------------------
//
// parameters
//		ratio	ratio to average
// return
//		rank 	number 1-100 in 100 
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

