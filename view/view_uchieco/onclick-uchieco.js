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

// parameters -------------------------------------------------
var reduceTarget = -1;	//0,26,40,80
var hideAverage = 1;
var itemizeGraphTarget = "";
var graphCO2averageTarget = "";
var modechangeid = "";

// change display lifestyle or invest 
var displifestyle  = true;
var maxshow = 10;		//max show
var dispLifestylePage = 2;
showLifestyle = function(m){
	var c = 0;
	if ( m==1 ) {
		//工夫（ライフスタイル）
		$("tr").each(function(){
			if( $(this).hasClass("invest") ) $(this).hide();
			if( $(this).hasClass("lifestyle") ){
				c++;
				if ( c>=maxshow ) { 
					$(this).hide();
				} else {
					$(this).show();
				}
			}
		});
	} else if ( m==2 ) {
		//すべて
		$("tr").each(function(){
			if( $(this).hasClass("invest") || $(this).hasClass("lifestyle") ){
				c++;
				if ( c>=maxshow ) { 
					$(this).hide();
				} else {
					$(this).show();
				}
			}
		});
	} else {
		//機器導入
		$("tr").each(function(){
			if( $(this).hasClass("lifestyle") ) $(this).hide();
			if( $(this).hasClass("invest") ){
				c++;
				if ( c>=maxshow ) {
					$(this).hide();
				} else {
					$(this).show();
				}
			}
		});
	}
};

changeLifeStyle = function(m){
	if ( (displifestyle && m==0) || ( !displifestyle && m==1) ) {
		displifestyle = !displifestyle;
	}
	dispLifestylePage = m;
	showLifestyle(m);
	$("#L0").removeClass("selected");
	$("#L1").removeClass("selected");
	$("#L2").removeClass("selected");
	$("#L" + m).addClass("selected");
};

changeLength = function(){
	if ( maxshow == 10 ) {
		maxshow = 30;
		$("#moreMeasure").text("短く表示する");
	} else {
		maxshow = 10;
		$("#moreMeasure").text("もっと表示する");
	}
	changeLifeStyle(dispLifestylePage);
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
		case "recalc":
			inputHtml = createInputPage( res.inputPage );
			if ( res.quesone !="end" ) {
				$("#quescontents").html( createInputButtonPageOne(res.quesone) );
			}
			$('#tabcontents').html( inputHtml.combo );
			$("#measure").html(showMeasureTable(res.measure));
			leanModalSet();
			$('#itemize').removeClass("limit");
			showLifestyle(2);

			//itemize graph for m7/m8
			if ( itemizeGraphTarget !="" ) {
				//m7
				graphItemizeCommon( res.itemize_graph, itemizeGraphTarget );
			} else {
				//m8
				graphItemize( res.itemize_graph );
			}
			$("#totalReduceComment").html( showMeasureTotalMessage( res.common ) );

			//energy compare to average graph m5
			if ( modechangeid == "m5" ) {
				graphEnergy(res.average_graph);
				var comment = createEnergyAverage( res.average_graph );
				$("#energyComment").text( comment );
				
				//graphCO2averageCommon(res.average_graph, graphCO2averageTarget);
				graphCO2average(res.average_graph);
				var comment = createCompareComment( "同じ世帯人数の家族", res.average_graph.co2[0].total, res.average_graph.co2[1].total, "TO", res.average.rank100 );
				$("#co2Comment").html( comment );
			}

			//トップページの場合
			if ( modechangeid == "" ) {
				if ( localStorage.getItem('sindan' + languageMode+ targetMode ) ) {
					$("#previousstart").show();
				}
			}

			
			if ( modechangeid == "m6" ) {
				//m6
				graphCO2average(res.average_graph);
				//target set
				uchiecoTargetSet( res.average_graph );
			}
			
			if( debugMode ) {
				console.log( "return value from d6 worker----" );
				console.log( res );
			}
			break;
		
		case "inchange_only":
			break;

		case "tabclick":
		case "quesone_set":
		case "quesone_next":
		case "quesone_prev":
			if ( res.quesone.info == "end") {
				$( "#p5").show();	
				modeChange("m5");
			} else {
				var ret = createInputButtonPageOne(res.quesone);
				$("#quescontents").html( ret );
			}
			break;

		case "measureadd":
		case "measuredelete":
			$("#average").html(showAverageTable(res.average));
//			$("#cons").html(showItemizeTable(res.cons));
			$("#measure").html(showMeasureTable(res.measure));
			graphItemize( res.itemize_graph );
			graphMonthly( res.graphMonthly );
			$("#totalReduceComment").html( showMeasureTotalMessage( res.common ) );
			showLifestyle(dispLifestylePage);
			break;

		case "graphchange":
			graphItemize( res.itemize_graph );
			break;
		
		case "save":
		case "save_noalert":
			localStorage.setItem('sindan'+ languageMode+ targetMode, res);
			if ( command == "save" ) {
				alert( lang.savetobrowser );
			}
			break;
			
		case "modal":
			$("#header")[0].scrollIntoView(true);
			leanModalSet();
			var modalHtml = createModalPage( res.measure_detail );
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
	startCalc( "quesone_next", "" );
};

//quesone_prev() ------------------------------------------------
//		show previous question
quesone_prev = function(){
	startCalc( "quesone_prev", "" );
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
	startCalc( "save", "" );
};
	
//dataClear() ------------------------------------------
//		clear saved data after confirm
dataClear = function(){
	localStorage.removeItem('sindan'+ languageMode+ targetMode);
	location.reload();
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


//uchiecoTargetSet(res)
uchiecoTargetSet = function(res) {
	function compare( y, a ) {
		if( a > y ) {
			return "達成済み";
		} else {
			return Math.round(100*( y-a )/y) + "%減";
		}
	};
	var you = res.co2[0].total * 12;
	var av = res.co2[1].total * 12;
	$("span#co2younow").text(  Math.round(you) );
	$("span#co2-0").text( Math.round(av));
	$("span#co2-26").text( Math.round(av*0.74));
	$("span#co2-40").text( Math.round(av*0.6));
	$("span#co2-80").text( Math.round(av*0.2));
	$("span#co2-0rate").text( compare(you, av));
	$("span#co2-26rate").text( compare(you,av*0.74));
	$("span#co2-40rate").text( compare(you,av*0.6));
	$("span#co2-80rate").text( compare(you,av*0.2));
};


//================ D6 calculation action ===================================

//modeChange(id) -------------------------------------------------
//		change display mode for smartphone
// parameters
//		id : code "m1" to "m10" (string)
modeChange = function( id ){
	var param={};
	param.consName = tabNowName;
	param.subName = tabSubNowName;

	modechangeid = id;
	$(".menu button").removeClass("selected");
	$("#"+id).addClass('selected');
	$(".menu").hide();
	$(".page").hide();
	$( "#p" + id.substr(1,1) ).show();	
	$(".step button").removeClass("selected");

	switch( id ) {
		case "m2":
		case "m2a":
			//guide
			if ( id=="m2a" ){
				localStorage.removeItem('sindan'+ languageMode+ targetMode);
				startInit();
			}
			$("#s4").addClass("selected");
			$("#titleadd").text("");
		case "m3":
			//　question
			$("#s4").addClass("selected");
			$("#titleadd").text("質問");
			/* //in case of question list change
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
		case "m4":
			// question list
			$("#s4").addClass("selected");
			$("#titleadd").text("質問一覧");
			startCalc( "recalc", param );
			break;
		case "m5":
			// 
			$("#s5").addClass("selected");
			$("#titleadd").text("平均比較");
			startCalc( "recalc", param );
			break;
		case "m6":
			graphCO2averageTarget = "graphCO2average2";
			$("#s6").addClass("selected");
			$("#titleadd").text("CO2削減目標");
			startCalc( "recalc", param );
			break;
		case "m7":
			hideAverage = 1;
			pageMode = "m1";
			itemizeGraphTarget = "graph2";
			graphCO2averageTarget = "";
			$("#s7").addClass("selected");
			$("#titleadd").text("CO2排出の内訳");
			startCalc( "recalc", param );
			break;
		case "m8":
			hideAverage = 1;
			pageMode = "m2";
			itemizeGraphTarget = "";
			$("#s8").addClass("selected");
			$("#titleadd").text("CO2削減対策と効果");
			startCalc( "recalc", param );
			break;
		case "m9":
			startCalc( "save_noalert", param );
			break;
		case "ma":
			//about this system
			break;
		default:
			break;
	} 
};




