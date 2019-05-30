//　通常のvueでは vue.inpに保存をして、まとめてD6を呼び出すが、ここでは直接D6.doc.dataを操作する
//　fmは1か2か4（workerは使えない。公開時は4）
//

var hidePrice = 0;
var prohibitMeasures = [];
var allowedMeasures = [];
var pageMode = "m2";
var debugMode = false;
var targetMode = 1;
var hideAverage = "0";

var lang = {};
lang.code = "ja";
lang.home_title = "家庭の省エネ診断";
lang.countfix_pre_after = "2";
lang.electricitytitle = "電気";
lang.gastitle = "ガス";
lang.kerosenetitle = "灯油";
lang.briquettitle = "練炭";
lang.areatitle = "地域熱";
lang.gasolinetitle = "車燃料";
lang.electricityunit = "kWh";
lang.gasunit = "m3";
lang.keroseneunit = "L";
lang.briquetunit = "kg";
lang.areaunit = "MJ";
lang.gasolineunit = "L";
lang.point_disp = function(num) {
	return num + "点";
};
lang.priceunit = "円";
lang.co2unit = "kg";
lang.energyunit = "GJ";
lang.monthunit = "月";
lang.yearunit = "年";
lang.co2unitperyear = "kg/年";
lang.co2unitpermonth = "kg/月";
lang.feeunitperyear = "円/年";
lang.feeunitpermonth = "円/月";
lang.energyunitperyear = "GJ/年";
lang.energyunitpermonth = "GJ/月";
lang.dataClear = "入力データを全て削除します。よろしいですか。";
lang.savetobrowser = "ブラウザに保存しました。";
lang.savedataisshown = "保存値は以下のとおりです。";
lang.QuestionNumber = function(numques, nowques) {
	return "（" + numques + "問中" + nowques + "問目）";
};
lang.youcall = "あなた";
lang.youcount = "世帯";
lang.totalhome = "家庭全体";
lang.comparehome = function(target) {
	return "同じ世帯人数の" + target + "の家庭";
};
lang.rankin100 = function(count) {
	return "100" + count + "中順位";
};
lang.rankcall = "位";
lang.co2ratio = function(ratio) {
	return "　CO2排出量は、平均の" + ratio + "倍です。";
};
lang.co2compare06 = "平均よりもだいぶ少ないです。とてもすてきな暮らしです。";
lang.co2compare08 = "平均よりも少なめです。すてきな暮らしです。";
lang.co2compare10 = "平均と同じ程度です。";
lang.co2compare12 =
	"平均よりもやや多めです。改善により光熱費が下がる余地は大きそうです。";
lang.co2compare14 =
	"平均よりも多めです。改善により光熱費が下がる余地は大きそうです。";
lang.rankcomment = function(same, youcount, rank) {
	return (
		same +
		"が100" +
		youcount +
		"あったとすると、少ないほうから" +
		rank +
		"番目です。"
	);
};
lang.itemize = "内訳";
lang.itemname = "分野";
lang.percent = "割合(%)";
lang.measure = "対策";
lang.merit = "お得";
lang.select = "選択";
lang.itemizecomment = function(main3, sum) {
	return (
		main3 +
		"の割合が大きく、この3分野で" +
		sum +
		"%を占めます。こうした大きい分野の対策が効果的です。"
	);
};
lang.effectivemeasures = "効果的な対策";
lang.comment_combined_reduce = function(percent, fee, co2) {
	return co2 == 0
		? "対策をすることでCO2排出をへらすことができます。"
		: "　組み合わせると" +
				percent +
				"%、年間" +
				(hidePrice != 1 ? fee + "円の光熱費と、" : "") +
				co2 +
				"kgのCO2が削減できます。";
};
lang.titlemessage = function(title) {
	return title + "取り組みが効果的です。";
};
lang.co2reduction = function(co2) {
	return "年間" + co2 + "kgのCO2を減らすことができます。";
};
lang.reducepercent = function(name, percent) {
	return "これは" + name + "の" + percent + "%を減らすことに相当します。";
};
lang.co2minus = "CO2を排出しない生活が達成できます。";
lang.error = " ※詳細の記入がないため概算です。";
lang.feereduction = function(fee) {
	return "年間約" + fee + "円お得な取り組みです。";
};
lang.feenochange = "光熱費等の変化はありません。";
lang.initialcost = function(price, lifetime, load) {
	return (
		"新たに購入するために、約" +
		price +
		"円（参考価格）かかり、" +
		lifetime +
		"年の寿命で割ると、年間約" +
		load +
		"円の負担になります。"
	);
};
lang.payback = function(change, totalchange, down) {
	return (
		"一方、光熱費が毎年約" +
		change +
		"円安くなるため、トータルでは年間約" +
		totalchange +
		(down ? "円お得となります。" : "円の負担ですみます。")
	);
};
lang.payback1month = "1ヶ月以内に元をとれます。";
lang.paybackmonth = function(month) {
	return "約" + month + "ヶ月で元をとれます。";
};
lang.paybackyear = function(year) {
	return "約" + year + "年で元をとれます。";
};
//lang.paybacknever="なお、製品の寿命までに、光熱費削減額で元をとることはできません。";
lang.paybacknever = "";
lang.notinstallfee = function(fee) {
	return "光熱費は年間約" + fee + "円安くなります。";
};
lang.monthlytitle = "月ごとの光熱費推計";
lang.month = "月";
lang.energy = "エネルギー";
lang.button_clear = "クリア";
lang.button_savenew = "新規保存";
lang.button_save = "保存";
lang.button_open = "開く";
lang.button_close = "閉じる";
lang.button_showall = "全て表示";
lang.add = "追加";
lang.button_menu = "メニュー";
lang.button_back_toppage = "最初のページに戻る";
lang.button_back = "戻る";
lang.button_prev = "前へ";
lang.button_next = "次へ";
lang.button_top = "トップ";
lang.button_input = "現状記入";
lang.button_queslist = "質問一覧";
lang.button_diagnosis = "診断画面";
lang.button_measures = "対策検討";
lang.button_selectcategory = "評価分野設定";
lang.button_calcresult = "計算結果";
lang.button_about = "解説";
lang.button_fullversion = "全機能版";
lang.clear_confirm = "一覧モード";
lang.button_co2emission = "CO2排出量";
lang.button_firstenergy = "一次エネルギー量";
lang.button_energyfee = "光熱費";
lang.younow = "現状";
lang.youafter = "対策後";
lang.average = "平均";
lang.compare = "比較";
lang.comparetoaverage = "";
lang.co2emission = "CO2排出量";
lang.co2reductiontitle = "CO2削減効果";
lang.fee = "光熱費";
lang.feereductiontitle = "光熱費削減";
lang.initialcosttitle = "初期投資額";
lang.loadperyear = "年間負担額";
lang.primaryenergy = "一次エネルギー消費量";
lang.other = "その他";

//初期化（ゼロにする）
function equipinit(consName, clistid) {
	D6.doc.data["i6331"] = 0; //テレビ時間
	D6.doc.data["i403"] = 0; //洗濯頻度
	D6.doc.data["i502"] = 0; //不在部屋照明
	D6.doc.data["i7111"] = 0; //冷蔵庫使用
	D6.doc.data["i2711"] = 0; //冷房時間
	D6.doc.data["i2351"] = 0; //冷房時間
	D6.doc.data["i106"] = 0; //シャワー時間
	D6.doc.data["i105"] = 0; //シャワー時間
	D6.doc.data["i112"] = 0; //シャワー出るまで
	D6.doc.data["i104"] = 0; //湯はり
	D6.doc.data["i103"] = 0; //湯はり
	D6.doc.data["i802"] = 0; //エネルギー割
	D6.doc.data["i821"] = 0; //ポット保温時間

	var param = {};
	param["get"] = { all: 1 };
	param["set"] = { inp: D6.doc.data };
	callGetResult(param);
	app.calcco2();
}

//機器を追加する
function equipadd(consName, clistid, count, add) {
	if (add) {
		var addlist = [consName];
		if (consName == "consCR") {
			addlist.push("consCRtrip");
		}
		callGetResult({
			get: { all: 1 },
			set: { add: addlist }
		});
	}
	switch (consName) {
	case "consTV":
		D6.doc.data["i633" + count] = 6; //時間
		break;
	case "consDRsum":
		D6.doc.data["i403"] = 2; //頻度
		break;
	case "consLI":
		D6.doc.data["i513" + count] = 15; //W
		D6.doc.data["i514" + count] = 4; //個
		D6.doc.data["i515" + count] = 6; //時間
		break;
	case "consRF":
		D6.doc.data["i711" + count] = 10; //年数
		break;
	case "consACcool":
		D6.doc.data["i271" + count] = 4; //使用時間
		if (D6.doc.data["i235" + count] == -1) D6.doc.data["i235" + count] = 0; //使用時間
		break;
	case "consACheat":
		if (D6.doc.data["i271" + count] == -1) D6.doc.data["i271" + count] = 0; //使用時間
		D6.doc.data["i235" + count] = 6; //使用時間
		break;
	case "consHWshower":
		D6.doc.data["i106"] = -1; //シャワー時間
		D6.doc.data["i105"] = -1; //シャワー時間
		break;
	case "consHWtub":
		D6.doc.data["i104"] = -1; //湯
		D6.doc.data["i103"] = -1; //湯
		break;
	case "consCKcook":
		D6.doc.data["i802"] = 7; //エネルギー割
		break;
	case "consCKpot":
		D6.doc.data["i821"] = 6; //時間
		break;
	case "consCR":
		D6.doc.data["i923" + count] = 8; //片道距離
		D6.doc.data["i922" + count] = 250; //頻度
		D6.doc.data["i924" + count] = count; //車番号
		break;
	case "consOTother":
		var ename = app.equipCons[clistid].name;
		var watt = 0;
		var hr = 0;
		var day = 0;
		for (var k in D6.consOTother.eq_list) {
			if (D6.consOTother.eq_list[k][0] == ename) {
				watt = D6.consOTother.eq_list[k][1];
				hr = D6.consOTother.eq_list[k][2];
				day = D6.consOTother.eq_list[k][3];
				break;
			}
		}
		if (add != 1) {
			var c = 0;
			for (var k in D6.consListByName["consOTother"]) {
				if (D6.consListByName["consOTother"][k].name == ename) {
					c++;
					if (c == count) {
						//対象の消費の場合
						D6.doc.data["i653" + k] = ename;
						D6.doc.data["i654" + k] = watt;
						D6.doc.data["i655" + k] = hr;
						D6.doc.data["i656" + k] = day;
						break;
					}
				}
			}
		} else {
			console.log(clistid);
			console.log(ename);
			var k = D6.consListByName["consOTother"].length - 2;
			D6.doc.data["i653" + k] = ename;
			D6.doc.data["i654" + k] = watt;
			D6.doc.data["i655" + k] = hr;
			D6.doc.data["i656" + k] = day;
		}
		break;
	}

	//値だけ取得
	equipCalc();
}

//計算だけする
function equipCalc() {
	app.calcco2();
	var oldco2 = app.co2;
	var oldpenguin = app.penguin;
	//値だけ取得
	callGetResult({
		get: { all: 1 }
	});
	app.calcco2();
	console.log(oldco2);
	//変更点の表示
	var changemessage = "";
	if (oldco2 != app.co2) {
		changemessage =
			Math.round(Math.abs(app.co2 - oldco2) * 12) +
			"kg " +
			(app.co2 > oldco2 ? "増加" : "削減");
		if (oldpenguin != app.penguin) {
			changemessage +=
				" ペンギンが" +
				Math.abs(app.penguin - oldpenguin) +
				"匹 " +
				(app.penguin > oldpenguin ? "復活" : "転落");
		}
	}
	Vue.set(app, "message", changemessage);
	setTimeout(closeMessage, 5000);
}

function closeMessage() {
	Vue.set(app, "message", "");
}

//機器を外す
function equipdel(consName, clistid, count) {
	switch (consName) {
	case "consTV":
		D6.doc.data["i633" + count] = 0; //時間
		break;
	case "consDRsum":
		D6.doc.data["i403"] = 0; //頻度
		break;
	case "consLI":
		D6.doc.data["i514" + count] = 0; //個
		break;
	case "consRF":
		D6.doc.data["i711" + count] = 0; //年数
		break;
	case "consACcool":
		D6.doc.data["i271" + count] = 0; //使用時間
		break;
	case "consACheat":
		D6.doc.data["i235" + count] = 0; //使用時間
		break;
	case "consHWshower":
		D6.doc.data["i106"] = 0; //シャワー時間
		D6.doc.data["i105"] = 0; //シャワー時間
		break;
	case "consHWtub":
		D6.doc.data["i104"] = 0; //湯
		D6.doc.data["i103"] = 0; //湯
		break;
	case "consCKcook":
		D6.doc.data["i802"] = 0; //エネルギー割
		break;
	case "consCKpot":
		D6.doc.data["i821"] = 0; //時間
		break;
	case "consCR":
		D6.doc.data["i923" + count] = 0; //片道距離
		break;
	case "consOTother":
		var ename = app.equipCons[clistid].name;
		var c = 0;
		for (var k in D6.consListByName["consOTother"]) {
			if (D6.consListByName["consOTother"][k].name == ename) {
				c++;
				if (c == count) {
					D6.doc.data["i655" + k] = 0;
				}
			}
		}
		break;
	}
	equipCalc();
}
