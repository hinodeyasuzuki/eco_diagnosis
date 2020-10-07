/* diagnosis design setting focus on questions and measures  
*/

//prohibit questions numbers as array i***
var prohibitQuestions = [];

//allow questions numbers. use this setting when prohibitQuestions is null.
var allowedQuestions = [];

//prohibit measures codes as array m*****
//var prohibitMeasures = ["mTOsolar"];	//example
var prohibitMeasures = [];

//allow measures codes. use this setting when prohibitMeasures is null.
var allowedMeasures = [];


//fix in D6.setscenario, just after setDefs
var D6 = D6||{};
D6.fix = function() {
	//	D6.scenario.defInput["i002"].title = "example";
};

//default value set in d6facade.js
D6.forceDataSet = function() {
};


