<?php // set to Language/*.php ========================
// 
// 
// 
//----------system title-----------------------------------------------
$lang["code"]='ko';
$lang['home_title']='가정의 에너지 절약 진단';
$lang['home_joy_title']='가정의 에너지 절약 진단 (느긋함 버전)';

$lang['countfix_pre_after']=

//--energy -----------------
$lang["show_electricity"]=True;
$lang["show_gas"]=True;
$lang["show_kerosene"]=True;
$lang["show_briquet"]=False;
$lang["show_area"]=False;
$lang["show_gasoline"]=True;

$lang["electricitytitle"]='전기';
$lang["gastitle"]='가스';
$lang["kerosenetitle"]='등유';
$lang["briquettitle"]='연탄';
$lang["areatitle"]='지역 열';
$lang["gasolinetitle"]='가솔린';
$lang["electricityunit"]='kWh';
$lang["gasunit"]='m3';
$lang["keroseneunit"]='L';
$lang["briquetunit"]='kg';
$lang["areaunit"]='MJ';
$lang["gasolineunit"]='L';

//--common unit-----------------
$lang['point_disp']='function(num) {return num + "점"};';

$lang["priceunit"]='원형';
$lang['co2unit']='kg';
$lang['energyunit']='GJ';
$lang['monthunit']=
$lang['yearunit']=
$lang["co2unitperyear"]='kg/년';
$lang["co2unitpermonth"]='kg/월';
$lang["feeunitperyear"]='원형/년';
$lang["feeunitpermonth"]='원형/월';
$lang["energyunitperyear"]='GJ/년';
$lang["energyunitpermonth"]='GJ/월';

//--common page-----------------
$lang["startPageName"]='전체 (간이)';
$lang['header_attension']='(동작 모델에 대한 제안 수치의 보장은 없습니다. 필요에 따라 개발 수 있습니다.)';
$lang["dataClear"]='입력 데이터를 모두 삭제합니다. 좋습니까.';
$lang["savetobrowser"]='브라우저에 저장했습니다.';
$lang["savedataisshown"]='저장 값은 다음과 같습니다.';

//--question page-----------------
$lang["QuestionNumber"]='function(numques, nowques) {return "("+ numques + "질문 중에"+ nowques + "문 번째)"};';


//--compare-----------------
$lang["youcall"]='당신';
$lang["youcount"]='가구';
$lang["totalhome"]='집 전체';
$lang["comparehome"]='function(target) {return "같은 가구 규모의"+ target + "가정"};';


$lang["rankin100"]='function(count) {return "100"+ count + "중간 순위"};';


$lang["rankcall"]='';
$lang["co2ratio"]='function(ratio) {return "CO2 배출량은 평균의"+ ratio + "배입니다."};';


$lang["co2compare06"]='평균보다 상당히 적습니다. 아주 좋은 생활입니다.';
$lang["co2compare08"]='평균보다 적습니다. 멋진 삶입니다.';
$lang["co2compare10"]='평균과 같은 수준입니다.';
$lang["co2compare12"]='평균보다 좀 더 큽니다. 개선을 통해 에너지 비용이 내려갈 여지가 큰 것입니다.';
$lang["co2compare14"]='평균보다 넉넉합니다. 개선을 통해 에너지 비용이 내려갈 여지가 큰 것입니다.';
$lang["rankcomment"]='function(same, youcount, rank) {return same + "100"+ youcount + "있었다고하면 적은 편에서"+ youcount + "번째입니다. <br>"};';





//itemize-----------
$lang["itemize"]='내역';
$lang["itemname"]='분야';
$lang["percent"]='비율 (%)';
$lang["measure"]='대책';
$lang["merit"]='거래';
$lang["select"]='선택';
$lang["itemizecomment"]='function(main3, sum) {return main3 + "의 비중이 크고,이 세 분야에서"+ sum + "%를 차지하고 있습니다. 이러한 큰 분야의 대책이 효과적입니다."};';



//--result-----------------
$lang["effectivemeasures"]='효과적인 대책';
$lang["comment_combined_reduce"]='function(percent, fee, co2) {return "결합"+ percent + "% 연간"+ (hidePrice!= 1? fee + "엔 광열비와": "") + co2 + "kg의 CO2가 줄어 듭니다. 이미 작업하는 경우, 이만큼 성과가 오르는 에코 생활을 할 수 있다는 것을 의미합니다. "};';




$lang["titlemessage"]='function(title) {return title + "대처가 효과적입니다."};';

$lang["co2reduction"]='function(co2) {return "연간"+ co2 + "kg의 CO2를 줄일 수 있습니다."};';


$lang["reducepercent"]='function(name, percent) {return "이것은"+ name + "의"+ percent + "%를 줄일 수에 해당합니다."};';



$lang["co2minus"]='CO2를 배출하지 않는 생활을 달성 할 수 있습니다.';
$lang["error"]='※ 세부 사항 기입이 없기 때문에 예상입니다.';

$lang["feereduction"]='function(fee) {return "연간"+ fee + "엔 유익한 노력입니다."};';


$lang["feenochange"]='광열비 등의 변화는 없습니다.';

//result payback----------------------------
$lang["initialcost"]='function(price, lifetime, load) {return "새로 구입하는 약"+ price + "엔 (가격) 소요"+ lifetime + "년의 수명으로 나누면 연간 약"+ load + "엔의 부담이됩니다."};';




$lang["payback"]='function(change, totalchange, down) {return "한편, 광열비가 매년 약"+ change + "엔 저렴하기 때문에 전체적으로는 연간 약"+ totalchange + (down? "엔 이득입니다.": "엔의 부담하면됩니다.")};';




$lang["payback1month"]='1 개월 이내에 원래를 취할 수 있습니다.';
$lang["paybackmonth"]='function(month) {return "약"+ month + "개월 전을 취할 수 있습니다."};';


$lang["paybackyear"]='function(year) {return "약"+ year + "년에 전을 취할 수 있습니다."};';


$lang["paybacknever"]='또한, 제품의 수명까지 광열비 삭감 액에 전을 취할 수 없습니다.';
$lang["notinstallfee"]='function(fee) {return "광열비는 연간 약"+ fee + "엔 저렴합니다."};';



//monthly-----------
$lang["monthlytitle"]='월별 광열비 추계';
$lang["month"]='월';
$lang["energy"]='에너지';


//----------buttons -----------------------------------------------
$lang['button_clear']='클리어';
$lang['button_savenew']='새 저장';
$lang['button_save']='저장';
$lang['button_open']=
$lang['button_close']='닫기';
$lang['button_showall']='모두 표시';
$lang["add"]='추가';

$lang['button_menu']='메뉴';
$lang['button_back_toppage']='첫 페이지로 돌아 가기';
$lang['button_back']='돌아 가기';
$lang['button_prev']='이전';
$lang['button_next']='다음에';

$lang['button_top']=
$lang['button_input']='현재 작성';
$lang['button_queslist']='질문 목록';
$lang['button_diagnosis']='진단 화면';
$lang['button_measures']='대책 검토';
$lang['button_selectcategory']='평가 분야 설정';
$lang['button_calcresult']='계산 결과';
$lang['button_about']='해설';
$lang['button_fullversion']='전 기능';
$lang['clear_confirm']='목록 모드';

$lang['button_co2emission']='CO2 배출량';
$lang['button_firstenergy']='일차 에너지 량';
$lang['button_energyfee']='광열비';


//---- 1 button mode -----------
$lang['home_button_intro1']='당신의 가정에서의 에너지 장비와 그 사용법에 따라 유효한 에너지 절약 대책을 제안합니다. 가정에서의 에너지 사용에 대한 20 문항 정도의 질문이 있습니다. 대답 할 수있는 질문 만 괜찮아요 때문에 답변하시면 귀하의 가정에 있었다 대책을 제안 할 수 있습니다.';
$lang['home_button_intro2']='입력 된 정보는이 단말기를 이용하는 귀하 만이 열람 할 서버에 축적되지 않습니다.';
$lang['home_button_startdiagnosis']='진단을 시작';
$lang['home_button_about']='이 진단에 대해';
$lang['home_button_result']='결과를 보면';
$lang['home_button_retry']='답변을 다시';
$lang['home_button_average']='평균 비교';
$lang['home_button_monthly']='달 변화';
$lang['home_button_measure']='유효한 대책';
$lang['home_button_resultmessage']='평균과의 비교를 그래프로했습니다. "유효한 대책 \'을 실행 한 경우의 효과가 중앙의 그래프에 표시됩니다.';
$lang['home_button_measuremessage']='유효한 대책의 목록입니다. "선택"에 체크를하면 효과가 그래프로 표시됩니다.';
$lang['home_button_pagemessage']='분야를 지정하여 상세히 답변 해 다시 수 있습니다. "추가"에서 객실 및 장비를 추가 할 수 있습니다.';



//---------- 2 focus mode page -----------------------------------------------
$lang['home_focus_title_after']='목록 모드';

$lang['intro1']='오신 것을 환영합니다 새로운 에너지 절약 진단 소프트 (D6)에. 지금의 에너지 사용을 입력하여 효과적인 에너지 절약 대책을 계산하고 제안 할 수 있습니다.';
$lang['intro2']='아는 범위에서, 지금의 에너지 사용을 선택하십시오. 대략이라도 상관 없으며, 모르는 질문은 건너 뜁니다.';
$lang['intro3']='입력에 따른 분석 결과를 수시 표시됩니다.';
$lang['intro4']='CO2 배출량을 용도별로 분석 한 추정 결과입니다. 왼쪽이 당신의 현실입니다. 오른쪽이 비교로 비슷한 가정 (사업자)를 보여줍니다. 중앙은 대책을 선택했을 때의 절감 성과가 표시됩니다.';
$lang['intro5']='월별 광열비를 그래프로하고 있습니다.';
$lang['intro6']='효과적인 에너지 절약 대책이 수시로 나타납니다. 제목을 클릭하면 자세히 설명됩니다. 거래의 ★ 구입 비용이 있어도 원래를 취할 대책입니다. 오른쪽 열을 클릭하여 선택하면 대책을했을 경우의 성과가 중앙의 그래프에 반영됩니다.';
$lang['intro7']='브라우저에 입력 정보를 저장할 수 있습니다.';
$lang['intro8']='이 화면은 20 항목 정도의 제한된 질문 뿐이지 만, 자세한 진단 할 수 있습니다. 그럼 즉시 Done (완료)을 눌러 진단을 시작합니다.';

//---------- 3 easy mode page -----------------------------------------------
$lang['home_easy_title']='편안한 생활을위한 간단한 에코 체크';
$lang['home_easy_step1']='질문';
$lang['home_easy_step2']='비교';
$lang['home_easy_step3']='특징';
$lang['home_easy_step4']='대책';
$lang['home_easy_toptitle']='집의 광열비를 저렴하고 보지 않겠습니까';
$lang['home_easy_top1']='일본에서는 「에너지 절약」가 오해되고 있습니다. 결코 "참는 \'것이 아니라 더 삶을 풍요롭게하는 것입니다. 광열비도 저렴 생활이 편안하게, 그래서 미래의 아이들을 위해서도됩니다.';
$lang['home_easy_top2']='간단한 질문으로 당신의 생활에 맞는 대책을 나타냅니다. 3 분만에있는 에코 체크해주세요.';
$lang['home_easy_top3sm']='※ 완전 무료입니다. 이름과 이메일 주소 등 귀하를 식별하는 정보를 입력 할 필요가 없습니다.';
$lang['home_easy_top_button_start']='진단을 시작';
$lang['home_easy_top_button_about']='해설';

$lang['home_easy_p5title']='이 질문에 대한 답변';
$lang['home_easy_p5_1']='대체로 들어 맞는 옵션을 선택하십시오. 모르는 경우에는 답변하지 않아도 상관 없습니다.';
$lang['home_easy_p5_button_next']='결과를 보면';

$lang['home_easy_p2title']='평균 가구와 비교하여';
$lang['home_easy_p2_button_next']='큰 원인을 밝혀합니다';

$lang['home_easy_p3title']='당신의 삶의 특징';
$lang['home_easy_p3_1']='CO2가 어디에서 나오고 있는지 분석 한 결과입니다. 왼쪽이 당신, 오른쪽은 조건이 당신을 닮은 가정의 표준 값을 보여줍니다.';
$lang['home_easy_p3_button_next']='추천 대책은 이쪽';
$lang['home_easy_p4title_pre']=
$lang['home_easy_p4title_after']='하나의 추천 대책';
$lang['home_easy_p4_button_next']='가장 추천 대책';
$lang['home_easy_p4_1']='당신의 가정에 맞는 추천 에너지 절약 대책입니다. 제목을 클릭하면 자세히 설명됩니다. 거래의 ★ 마크는 구입 비용이 있어도 원래를 취할 대책입니다.';
$lang['home_easy_p4_2']='이것은 예상입니다. 자세한 진단에서 더 여러분에게 맞는 제안을 할 수 있습니다.';
$lang['home_easy_p4_button_next2']='자세한 진단은 여기에서 할 수 있습니다';
$lang['home_easy_p4_button_next3']='가전 ​​제품의 교체를 생각하고있는 분';
$lang['home_easy_measure_show']= 'function(num) {return num + "번째로 추천을 표시"};';


//--5 maintenance page-----------------
$lang['home_maintenance_message']='당신의 선택 대책은 다음과 같습니다. 종사하고 있습니까?';
$lang['home_maintenance_list']='선택한 대책';
$lang['home_maintenance_selected']='이 대책을 선택했습니다';

//-- 6 action page-----------------
$lang['home_action_title']='저탄소 생활을위한 간단한 에코 체크';
$lang['home_action_step1']='질문';
$lang['home_action_step2']='평가';
$lang['home_action_step3']='대책';
$lang['home_action_toptitle']='목표로 저탄소 가정';
$lang['home_action_top1']='줄일 수 있습니다';
$lang['home_action_top2']='간단한 방법으로';
$lang['home_action_axis1']='지속 가능성';
$lang['home_action_axis2']='에너지 절약 기기';
$lang['home_action_axis3']='에너지 절약 행동';
$lang['home_action_label1']='굉장하다!';
$lang['home_action_label2']='그저 좋은';
$lang['home_action_label3']='조금 유감';
$lang['home_action_good_point']='좋은 점';
$lang['home_action_bad_point']='개선점';

//--99 list page-----------------
$lang['home_list_message']='이 중에서 여러분에게 맞는 대책을 엄선합니다';

//--createpage-----------------

$lang["younow"]='당신현상';
$lang["youafter"]='대책 후';
$lang["average"]='평균';
$lang["compare"]='비교';
$lang["comparetoaverage"]='평균비교';
$lang["co2emission"]='CO2 배출량';
$lang["co2reductiontitle"]='CO2 삭감 효과';
$lang["fee"]='광열비';
$lang["feereductiontitle"]='광열비 절감';
$lang["initialcosttitle"]='초기 투자';
$lang["loadperyear"]='연간 부담액';
$lang["primaryenergy"]='일차 에너지 소비량';
$lang["other"]='기타';



//----------for office -----------------------------------------------
$lang['office_title']='사업소 간이 에너지 절약 진단';
$lang["officecall"]='귀사';
$lang["officecount"]='사업소';
$lang["totaloffice"]='사업소 전체';
$lang["officenow"]='사업소현상';
$lang["compareoffice"]='function(target) {return "같은 규모의"+ target};';


$lang['button_demand']=

//----------7 lifegame -----------------------------------------------
$lang['home_lifegame_title']='CO2 제로 시대 서바이벌';
$lang['home_lifegame_toptitle']='당신의 월 소득이 1 만원 올랐습니다!';
$lang['home_lifegame_top1']='경기가 좋아진 것인지, 당신의 일을 인정 받게 됐는지 모르겠습니다 만, 소득이 월 1 만 엔 증가했습니다. 축하합니다. 응? 대단한 금액이 아닌 고요? 뭐 그렇게 겸손하지 않아도 괜찮습니다.';
$lang['home_lifegame_top2']='무엇에 쓰려고하지만 자유입니다 만,별로 자유롭게 소비하면 인류가이 지구상에서 생존하지 못할 것으로 밝혀지고 있습니다. 기후 변화 (지구 온난화) 문제입니다. 21 세기는 석유 나 석탄을 사용할 수 없게하는 것이 전 세계적으로 합의되어 있습니다. 그래서,이 매월 1 만엔을 사용하여 당신의 생활의 CO2 배출을 제로로합니다.';
$lang['home_lifegame_top3']='감사합니다. 몇 년 걸려도 상관 없지만, 살아있는 동안은 제로합시다. 그러나 추가로 지불하는 돈은 월 1 만 엔입니다.';
$lang['home_lifegame_top3b']='그런데 당신은 혹시 <br> <ul> <li> 25 세 독신, 임대 아파트 등 해 </ li> <li> 광열비 일본 평균 </ li> </ ul> 생활을하고있는 분 있나요 ?';
$lang['home_lifegame_toptitle4']='대처를 선택하십시오';
$lang['home_lifegame_top4']='처음이므로 아직 사용할 예산은 1 만엔 밖에 없습니다. 1 만엔 이내 임하는 것, 돈이 들지 않는 활동에는 이런 것들이 있습니다. 그러나 한 번의 선택이 3 항목까지 밖에 선택할 수 없습니다. 더 이상 선택도 인간은 잊어 버립니다.';
$lang['home_lifegame_toptitle5']='대처 감사합니다';
$lang['home_lifegame_top5']='○○, ○○ 활동을 수행했습니다. 이 때문에 ○ 만엔의 돈이 사용되고, 나머지는 ○ 만엔되었습니다.';
$lang['home_lifegame_toptitle6']='효과가 나타난했습니다';
$lang['home_lifegame_top6']='그러나, 노력에 따라 매월 ○ 만엔이 추가로 싸졌습니다. 만약 아무것도하지 않은 경우와 비교하면 지금까지의 축적으로 매월 ○ 만엔 저렴합니다. CO2 배출량은 초기 상태에서 ○ % 감소되어 있습니다.';
$lang['home_lifegame_top6b']='1 년이 경과 수입이 오른만큼 12 만원이 추가로 사용할 수 있습니다. 또한, 1 년 광열비 절감하여 ○ 만엔 사용할 수 있습니다. 사용할 수있는 돈은 ○ 만엔에서 ○ 만엔 증가했습니다.';
$lang['home_lifegame_toptitle7']='활동시기가되었습니다';
$lang['home_lifegame_top7']='현재 사용할 수있는 예산은 ○ 만엔 있습니다. 이 금액 이내에서 대응할 것, 돈이 들지 않는 활동에는 이런 것들이 있습니다. 태클 항목을 선택하십시오.';
$lang['home_lifegame_toptitle90']='당신의 설정을 선택하십시오';
$lang['home_lifegame_top90']='현재의 생활을 선택하면 현재에서 정말 CO2를 제로로 만들어가는 시뮬레이션이 시작됩니다.';
$lang['home_lifegame_toptitle99']='죽었습니다. 수고하셨습니다.';
$lang['home_lifegame_top99']='인류는 지구 온난화의 진행을 막을 수없고, 거대한 폭풍에 도시가 괴멸 상태가되는 일이 반복되었습니다. 세계 식량 생산지에서 물 부족이 심화 음식이 세계적으로 부족한 식량을 둘러싼 전쟁이 각지에서 일어났다. 다행히, 당신은 작은 아이들이 고통 슬퍼 모습을 보지 않고 무사히 저승에 갈 수있었습니다. 좋았 지요.';


$lang['button_end']='종료';
$lang['button_agree']='설정';
$lang['button_commit']='실행합니다';
$lang['home_lifegame_button_sel99']='죄송합니다,하고 있습니다.';
$lang['home_lifegame_button_sel3a']='다릅니다';
$lang['home_lifegame_button_sel3b']='글쎄, 그래서 좋다.';

//----------8 uchieco web -----------------------------------------------
$lang['home_uchieco_title']='집 에코 진단 WEB';



