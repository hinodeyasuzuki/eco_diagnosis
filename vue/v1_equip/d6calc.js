// work on both amazon Lambda and local
//　HTML(JS)から呼び出される計算ロジック（ファサード） d6calc()
//
// d6calc 			共通D6ルーチン呼び出し facadeの代わり
//
// callGetScenario 	シナリオ受信
// callGetResult　	結果の取得
// callGetDetail　	詳細の取得
// callSetMeasureSelChange 対策選択の変更
//
//

// シナリオ受信
function callGetScenario(params) {
	var resjson = d6calc(params); //in d6calc local

	if (!resjson.scenario.defInput) {
		alert("Error setting: defInput が適切に設定されていません。");
	}
	if (!resjson.scenario.defCons) {
		alert("Error setting: defCons が適切に設定されていません。");
	}
	for (var k in resjson.scenario.defInput) {
		Vue.set(app.defInput, k, resjson.scenario.defInput[k]);
		var keysel = resjson.scenario.defInput[k].inputType;
		//選択肢のkey は defInputに合わせる
		if (resjson.scenario.defInput[k].selectData)
			Vue.set(app.defSelectData, k, resjson.scenario.defInput[k].selectData);
		if (resjson.scenario.defInput[k].selectValue)
			Vue.set(app.defSelectValue, k, resjson.scenario.defInput[k].selectValue);
		if (resjson.scenario.defInput[k].selectValue) {
			Vue.set(app.selects, k, []);
			for (var k2 in resjson.scenario.defInput[k].selectValue) {
				var item = resjson.scenario.defInput[k].selectValue[k2];
				if (item !== "" && item != "選んで下さい" && item != "選んでください") {
					app.selects[k].push({
						label: item,
						code: resjson.scenario.defInput[k].selectData[k2]
					});
				}
			}
		}
	}
	for (var k in resjson.scenario.defConsShow) {
		if (k == "" || k == "TO") continue; //全体の時には分野一覧に表示
		Vue.set(app.defConsShow, k, resjson.scenario.defConsShow[k]);
	}
	for (var k in resjson.scenario.defCons) {
		Vue.set(app.defCons, k, resjson.scenario.defCons[k]);
	}

	//現在の月を設定
	var date = new Date();
	var mon = date.getMonth() + 1;

	//シナリオユニット追加処理
	for (var k in D6.scenario.defInputGroup) {
		if (D6.scenario.defInputGroup[k].measures) {
			Vue.set(app.defConsThema, k, D6.scenario.defInputGroup[k].title);
		}
	}

	//その他を設定
	for (var key in D6.consOTother.eq_list) {
		Vue.set(app.eqlist, key, D6.consOTother.eq_list[key]);
	}

	if (debugmode) console.log(D6);
}

// callGetResult　結果の取得と設定
//
function callGetResult(params) {
	var resjson = d6calc(params); //in d6calc local

	//結果取得後の処理
	if (debugmode) console.log(resjson);

	result = resjson;
	Vue.set(app, "measures", []);
	for (var k in resjson.measure) {
		var res = resjson.measure[k];
		res.selectafter = app.measures_selectafter.indexOf(res.mesID) >= 0;
		res.selectalready = app.measures_selectalready.indexOf(res.mesID) >= 0;
		res.selectno = app.measures_selectno.indexOf(res.mesID) >= 0;
		app.measures.push(res);
	}

	//表示中分野の量と削減
	var consCode = "TO";

	Vue.set(app, "co2", Math.round(resjson.consShow[consCode].co2Original * 12));
	Vue.set(
		app,
		"reduceCO2",
		Math.round(
			-(
				resjson.consShow[consCode].co2 - resjson.consShow[consCode].co2Original
			) * 12
		)
	);
	Vue.set(
		app,
		"cost",
		Math.round(resjson.consShow[consCode].costOriginal * 12)
	);
	Vue.set(
		app,
		"reduceCost",
		Math.round(
			-(
				resjson.consShow[consCode].cost -
				resjson.consShow[consCode].costOriginal
			) * 12
		)
	);

	Vue.set(app.pageResult, "rank100", resjson.average.rank100);
	Vue.set(app.pageResult, "afterrank100", resjson.average.afterrank100);

	//結果一覧表示の場合には結果htmlを生成
	//	checkshow_all(resjson); //checkshow.js

	//グラフ描画をワンタイム遅らせて実行
	Vue.set(app, "important_items", []);
	var cn;
	for (var i = 0; i < 3; i++) {
		for (var cons in D6.consShow) {
			if (D6.consShow[cons].title == result.itemize_graph.ord[i]) {
				app.important_items.push({
					title: D6.consShow[cons].title,
					consName: D6.consShow[cons].consName,
					consCode: cons
				});
				break;
			}
		}
	}
	app.$nextTick(function() {
		//結果・グラフ更新（とりあえず全部に渡して描画）
		graphEnergy(result.average_graph);
		graphCO2average(result.average_graph);
		graphItemize(result.itemize_graph);
		Vue.set(app, "rank100", result.average.rank100);
		//Vue.set(app, "averageComment", createAverageComment(result.average_graph));
		//Vue.set(app, "averageCO2Comment", createAverageCO2Comment(result.average));
	});
}

//詳細の取得
function callGetDetail(params) {
	var resjson = d6calc(params); //in d6calc local

	Vue.set(app, "detail", resjson.measure_detail);
	var mesID = resjson.measure_detail.mesID;
	Vue.set(
		app.detail,
		"selectafter",
		app.measures_selectafter.indexOf(mesID) >= 0
	);
	Vue.set(
		app.detail,
		"selectalready",
		app.measures_selectalready.indexOf(mesID) >= 0
	);
	Vue.set(app.detail, "selectno", app.measures_selectno.indexOf(mesID) >= 0);

	Vue.set(app, "measureComment", createMeasureComment(resjson.measure_detail));
	if (debugmode) console.log(resjson.measure_detail);
}

//対策選択の変更
function callSetMeasureSelChange(params) {
	callGetResult(params);
}

// called as calculation function
var d6calc = function(cmd) {
	function maxmeasure(n) {
		if (ret.measure.length <= n) return;
		ret.measureorg = ret.measure;
		ret.measure = [];
		for (var i = ret.measureorg.length - 1; i >= 0; i--) {
			if (i < n) {
				ret.measure[i] = ret.measureorg[i];
			}
		}
		delete ret.measureorg;
	}

	//基本構造構築
	if (cmd.get.scenario) {
		D6.constructor();
	}

	var key, key2;
	//クリア
	if (cmd.set && cmd.set.clear) {
		for (key in D6.doc.data) {
			D6.doc.data[key] = -1;
		}
		for (key in D6.measureList) {
			D6.measureList[key].selected = false;
		}
	}

	//設定：部屋等の追加（単体）変数名の配列
	var bk = {};
	for (var k in D6.doc.data) bk[k] = D6.doc.data[k];	//addで保存データが消えてしまう
	if (cmd.set && cmd.set.add) {
		for (key in cmd.set.add) {
			D6.addConsSetting(cmd.set.add[key]);
			//initialize datasets without scenarioset
			D6.setscenario("add");
		}
	}
	for (var k in bk) D6.doc.data[k] = bk[k];

	//設定：変数の設定（単体）
	if (cmd.set && cmd.set.inp) {
		for (key in cmd.set.inp) {
			D6.inSet(key, cmd.set.inp[key]);
		}
	}

	//設定：変数全体の設定１
	if (cmd.set && cmd.set.rebuild) {
		//部屋数等の再現
		var target = cmd.set.rebuild.cons_count;
		for (key in target) {
			for (var i = D6.scenario.defCons[key].orgCopyNum; i < target.key; i++) {
				D6.addConsSetting(key);
			}
		}
		//入力値
		target = cmd.set.rebuild.inp;
		for (key in target) {
			D6.inSet(key, target[key]);
		}
	}

	//計算
	if (!cmd.get.scenario) {
		//コマンド設定では必要ない
		D6.calculateAll();

		//設定：対策の追加 配列で渡す
		if (cmd.set && cmd.set.measureadd) {
			D6.clearSelectedMeasures(-1);
			for (key in cmd.set.measureadd) {
				D6.measureAdd(cmd.set.measureadd[key]);
			}
			D6.calcMeasures(-1);
		}

		//設定：変数全体の設定2
		if (cmd.set && cmd.set.rebuild) {
			D6.clearSelectedMeasures(-1);
			for (key in cmd.set.rebuild.measures_selected) {
				D6.measureAdd(cmd.set.rebuild.measures_selected[key]);
			}
			D6.calcMeasures(-1);
		}
	}

	//取得データ
	var ret = {};
	if (cmd.get.all) {
		ret = D6.getAllResult();
		//maxmeasure(15);
	} else {
		//個別のデータ取得
		if (
			!cmd.get.target ||
			(cmd.get.target && cmd.get.target.substr(0, 4) != "cons")
		)
			cmd.get.target = "consTotal";
		if (cmd.get.common) {
			ret.common = D6.getCommonParameters();
		}
		if (cmd.get.monthly) {
			ret.monthly = D6.getMonthly();
		}
		if (cmd.get.average) {
			ret.average = D6.getAverage(cmd.get.target);
		}
		if (cmd.get.average_graph) {
			ret.average_graph = D6.getAverage_graph();
		}
		if (cmd.get.itemize) {
			ret.itemize = D6.getItemize(cmd.get.target);
		}
		if (cmd.get.itemize_graph) {
			ret.itemize_graph = D6.getItemizeGraph(cmd.get.target);
		}
		if (cmd.get.measure) {
			ret.measure = D6.getMeasure(cmd.get.target);
			maxmeasure(50);
		}
		if (cmd.get.measure_all) {
			ret.measure = D6.getMeasure(cmd.get.target);
		}
		if (cmd.get.measure_detail) {
			ret.measure_detail = D6.getMeasureDetail(cmd.get.detail);
		}
		if (cmd.get.input_page) {
			if (cmd.get.input_page == 1) cmd.get.input_page = cmd.get.target;
			ret.input_page = D6.getInputPage(cmd.get.target, cmd.get.input_page);
		}
		//データ構造
		if (cmd.get.scenario) {
			ret.scenario = {};
			ret.scenario.defInput = D6.scenario.defInput;
			//消費量
			var cshow = {};
			for (var key in D6.consShow) {
				cshow[key] = {
					key: key,
					consName: D6.consShow[key].consName,
					title: D6.consShow[key].title
				};
			}
			ret.scenario.defConsShow = cshow;
			var cons = {};
			for (var key in D6.consListByName) {
				cons[key] = {
					key: key,
					consName: D6.consListByName[key][0].consName,
					title: D6.consListByName[key][0].title,
					sumConsName: D6.consListByName[key][0].sumConsName,
					orgCopyNum: D6.consListByName[key][0].orgCopyNum
				};
			}
			ret.scenario.defCons = cons;
		}
	}
	return ret;
};
