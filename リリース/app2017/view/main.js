/**
* Home-Eco Diagnosis for JavaScript
* 
* view/main.js:  Main Class to use d6 package
* 
* in this routine, cannot access D6, can access html DOM
* call D6 routine by web-worker
* 
* @author SUZUKI Yasufumi	2016/05/23
* 
*/

/*
	1) click function is listed in view/onclick*.js
	2) startCalc(val, command ) connect to D6 calculation
	3) result is dealed in getCalcResult( response, res )
	
	"command" string is same to "response" 
	
	command/response	action
	start				clear to construct instances and calculate
	addandstart			add one room or equipment and calculate 
	tabclick			change consumption group and prepare questions
	subtabclick			change consumption of subgroup and prepare questions
	inchange			set input value and calculate
	inchange_only		set input value but not calculate
	quespne_next		go to next question in case of smartphone
	quesone_prev		go to previous question in case of smartphone
	quesone_set			set input value and go to next question in case of smartphone
	recalc				calculate
	pagelist			consumption list which can be select in case of smartphone
	measureadd			adopt measure as selectedlist and calculate
	measuredelete		release measure whitch is in selectedlist and calclulate
	graphchange			change graph type
	add_demand			add equipment to estimate demand
	demand				show demand estimation page with graph
	inchange_demand		usage of equipment in demand estimation is changed and calculate
	modal				show detail result of one measure
	save				save input data to browser
	savenew				save input data -- not installed --
	load				load input data from browser -- not installed --
*/

//useWorker,debugMode is set in php files
var includejs = ( useCode==2 ? includesumjs : includeminjs);

//worker parameters
var worker = "";
var val = "";

//display state initialize
var tabNow = "";

var tabNowName = "easy01";		// default page 
var tabSubNowName = "easy01";	// default sub page
var showPageName = lang.startPageName;	// title of default page
var tabSubNow = tabNowName + "-" + tabSubNowName;

var tabNowIndex = 0;
var tabSubNowCode = "";

var graphNow = "co2";	// graph unit, "co2", "jules" or "price"
var mainTab = "cons";	// main tab mode , "cons" or "demand"
var pageMode = "m1";	// "m1":input page ,"m2":measures page

// set in focussetting
var prohibitQuestions = [];
var allowedQuestions = [];
var prohibitMeasures = [];
var allowedMeasures = [];


// initialize after html and scripts are loaded ========================================
//
//
$(document).ready(function(){
	$(".preloader").hide();
	$(".contents").show();
	
	// check web-worker
	if ( useWorker && window.Worker) {
		worker = new Worker( includejs );

		// call back by web-worker
		worker.onmessage = function (event) {
			getCalcResult( event.data.response, event.data.result );
		};

		worker.addEventListener=("error",function(event){
			_output.textContent = event.data;
		},false);

	} else {
		//no web-worker
		if ( useWorker ) //alert("sorrry.  web woker dosen't work.");
		useWorker = false;
		includejs = " [use each js] ";
	};

	//clear measures number limit
	localStorage.removeItem('sindanOver15');

	//default setting
	var val = {};
	if ( typeof(paramdata) !="undefined" && paramdata ) {
		val.rdata = paramdata;
	} else {
		val.rdata = localStorage.getItem('sindan' + languageMode+ targetMode );
		if ( debugMode == 1 ) console.log( "data loaded from localStorage" );
	}
	val.consName = tabNowName;
	val.subName = tabSubNowName;
	val.prohibitQuestions = prohibitQuestions;	//focus questions
	val.allowedQuestions = allowedQuestions;
	val.defInput = (typeof(defInput) =="undefined" ? "" : defInput);
	val.debugMode = ( debugMode ? 1 : 2 );	//set to D6
	val.dispMode = dispMode;
	val.targetMode = targetMode;
	val.focusMode = focusMode;
	startCalc( val,"start" );

/*
	//common output to log
	console.log( "useWorker", useWorker, includejs, "debugMode", debugMode);
*/

});


// startCalc( val, command )  ---------------------------------------
//		select worker or non-worker function , and start calculation
// parameters
//		val : parameters to calclation ( any type )
//		command : command code (string)
// return
//		none
// set
//		after both web-worker or workercalc, getCalcResult() work to show display
//
function startCalc( val, command ){
	if ( useWorker){
		//use worker
		val.targetMode = targetMode;
		worker.postMessage({ "command":command ,"val": val });
			//call D6.workercalc in d6facade.js as worker 
			//after worker getCalcResult() is called
		
	} else {
		//not use woker
		D6.targetMode = targetMode;
		var ret = D6.workercalc( command, val );
		getCalcResult( command, ret );		//expressly call getCalcResult()
	}
};


// getCalcResult( response, res ) ----------------------------------------------
//		call backed by web-worker, called after workercalc
//		display calculation result
//		in smartphone this is overrided in design-common/onclick-buttons.js
// parameter
//		command : action code( string ) switch action with this code
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
	case "addandstart":
	case "tabclick":
		inputHtml = createInputPage( res.inputPage );
		$('#tab').html( inputHtml.menu );
		$('#tabcontents').html( inputHtml.combo );
		
		$("#average").html(showAverageTable(res.average));
		$("#cons").html(showItemizeTable(res.cons));
		$("#measure").html("<h3>" + lang.effectivemeasures + "</h3>" + showMeasureTable(res.measure));
		graphItemize( res.graphItemize );
		graphMonthly( res.graphMonthly );
		leanModalSet();
		
		//tab click method
		$('#tab li').click(function() {
			var index = $('#tab li').index(this);
			var consname = $(this).prop( "id" );
			tabclick(index, consname);
		});			
		tabset(tabNow);	

		if ( localStorage.getItem('sindanOver15') ) {
			$('.over15').toggle();
		}
		break;
	
	case "subtabclick":
		inputHtml = createInputPage( res.inputPage );
		$('#tabcontents').html( inputHtml.combo );
		//sub tab click method : main tab is not changed
		tabset(tabNow);
		tabSubNowName = res.subName;
		var page = tabNowName;
		var subpage = tabSubNowName;
		//$('li#subpage' + page + "-" + subpage ).css('display','block');
		$('ul.submenu li' ).removeClass('select');
		$('ul.submenu li#' + page + "-" + subpage ).addClass('select');

		break;
	
	case "modal":
		$("#header")[0].scrollIntoView(true);
		leanModalSet();
		var modalHtml = createModalPage( res );
		$("#modal-contents").html( modalHtml );
		if ( typeof( modalJoy ) != 'undefined' ) {
			if ( modalJoy == 1 ){
				$(".modaljoyfull").show();
				$(".modaladvice").hide();
			}
		}
		break;

	case "measuredetail":
		var detailHtml = createModalPage( res );
		$("#measuredetail").html( detailHtml );
		break;

	case "inchange":
	case "measureadd":
	case "measuredelete":
		$("#average").html(showAverageTable(res.average));
		$("#cons").html(showItemizeTable(res.cons));
		graphItemize( res.graphItemize );
		graphMonthly( res.graphMonthly );
		$("#measure").html("<h3>" + lang.effectivemeasures + "</h3>" + showMeasureTable(res.measure) );
		leanModalSet();
		if ( localStorage.getItem('sindanOver15') ) {
			$('.over15').show();
		}
	case "measureadd_comment":
		var redco2 = res.co2Original - res.co2;
		var redcost = res.costOriginal - res.cost;
		if( !isNaN(redco2) ) {
			$("#totalReduceComment").html( lang.comment_combined_reduce( Math.round(redco2/res.co2Original*100), comma3(redcost*12), comma3(redco2*12)) );
		} else {
			$("#totalReduceComment").html("");
		}
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
		graphDemand( res.graph );
		break;
		
	case "inchange_demand":
		graphDemand( res.graph );
		break;
		
	case "save":
	case "save_noalert":
	case "saveandgo":
		localStorage.setItem('sindan'+ languageMode+ targetMode, res);
		var resurl = "";
		var url = location.protocol + "//" + location.hostname + ( location.pathname ? location.pathname  :  "/" );
		var params = location.search;
		if ( params ) {
			var parray = params.split("data=");
			resurl = url + parray[0] + "&data=" + res;
		} else {
			resurl = url + "?data=" + res;
		}
		
		if ( command == "save" ) {
			alert( lang.savetobrowser + lang.savedataisshown +"\n" + resurl );
		}
		if ( command == "saveandgo" ) {
			if ( dispMode == 3 ) {
				location.href="./?lang="+languageMode+"&v=2&intro=-1";
			} else if ( dispMode == 2 ) {
				location.href="./?lang="+languageMode+"&v=0&intro=-1";
			}
		}
		break;

/*
		case "savenew":
			//save new , not use for IE9,safari
			var dat  = new Date();
			var fname = "d6-" + 
						dat.getFullYear() + 
						('0' + (dat.getMonth() + 1)).slice(-2) + 
						('0' + dat.getDate()).slice(-2) + 
						".txt";
			var blob = new Blob([res], {type: "text/plain"}); //change to binary
			// check ie
			if(window.navigator.msSaveBlob) {
				// use original function on ie
				window.navigator.msSaveBlob(blob, fname);
			} else {
				// other browser
				a.href = window.URL.createObjectURL(blob);
				a.target = '_blank';
				a.download = fname;
				a.click();
			}
			
			alert( "saved as  " + fname + "" );
			window.URL.revokeObjectURL(a.href);
			
		case "load":
			break;
*/

	default:
	}
};





