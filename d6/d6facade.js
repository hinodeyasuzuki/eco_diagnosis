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

