<?php // set to Language/*.php ========================
// 
// 
// 
//----------system title-----------------------------------------------
$lang["code"]='ja';
$lang['home_title']='家庭の省エネ診断';
$lang['home_joy_title']='家庭の省エネ診断（お気楽版）';

$lang['countfix_pre_after']='2';

//--energy -----------------
$lang["show_electricity"]=True;
$lang["show_gas"]=True;
$lang["show_kerosene"]=True;
$lang["show_briquet"]=False;
$lang["show_area"]=False;
$lang["show_gasoline"]=True;

$lang["electricitytitle"]='電気';
$lang["gastitle"]='ガス';
$lang["kerosenetitle"]='灯油';
$lang["briquettitle"]='練炭';
$lang["areatitle"]='地域熱';
$lang["gasolinetitle"]='ガソリン';
$lang["electricityunit"]='kWh';
$lang["gasunit"]='m3';
$lang["keroseneunit"]='L';
$lang["briquetunit"]='kg';
$lang["areaunit"]='MJ';
$lang["gasolineunit"]='L';

//--common unit-----------------
$lang['point_disp']='function(num) {return num + "点"};';

$lang["priceunit"]='円';
$lang['co2unit']='kg';
$lang['energyunit']='GJ';
$lang['monthunit']='月';
$lang['yearunit']='年';
$lang["co2unitperyear"]='kg/年';
$lang["co2unitpermonth"]='kg/月';
$lang["feeunitperyear"]='円/年';
$lang["feeunitpermonth"]='円/月';
$lang["energyunitperyear"]='GJ/年';
$lang["energyunitpermonth"]='GJ/月';

//--common page-----------------
$lang["startPageName"]='全体（簡易）';
$lang['header_attension']='（動作モデルのため提案数値の保証はありません。ニーズに応じた開発ができます。）';
$lang["dataClear"]='入力データを全て削除します。よろしいですか。';
$lang["savetobrowser"]='ブラウザに保存しました。';
$lang["savedataisshown"]='保存値は以下のとおりです。';

//--question page-----------------
$lang["QuestionNumber"]='function(numques, nowques) {return  "（" + numques +"問中" + nowques + "問目）"};';


//--compare-----------------
$lang["youcall"]='あなた';
$lang["youcount"]='世帯';
$lang["totalhome"]='家庭全体';
$lang["comparehome"]='function(target) {return "同じ世帯人数の"+target+"の家庭"};';


$lang["rankin100"]='function(count) {return "100" + count +"中順位"};';


$lang["rankcall"]='位';
$lang["co2ratio"]='function(ratio) {return "　CO2排出量は、平均の" + ratio +"倍です。"};';


$lang["co2compare06"]='平均よりもだいぶ少ないです。とてもすてきな暮らしです。';
$lang["co2compare08"]='平均よりも少なめです。すてきな暮らしです。';
$lang["co2compare10"]='平均と同じ程度です。';
$lang["co2compare12"]='平均よりもやや多めです。改善により光熱費が下がる余地は大きそうです。';
$lang["co2compare14"]='平均よりも多めです。改善により光熱費が下がる余地は大きそうです。';
$lang["rankcomment"]='function(same,youcount,rank) {return same +"が100" + youcount + "あったとすると、少ないほうから" +   rank+ "番目です。<br>"};';





//itemize-----------
$lang["itemize"]='内訳';
$lang["itemname"]='分野';
$lang["percent"]='割合(%)';
$lang["measure"]='対策';
$lang["merit"]='お得';
$lang["select"]='選択';
$lang["itemizecomment"]='function(main3,sum) {return main3+"の割合が大きく、この3分野で" + sum+"%を占めます。こうした大きい分野の対策が効果的です。"};';



//--result-----------------
$lang["effectivemeasures"]='効果的な対策';
$lang["comment_combined_reduce"]='function(percent,fee,co2) {return "　組み合わせると" + percent+"%、年間" + ( hidePrice != 1  ? fee +"円の光熱費と、":"") + co2+"kgのCO2が削減できます。すでに取り組んでいる場合、これだけの成果があがるエコ生活ができていることを意味しています。"};';




$lang["titlemessage"]='function(title) {return  title+"取り組みが効果的です。"};';

$lang["co2reduction"]='function(co2) {return "年間" + co2+"kgのCO2を減らすことができます。"};';


$lang["reducepercent"]='function(name,percent) {return "これは" + name+"の" +percent+"%を減らすことに相当します。"};';



$lang["co2minus"]='CO2を排出しない生活が達成できます。';
$lang["error"]=' ※詳細の記入がないため概算です。';

$lang["feereduction"]='function(fee) {return "年間約" + fee+"円お得な取り組みです。"};';


$lang["feenochange"]='光熱費等の変化はありません。';

//result payback----------------------------
$lang["initialcost"]='function(price,lifetime,load) {return "新たに購入するために、約" + price+"円（参考価格）かかり、" + lifetime+"年の寿命で割ると、年間約"+ load+"円の負担になります。"};';




$lang["payback"]='function(change,totalchange,down) {return "一方、光熱費が毎年約" + change+ "円安くなるため、トータルでは年間約" + totalchange +(down?"円お得となります。":"円の負担ですみます。" )};';




$lang["payback1month"]='1ヶ月以内に元をとれます。';
$lang["paybackmonth"]='function(month) {return "約" + month+"ヶ月で元をとれます。"};';


$lang["paybackyear"]='function(year) {return "約" + year+"年で元をとれます。"};';


$lang["paybacknever"]='なお、製品の寿命までに、光熱費削減額で元をとることはできません。';
$lang["notinstallfee"]='function(fee) {return "光熱費は年間約" + fee+"円安くなります。"};';



//monthly-----------
$lang["monthlytitle"]='月ごとの光熱費推計';
$lang["month"]='月';
$lang["energy"]='エネルギー';


//----------buttons -----------------------------------------------
$lang['button_clear']='クリア';
$lang['button_savenew']='新規保存';
$lang['button_save']='保存';
$lang['button_open']='開く';
$lang['button_close']='閉じる';
$lang['button_showall']='全て表示';
$lang["add"]='追加';

$lang['button_menu']='メニュー';
$lang['button_back_toppage']='最初のページに戻る';
$lang['button_back']='戻る';
$lang['button_prev']='前へ';
$lang['button_next']='次へ';

$lang['button_top']='トップ';
$lang['button_input']='現状記入';
$lang['button_queslist']='質問一覧';
$lang['button_diagnosis']='診断画面';
$lang['button_measures']='対策検討';
$lang['button_selectcategory']='評価分野設定';
$lang['button_calcresult']='計算結果';
$lang['button_about']='解説';
$lang['button_fullversion']='全機能版';
$lang['clear_confirm']='一覧モード';

$lang['button_co2emission']='CO2排出量';
$lang['button_firstenergy']='一次エネルギー量';
$lang['button_energyfee']='光熱費';


//---- 1 button mode -----------
$lang['home_button_intro1']='　あなたの家庭でのエネルギー機器や、その使い方に応じて、有効な省エネ対策を提案します。家庭でのエネルギーの使い方について20問程度の質問があります。答えられる質問だけで結構ですので、回答いただくと、あなたの家庭にあった対策を提案することができます。';
$lang['home_button_intro2']='　入力された情報については、この端末を利用するあなただけが閲覧でき、サーバーには蓄積されません。';
$lang['home_button_startdiagnosis']='診断をはじめる';
$lang['home_button_about']='この診断について';
$lang['home_button_result']='結果をみる';
$lang['home_button_retry']='回答しなおす';
$lang['home_button_average']='平均比較';
$lang['home_button_monthly']='月変化';
$lang['home_button_measure']='有効な対策';
$lang['home_button_resultmessage']='　平均との比較をグラフにしました。「有効な対策」を実行した場合の効果が中央のグラフに表示されます。';
$lang['home_button_measuremessage']='　有効な対策の一覧です。「選択」にチェックをすると、効果がグラフで表示されます。';
$lang['home_button_pagemessage']='　分野を指定して詳しく回答しなおすことができます。「追加」で部屋や機器を追加できます。';



//---------- 2 focus mode page -----------------------------------------------
$lang['home_focus_title_after']='　一覧モード';

$lang['intro1']='ようこそ新省エネ診断ソフト(D6)へ。いまのエネルギーの使い方を入力することで、有効な省エネ対策を計算して提案できます。';
$lang['intro2']='わかる範囲で、今のエネルギーの使い方を選んでください。おおよそでも構いませんし、わからない質問は飛ばしてください。';
$lang['intro3']='入力に応じた分析結果が随時表示されます。';
$lang['intro4']='CO2排出量を用途別に分析した推計結果です。左があなたの現状です。右が比較として、同様の家庭（事業者）を示しています。中央は、対策を選択したときの削減成果が示されます。';
$lang['intro5']='月別の光熱費をグラフにしています。';
$lang['intro6']='有効な省エネ対策が随時表示されます。タイトルをクリックすると、詳しく解説されます。お得の★は、購入費用があっても元を取れる対策です。右の列をクリックして選択すると、対策をした場合の成果が、中央のグラフに反映されます。';
$lang['intro7']='ブラウザに入力情報を保存しておくことができます。';
$lang['intro8']='この画面は20項目程度の限られた質問だけですが、詳しく診断することもできます。ではさっそく[Done]を押して診断をはじめてください。';

//---------- 3 easy mode page -----------------------------------------------
$lang['home_easy_title']='快適生活のための簡単エコチェック';
$lang['home_easy_step1']='質問';
$lang['home_easy_step2']='比較';
$lang['home_easy_step3']='特徴';
$lang['home_easy_step4']='対策';
$lang['home_easy_toptitle']='家の光熱費を安くしてみませんか';
$lang['home_easy_top1']='　日本では「省エネ」が誤解されています。決して「がまんする」ものではなく、より生活を豊かにするものです。光熱費も安くなり、生活が快適になり、それで未来の子どもたちのためにもなります。';
$lang['home_easy_top2']='　かんたんな質問で、あなたの生活にあった対策を示します。3分間でできるエコチェックしてみてください。';
$lang['home_easy_top3sm']='※完全無料です。名前やメールアドレスなど、あなたを特定する情報の入力は必要ありません。';
$lang['home_easy_top_button_start']='診断をはじめる';
$lang['home_easy_top_button_about']='　解説　';

$lang['home_easy_p5title']='この質問にお答えください';
$lang['home_easy_p5_1']='　おおよそあてはまる選択肢を選んでください。わからない場合には、回答しなくても構いません。';
$lang['home_easy_p5_button_next']='結果をみる';

$lang['home_easy_p2title']='平均世帯とくらべて';
$lang['home_easy_p2_button_next']='大きな原因を明らかにします';

$lang['home_easy_p3title']='あなたの生活の特徴';
$lang['home_easy_p3_1']='　CO2がどこから出ているのか分析した結果です。左があなた、右は条件があなたに似た家庭の標準値を示しています。';
$lang['home_easy_p3_button_next']='おすすめの対策はこちら';
$lang['home_easy_p4title_pre']='　';
$lang['home_easy_p4title_after']='つのおすすめ対策';
$lang['home_easy_p4_button_next']='一番おすすめの対策';
$lang['home_easy_p4_1']='　あなたの家庭に合わせた、おすすめの省エネ対策です。タイトルをクリックすると、詳しく解説されます。お得の★マークは、購入費用があっても元を取れる対策です。';
$lang['home_easy_p4_2']='　これは概算です。詳しい診断で、よりあなたにあった提案をすることもできます。';
$lang['home_easy_p4_button_next2']='さらに詳しい診断はこちらからできます';
$lang['home_easy_p4_button_next3']='家電製品の買い換えを考えているかた';
$lang['home_easy_measure_show']= 'function(num) {return num + "番目におすすめを表示"};';


//--5 maintenance page-----------------
$lang['home_maintenance_message']='　あなたの選択した対策は以下のとおりです。取り組めていますか？';
$lang['home_maintenance_list']='選択した対策';
$lang['home_maintenance_selected']='この対策を選択しました';

//-- 6 action page-----------------
$lang['home_action_title']='低炭素生活のための簡単エコチェック';
$lang['home_action_step1']='質問';
$lang['home_action_step2']='評価';
$lang['home_action_step3']='対策';
$lang['home_action_toptitle']='めざせ低炭素家庭';
$lang['home_action_top1']='削減ができます';
$lang['home_action_top2']='かんたんな方法で';
$lang['home_action_axis1']='持続可能性';
$lang['home_action_axis2']='省エネ機器';
$lang['home_action_axis3']='省エネ行動';
$lang['home_action_label1']='すばらしい！';
$lang['home_action_label2']='まあまあよい';
$lang['home_action_label3']='ちょっと残念';
$lang['home_action_good_point']='良い点';
$lang['home_action_bad_point']='改善点';

//--99 list page-----------------
$lang['home_list_message']='この中からあなたにあった対策を厳選します';

//--createpage-----------------

$lang["younow"]='あなた現状';
$lang["youafter"]='対策後';
$lang["average"]='平均';
$lang["compare"]='比較';
$lang["comparetoaverage"]='平均比較';
$lang["co2emission"]='CO2排出量';
$lang["co2reductiontitle"]='CO2削減効果';
$lang["fee"]='光熱費';
$lang["feereductiontitle"]='光熱費削減';
$lang["initialcosttitle"]='初期投資額';
$lang["loadperyear"]='年間負担額';
$lang["primaryenergy"]='一次エネルギー消費量';
$lang["other"]='その他';



//----------for office -----------------------------------------------
$lang['office_title']='事業所簡易省エネ診断';
$lang["officecall"]='御社';
$lang["officecount"]='事業所';
$lang["totaloffice"]='事業所全体';
$lang["officenow"]='事業所現状';
$lang["compareoffice"]='function(target) {return "同じ規模の" + target};';


$lang['button_demand']='デマンド';


//----------7 lifegame -----------------------------------------------
$lang['home_lifegame_title']='CO2ゼロ時代サバイバル';
$lang['home_lifegame_toptitle']='あなたの月の収入が1万円あがりました！';
$lang['home_lifegame_top1']='　景気が良くなったのか、あなたの仕事が認められるようになったのかわかりませんが、収入が月1万円増えました。おめでとうございます。え？たいした額ではないですって？　まあそう謙遜しなくても結構です。';
$lang['home_lifegame_top2']='　何に使おうが自由なのですが、あまり自由に消費すると、人類がこの地球上で生存できなくなることが明らかになっています。気候変動（地球温暖化）問題です。21世紀中には石油や石炭が使えなくすることが、世界中で合意されています。というわけで、この毎月の1万円を使って、あなたの生活のCO2排出をゼロにしてください。';
$lang['home_lifegame_top3']='　ありがとうございます。何年かかっても構いませんが、生きている間にはゼロにしましょう。ただし追加で支払うお金は、月1万円です。';
$lang['home_lifegame_top3b']='　ところであなたは、もしかして、<br><ul><li>25歳独身、賃貸アパートぐらし</li><li>光熱費日本平均</li></ul>の生活をされている方ですか？';
$lang['home_lifegame_toptitle4']='取り組みを選んでください';
$lang['home_lifegame_top4']='　最初なので、まだ使える予算は1万円しかありません。1万円以内で取り組めること、お金がかからない取り組みにはこのようなものがあります。ただし、1回の選択では3項目までしか選ぶことはできません。それ以上選んでも、人間は忘れてしまいます。';
$lang['home_lifegame_toptitle5']='取り組みありがとうございます';
$lang['home_lifegame_top5']='　○○、○○の取り組みを実行しました。このため○万円のお金が使われ、残りは○万円になりました。';
$lang['home_lifegame_toptitle6']='効果があらわれました';
$lang['home_lifegame_top6']='　けれども、取り組みにより毎月○万円が追加で安くなりました。もし何もしなかった場合と比較すると、今までの積み重ねで、毎月○万円安くなっています。CO2排出量は、初期状態から○%減になっています。';
$lang['home_lifegame_top6b']='　1年間が経過し、収入が上がった分、12万円が追加で使えます。加えて、1年の光熱費削減により、○万円が使えます。使えるお金は、○万円から○万円に増加しました。';
$lang['home_lifegame_toptitle7']='取り組み時期になりました';
$lang['home_lifegame_top7']='　現在、使える予算は○万円あります。この金額以内で取り組めること、お金がかからない取り組みにはこのようなものがあります。取り組む項目を選んでください。';
$lang['home_lifegame_toptitle90']='あなたの設定を選んでください';
$lang['home_lifegame_top90']='　現在の生活を選ぶと、現在から本当にCO2をゼロにしていくシミュレーションが始まります。';
$lang['home_lifegame_toptitle99']='死にました。おつかれさまでした。';
$lang['home_lifegame_top99']='　人類は地球温暖化の進行を止めることができず、巨大な暴風雨で都市が壊滅状態となることが繰り返されました。世界の食料生産地では水不足が深刻化し、食料が世界的に不足し、食料をめぐる戦争が各地で起こりました。幸いなことに、あなたは、小さな子どもたちが苦しみ悲しむ姿を見ることなく、無事にあの世に行くことができました。よかったですね。';


$lang['button_end']='やめる';
$lang['button_agree']='設定する';
$lang['button_commit']='実行します';

$lang['home_lifegame_button_sel99']='すみません、やります。';
$lang['home_lifegame_button_sel3a']='ちがいます';
$lang['home_lifegame_button_sel3b']='まあ、それでいいです。';

//----------8 uchieco web -----------------------------------------------
$lang['home_uchieco_title']='うちエコキッズWEB診断';

