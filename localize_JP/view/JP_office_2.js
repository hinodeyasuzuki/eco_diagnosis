/* diagnosis design setting focus on questions and measures
 */

//prohibit questions numbers as array i***
var prohibitQuestions = [];

//allow questions numbers. use this setting when prohibitQuestions is null.
var allowedQuestions = [];

//prohibit measures codes as array m*****
var prohibitMeasures = [];

//allow measures codes. use this setting when prohibitMeasures is null.
var allowedMeasures = [];

//fix in D6.setscenario, just after setDefs
var defInput = [];
/*
defInput[0] = ["i002", "title", "standalone or apartment?"];
defInput[1] = ["i061", "title", "monthly electricity charge"];
*/

//global
//var showMeasureTable_Max = 40;	//createpage.js showMeasureTable() max result
