/**
* Home-Eco Diagnosis for JavaScript
* 
* onlick-action.js: key input for PC system
* 
* 
* @author SUZUKI Yasufumi	Hinodeya Insititute for Ecolife.co.ltd. 2016/12/13
* 
*/

// call startCalc in main.js , in order to execute D6.workercalc in d6facade.js
// result is dealed in main.js

//------- view depend action ---------------
var detailNextDiagnosisCode = 2;
var evaluateaxisNextMode = "m3";

tabNowName = "action01";
tabSubNowName = "action01";

//================ button action ===================================
//inchange(id) -----------------------------------------------
// 		set input value and calculate
// parameters
//		id : input ID, "i" + 3-5 number
// set
//		in other page, execute inchange
inchange = function( id ){
	var param = {};
	param.id = id;
	param.val = escapeHtml($("#" + id ).val());
	if ( param.val == -1 || param.val === "" ){
		$("#" + id ).removeClass("written");	
	} else {
		$("#" + id ).addClass("written");	
	}
	startCalc( "inchange", param );
};


// calcActionPoint() --------------------------------------
//		calc action point
calcActionPoint = function(){
	var param={};
	param.subName = "action01";
	startCalc( "evaluateaxis", param );
};


//graphChange() -----------------------------------------
// 		change graph type
graphChange = function(){
	var param={};
	param.graph = $("#graphChange").val();
	graphNow = param.graph;
	startCalc( "graphchange", param );
};


//over15show() -----------------------------------------
//		measures list is restricted in 15. this button shows measures more than 15.
over15show = function() {
	localStorage.setItem('sindanOver15', "1");
	$('.over15').show();
};

	
//dataSave() -------------------------------------------
//		save input data
dataSave = function(){
	var param = {};
	startCalc( "save", param );
};
	
//dataClear() ------------------------------------------
//		clear saved data, after confirm
dataClear = function(){
	if ( confirm( lang.dataClear ) ) {
		localStorage.removeItem('sindan'+ targetMode);
		location.reload();
	}
};


// detail step
function saveandgo(){
	var param = {};
	startCalc( "saveandgo", param );
};

//show next one measure by click
var measuredisp = 0;
function measurenext(){
	var param = {};
	if( measuredisp == 0 ){
		$("#measure").show();
		$("table#itemize tr").hide();
		$("table#itemize tr:nth-child(1)").show();
	}
	measuredisp++;
	$(".notfirst").show();
	$("table#itemize tr:nth-child("+(measuredisp+1)+")").show();
	$("#mesnextbtn").text( lang.home_easy_measure_show(measuredisp+1) );
	
	if ( measuredisp == 1 ) {
		$("#totalReduceComment").show();
	}
	if ( measuredisp == 2 ) {
		$(".onlyfirst").hide();
	}
	if ( measuredisp == messhownumber ) {
		$("#mesnextbtn").hide();
		$("#lastbtns").show();
		$(".show7").show();
	}
	
	param.mid = $("table#itemize tr:nth-child("+(measuredisp+1)+")").prop("id").substr(5,8);
	startCalc( "measureadd_comment", param );

};

//================ after D6 calculation action ===================================

//modeChange(id) -------------------------------------------------
//		change display mode for smartphone
// parameters
//		id : code "m1" to "m5" (string)
modeChange = function( id ){
	var param={};

	$(".page").hide();
	$( "#p" + id.substr(1,10) ).show();	
	$('#top').hide();

	switch( id ) {
		case "m2":
			//result page table
			tabNowName = "action01";
			tabSubNowName = "action01";
			param.id = "i001";
			param.val = escapeHtml($("#i001" ).val());
			$("#step span").removeClass("already");
			$("#s1").addClass("already");
			startCalc( "inchange", param );
			break;
		case "m3":
			//result page graph
			param.consName = tabNowName;
			param.subName = tabSubNowName;
			$("#step span").removeClass("already");
			$("#s2").addClass("already");
			startCalc( "tabclick", param );
			break;
		case "m4":
			//measures calculation
			param.id = "i010";
			param.val = "4";
			measuredisp = 0;
			$("#step span").removeClass("already");
			$("#s3").addClass("already");
			$("#totalReduceComment").hide();
			$(".show7").hide();
			$("#measure").hide();
			$(".onlyfirst").show();
			$("#mesnextbtn").text( lang.home_easy_p4_button_next );
			startCalc( "inchange", param );
			break;
		case "m5":
			// consumption list to select and add
			$("#step span").removeClass("already");
			$("#s1").addClass("already");
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
};


function showEvaluateAxis( res ){
	var html = "";
	var title = [lang.home_action_axis1.replace(/\\\'/g, '\''), lang.home_action_axis2.replace(/\\\'/g, '\''), lang.home_action_axis3.replace(/\\\'/g, '\'')];
	var label = [lang.home_action_label1.replace(/\\\'/g, '\''), lang.home_action_label2.replace(/\\\'/g, '\''), lang.home_action_label3.replace(/\\\'/g, '\'')];
	for ( var i=0 ; i<3 ;i++ ) {
		html += "<div class='evaluate'>";
		html += "<h3>" + title[i] + "</h3>";
		html += "<img src='view/images/" + ( res[i][0] > 75 ? "good.jpg" : ( res[i][0] > 40 ? "even.jpg" : "bad.jpg" ) ) + "'><br>";
		html += "<font size='+2'>" + ( res[i][0] > 75 ? label[0] : ( res[i][0] > 40 ? label[1] : label[2] ) ) + "</font><br>";
		html += lang.point_disp(parseInt(res[i][0])) +"<Br>"+lang.home_action_good_point.replace(/\\\'/g, '\'')+"：<br>" + res[i][1] + "<br>"+lang.home_action_bad_point.replace(/\\\'/g, '\'')+"：<br>" + res[i][2] + "<br>" ;
		html += "</div>";
	}
	$("#actionpoint").html( html );
};


