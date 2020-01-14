/* diagnosis design setting focus on questions and measures
 */

//prohibit questions numbers as array i***
var prohibitQuestions = [];

//allow questions numbers. use this setting when prohibitQuestions is null.
var allowedQuestions = [
	"i021",
	"i001",
	"i002",
	"i003",
	"i051",
	"i061",
	"i063",
	"i064",
	"i075",
	"i101",
	"i103",
	"i105",
	"i201",
	"i202",
	"i205",
	"i601",
	"i701",
	"i010"
];

//prohibit measures codes as array m*****
//var prohibitMeasures = ["mTOsolar"];	//example
var prohibitMeasures = [];

//allow measures codes. use this setting when prohibitMeasures is null.
var allowedMeasures = [];

//fix in D6.setscenario, just after setDefs
var defInput = [];
