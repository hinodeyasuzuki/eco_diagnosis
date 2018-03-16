/**
* Home-Eco Diagnosis for JavaScript
* 
* onlick.js: key input for PC system
* 
* 
* @author SUZUKI Yasufumi	Hinodeya Insititute for Ecolife.co.ltd. 2016/12/13
* 
*/

// call startCalc in main.js , in order to execute D6.workercalc in d6facade.js
// result is dealed in main.js

//------- view depend action ---------------
var detailNextDiagnosisCode = 2;

//------- game property ------------
var budget = 10000;

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



//graphChange() -----------------------------------------
// 		change graph type
graphChange = function(){
	var param={};
	param.graph = $("#graphChange").val();
	graphNow = param.graph;
	startCalc( "graphchange", param );
};


	
//dataSave() -------------------------------------------
//		save input data
dataSave = function(){
	startCalc( "save", "" );
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
	startCalc( "saveandgo", "" );
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
			param.id = "i001";
			param.val = escapeHtml($("#i001" ).val());
			startCalc( "inchange", param );
			break;
		case "m3":
			break;
		case "m4":
			break;
		case "m5":
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




