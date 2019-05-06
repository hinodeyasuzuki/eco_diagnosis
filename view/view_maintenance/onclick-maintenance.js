/**
 * Home-Eco Diagnosis for JavaScript
 *
 * design-common/onlick-maintenance.js: keybord/tatch input management for smartphone
 *
 *
 * @author SUZUKI Yasufumi	Hinodeya Insititute for Ecolife co.Ltd. 2016/12/13
 *
 */

// call startCalc in main.js , in order to execute D6.workercalc in d6facade.js
// result is dealed in main.js

var selList;

// initialize display -------------------------------------------------
//		add actions to main.js
$(function() {
	var def = D6.scenario.setDefs();
	var rdata = localStorage.getItem("sindan" + languageMode + targetMode);
	rdata = rdata ? decodeURIComponent(escape(atob(rdata))) : "";
	var param = rdata.split(",");
	selList = "";
	for (i = 0; i < param.length; i++) {
		paramOne = param[i].split("=");
		if (paramOne[0] == "mesSelId") {
			selList = paramOne[1]; //3 mesid 2 subid 8 cost 8 priceChange 6 co2Change
		}
	}
	showList();
});

function setOneMeasure(j, measure) {
	var html = "";
	//one measure
	html += "<h2>" + D6.scenario.defMeasures[measure].title + "</h2>";
	html +=
		"<img src='./view/images/p" +
		D6.scenario.defMeasures[measure].figNum +
		".jpg'' id='mesimg'><p>";

	html +=
		"<table><tr><th>初期投資</th><td style='text-align=right;'>" +
		parseInt(selList.substr(j + 5, 8)) +
		"円</td></tr>";
	html +=
		"<tr><th>光熱費削減額</th><td style='text-align=right;'>" +
		(parseInt(selList.substr(j + 13, 1)) == 9 ? "-" : "") +
		parseInt(selList.substr(j + 14, 7)) +
		"円</td></tr>";
	html +=
		"<tr><th>CO2削減</th><td style='text-align=right;'>" +
		(parseInt(selList.substr(j + 21, 1)) == 9 ? "-" : "") +
		parseInt(selList.substr(j + 22, 5)) +
		" kg</td></tr></table>";

	html += "<p>" + D6.scenario.defMeasures[measure].advice + "</p>";
	$("#onemeasure").show();
	$("#list").hide();
	$("#mescontents").html(html);
}

function showList() {
	var html = "";
	var measure = "";
	for (var j = 0; j < selList.length; j += 27) {
		var mesid = parseInt(selList.substr(j, 3));
		var subid = parseInt(selList.substr(j + 3, 2));
		for (var mid in D6.scenario.defMeasures) {
			if (D6.scenario.defMeasures[mid].mid == mesid) {
				html +=
					"<li><span onclick='setOneMeasure(" +
					j +
					",\"" +
					mid +
					"\");'>" +
					D6.scenario.defMeasures[mid].title +
					"</span></li>";
				break;
			}
		}
	}
	$("#measures").html(html);
	$("#onemeasure").hide();
	$("#list").show();
}
