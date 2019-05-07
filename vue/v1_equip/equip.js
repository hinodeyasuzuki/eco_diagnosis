var hidePrice = 0;
var prohibitMeasures = [];
var allowedMeasures = [];
var pageMode = "m1";
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

/*
 * file exchange save/load and user management
 *
 *
 * 
 */

var file = {
	//変換配列 D6_うちエコ質問対応表
	trans_d6_eco: {
		i001: "In001",
		i002: "In903",
		i003: "In917",
		i004: "In942",
		i007: "In904",
		i009: "In918",

		i011: "In019",
		i012: "In020",
		i013: "In021",
		i014: "In022",
		i015: "In023",
		i016: "In024",
		i017: "In025",
		i018: "In026",
		i021: "Pref",
		i022: "Area",
		i023: "Urban",
		i041: "In25409",
		i042: "In221",
		i043: "In93201",
		i044: "In93202",
		i045: "In93203",
		i046: "In93204",
		i047: "In929",
		i051: "In945",
		i052: "In925",
		i053: "In930",
		i054: "In935",
		i055: "In920",
		i056: "In923",
		i057: "In921",
		i058: "In922",
		i059: "In926",
		i059: "In940",
		i060: "In934",
		i067: "In01410",
		i072: "In01405",
		i073: "In01406",
		i075: "In01501",
		i076: "In01409",
		i077: "In01407",
		i078: "car",
		i082: "In012",
		i083: "In003",
		i084: "AreaGas",
		i085: "In931",
		i335: "In01103",
		i336: "In01803",
		i337: "In01303",
		i338: "In01403",
		i331: "In01102",
		i332: "In01802",
		i333: "In01302",
		i334: "In01402",
		i339: "In01104",
		i340: "In01804",
		i341: "In01304",
		i342: "In01404",
		i101: "In103",
		i102: "In949",
		i103: "In10102",
		i104: "In10101",
		i105: "In10202",
		i106: "In10201",
		i107: "In117",
		i108: "In105",
		i113: "In113",
		i114: "In114",
		i115: "In126",
		i116: "In137",
		i117: "In132",
		i118: "In125",
		i119: "In007",
		i120: "In916",
		i121: "In115",
		i122: "In517d",
		i123: "In517e",

		i131: "In702",
		i132: "In703",
		i133: "In714",
		i134: "In715",
		i143: "In131",
		i144: "In13801",
		i145: "In119",
		i146: "In110",
		i147: "In118",

		i201: "In910",

		i381: "In20309a",
		i382: "In20309b",
		i383: "In20309c",
		i384: "In20309d",
		i385: "In20309e",
		i386: "In20309ｆ",
		i387: "In20309g",
		i388: "In20309h",

		i204: "In20509",
		i205: "In21209",
		i206: "In20409",
		i211: "In201",
		i212: "In202",
		i213: "In220",
		i214: "In254",
		i215: "In209",
		i216: "In225",
		i217: "In224",
		i218: "In223",
		i219: "In236",
		i222: "In517a",
		i231: "In203",
		i232: "In226",
		i233: "In205",
		i234: "In212",
		i235: "In204",
		i237: "In227",
		i240: "In222",
		i241: "In228",
		i248: "In255",
		i250: "In24709",
		i251: "In229",
		i252: "In230",

		i261: "In20709",
		i263: "In21309",
		i264: "In20609",
		i271: "In207",
		i273: "In213",
		i274: "In206",
		i276: "In231",
		i277: "In239",
		i281: "In231",
		i282: "In232",
		i283: "In252",
		i284: "In233",
		i285: "In234",
		i286: "In235",
		i287: "In237",
		i288: "In236",
		i289: "In238",
		i290: "In239",
		i291: "In240",
		i292: "In241",
		i293: "In242",
		i294: "In243",
		i295: "In244",
		i351: "In990",
		i352: "In99101",
		i353: "In99102",
		i354: "In99103",
		i355: "In99104",
		i356: "In99105",
		i357: "In99106",
		i358: "In99107",
		i359: "In99108",
		i360: "In99109",
		i361: "In992",
		i362: "In993",
		i401: "In401",
		i402: "i406",

		i501: "In515",
		i503: "In516",
		i511: "In501",
		i512: "In510",
		i513: "In503",
		i514: "In511",
		i515: "In504",
		i601: "In60509",
		i622: "In517c",
		i631: "In603",
		i632: "In607",
		i633: "In605",
		i634: "In604",
		i635: "In601",
		i636: "In602",
		i637: "In606",
		i651: "In716",
		i652: "In924",
		i653: "In31010",
		i701: "In912",
		i711: "In302",
		i712: "In312",
		i713: "In305",
		i714: "In309",
		i715: "In324",
		i716: "In318",
		i717: "In303",
		i722: "In517b",
		i801: "In005",
		i802: "In129",
		i803: "In121",
		i811: "In310",
		i812: "In127",
		i821: "In311",
		i822: "In313",
		i823: "In123",
		i824: "In124",
		i831: "In122",
		i901: "In911",
		i911: "In830",
		i912: "In808",
		i913: "In815",
		i914: "In820",
		i915: "In831",
		i921: "In810",
		i922: "In811",
		i923: "In812",
		i924: "In816",
		i925: "In817",
		i926: "In824",
		i931: "In802",
		i932: "In803",
		i933: "In825",
		i934: "In826",
		i935: "In827",
		i936: "In828",
		i937: "In821",
		i938: "In822",
		i939: "In823",
		i940: "In829"
	},

	trans_eco_d6: {
		In001: "i001",
		In903: "i002",
		In917: "i003",
		In942: "i004",
		In904: "i007",
		In918: "i009",

		In019: "i011",
		In020: "i012",
		In021: "i013",
		In022: "i014",
		In023: "i015",
		In024: "i016",
		In025: "i017",
		In026: "i018",
		Pref: "i021",
		Area: "i022",
		Urban: "i023",
		In25409: "i041",
		In221: "i042",
		In93201: "i043",
		In93202: "i044",
		In93203: "i045",
		In93204: "i046",
		In929: "i047",
		In945: "i051",
		In925: "i052",
		In930: "i053",
		In935: "i054",
		In920: "i055",
		In923: "i056",
		In921: "i057",
		In922: "i058",
		In926: "i059",
		In940: "i059",
		In934: "i060",
		In01410: "i067",
		In01405: "i072",
		In01406: "i073",
		In01501: "i075",
		In01409: "i076",
		In01407: "i077",
		car: "i078",
		In012: "i082",
		In003: "i083",
		AreaGas: "i084",
		In931: "i085",
		In01103: "i335",
		In01803: "i336",
		In01303: "i337",
		In01403: "i338",
		In01102: "i331",
		In01802: "i332",
		In01302: "i333",
		In01402: "i334",
		In01104: "i339",
		In01804: "i340",
		In01304: "i341",
		In01404: "i342",
		In103: "i101",
		In949: "i102",
		In10102: "i103",
		In10101: "i104",
		In10202: "i105",
		In10201: "i106",
		In117: "i107",
		In105: "i108",
		In113: "i113",
		In114: "i114",
		In126: "i115",
		In137: "i116",
		In132: "i117",
		In125: "i118",
		In007: "i119",
		In916: "i120",
		In115: "i121",
		In517d: "i122",
		In517e: "i123",

		In702: "i131",
		In703: "i132",
		In714: "i133",
		In715: "i134",
		In131: "i143",
		In13801: "i144",
		In119: "i145",
		In110: "i146",
		In118: "i147",

		In910: "i201",

		In20309a: "i381",
		In20309b: "i382",
		In20309c: "i383",
		In20309d: "i384",
		In20309e: "i385",
		In20309ｆ: "i386",
		In20309g: "i387",
		In20309h: "i388",

		In20509: "i204",
		In21209: "i205",
		In20409: "i206",
		In201: "i211",
		In202: "i212",
		In220: "i213",
		In254: "i214",
		In209: "i215",
		In225: "i216",
		In224: "i217",
		In223: "i218",
		In236: "i219",
		In517a: "i222",
		In203: "i231",
		In226: "i232",
		In205: "i233",
		In212: "i234",
		In204: "i235",
		In227: "i237",
		In222: "i240",
		In228: "i241",
		In255: "i248",
		In24709: "i250",
		In229: "i251",
		In230: "i252",

		In20709: "i261",
		In21309: "i263",
		In20609: "i264",
		In207: "i271",
		In213: "i273",
		In206: "i274",
		In231: "i276",
		In239: "i277",
		In231: "i281",
		In232: "i282",
		In252: "i283",
		In233: "i284",
		In234: "i285",
		In235: "i286",
		In237: "i287",
		In236: "i288",
		In238: "i289",
		In239: "i290",
		In240: "i291",
		In241: "i292",
		In242: "i293",
		In243: "i294",
		In244: "i295",
		In990: "i351",
		In99101: "i352",
		In99102: "i353",
		In99103: "i354",
		In99104: "i355",
		In99105: "i356",
		In99106: "i357",
		In99107: "i358",
		In99108: "i359",
		In99109: "i360",
		In992: "i361",
		In993: "i362",
		In401: "i401",
		i406: "i402",

		In515: "i501",
		In516: "i503",
		In501: "i511",
		In510: "i512",
		In503: "i513",
		In511: "i514",
		In504: "i515",
		In60509: "i601",
		In517c: "i622",
		In603: "i631",
		In607: "i632",
		In605: "i633",
		In604: "i634",
		In601: "i635",
		In602: "i636",
		In606: "i637",
		In716: "i651",
		In924: "i652",
		In31010: "i653",
		In912: "i701",
		In302: "i711",
		In312: "i712",
		In305: "i713",
		In309: "i714",
		In324: "i715",
		In318: "i716",
		In303: "i717",
		In517b: "i722",
		In005: "i801",
		In129: "i802",
		In121: "i803",
		In310: "i811",
		In127: "i812",
		In311: "i821",
		In313: "i822",
		In123: "i823",
		In124: "i824",
		In122: "i831",
		In911: "i901",
		In830: "i911",
		In808: "i912",
		In815: "i913",
		In820: "i914",
		In831: "i915",
		In810: "i921",
		In811: "i922",
		In812: "i923",
		In816: "i924",
		In817: "i925",
		In824: "i926",
		In802: "i931",
		In803: "i932",
		In825: "i933",
		In826: "i934",
		In827: "i935",
		In828: "i936",
		In821: "i937",
		In822: "i938",
		In823: "i939",
		In829: "i940"
	},

	conv: {},

	// dat:保存データの配列
	// ret:シリアライズされたデータ　compatible to .ecoファイル
	save_ecofile_generate: function(dat) {
		var eco = "";
		for (var key in app.inp) {
			if (this.trans_d6_eco[key]) {
				eco += this.trans_d6_eco[key] + "=" + app.inp[key] + ",";
			} else if (this.trans_d6_eco[key.substr(0, 4)]) {
				eco +=
					this.trans_d6_eco[key.substr(0, 4)] +
					"0" +
					key.substr(5, 1) +
					"=" +
					app.inp[key.substr(0, 4)];
			}
		}
		eco +=
			"uchiecoweb2019=" +
			this.save_json_generate()
				.split(",")
				.join("，");
		return eco;
	},

	// ecoファイルからの読み込み
	load_ecofile: function(str) {
		var ret = "";
		var eco = decodeURIComponent(escape(atob(str)));
		var dat = eco.split(",");
		for (var key in dat) {
			var kd = dat[key]
				.split("，")
				.join(",")
				.split("=");
			if (kd[0] == "uchiecoweb2019") {
				ret = kd[1];
				break;
			}
		}
		if (ret) {
			this.load_json(ret);
		} else {
			//uchiecoweb2019なし
			for (key in dat) {
				kd = dat[key]
					.split("，")
					.join(",")
					.split("=");
				if (this.trans_eco_d6[kd[0]]) {
					Vue.set(app.inp, this.trans_eco_d6[kd[0]], kd[1]);
				} else if (this.trans_eco_d6[kd[0].substr(0, 4)]) {
					Vue.set(
						app.inp,
						this.trans_eco_d6[kd[0].substr(0, 4) + kd[0].substr(6, 1)],
						kd[1]
					);
				}
			}
		}
	},

	//保存形式のjsonを作成する（local側の値を保存）
	save_json_generate: function() {
		var ret = {};
		ret.inp = app.inp;
		ret.measures_selected = app.measures_selected;
		ret.measures_selectafter = app.measures_selectafter;
		ret.cons_count = app.cons_count;
		ret.already = app.already;
		return JSON.stringify(ret);
	},

	//呼び出したjsonを診断に設定する(localと、D6の両方に設定）
	load_json: function(json) {
		var dat = JSON.parse(json);
		for (var key in dat.inp) {
			Vue.set(app.inp, key, dat.inp[key]);
		}
		for (var key in dat.measures_selected) {
			Vue.set(app.measures_selected, key, dat.measures_selected[key]);
		}
		for (var key in dat.measures_selectafter) {
			Vue.set(app.measures_selectafter, key, dat.measures_selectafter[key]);
		}
		for (var key in dat.cons_count) {
			Vue.set(app.cons_count, key, dat.cons_count[key]);
		}
		for (var key in dat.already) {
			Vue.set(app.already, key, dat.already[key]);
		}

		//D6を再構築する
		callGetResult({
			get: { all: 1 },
			set: { rebuild: dat }
		});
	},

	//localstorage　への保存
	saveToLocal: function() {
		var dat = this.save_json_generate();
		localStorage.setItem("d6uchiecodata", dat);
	},

	//localStorage からの呼び出し
	loadLocal: function() {
		var dat = localStorage.getItem("d6uchiecodata");
		if (dat) {
			this.load_json(dat);
		}
	},

	//データ削除(クリア）
	clear: function() {
		Vue.set(app, "inp", {}); //入力値
		Vue.set(app, "measures_selected", []); //選択された項目の番号
		Vue.set(app, "measures_selectafter", []); //後で採用する
		Vue.set(app, "measures_selectalready", []); //すでにしてる
		Vue.set(app, "measures_selectno", []); //していない
		Vue.set(app, "cons_count", []); //分野の追加数
		Vue.set(app, "already", {}); //入力ずみページ
		Vue.set(app, "instarted", false); //入力なし

		localStorage.setItem("d6uchiecodata", "");
		app.page("top");

		//D6を再構築する
		callGetResult({
			get: { all: 1 },
			set: { clear: 1 }
		});
	}
};

/**
 * Home-Eco Diagnosis for JavaScript
 *
 * graph: graph create Class
 *
 * graphItemizeCommon　内訳グラフ
 *
 *
 * @author SUZUKI Yasufumi	2016/05/23
 *
 */

var wid;
var hei;

//graphItemize( ret ) ------------------------------------------------
//		draw itemized graph to div#graph
//		comment to div#graphcomment
// parameters
//		ret: graph data calcrated by D6
// global
//		hideAverage: 1,hide
function graphItemize(ret) {
	graphItemizeCommon(ret, "graph2");
}

//内訳グラフ
function graphItemizeCommon(ret, targetname) {
	var translegend = {};
	if (!$("#" + targetname).is(":visible")) {
		return;
	}
	console.log(ret);
	$("#" + targetname).html(""); //二重に表示されることがあるため
	hideAverage = 1; //1903 平均を表示させない
	//caption: graph captions translate
	if (targetMode == 1) {
		var captions = {
			you: lang.younow,
			after: lang.youafter,
			average: lang.average
		};
	} else {
		var captions = {
			you: lang.officenow,
			after: lang.youafter,
			average: lang.average
		};
	}
	var titles = {
		kg: lang.co2emission + "（" + lang.co2unitperyear + "）",
		GJ: lang.primaryenergy + "（" + lang.energyunitperyear + "）",
		yen: lang.fee + "（" + lang.feeunitperyear + "）"
	};

	var captionCompareAverage = lang.comparetoaverage;
	var captionItem = lang.itemize;
	var captionCompare = lang.compare;
	var captionPercent = lang.percent;

	Vue.set(
		app,
		"graph_itemize_title",
		titles[ret.yaxis] +
			(hideAverage != 1
				? ":" +
				  ret.averageCaption +
				  captionCompareAverage +
				  "（" +
				  ret.consTitle +
				  "）"
				: "")
	);

	// dimple size
	wid = Math.min(
		400,
		Math.min(
			$("#" + targetname)
				.parent()
				.width(),
			$(window).width()
		) * 0.9
	);
	if (wid <= 0) return;
	hei = Math.max(wid * 0.4, 320);

	var svg = dimple.newSvg("#" + targetname, wid, hei);

	// redesign data for graph
	for (var c in ret.data) {
		if (pageMode == "m1") {
			//in case of no selection mode
			if (ret.data[c].compare == "after") {
				delete ret.data[c];
				continue;
			}
		}
		if (hideAverage == 1 && ret.data[c].compare == "average") {
			delete ret.data[c];
			continue;
		}
		//set language (other is not set in d6)　グラフの凡例等の差し替え
		if (ret.data[c].item == "other") {
			ret.data[c][captionItem] = lang.other + "(" + ret.data[c].ratio + "%)";
			ret.data[c].orgcaption = lang.other;
		} else {
			ret.data[c][captionItem] =
				ret.data[c].item + "(" + ret.data[c].ratio + "%)";
			ret.data[c].orgcaption = ret.data[c].item;
		}
		translegend[ret.data[c].orgcaption] = ret.data[c][captionItem];
		delete ret.data[c].item;
		ret.data[c][captionCompare] = captions[ret.data[c].compare];
		delete ret.data[c].compare;
		ret.data[c][captionPercent] = ret.data[c].ratio;
		delete ret.data[c].ratio;
		ret.data[c][titles[ret.yaxis]] = ret.data[c][ret.yaxis];
		delete ret.data[c][ret.yaxis];
	}
	var chart = new dimple.chart(svg, ret.data);
	chart.customClassList.axisLine = "dimple-custom-gridline";

	//X axis 軸
	var xAxis = chart.addCategoryAxis("x", captionCompare);
	xAxis.fontSize = "13px";
	xAxis.title = "";
	//sort data and set axis
	var categoryOrder = [];
	categoryOrder[0] = captions.you;

	if (pageMode == "m1") {
		if (hideAverage == 0) {
			categoryOrder[1] = captions.average;
		}
	} else {
		categoryOrder[1] = captions.after;
		if (hideAverage == 0) {
			categoryOrder[2] = captions.average;
		}
	}

	xAxis.addOrderRule(categoryOrder);

	// y axis 軸
	var yAxis = chart.addMeasureAxis("y", titles[ret.yaxis]);
	yAxis.tickFormat = "";
	yAxis.textAlign = "left";
	yAxis.fontSize = "12px";

	//legend　凡例
	var myLegend = chart.addLegend(wid - 110, 20, 110, hei - 40);
	myLegend.fontSize = "12px";

	// reverse regend: first, store a copy of the original _getEntries method.
	myLegend._getEntries_old = myLegend._getEntries;
	// now override the method
	myLegend._getEntries = function() {
		return myLegend._getEntries_old.apply(this, arguments).reverse();
	};

	//graph size setting　グラフ表示サイズ
	chart.setBounds(70, 10, wid - 180, hei - 40); //left margin, top margin, width, height

	var barAxis = chart.addSeries(captionItem, dimple.plot.bar);
	//ラベル
	barAxis.afterDraw = function(shape, data) {
		var s = d3.select(shape),
			rect = {
				x: parseFloat(s.attr("x")),
				y: parseFloat(s.attr("y")),
				width: parseFloat(s.attr("width")),
				height: parseFloat(s.attr("height"))
			};
		if (rect.height >= 8) {
			svg
				.append("text")
				// Position in the centre of the shape (vertical position is
				// manually set due to cross-browser problems with baseline)
				.attr("x", rect.x + rect.width / 2)
				.attr("y", rect.y + rect.height / 2 + 3.5)
				// Centre align
				.style("text-anchor", "middle")
				.style("font-size", "10px")
				.style("font-family", "sans-serif")
				// Make it a little transparent to tone down the black
				.style("opacity", 1)
				// Prevent text cursor on hover and allow tooltips
				.style("pointer-events", "none")
				// Format the number
				.text(d3.format(",.0f")(data.yValue) + "kg");
		}
	};

	for (var cid in ret.clist) {
		chart.assignColor(translegend[ret.clist[cid].title], ret.clist[cid].color);
		/*		for( var c in ret.data ){
			if( ret.clist[cid].title.substr(0,2) == ret.data[c][captionItem].substr(0,2)){
				chart.assignColor(ret.data[c][captionItem], ret.clist[cid].color);
			}
		}
*/
	}

	//縦軸の反転
	var varaxorder = [];
	for (var i = ret.ord.length - 1; i >= 0; i--) {
		if (ret.ord[i] == "other") {
			varaxorder.push(translegend["その他"]);
		} else {
			varaxorder.push(translegend[ret.ord[i]]);
		}
	}
	barAxis.addOrderRule(varaxorder);

	//draw
	chart.ease = "bounce";
	chart.staggerDraw = true;
	chart.draw(1500);

	//comment-------------------　コメントの生成
	var rat = [];
	var ratsum = 0;
	for (var i1 = 0; i1 < 3; i1++) {
		for (var i2 in chart.data) {
			if (
				chart.data[i2][captionCompare] == captions.you &&
				chart.data[i2][captionItem] == translegend[ret.ord[i1]]
			) {
				rat[i1] = chart.data[i2][captionPercent];
				ratsum += chart.data[i2][captionPercent];
				break;
			}
		}
	}
	var comment = lang.itemizecomment(
		ret.ord[0] +
			"（" +
			rat[0] +
			"%）、" +
			ret.ord[1] +
			"（" +
			rat[1] +
			"%）、" +
			ret.ord[2] +
			"（" +
			rat[2] +
			"%）",
		Math.round(ratsum)
	);
	Vue.set(app, "graph_itemize_comment", comment);
}

// graphEnergy( averageData ) 熱源別-----------------------------------------------------
//		energy compare to average
function graphEnergy(averageData) {
	if (!$("#graphEnergy").is(":visible")) {
		return;
	}

	$("#graphEnergy").html("");

	// use dimple
	wid =
		Math.min(
			$("#graphEnergy")
				.parent()
				.width(),
			$(window).width()
		) * 0.9;
	if (wid <= 0) return;
	hei = Math.max(wid * 0.4, 240);

	var svg = dimple.newSvg("#graphEnergy", wid, hei);
	var data = [
		{
			user: lang.average,
			energy: lang.electricitytitle,
			cons: Math.round(averageData.cost[1].electricity)
		},
		{
			user: lang.youcall,
			energy: lang.electricitytitle,
			cons: Math.round(averageData.cost[0].electricity)
		},
		{
			user: lang.average,
			energy: lang.gastitle,
			cons: Math.round(averageData.cost[1].gas)
		},
		{
			user: lang.youcall,
			energy: lang.gastitle,
			cons: Math.round(averageData.cost[0].gas)
		},
		{
			user: lang.average,
			energy: lang.kerosenetitle,
			cons: Math.round(averageData.cost[1].kerosene)
		},
		{
			user: lang.youcall,
			energy: lang.kerosenetitle,
			cons: Math.round(averageData.cost[0].kerosene)
		},
		{
			user: lang.average,
			energy: lang.gasolinetitle,
			cons: Math.round(averageData.cost[1].car)
		},
		{
			user: lang.youcall,
			energy: lang.gasolinetitle,
			cons: Math.round(averageData.cost[0].car)
		}
	];
	for (var c in data) {
		data[c][lang.fee] = data[c].cons;
		delete data[c].cons;
	}
	var chart = new dimple.chart(svg, data);

	//x axis
	var xAxis = chart.addCategoryAxis("x", ["energy", "user"]); //カテゴリーの優先順位
	xAxis.fontSize = "13px";
	xAxis.title = "";
	xAxis.addOrderRule([
		lang.electricitytitle,
		lang.gastitle,
		lang.kerosenetitle,
		lang.gasolinetitle
	]); //グラフの並び順
	xAxis.addGroupOrderRule([lang.youcall, lang.average]); //カテゴリーの並び順

	//y axis
	var yAxis = chart.addMeasureAxis("y", lang.fee);
	yAxis.tickFormat = "";
	yAxis.fontSize = "13px";
	yAxis.title = "光熱費（円/月）";

	//legend
	var myLegend = chart.addLegend(wid - 160, 10, 160, 20);
	myLegend.fontSize = "12px";

	//set color
	chart.assignColor(lang.youcall, "orange");
	chart.assignColor(lang.average, "green");

	chart.setBounds(80, 30, wid - 80, hei - 60);

	var s = chart.addSeries("user", dimple.plot.bar);
	//ラベル
	s.afterDraw = function(shape, data) {
		var s = d3.select(shape),
			rect = {
				x: parseFloat(s.attr("x")),
				y: parseFloat(s.attr("y")),
				width: parseFloat(s.attr("width")),
				height: parseFloat(s.attr("height"))
			};
		svg
			.append("text")
			// Position in the centre of the shape (vertical position is
			// manually set due to cross-browser problems with baseline)
			.attr("x", rect.x + rect.width / 2)
			.attr("y", rect.y - 3.5)
			// Centre align
			.style("text-anchor", "middle")
			.style("font-size", "10px")
			.style("font-family", "sans-serif")
			// Make it a little transparent to tone down the black
			.style("opacity", 1)
			// Prevent text cursor on hover and allow tooltips
			.style("pointer-events", "none")
			// Format the number
			.text(d3.format(",.0f")(data.yValue) + "円");
	};

	chart.ease = "bounce";
	chart.staggerDraw = true;
	chart.draw(2000);
}

// graphCO2average( averageData ) -----------------------------------------------------
//		energy compare to average
function graphCO2average(averageData) {
	graphCO2averageCommon(averageData, "graphCO2average");
}

//CO2平均比較グラフ
// graphCO2averageCommon( averageData, target ) -----------------------------------------------------
function graphCO2averageCommon(averageData, target) {
	if (!$("#" + target).is(":visible")) {
		return;
	}

	$("#" + target).html("");

	// use dimple
	wid =
		Math.min(
			$("#" + target)
				.parent()
				.width(),
			$(window).width()
		) * 0.9;
	if (wid <= 0) return;
	hei = Math.max(wid * 0.4, 240);

	var svgco2 = dimple.newSvg("#" + target, wid, hei);
	var data = [
		{ user: lang.average, CO2: Math.round(averageData.co2[1].total * 12) },
		{ user: "省エネ", CO2: Math.round(averageData.co2[1].total * 12 * 0.7) },
		{ user: lang.youcall, CO2: Math.round(averageData.co2[0].total * 12) }
	];
	var chart = new dimple.chart(svgco2, data);

	//x axis　軸
	var xAxis = chart.addCategoryAxis("x", "user");
	xAxis.fontSize = "15px";
	xAxis.addOrderRule([lang.youcall, lang.average, "省エネ"]); //グラフ並び順
	xAxis.title = "";

	//y axis　軸
	var yAxis = chart.addMeasureAxis("y", "CO2");
	yAxis.tickFormat = "";
	yAxis.fontSize = "13px";
	yAxis.title = "CO2排出量（kg/年）";

	//set color　色
	chart.assignColor(lang.youcall, "red");
	chart.assignColor(lang.average, "green");
	chart.assignColor("省エネ", "lightgreen");
	chart.setBounds(80, 10, wid - 80, hei - 40); //left padding, top padding, graph width, graph height

	var s = chart.addSeries("user", dimple.plot.bar);
	//ラベル
	s.afterDraw = function(shape, data) {
		var s = d3.select(shape),
			rect = {
				x: parseFloat(s.attr("x")),
				y: parseFloat(s.attr("y")),
				width: parseFloat(s.attr("width")),
				height: parseFloat(s.attr("height"))
			};
		svgco2
			.append("text")
			// Position in the centre of the shape (vertical position is
			// manually set due to cross-browser problems with baseline)
			.attr("x", rect.x + rect.width / 2)
			.attr("y", rect.y - 3.5)
			// Centre align
			.style("text-anchor", "middle")
			.style("font-size", "12px")
			.style("font-family", "sans-serif")
			// Make it a little transparent to tone down the black
			.style("opacity", 1)
			// Prevent text cursor on hover and allow tooltips
			.style("pointer-events", "none")
			// Format the number
			.text(d3.format(",.0f")(data.yValue) + "kg");
	};

	chart.ease = "bounce";
	chart.staggerDraw = true;
	chart.draw(2000);
}

// graphMonthly( ret ) -----------------------------------------------------
//		monthly graph xAxis are from Jan. to Dec. #graphMonthly
//
// parameters
//		ret : graph data calcurated by D6
//
function graphMonthly(ret) {
	if (!$("#graphMonthly").is(":visible")) {
		return;
	}
	//graph captions
	var titles = {
		kg: lang.co2emission + "（" + lang.co2unitpermonth + "）",
		MJ: lang.primaryenergy + "（" + lang.energyunitpermonth + "）",
		yen: lang.fee + "（" + lang.feeunitpermonth + "）"
	};
	var enename = {
		electricity: lang.electricitytitle,
		gas: lang.gastitle,
		kerosene: lang.kerosenetitle,
		coal: lang.briquettitle,
		hotwater: lang.areatitle,
		car: lang.gasolinetitle
	};
	var color = {
		electricity: "orange",
		gas: "Lime",
		kerosene: "red",
		coal: "black",
		hotwater: "yellow",
		car: "magenta"
	};
	var captionGraph = lang.monthlytitle;
	var captionMonth = lang.month;
	var captionEnergy = "energyname"; //same to disp.js
	$("#graphMonthly").html("<h3>" + captionGraph + "</h3>");

	// use dimple
	wid =
		Math.min(
			$("#graphMonthly")
				.parent()
				.width(),
			$(window).width()
		) * 0.9;
	if (wid <= 0) return;
	hei = Math.max(wid * 0.4, 240);

	var svg = dimple.newSvg("#graphMonthly", wid, hei);

	// redesign data for graph
	for (var c in ret.data) {
		ret.data[c][captionMonth] = ret.data[c].month;
		delete ret.data[c].month;
		ret.data[c][captionEnergy] = enename[ret.data[c].energyname];
		delete ret.data[c].energy;
		ret.data[c][titles[ret.yaxis]] = ret.data[c][ret.yaxis];
		delete ret.data[c][ret.yaxis];
	}

	var chart = new dimple.chart(svg, ret.data);
	var xAxis = chart.addCategoryAxis("x", captionMonth);
	xAxis.fontSize = "13px";

	var yAxis = chart.addMeasureAxis("y", titles[ret.yaxis]);
	yAxis.tickFormat = "";
	yAxis.fontSize = "12px";

	//legend
	var myLegend = chart.addLegend(wid - 70, 10, 70, hei - 40);
	myLegend.fontSize = "12px";

	chart.setBounds(70, 10, wid - 160, hei - 30); //left padding, top padding, graph width, graph height
	var barAxis = chart.addSeries(captionEnergy, dimple.plot.bar);

	//color
	for (var cid in enename) {
		chart.assignColor(enename[cid], color[cid]);
	}
	chart.draw(2000);
}

//.eyeblackはopacity:0; position: absolute;
//.eyewhiteの中身は.eyeblack1つだけにすること。
//.eyewhiteにposition:staticを設定するときはinitにtrueを渡す。
//（例）
//window.addEventListener('load',function(){EYE.init(true);},false);
//
window.onload = function() {
	EYE.init(true);
};

// https://codepen.io/taca/pen/dYoPWN
var EYE = {
	data: {
		X: null,
		Y: null,
		count: 0,
		eyes: new Array(),
		oposi: 180 * Math.PI / 180,
		eLM: new Array(),
		eTM: new Array(),
		WW: new Array(),
		WH: new Array(),
		eCX: new Array(),
		eCY: new Array(),
		BW: new Array(),
		BH: new Array()
	},

	init: function(swt) {
		var whites = document.getElementsByClassName("eyewhite");
		for (i = 0; i < whites.length; i++) {
			for (j = 0; j < whites[i].childNodes.length; j++) {
				if (whites[i].childNodes[j].className == "eyeblack") {
					EYE.data.eyes[i] = whites[i];
					EYE.data.eyes[i][1] = whites[i].childNodes[j];
				}
			}
		}
		//黒目の初期化
		for (i = 0; i < EYE.data.eyes.length; i++) {
			EYE.data.eLM[i] = EYE.data.eyes[i].getBoundingClientRect().left;
			EYE.data.eTM[i] = EYE.data.eyes[i].getBoundingClientRect().top;
			EYE.data.WW[i] = EYE.data.eyes[i].clientWidth;
			EYE.data.WH[i] = EYE.data.eyes[i].clientHeight;
			EYE.data.BW[i] = EYE.data.eyes[i][1].clientWidth;
			EYE.data.BH[i] = EYE.data.eyes[i][1].clientHeight;
			EYE.data.eCX[i] = EYE.data.eLM[i] + EYE.data.WW[i] / 2;
			EYE.data.eCY[i] = EYE.data.eTM[i] + EYE.data.WH[i] / 2;
			if (!swt) {
				EYE.data.eyes[i][1].style.left =
					EYE.data.eCX[i] - EYE.data.BW[i] / 2 - EYE.data.eLM[i] + "px";
				EYE.data.eyes[i][1].style.top =
					EYE.data.eCY[i] - EYE.data.BH[i] / 2 - EYE.data.eTM[i] + "px";
			} else {
				EYE.data.eyes[i][1].style.left =
					EYE.data.eCX[i] - EYE.data.BW[i] / 2 + "px";
				EYE.data.eyes[i][1].style.top =
					EYE.data.eCY[i] - EYE.data.BH[i] / 2 + "px";
			}
			EYE.data.eyes[i][1].style.opacity = 1;
		}

		window.addEventListener(
			"mousemove",
			function(e) {
				if (e) {
					EYE.data.X = e.pageX;
					EYE.data.Y = e.pageY;
				} else {
					EYE.data.X = event.clientX + document.body.scrollLeft;
					EYE.data.Y = event.clientY + document.body.scrollTop;
				}
				for (i = 0, i < EYE.data.eyes.length; i < EYE.data.eyes.length; i++) {
					if (swt == true) {
						EYE.watch(EYE.data.eyes[i], EYE.data.eyes[i][1], i, swt);
					} else {
						EYE.watch(EYE.data.eyes[i], EYE.data.eyes[i][1], i);
					}
				}
			},
			false
		);

		window.addEventListener(
			"touchmove",
			function() {
				event.preventDefault();
				e = event.touches[0];
				EYE.data.X = e.clientX;
				EYE.data.Y = e.clientY;

				for (i = 0, i < EYE.data.eyes.length; i < EYE.data.eyes.length; i++) {
					EYE.watch(EYE.data.eyes[i], EYE.data.eyes[i][1], i);
				}
			},
			false
		);

		window.addEventListener(
			"touchstart",
			function() {
				event.preventDefault();
				e = event.touches[0];
				EYE.data.X = e.clientX;
				EYE.data.Y = e.clientY;

				for (i = 0, i < EYE.data.eyes.length; i < EYE.data.eyes.length; i++) {
					EYE.watch(EYE.data.eyes[i], EYE.data.eyes[i][1], i);
				}
			},
			false
		);

		if (swt) {
			EYE.findMargin();
			window.addEventListener("resize", EYE.findMargin, false);
		}
	},

	//ウィンドウリサイズによって変わった.eyewhiteの位置情報の取得
	findMargin: function() {
		for (i = 0; i < EYE.data.eyes.length; i++) {
			//eyes[i]の初期化時の値を保存
			var nowL = EYE.data.eLM[i];
			var nowT = EYE.data.eTM[i];

			var eB = EYE.data.eyes[i][1];
			//値を更新
			EYE.data.eLM[i] = EYE.data.eyes[i].getBoundingClientRect().left;
			EYE.data.eTM[i] = EYE.data.eyes[i].getBoundingClientRect().top;
			//eyes[i]のリサイズ前後の位置の変化量をeyeblackの値に反映する。
			eB.style.left = eB.offsetLeft + EYE.data.eLM[i] - nowL + "px";
			eB.style.top = eB.offsetTop + EYE.data.eTM[i] - nowT + "px";
		}
	},

	watch: function(eW, eB, num, swt) {
		var eS = eB.style;
		var eWW = eW.clientWidth;
		var eWH = eW.clientHeight;
		var eBW = eB.clientWidth;
		var eBH = eB.clientHeight;

		//eyewhiteの中心位置からの距離
		//(現時点での値を計算するため、eCX,Yは使えない)
		var sX =
			EYE.data.X -
			(eW.getBoundingClientRect().left + EYE.data.WW[num] / 2 + window.scrollX);
		var sY =
			EYE.data.Y -
			(eW.getBoundingClientRect().top + EYE.data.WH[num] / 2 + window.scrollY);
		var DX = sX * sX;
		var DY = sY * sY;
		//blackがwhiteに内接するときのeyewhiteの中心からeyeblackの中心までの距離を半径rとする
		var r = eWW / 2 - eBW / 2;
		var Dr = r * r;
		//XとYから得る角度（ラジアン）
		var deg = Math.atan(sY / sX);

		//円周上の座標はXの二乗＋Yの二乗＝半径の二乗
		//X*X + Y*Y = r*r以内の場合
		if (DX + DY < Dr) {
			if (!swt) {
				eS.left =
					EYE.data.X -
					eBW / 2 -
					(eW.getBoundingClientRect().left + window.scrollX) +
					"px";
				eS.top =
					EYE.data.Y -
					eBH / 2 -
					(eW.getBoundingClientRect().top + window.scrollY) +
					"px";
			} else {
				eS.left = EYE.data.X - eBW / 2 + "px";
				eS.top = EYE.data.Y - eBH / 2 + "px";
			}
		}
		//X*X + Y*Y = r*r以上の場合
		//X、Yから得られる角度でeyewhite内にeyeblackを内接させる。
		if (DX + DY > Dr) {
			if (sX > 0) {
				if (!swt) {
					eS.left = Math.cos(deg) * r + eWW / 2 - eBW / 2 + "px";
					eS.top = Math.sin(deg) * r + eWH / 2 - eBH / 2 + "px";
				} else {
					eS.left =
						Math.cos(deg) * r + eWW / 2 - eBW / 2 + eW.offsetLeft + "px";
					eS.top = Math.sin(deg) * r + eWH / 2 - eBH / 2 + eW.offsetTop + "px";
				}
			}
			//X座標がマイナスの場合は角度に１８０度を加えて反転させる。
			if (sX < 0) {
				if (!swt) {
					eS.left =
						Math.cos(deg + EYE.data.oposi) * r + eWW / 2 - eBW / 2 + "px";
					eS.top =
						Math.sin(deg + EYE.data.oposi) * r + eWH / 2 - eBH / 2 + "px";
				} else {
					eS.left =
						Math.cos(deg + EYE.data.oposi) * r +
						eWW / 2 -
						eBW / 2 +
						eW.offsetLeft +
						"px";
					eS.top =
						Math.sin(deg + EYE.data.oposi) * r +
						eWH / 2 -
						eBH / 2 +
						eW.offsetTop +
						"px";
				}
			}
		}
	}
};

/**
 * Home-Eco Diagnosis for JavaScript
 *
 * createpage.js: create html pages, comments
 * 　画面情報の生成
 * 		getPageData 		ページ名から質問リスト・タイトルを生成する
 * 		createPageData		質問番号の配列から、タブ表示の分野などを生成する
 * 		createMeasureComment	対策コメントの生成
 * 		createAverageComment	平均比較のコメント
 * 		createAverageCO2Comment	CO2比較のコメント
 *
 * @author SUZUKI Yasufumi	2016/12/13
 *
 */

//getPageData
// ページ名から質問リスト・タイトルを生成する
//
//		app.input_codes
//
getPageData = function(subname) {
	var count = 0;
	var noTab = false; //tabで分けるわけないの設定

	Vue.set(app, "input_codes", []);
	Vue.set(app, "intro", "");

	//Vue展開時に、subIDも設定する i22201 222:defInput, 01:subID
	if (D6.scenario.defInputGroup[subname]) {
		//追加分野の場合
		//質問番号の追加定義(vueへの設定)
		var d6subname = D6.scenario.defInputGroup[subname];
		if (d6subname.noTab) noTab = true;

		if (typeof d6subname.ques !== undefined) {
			Vue.set(app, "defCons", {});
			Vue.set(app, "defConsMeasures", {});
			D6[subname] = {};
			D6[subname].title = d6subname.title;
			D6[subname].consCode = d6subname.consCode;
			Vue.set(app, "intro", d6subname.intro);
			Vue.set(app, "introimage", d6subname.introimage);
			Vue.set(app.defCons, "title", d6subname.title);
			for (var k in d6subname.ques) {
				var key = d6subname.ques[k];
				Vue.set(app.input_codes, count, key);
				count++;

				var consname = app.defInput[key.substr(0, 4)].cons;
				if (D6[consname].countCall) {
					//数え方
					Vue.set(app, "countCall", D6[consname].countCall);
				}
			}
			if (d6subname.measures) {
				//対策が定義されている場合
				for (k in d6subname.measures) {
					Vue.set(
						app.defConsMeasures,
						d6subname.measures[k],
						d6subname.measures[k]
					);
				}
			} else {
				//分野が指定されている場合
				for (k in D6.measureList) {
					if (
						D6.measureList[k].cons.consCode == d6subname.consCode ||
						(D6.measureList[k].cons.sumCons &&
							D6.measureList[k].cons.sumCons.consCode == d6subname.consCode)
					) {
						Vue.set(
							app.defConsMeasures,
							D6.measureList[k].measureName,
							D6.measureList[k].measureName
						);
					}
				}
			}
		}
	} else {
		//標準消費の場合
		for (var key in app.defInput) {
			var consname = app.defInput[key].cons;
			if (
				!subname ||
				consname == subname ||
				D6[consname].sumConsName == subname ||
				D6[consname].sumCons2Name == subname ||
				D6[consname].sumCons3Name == subname ||
				D6[consname].sumCons4Name == subname
			) {
				Vue.set(app.input_codes, count, key);
				count++;
				if (D6[consname].countCall) {
					//数え方
					Vue.set(app, "countCall", D6[consname].countCall);
				}
			}
		}
		if (D6[subname]) {
			Vue.set(app.defCons, "title", D6[subname].title);
			Vue.set(app, "intro", D6[subname].intro);
		}
	}
	Vue.set(app, "ques_max", count);

	//表示ページの生成
	if (noTab) {
		//分野を分けない形で生成
		Vue.set(app, "input_pageset", {});
		Vue.set(app.input_pageset, subname, {});
		Vue.set(app.input_pageset[subname], "subID", 0);
		Vue.set(app.input_pageset[subname], "title", app.defCons.title);
		Vue.set(app.input_pageset[subname], "incode", app.input_codes);
		Vue.set(app.input_pageset[subname], "ques_max", count);
		Vue.set(app, "ques_page_max", count);
		Vue.set(app, "tab_max", 1);
		Vue.set(app, "show_tab", false);
		Vue.set(app, "consadd", []);
	} else {
		//分野を構築
		createPageData(app.input_codes);
	}
};

//createPageData
// inparray : [ "i001", "i032",.... ];
createPageData = function(inparray) {
	//関連するconsを抽出
	var conslist = {};
	var page = {};
	var i,
		count = 0,
		k,
		consaddcount = 0;
	var cname = "";
	var inlist = [];
	var count = 0;
	var first_tab = "";
	var first_tab_countable = "";

	for (k in inparray) {
		try {
			cname = D6.scenario.defInput[inparray[k].substr(0, 4)].cons;
		} catch (e) {
			console.log(
				"ERROR:定義されていない変数です。 " + inparray[k].substr(0, 4)
			);
			return;
		}
		if (!conslist[cname] && cname != "consAC") {
			conslist[cname] = {
				cons: cname,
				consCount: D6.logicList[cname].orgCopyNum
			};
		}
	}

	Vue.set(app, "input_pageset", {});
	Vue.set(app, "consadd", []);
	Vue.set(app, "tab_max", Object.keys(conslist).length);
	Vue.set(app, "show_tab", true); //複数入力がある場合にはタブ表示

	//consごとにsubIDで展開
	//　page={"subconsname" :{ title, subID, incode[]},...}
	var cnamecount = 0;
	for (k in conslist) {
		if (conslist[k].consCount <= 0) {
			cnamecount = 0;
			//単体のページ定義
			cname = conslist[k].cons;
			inlist = [];
			for (i in inparray) {
				var incons = D6.scenario.defInput[inparray[i].substr(0, 4)].cons;
				if (
					incons == cname ||
					((cname == "consACheat" || cname == "consACcool") &&
						incons == "consAC")
				) {
					inlist.push(inparray[i]);
					count++;
					cnamecount++;
				}
			}
			Vue.set(app.input_pageset, cname, {});
			Vue.set(app.input_pageset[cname], "title", D6[cname].title);
			Vue.set(app.input_pageset[cname], "inputGuide", D6[cname].inputGuide);
			Vue.set(app.input_pageset[cname], "subID", 0);
			Vue.set(app.input_pageset[cname], "incode", inlist);
			Vue.set(app.input_pageset[cname], "ques_max", cnamecount);
			if (!first_tab) first_tab = cname;
		} else {
			//追加あり
			//consごとに「追加ボタン」を設置　consを拡大できるようなもの　->consadd {cons, nowCount}
			Vue.set(app.consadd, consaddcount, {});
			Vue.set(app.consadd[consaddcount], "cons", conslist[k].cons);
			Vue.set(app.consadd[consaddcount], "title", D6[conslist[k].cons].title);
			Vue.set(app.consadd[consaddcount], "nowCount", conslist[k].consCount);
			consaddcount++;

			//ページ定義
			cname = conslist[k].cons;
			for (i = 1; i <= conslist[k].consCount; i++) {
				cnamecount = 0;
				inlist = [];
				for (var j in inparray) {
					var incons = D6.scenario.defInput[inparray[j].substr(0, 4)].cons;
					if (
						incons == cname ||
						((cname == "consACheat" || cname == "consACcool") &&
							incons == "consAC")
					) {
						inlist.push(inparray[j] + i);
						count++;
						cnamecount++;
					}
				}
				Vue.set(app.input_pageset, cname + i, {});
				Vue.set(app.input_pageset[cname + i], "title", D6[cname].title);
				Vue.set(
					app.input_pageset[cname + i],
					"inputGuide",
					D6[cname].inputGuide
				);
				Vue.set(app.input_pageset[cname + i], "subID", i);
				Vue.set(app.input_pageset[cname + i], "countCall", D6[cname].countCall);
				Vue.set(app.input_pageset[cname + i], "incode", inlist);
				Vue.set(app.input_pageset[cname + i], "ques_max", cnamecount);
				if (!first_tab_countable) first_tab_countable = cname + i;
			}
		}
		Vue.set(app, "ques_page_max", count);
		Vue.set(app, "now_tab", first_tab ? first_tab : first_tab_countable);
	}
};

//createMeasureComment(mes) -------------------------------------------------
//		create comment text of one measure
// parameters
//		mes		measure instance
// return
//		ret[0]	title message
//		ret[1]	CO2 reduction comment
//		ret[2]  cost comment
//		ret[3]	advice
createMeasureComment = function(mes) {
	var ret = [];

	// caption to call total
	var you = lang.totalhome;
	if (targetMode == 1) {
		you = lang.totalhome;
	} else {
		you = lang.totaloffic;
	}
	//ret[0] title message
	ret[0] = lang.titlemessage(mes.title);

	//ret[1] CO2 reduction comment
	ret[1] = lang.co2reduction(Math.round(-mes.co2ChangeOriginal * 12));

	// reduce percent(%)　in case of co2ChangeOriginal is below 0, co2 is reduced
	var percent = -mes.co2ChangeOriginal / mes.co2Total * 100;

	if (percent < 0.05) {
		ret[1] += "";
	} else if (percent < 0.5) {
		ret[1] += lang.reducepercent(you, Math.round(percent * 10) / 10);
	} else if (percent < 100) {
		ret[1] += lang.reducepercent(you, Math.round(percent));
	} else {
		ret[1] += lang.reducepercent(you, Math.round(percent)) + lang.co2minus;
	}
	if (mes.total) {
		// rough estimate
		ret[1] += lang.error;
	}

	//ret[2] cost comment
	ret[2] = "";
	if (mes.costTotalChangeOriginal < 0) {
		ret[2] = lang.feereduction(priceRound(-mes.costTotalChangeOriginal * 12));
	} else if (mes.costTotalChangeOriginal == 0) {
		ret[2] = lang.feenochange;
	}

	if (mes.priceNew > 0 && mes.lifeTime) {
		//in case of initial cost
		if (!mes.total) {
			//not rough estimate

			//initial cost
			ret[2] += lang.initialcost(
				comma3(mes.priceNew),
				Math.round(mes.lifeTime),
				priceRound(mes.priceNew / mes.lifeTime)
			);

			//reduce cost
			ret[2] += lang.payback(
				priceRound(-mes.costChangeOriginal * 12),
				priceRound(Math.abs(mes.costTotalChangeOriginal * 12)),
				mes.costTotalChangeOriginal < 0
			);

			if (mes.costTotalChangeOriginal < 0) {
				if (mes.payBackYear < 0.08) {
					ret[2] += lang.payback1month;
				} else if (mes.payBackYear < 1) {
					ret[2] += lang.paybackmonth(Math.round(mes.payBackYear * 12));
				} else {
					ret[2] += lang.paybackyear(Math.round(mes.payBackYear * 10) / 10);
				}
			} else {
				ret[2] += lang.paybacknever;
			}
		} else {
			//not install
			ret[2] = lang.notinstallfee(priceRound(-mes.costChangeOriginal * 12));
		}
	}
	if (mes.total) {
		//rough estimate comment
		ret[2] += lang.error;
	}

	ret[3] = mes.advice;

	return ret;
};

//光熱消費量の平均比較コメント
createAverageComment = function(ave) {
	var good = "";
	var goodcount = 0;
	var bad = "";
	var badcount = 0;
	var comment = "";

	if (ave.co2[0].electricity > ave.co2[1].electricity * 1.2) {
		bad += lang.electricitytitle + ", ";
		badcount++;
	} else if (ave.co2[0].electricity < ave.co2[1].electricity * 0.9) {
		good += lang.electricitytitle + ", ";
		goodcount++;
	}
	if (ave.co2[0].gas > ave.co2[1].gas * 1.2) {
		bad += lang.gastitle + ", ";
		badcount++;
	} else if (ave.co2[0].gas < ave.co2[1].gas * 0.9) {
		good += lang.gastitle + ", ";
		goodcount++;
	}
	if (ave.co2[0].kerosene > ave.co2[1].kerosene * 1.2) {
		bad += lang.kerosenetitle + ", ";
		badcount++;
	} else if (ave.co2[0].kerosene < ave.co2[1].kerosene * 0.9) {
		good += lang.kerosenetitle + ", ";
		goodcount++;
	}
	if (ave.co2[0].car > ave.co2[1].car * 1.2) {
		bad += lang.gasolinetitle + ", ";
		badcount++;
	} else if (ave.co2[0].car < ave.co2[1].car * 0.9) {
		good += lang.gasolinetitle + ", ";
		goodcount++;
	}
	if (goodcount == 4) {
		comment = good.slice(0, -2) + "のいずれも平均より少ないです。";
	} else if (goodcount > 0) {
		if (badcount == 0) {
			comment = good.slice(0, -2) + "が平均より少ないです。";
		} else {
			comment =
				bad.slice(0, -2) +
				"が平均より多いですが、" +
				good.slice(0, -2) +
				"が平均より少ないです。";
		}
	} else {
		if (badcount == 0) {
			comment = "いずれも、平均的です。";
		} else {
			comment = bad.slice(0, -2) + "が平均より多いです。";
		}
	}
	return comment;
};

// createAverageCO2Comment(dat) ---------------------------------------------
// parameters
//		dat  calculation result by web-worker
//		notshowafter 1/0 show table of after saving
// return
//		ret  compare to average comment
createAverageCO2Comment = function(dat) {
	var youcall = "";
	var youcount = "";
	var same = "";
	var notshowafter = 0;
	if (pageMode == "m1") {
		notshowafter = 1;
	}

	youcall = lang.youcall;
	youcount = lang.youcount;
	same = lang.comparehome(dat.samehome);

	//compare avearage CO2
	var ret = createCompareComment(
		same,
		dat.you,
		dat.av,
		dat.consCode,
		dat.rank100
	);
	return ret;
};

//createCompareComment( you, av, target )
//
createCompareComment = function(same, you, av, target, rank100) {
	var youcount = lang.youcount;

	//compare avearage CO2
	var rel = you / av;
	var ret = lang.co2ratio(Math.round(rel * 10) / 10);
	if (rel < 0.7) {
		ret += lang.co2compare06;
	} else if (rel < 0.93) {
		ret += lang.co2compare08;
	} else if (rel < 1.1) {
		ret += lang.co2compare10;
	} else if (rel < 1.3) {
		ret += lang.co2compare12;
	} else {
		ret += lang.co2compare14;
	}

	if (target == "TO") {
		ret += lang.rankcomment(same, youcount, rank100);
	}

	return ret;
};

// showMeasureTotalMessage(rescommon) ------------------------------------------------
//		create input page for demand by hour
//	parameters
//		rescommon	return value common
//  result
//		message written in html
showMeasureTotalMessage = function(rescommon) {
	var html = "";
	var redco2 = rescommon.co2Original - rescommon.co2;
	var redcost = rescommon.costOriginal - rescommon.cost;
	if (!isNaN(redco2)) {
		html = lang.comment_combined_reduce(
			Math.round(redco2 / rescommon.co2Original * 100),
			comma3(redcost * 12),
			comma3(redco2 * 12)
		);
	}
	return html;
};

// need in Chrome
function tabset() {}

// priceRound(num)------------------------------------------
//		make round value
// parameters
//		num : price(yen)
//	return
//		rounded string with commma
//
priceRound = function(num) {
	var price;
	if (num > 10000) {
		price = this.comma3(Math.round(num / 100) * 100);
	} else if (num > 4000) {
		price = this.comma3(Math.round(num / 50) * 50);
	} else {
		price = this.comma3(Math.round(num / 10) * 10);
	}
	return price;
};

//comma3( num )------------------------------------------
//		rounded to integral and add comma to each 3 charactors
//	parameters
//		num : number
//	return
//		rounded string with comma
comma3 = function(num) {
	var n;
	var l;
	var m = "";
	var minus = 0;
	if (num < 0) minus = 1;
	n = "" + Math.abs(Math.round(num));
	while ((l = n.length) > 3) {
		m = "," + n.substr(l - 3, 3) + m;
		n = n.substr(0, l - 3);
	}
	n = (minus == 1 ? "-" : "") + n + m;
	return n;
};

//escapeHtml(string)----------------------------------------
//		sanitize html script
//
escapeHtml = (function(String) {
	var escapeMap = {
		"&": "&amp;",
		"'": "&#x27;",
		"`": "&#x60;",
		"\"": "&quot;",
		"<": "&lt;",
		">": "&gt;"
	};
	var escapeReg = "[";
	var reg;
	for (var p in escapeMap) {
		if (escapeMap.hasOwnProperty(p)) {
			escapeReg += p;
		}
	}
	escapeReg += "]";
	reg = new RegExp(escapeReg, "g");
	return function escapeHtml(str) {
		str = str === null || str === undefined ? "" : "" + str;
		return str.replace(reg, function(match) {
			return escapeMap[match];
		});
	};
})(String);

//object sort
ObjArraySort = function(ary, key, order) {
	var reverse = 1;
	if (order && order.toLowerCase() == "desc") reverse = -1;
	ary.sort(function(a, b) {
		if (a[key] < b[key]) return -1 * reverse;
		else if (a[key] == b[key]) return 0;
		else return 1 * reverse;
	});
};

// initial language set
languageset = function() {
	//rot13 decode
	function rot13(str) {
		var i = [];
		i = str.split("");
		return i.map
			.call(i, function(char) {
				x = char.charCodeAt(0);
				if ((65 <= x && x < 78) || (97 <= x && x < 110)) {
					return String.fromCharCode(x + 13);
				} else if ((78 <= x && x <= 90) || (110 <= x && x <= 122)) {
					return String.fromCharCode(x - 13);
				}
				return String.fromCharCode(x);
			})
			.join("");
	}

	//rot 13
	for (var c in lang) {
		if (typeof lang[c] == "string" && lang[c].substr(0, 2) == "q@") {
			lang[c] = decodeURIComponent(
				escape(base64.decode(rot13(lang[c].substr(2))))
			);
		}
	}

	//common message create===========
	lang.electricity = lang.electricitytitle + " (" + lang.electricityunit + ")";
	lang.gas = lang.gastitle + " (" + lang.gasunit + ")";
	lang.kerosene = lang.kerosenetitle + " (" + lang.keroseneunit + ")";
	lang.gasoline = lang.gasolinetitle + " (" + lang.gasolineunit + ")";
	lang.area = lang.areatitle + " (" + lang.areaunit + ")";
	lang.briquet = lang.briquettitle + " (" + lang.briquetunit + ")";
};

// CheckShow.js 情報の計算経過などの確認画面の生成
//
// filled input / selected measures
//
//
//

checkshow = function(target) {
	if (target == "question") {
		var ques_answerd = 0;
		Vue.set(app, "ques_list_all", []);
		for (var k in D6.doc.data) {
			if (app.inp[k] || app.inp[k] === 0) ques_answerd++;
			app.ques_list_all.push(k);
		}
		Vue.set(app, "ques_count_all", app.ques_list_all.length);
		Vue.set(app, "ques_answerd", ques_answerd);
	} else if (target == "measures") {
		Vue.set(app, "measures_count_all", app.measures.length);
		Vue.set(app, "measures_count_selected", app.measures_selected.length);
	}
};

num1 = function(v) {
	return Math.round(v * 10) / 10;
};

checkshow_all = function(res) {
	//table mode
	var tablemode = true;
	if (tablemode) {
		var t_st = "<table>";
		var t_ed = "</table>";
		var r_st = "<tr>";
		var r_ed = "</tr>";
		var c_st = "<td class='right'>";
		var c_stw = "<td  style='word-break : break-all;'>";
		var c_ed = "</td>";
	} else {
		var t_st = "";
		var t_ed = "<br>";
		var r_st = "";
		var r_ed = "<br>";
		var c_st = "";
		var c_stw = "";
		var c_ed = "\t";
	}

	//全ての項目についての記載
	var average = "";
	var itemize = "";
	var measure = "";
	var order = ["total", "electricity", "gas", "kerosene", "car"];
	//平均値
	average += t_st + r_st + c_st + c_ed;
	for (var ene in order) average += c_st + order[ene] + c_ed;
	average += r_ed;
	average += r_st + c_st + "CO2家庭" + c_ed;
	for (var ene in order)
		average += c_st + num1(res.average_graph.co2[0][order[ene]] * 12) + c_ed;
	average += r_ed;
	average += r_st + c_st + "CO2平均" + c_ed;
	for (var ene in order)
		average += c_st + num1(res.average_graph.co2[1][order[ene]] * 12) + c_ed;
	average += r_ed;
	average += r_st + c_st + "金額家庭" + c_ed;
	for (var ene in order)
		average += c_st + num1(res.average_graph.cost[0][order[ene]]) + c_ed;
	average += r_ed;
	average += r_st + c_st + "金額平均" + c_ed;
	for (var ene in order)
		average += c_st + num1(res.average_graph.cost[1][order[ene]]) + c_ed;
	average += r_ed + t_ed;

	//内訳
	order = ["co2", "electricity", "gas", "kerosene", "water", "car"];
	itemize += t_st + r_st + c_st + "分野名" + c_ed;
	for (var ene in order) itemize += c_st + order[ene] + c_ed;
	itemize += c_st + "consName" + r_ed;
	for (var key in res.itemize) {
		var item = res.itemize[key];
		if (item.consName == "consSeason") continue;
		if (item.consName == "consEnergy") continue;
		itemize += c_st + item.title + (item.subID ? item.subID : "") + c_ed;
		for (var ene in order) itemize += c_st + num1(item[order[ene]] * 12) + c_ed;
		itemize += c_st + item.consName + c_ed + r_ed;
	}
	itemize += t_ed;

	//対策
	var mes2, mes, k2;
	order = [
		"co2Change",
		"co2ChangeOriginal",
		"electricity",
		"gas",
		"kerosene",
		"water",
		"car"
	];
	measure +=
		t_st +
		r_st +
		c_st +
		"ID" +
		c_ed +
		c_st +
		"対策名（日本語）" +
		c_ed +
		c_st +
		"measureName" +
		c_ed;
	for (ene in order) measure += c_st + order[ene].substr(0, 7) + c_ed;
	measure += c_st + "consName" + c_ed + r_ed;
	for (key in res.measure) {
		mes2 = D6.measureList[key];
		mes = {};
		for (k2 in res.measure) {
			if (
				res.measure[k2].measureName == mes2.measureName &&
				res.measure[k2].conssubID == mes2.subID
			) {
				mes = res.measure[k2];
				break;
			}
		}
		measure +=
			r_st +
			c_st +
			mes.mesID +
			c_ed +
			c_stw +
			mes.title +
			c_ed +
			c_stw +
			mes.measureName +
			c_ed;
		for (var ene in order) measure += c_st + num1(mes2[order[ene]] * 12) + c_ed;
		measure += c_stw + (mes2.def ? mes2.def.refCons : "") + c_ed + r_ed;
	}
	measure += t_ed;

	Vue.set(app, "check_average", average);
	Vue.set(app, "check_itemize", itemize);
	Vue.set(app, "check_measures", measure);
};
