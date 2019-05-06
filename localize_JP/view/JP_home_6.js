/* diagnosis design setting focus on questions and measures
 */

//prohibit questions numbers as array i***
var prohibitQuestions = [];

//allow questions numbers. use this setting when prohibitQuestions is null.
var allowedQuestions = [];

//prohibit measures codes as array m*****
//var prohibitMeasures = ["mTOsolar"];	//example
var prohibitMeasures = ["mHWshowerTime30", "mTVradio"];

//allow measures codes. use this setting when prohibitMeasures is null.
var allowedMeasures = [];

//fix in D6.setscenario, just after setDefs
var defInput = [];
/*
defInput[0] = ["i002", "title", "戸建てですか集合住宅ですか"];
defInput[1] = ["i061", "title", "月平均の電気代"];
defInput[2] = ["i063", "title", "月平均のガス＋灯油代"];
defInput[3] = ["i063", "text",  "1ヶ月あたりのガスと灯油代の合計額を記入してください。"];
defInput[4] = ["i075", "title",  "月平均のガソリン代"];
*/
//global
var showMeasureTable_Max = 7; //createpage.js showMeasureTable() max result
