/**
* Home-Eco Diagnosis for JavaScript
* 
* onlick.js: key input for PC system
* 
* 
* @author SUZUKI Yasufumi	Hinodeya Insititute for Ecolife.co.ltd. 2016/12/13
* 
*/

var html = "<table style='border:1px; border-collapse: collapse;'>";
var results = {};
var count = 1;

calc =function(){
	
	var startcondition = $("#startcondition").val();
	var target = $("#target").val();
	var st = $("#st").val();
	var to = $("#to").val();
	var step = $("#step").val();
	var observe = $("#observe").val();
	

	var param = [];
	
	param.construct = true;
	if( startcondition != "" ) {
		var ins = startcondition.split(";");
		for ( var i in ins ){
			var v = ins[i].split("=");
			param.inputs[v[0]] = v[1];
		}
	}
	param.inputs[target] = st;
	param.getresult = true;
	startcalc( "common", param );
	
	for ( i=st+step ; i<to ; i+= step ) {
		param = [];
		param.getresult = true;
		param.id = target;
		param.val = i;
		startcalc( "common", param );		
	}
	
};

afterworker = function(res){
	results[count] = 
	count++;
}


