/**
* Home-Eco Diagnosis for JavaScript
* 
* design-common/onlick-button.js: keybord/tatch input management for smartphone
* 
* 	include this file after design-common/main.js
* 	
* @author SUZUKI Yasufumi	Hinodeya Insititute for Ecolife co.Ltd. 2016/12/13
* 
*/

// call startCalc in main.js , in order to execute D6.workercalc in d6facade.js
// result is dealed in main.js

// initialize display -------------------------------------------------
//		add actions to main.js
$(document).ready(function(){
	$(".page").hide();
	$(".menu").hide();
	$("#p1").show();
	pageMode = "m2";
});

onloadStartParamsSet = function(val){
	return val;
};


// getCalcResult( command, res ) --------------------------------------
//		callback by web-worker, override to main.js
//		display calculation result
// parameter
//		command : action code( string ) switch action with this code
//					this "command" is same to "command" in startCalc
//		res : result parameters from worker
// return
//		none
// set
//		none
getCalcResult = function( command, res ) {
	function isset( data ){
		return ( typeof( data ) != 'undefined' );
	};
	switch( command ) {
		case "start":
		case "tabclick":
		case "recalc":
			inputHtml = createInputPage( res.inputPage );
			$('#tabcontents').html( inputHtml.combo );
			if ( res.quesone !="end" ) {
				$("#quescontents").html( createInputButtonPageOne(res.quesone) );
			}
			
			$("#average").html(showAverageTable(res.average));
			$("#cons").html(showItemizeTable(res.cons));
			$("#measure").html("<h3>" + lang.effectivemeasures + "</h3>" + showMeasureTable(res.measure));
			$("#p3").show();
			$("#r1").show();
			$("#r3").show();
			graphItemize( res.graphItemize );
			graphMonthly( res.graphMonthly );
			if ( command != "recalc" ) {
				$("#p3").hide();
				$("#r1").hide();
			}
			$("#r3").hide();
			showPageName = res.inputPage.title;
			$(".constitle").html( showPageName );
			if ( localStorage.getItem('sindanOver15') ) {
				$('.over15').toggle();
			}
			break;
		
		case "subtabclick":
			inputHtml = createInputPage( res.inputPage );
			$('#tabcontents').html( inputHtml.combo );

			//sub tab click method : main tab is not changed
			tabSubNowName = res.subName;
			var page = tabNowName;
			var subpage = tabSubNowName;
			$('ul.submenu li' ).removeClass('select');
			$('ul.submenu li#' + page + "-" + subpage ).addClass('select');

			showPageName = res.inputPage.title;
			$(".constitle").html( showPageName );
			break;

		case "addandstart":
		case "pagelist":
			inputHtml = createPageList( res.inputPage );
			$('#pagelist').html( inputHtml );
			showPageName = res.inputPage.title;
			$(".constitle").html( showPageName );
			break;
		
		case "inchange_only":
			break;

		case "quesone_set":
		case "quesone_next":
		case "quesone_prev":
			if ( res.quesone.info == "end") {
				modeChange("m2");
			} else {
				var ret = createInputButtonPageOne(res.quesone);
				$("#quescontents").html( ret );
			}
			break;

		case "measureadd":
		case "measuredelete":
			$("#average").html(showAverageTable(res.average));
			$("#cons").html(showItemizeTable(res.cons));
			$("#r1").show();
			$("#r3").show();
			graphItemize( res.graphItemize );
			graphMonthly( res.graphMonthly );
			$("#r3").hide();
			break;

		case "graphchange":
			graphItemize( res );
			break;
		
		case "add_demand":
			$("div#inDemandSumup").html(showDemandSumupPage(res.demandin));
			$("div#inDemandLog").html(showDemandLogPage(res.demandlog));
			break;

		case "demand":
			$("div#inDemandSumup").html(showDemandSumupPage(res.demandin));
			$("div#inDemandLog").html(showDemandLogPage(res.demandlog));
			break;
			
		case "inchangeDemand":
			graphDemand( res.graph );
			break;
			
		case "save":
			localStorage.setItem('sindan'+ languageMode+ targetMode, res);
			alert( lang.savetobrowser );
			break;
			
		case "modal":
			$("#header")[0].scrollIntoView(true);
			leanModalSet();
			var modalHtml = createModalPage( res.measureDetail );
			$("#modal-contents").html( modalHtml );
			if ( typeof( modalJoy ) != 'undefined' && modalJoy == 1 ){
				$(".modaljoyfull").show();
				$(".modaladvice").hide();
			}
			break;

		default:
	}
};



//================ button action ===================================

//inchange(id) -----------------------------------------------
// 		set input value and calculate
// parameters
//		id : input ID, "i" + 3-5 number
// set
//		in demand page, execute inchange_demand
//		in other page, execute inchange_only ( dosen't calculate with smartphone )
inchange = function( id ){
	var param = [];
	param.id = id;
	param.val = escapeHtml($("#" + id ).val());
	if ( param.val == -1 || param.val === "" ){
		$("#" + id ).removeClass("written");	
	} else {
		$("#" + id ).addClass("written");	
	}
	if ( mainTab == "demand" ) {
		startCalc( "inchange_demand", param );
	} else {
		startCalc( "inchange_only", param );
	}
};

//quesone_set( id, data ) ---------------------------------------
//		set input value and go to next question
// parameters
//		id : input ID, "i" + 3-5 number
//		data : selected data
quesone_set = function(id, data){
	var param={};
	param.id = id;
	param.val = data;
	startCalc( "quesone_set", param );
};


//quesone_next() ------------------------------------------------
//		show next question
quesone_next = function(){
	var param={};
	startCalc( "quesone_next", param );
};

//quesone_prev() ------------------------------------------------
//		show previous question
quesone_prev = function(){
	var param={};
	startCalc( "quesone_prev", param );
};


//measureadddelete(mid) ------------------------------------
//		adopt or release measure as selectedlist and calculate
//		called when checkbox is changed
// parameters
//		mid : measure id
// set
//		checked, execute measureadd
//		released, execute measuredelete
measureadddelete = function( mid ){
	var intervalid;		//interval ID
	measureadd = function( mid){
		clearInterval( intervalid );
		var param = {};
		param.mid = mid;
		startCalc( "measureadd", param );
	};
	measuredelete = function( mid){
		clearInterval( intervalid );
		var param = {};
		param.mid = mid;
		startCalc( "measuredelete", param );
	};

	if ( $("#messel" + mid ).prop('checked') ) {
		resultChange("r1");
		intervalid = setInterval(function(){measureadd(mid)}, 200);
	} else {
		resultChange("r1");
		intervalid = setInterval(function(){measuredelete(mid)}, 200);
	};
};

//resultChange(id) --------------------------------------
//		show result page of tag id "m" + id
//		without calculation
resultChange = function( id ){
	$(".menuresult span").removeClass("selected");
	$("#m"+id).addClass('selected');
	$(".result").hide();
	$("#" + id).show();	
};


// addroom( consName ) -----------------------------------------
//		add one room or equipment and calculate 
// parameters
//		consName: consumption code of room or equipment 
// set
//		in demand page, execute add_demand
//		in other page, execute addandstart
addroom = function( consName ){
	var param = {};
	param.rdata = localStorage.getItem('sindan' + targetMode );
	param.consName = consName;
	param.subName = consName;
	if ( mainTab == "demand" ) {
		startCalc( "add_demand", param );
	} else {
		startCalc( "addandstart", param );
	}
};


//subtabclick( page, subpage ) --------------------------------
//		change consumption of subgroup and prepare questions
// parameters
//		page :		code of consumption belongs to
//		subpage:  	target consumption code
subtabclick = function( page, subpage ){
	var param = {};
	//tabSubNowName = subpage;
	param.consName = page;
	param.subName = subpage;

	startCalc( "subtabclick", param );
};


//graphChange() -----------------------------------------
// 		change graph type
graphChange = function(){
	var param={};
	param.graph = $("#graphChange").val();
	graphNow = param.graph;
	startCalc( "graphchange", param );
};


//conschange(consName, subName) ----------------------------
//		by click radio button
conschange = function( consName, subName ){
	var param = {};
	tabNowName = consName;
	tabSubNowName = subName;
	param.consName = consName;
	param.subName = subName;
//	startCalc( "pagelist", param );
	
};


//dataSave() -------------------------------------------
//		save input data
dataSave = function(){
	var param = "";
	startCalc( "save", param );
};
	
//dataClear() ------------------------------------------
//		clear saved data after confirm
dataClear = function(){
	if ( confirm( lang.dataClear ) ) {
		localStorage.removeItem('sindan'+ targetMode);
		location.reload();
	}
};

//menuopen() ---------------------------------------------------
menuopen = function() {
	if( !$("div#modal").is(":hidden") ){
		modalclose();
	}
	$('.menu').toggle();
};

//modalclose() --------------------------------------------------
//		close detail result of measure
modalclose = function(){
	$("#p3").show();
	$("div#modal").hide();
};



//================ after D6 calculation action ===================================

//modeChange(id) -------------------------------------------------
//		change display mode for smartphone
// parameters
//		id : code "m1" to "m5" (string)
modeChange = function( id ){
	var param={};

	$(".menu span").removeClass("selected");
	$("#"+id).addClass('selected');
	$(".menu").hide();

	switch( id ) {
		case "m2":
			//input page of each question by buttons 
			param.consName = tabNowName;
			param.subName = tabSubNowName;
			startCalc( "tabclick", param );
			break;
		case "m3":
			//result page
			param.consName = tabNowName;
			param.subName = tabSubNowName;
			startCalc( "recalc", param );
			$(".result").hide();
			$("#r1").show();			
			$(".menuresult span").removeClass("selected");
			$("#mr1").addClass('selected');
			break;
		case "m4":
			//input page change
			param.consName = tabNowName;
			param.subName = tabSubNowName;
			/* in case of question list change
			param.subName = [
			'i010',
			'i021',
			'i001',
			'i002',
			'i003',
			'i051',
			'i061'
			];
			*/
			startCalc( "tabclick", param );
			break;
		case "m5":
			// consumption list to select and add
			param.consName = tabNowName;
			param.subName = tabSubNowName;
			startCalc( "pagelist", param );
			break;
		case "m6":
			break;
		case "m7":
			break;
		case "m8":
			break;
		case "m9":
			break;
		case "m10":
			//about this system
			break;
		default:
			break;
	} 
	$(".page").hide();
	$( "#p" + id.substr(1,10) ).show();	
};




