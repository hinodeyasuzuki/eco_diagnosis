// language set 	
	
var lang = [];	
lang.code = 'ja';	
lang.show_electricity = true;	
lang.show_gas = true;	
lang.show_kerosene = true;	
lang.show_briquet = false;	
lang.show_area = false;	
lang.show_gasoline = true;	
	
lang.startPageName = '全体（簡易）';	
	
lang.dataClear = '入力データを全て削除します。よろしいですか。';	
lang.measuredisp_pre = '';	
lang.measuredisp_after = '番目におすすめを表示';	
	
lang.effectivemeasures = '効果的な対策';	
lang.savetobrowser = 'ブラウザに保存しました。';	
lang.savedataisshown = '保存値は以下のとおりです。';	
	
lang.comment_combined_reduce = function( percent, fee, co2 ) { 
	return '　組み合わせると' + 
	percent + '%、年間' + 
	fee + '円の光熱費と、' + 
	co2 + 'kgのCO2が削減できます。すでに取り組んでいる場合、これだけの成果があがるエコ生活ができていることを意味しています。';
};	
	
//-- create page -----------------	
lang.add = '追加';	
lang.youcall = 'あなた';	
lang.youcount = '世帯';	
lang.officecall = '御社';	
lang.officecount = '事業所';	
lang.totalhome = '家庭全体';	
lang.totaloffice = '事業所全体';	
lang.comparehome = function(target) {	
	return '同じ世帯人数の' + 
	target +'の家庭';
};	
lang.compareoffice = function(target) {	
	return '同じ規模の' + target;
};	
	
lang.younow = lang.youcall + '現状';	
lang.officenow = lang.officecall + '現状';	
lang.youafter = '対策後';	
lang.average = '平均';	
lang.compare = '比較';	
lang.comparetoaverage = lang.average + lang.compare;	
lang.co2emission = 'CO2排出量';	
lang.co2reductiontitle = 'CO2削減効果';	
lang.co2unitperyear = 'kg/年';	
lang.co2unitpermonth = 'kg/月';	
lang.fee = '光熱費';	
lang.feereductiontitle = '光熱費削減';	
lang.feeunitperyear = '円/年';	
lang.feeunitpermonth = '円/月';	
lang.initialcosttitle = '初期投資額';	
lang.priceunit = '円';	
lang.loadperyear = '年間負担額';	
lang.primaryenergy = '一次エネルギー消費量';	
lang.energyunitperyear = 'GJ/年';	
lang.energyunitpermonth = 'GJ/月';	
lang.ohter='その他';	
	
lang.titlemessage = function(title) {	
	return title + '取り組みが効果的です。';
};	
lang.co2reduction = function(co2) {	
	return '年間' + 
	co2 + 'kgのCO2を減らすことができます。';
};	
lang.reducepercent = function(name, percent) { 
	return 'これは' + 
	name + 'の' +
	percent + '%を減らすことに相当します。';
};	
lang.co2minus = 'CO2を排出しない生活が達成できます。';	
lang.error = ' ※詳細の記入がないため概算です。';	
	
lang.feereduction = function(fee) {	
	return '年間約' + 
	fee + '円お得な取り組みです。';
};	
lang.feenochange = '光熱費等の変化はありません。';	
	
//payback ----------------------------	
lang.initialcost = function(price, lifetime, load ) { 
	return '新たに購入するために、約' + 
	price + '円（参考価格）かかり、' + 
	lifetime +'年の寿命で割ると、年間約'+ 
	load + '円の負担になります。';
};	
lang.payback = function(change, totalchange, down ) { 
	return '一方、光熱費が毎年約' + change+ 
	'円安くなるため、トータルでは年間約' + totalchange + 
	( down ? '円お得となります。':
'円の負担ですみます。' );
};	
lang.payback1month = '1ヶ月以内に元をとれます。';	
lang.paybackmonth = function( month ) {	
	return '約' + 
	month + 'ヶ月で元をとれます。';
};	
lang.paybackyear = function( year ) {	
	return '約' + 
	year + '年で元をとれます。';
};	
lang.paybacknever = 'なお、製品の寿命までに、光熱費削減額で元をとることはできません。'	
lang.notinstallfee = function( fee ) {	
	return '光熱費は年間約' + 
	fee + '円安くなります。';
};	
	
//compare-----------	
lang.rankin100 = function( count ) {	
	return '100' + 
	count + '中順位';
};	
lang.rankcall = '位';	
lang.co2ratio = function( ratio ) {	
	return '　CO2排出量は、平均の' +
	ratio + '倍です。';
};	
lang.co2compare06 = '平均よりもだいぶ少ないです。とてもすてきな暮らしです。';	
lang.co2compare08 = '平均よりも少なめです。すてきな暮らしです。';	
lang.co2compare10 = '平均と同じ程度です。';	
lang.co2compare12 = '平均よりもやや多めです。改善により光熱費が下がる余地は大きそうです。';	
lang.co2compare14 =  '平均よりも多めです。改善により光熱費が下がる余地は大きそうです。';	
lang.rankcomment = function( same, youcount, rank ) { 
	return same + 'が100' + 
	youcount + 'あったとすると、少ないほうから' + 
	rank + '番目です。<br>';
};	
	
	
//itemize-----------	
lang.itemize = '内訳';	
lang.itemname = '分野';	
lang.percent = '割合(%)';	
lang.electricity = '電気(kWh)';	
lang.gas = 'ガス(m3)';	
lang.kerosene = '灯油(L)';	
lang.gasoline = 'ガソリン(L)';	
lang.electricitytitle = '電気';	
lang.gastitle = 'ガス';	
lang.kerosenetitle = '灯油';	
lang.coaltitle = '練炭';	
lang.areatitle = '地域熱';	
lang.gasolinetitle = 'ガソリン';	
lang.measure = '対策';	
lang.merit = 'お得';	
lang.select = '選択';	
lang.itemizecomment = function( main3,sum ){
	return main3 + 'の割合が大きく、この3分野で' + 
	sum + '%を占めます。こうした大きい分野の対策が効果的です。';
};	
	
//monthly-----------	
lang.monthlytitle = '月ごとの光熱費推計';	
lang.month = '月';	
lang.energy = 'エネルギー';	

lang.QuestionNumber = function(numques, nowques ){
	return "（" + numques +"問中" + nowques + "問目）";
}
