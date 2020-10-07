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


// getCalcResult( response, res ) --------------------------------------
//		callback by web-worker, override to main.js
//		display calculation result
// parameter
//		response : action code( string ) switch action with this code
//					this "response" is same to "command" in startCalc
//		res : result parameters from worker
// return
//		none
// set
//		none
getCalcResult = function( response, res ) {
	function isset( data ){
		return ( typeof( data ) != 'undefined' );
	};
	switch( response ) {
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
			if ( response != "recalc" ) {
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
			
		case "modal":
			var modalHtml = createModalPage( res );
			$("#modal-contents").html( modalHtml );
			if ( typeof( modalJoy ) != 'undefined' ) {
				if ( modalJoy == 1 ){
					$(".modaljoyfull").show();
					$(".modaladvice").hide();
				}
			}
			$("div.page").hide();
			$("div#modal").show();
			break;

			case "save":
			localStorage.setItem('sindan'+ targetMode, res);
			alert( lang.savetobrowser );
			break;

		default:
	}
};


//inchange(id) -----------------------------------------------
// 		set input value and calculate
// parameters
//		id : input ID, "i" + 3-5 number
// set
//		in demand page, execute inchange_demand
//		in other page, execute inchange_only ( dosen't calculate with smartphone )
inchange = function( id ){
	var value = [];
	value.id = id;
	value.val = escapeHtml($("#" + id ).val());
	if ( value.val == -1 || value.val === "" ){
		$("#" + id ).removeClass("written");	
	} else {
		$("#" + id ).addClass("written");	
	}
	if ( mainTab == "demand" ) {
		startCalc( value,"inchange_demand" );
	} else {
		startCalc( value,"inchange_only" );
	}
};

//quesone_set( id, data ) ---------------------------------------
//		set input value and go to next question
// parameters
//		id : input ID, "i" + 3-5 number
//		data : selected data
quesone_set = function(id, data){
	var val={};
	val.id = id;
	val.val = data;
	startCalc( val,"quesone_set" );
};


//quesone_next() ------------------------------------------------
//		show next question
quesone_next = function(){
	var val={};
	startCalc( val,"quesone_next" );
};

//quesone_prev() ------------------------------------------------
//		show previous question
quesone_prev = function(){
	var val={};
	startCalc( val,"quesone_prev" );
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
		var val = {};
		val.mid = mid;
		startCalc( val,"measureadd" );
	};
	measuredelete = function( mid){
		clearInterval( intervalid );
		var val = {};
		val.mid = mid;
		startCalc( val,"measuredelete" );
	};

	if ( $("#messel" + mid ).prop('checked') ) {
		resultChange("r1");
		intervalid = setInterval(function(){measureadd(mid)}, 200);
	} else {
		resultChange("r1");
		intervalid = setInterval(function(){measuredelete(mid)}, 200);
	};
};


// addroom( consName ) -----------------------------------------
//		add one room or equipment and calculate 
// parameters
//		consName: consumption code of room or equipment 
// set
//		in demand page, execute add_demand
//		in other page, execute addandstart
addroom = function( consName ){
	var val = {};
	val.rdata = localStorage.getItem('sindan' + targetMode );
	val.consName = consName;
	val.subName = consName;
	if ( mainTab == "demand" ) {
		startCalc( val,"add_demand" );
	} else {
		startCalc( val,"addandstart" );
	}
};



//subtabclick( page, subpage ) --------------------------------
//		change consumption of subgroup and prepare questions
// parameters
//		page :		code of consumption belongs to
//		subpage:  	target consumption code
subtabclick = function( page, subpage ){
	var value = {};
	//tabSubNowName = subpage;
	value.consName = page;
	value.subName = subpage;

	startCalc( value,"subtabclick" );
};



//modeChange(id) -------------------------------------------------
//		change display mode for smartphone
// parameters
//		id : code "m1" to "m5" (string)
modeChange = function( id ){
	var val={};

	$(".menu span").removeClass("selected");
	$("#"+id).addClass('selected');
	$(".menu").hide();

	switch( id ) {
		case "m2":
			//input page of each question by buttons 
			val.consName = tabNowName;
			val.subName = tabSubNowName;
			startCalc( val,"tabclick" );
			break;
		case "m3":
			//result page
			val.consName = tabNowName;
			val.subName = tabSubNowName;
			startCalc( val,"recalc" );
			$(".result").hide();
			$("#r1").show();			
			$(".menuresult span").removeClass("selected");
			$("#mr1").addClass('selected');
			break;
		case "m4":
			//input page change
			val.consName = tabNowName;
			val.subName = tabSubNowName;
			startCalc( val,"tabclick" );
			break;
		case "m5":
			// consumption list to select and add
			val.consName = tabNowName;
			val.subName = tabSubNowName;
			startCalc( val,"pagelist" );
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


//resultChange(id) --------------------------------------
//		show result page of tag id "m" + id
//		without calculation
resultChange = function( id ){
	$(".menuresult span").removeClass("selected");
	$("#m"+id).addClass('selected');
	$(".result").hide();
	$("#" + id).show();	
};


//graphChange() -----------------------------------------
// 		change graph type
graphChange = function(){
	var val={};
	val.graph = $("#graphChange").val();
	graphNow = val.graph;
	startCalc( val,"graphchange" );
};


//conschange(consName, subName) ----------------------------
//		by click radio button
conschange = function( consName, subName ){
	var val = {};
	tabNowName = consName;
	tabSubNowName = subName;
	val.consName = consName;
	val.subName = subName;
//	startCalc( val,"pagelist" );
	
};

//over15show() -----------------------------------------
//		show measures more than 15
over15show = function() {
	localStorage.setItem('sindanOver15', "1");
	$('.over15').show();
};



//dataSave() -------------------------------------------
//		save input data
dataSave = function(){
	var value = "";
	startCalc( value,"save" );
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

