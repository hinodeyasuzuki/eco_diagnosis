<?php // set to Language/*.php ========================
// 
// 
// 
//----------system title-----------------------------------------------
$lang["code"]='cn';
$lang['home_title']='低碳家庭诊断';
$lang['home_joy_title']='低碳家庭诊断（简单版）';

$lang['countfix_pre_after']='2';

//--energy -----------------
$lang["show_electricity"]='TRUE';
$lang["show_gas"]='TRUE';
$lang["show_kerosene"]='FALSE';
$lang["show_briquet"]='TRUE';
$lang["show_area"]='TRUE';
$lang["show_gasoline"]='TRUE';

$lang["electricitytitle"]='电力';
$lang["gastitle"]='煤气';
$lang["kerosenetitle"]='煤油';
$lang["briquettitle"]='蜂窝煤';
$lang["areatitle"]='区域供暖';
$lang["gasolinetitle"]='汽油';
$lang["electricityunit"]='kWh';
$lang["gasunit"]='m3';
$lang["keroseneunit"]='L';
$lang["briquetunit"]='kg';
$lang["areaunit"]='MJ';
$lang["gasolineunit"]='L';

//--common unit-----------------
$lang['point_disp']='function(num) {return num + "分"};';

$lang["priceunit"]='元';
$lang['co2unit']='kg';
$lang['energyunit']='GJ';
$lang['monthunit']='月';
$lang['yearunit']='年';
$lang["co2unitperyear"]='';
$lang["co2unitpermonth"]='';
$lang["feeunitperyear"]='';
$lang["feeunitpermonth"]='';
$lang["energyunitperyear"]='';
$lang["energyunitpermonth"]='';

//--common page-----------------
$lang["startPageName"]='全体（简单）';
$lang['header_attension']='';
$lang["dataClear"]='删除全部内容，删除？';
$lang["savetobrowser"]='已保存到浏览器。';
$lang["savedataisshown"]='保留值如下。';

//--question page-----------------
$lang["QuestionNumber"]='function(numques, nowques) {return  "（" + nowques + "个问题中第" + numques + "个）"};';


//--compare-----------------
$lang["youcall"]='您';
$lang["youcount"]='家庭规模';
$lang["totalhome"]='全体家庭成员';
$lang["comparehome"]='function(target) {return "同一家庭规模的"+target};';


$lang["rankin100"]='function(count) {return "在情况相似的100个家庭中，您家排在第 " + count +"名"};';


$lang["rankcall"]='名';
$lang["co2ratio"]='function(ratio) {return "　您家的二氧化碳排放量是平均的" + ratio +"倍。<br>"};';


$lang["co2compare06"]='大大低于家庭平均碳排放量，非常棒的低碳生活。';
$lang["co2compare08"]='略低于家庭平均碳排放量，低碳生活。';
$lang["co2compare10"]='与家庭平均碳排放量持平。';
$lang["co2compare12"]='略高于家庭平均碳排放量，通过升级改造，还能有很大进步空间。';
$lang["co2compare14"]='高于家庭平均碳排放量，通过升级改造，还能有很大进步空间。';
$lang["rankcomment"]='function(same,youcount,rank) {return "假如有100个类似家庭" + youcount + "，您家排在第" +   youcount+ "名。<br>"};';





//itemize-----------
$lang["itemize"]='细项';
$lang["itemname"]='方面';
$lang["percent"]='比例(%)';
$lang["measure"]='措施';
$lang["merit"]='优惠';
$lang["select"]='选择';
$lang["itemizecomment"]='function(main3,sum) {return main3+"）的比例较大，占到这3方面的" + sum+"%。占比大的策略效果更好。"};';



//--result-----------------
$lang["effectivemeasures"]='有效的措施';
$lang["comment_combined_reduce"]='function(percent,fee,co2) {return "　将以上措施组合起来每年可减少 " + percent+"%的二氧化碳排放量（" + ( hidePrice != 1  ? fee +"元水电费、 ":"") + co2+"公斤）。如果您已经采取了如上措施，说明您已经在享受低碳生活了。"};';




$lang["titlemessage"]='function(title) {return  title+"有效的措施组合。"};';

$lang["co2reduction"]='function(co2) {return "每年可减少 " + co2+"kg二氧化碳排放量。"};';


$lang["reducepercent"]='function(name,percent) {return "相当于二氧化碳排放量减少了" + name+"的"+ percent+"% "};';



$lang["co2minus"]='可实现二氧化碳0排放的生活。';
$lang["error"]=' ※由于您没有填写详细数据，因此这里只能提供概算。';

$lang["feereduction"]='function(fee) {return "该措施组合每年可节省约" + fee+"元。"};';


$lang["feenochange"]='煤电费无变化。';

//result payback----------------------------
$lang["initialcost"]='function(price,lifetime,load) {return "由于需要重新购买，需要花费约" + price+"元左右（参考价）。价格除以使用寿命 " + lifetime+"年​​，平均每年约负担"+ load+"元。"};';




$lang["payback"]='function(change,totalchange,down) {return "另一方面，煤电费每年减少约 " + change+ "元，每年会节省 " + totalchange +(down?"元。您只需负担":"元。" )};';




$lang["payback1month"]='您可在一个月内收回成本。';
$lang["paybackmonth"]='function(month) {return "您可在约" + month+"个月内收回成本。"};';


$lang["paybackyear"]='function(year) {return "您可在约" + year+"年内收回成本。"};';


$lang["paybacknever"]='即便达到了产品使用寿命，也无法通过节省煤电费来收回成本。';
$lang["notinstallfee"]='function(fee) {return "每年会节省煤电费" + fee+"元。"};';



//monthly-----------
$lang["monthlytitle"]='每月的煤电费推算';
$lang["month"]='月';
$lang["energy"]='能源';


//----------buttons -----------------------------------------------
$lang['button_clear']='删除';
$lang['button_savenew']='另存为';
$lang['button_save']='保存';
$lang['button_open']='开';
$lang['button_close']='关';
$lang['button_showall']='显示全部';
$lang["add"]='追加';

$lang['button_menu']='菜单';
$lang['button_back_toppage']='返回首页';
$lang['button_back']='返回';
$lang['button_prev']='上一页';
$lang['button_next']='下一页';

$lang['button_top']='首页';
$lang['button_input']='填写现状';
$lang['button_queslist']='所有问题';
$lang['button_diagnosis']='诊断首页';
$lang['button_measures']='研究措施';
$lang['button_selectcategory']='设定评价方面';
$lang['button_calcresult']='计算结果';
$lang['button_about']='说明';
$lang['button_fullversion']='功能完整版';
$lang['clear_confirm']='一览表模式';

$lang['button_co2emission']='二氧化碳排放量';
$lang['button_firstenergy']='初级能源量';
$lang['button_energyfee']='煤电费';


//---- 1 button mode -----------
$lang['home_button_intro1']='本软件可根据您家使用的的耗能设备及使用方式提供个性化的节能措施。以下是20个与家庭能耗使用方式相关的问题，请就您知道的范围进行回答，提交后会反馈给您相应的节能措施。';
$lang['home_button_intro2']='您所输入的信息不会被保存到服务器，仅显示在您的手机上。';
$lang['home_button_startdiagnosis']='开始诊断';
$lang['home_button_about']='关于诊断';
$lang['home_button_result']='看结果';
$lang['home_button_retry']='重新回答';
$lang['home_button_average']='与平均比较';
$lang['home_button_monthly']='每月变化';
$lang['home_button_measure']='有效措施';
$lang['home_button_resultmessage']='这是您家与家庭平均值的对比图。中间的图表是当您执行了“有效措施”后将取得的效果。';
$lang['home_button_measuremessage']='有效措施一览表。请在方框内打勾，相应的效果将以图表形式显示。';
$lang['home_button_pagemessage']='可指定某个部分重新回答。点击“追加”可追加房间或设备。';



//---------- 2 focus mode page -----------------------------------------------
$lang['home_focus_title_after']='列表模式';

$lang['intro1']='欢迎使用新节能诊断软件。填写您当前的能源使用方式，为您计算并提供有效的节能方案。';
$lang['intro2']='请在您所知的范围内选择目前的能源使用方式。可以不准确，不了解的问题请直接跳过。';
$lang['intro3']='根据您的输入内容随时显示分析结果。';
$lang['intro4']='以下是按照不同用途分析得出的碳排放量结果。左边为您的现状。右边为对比项，显示与您类似的家庭（或单位）的情况。中间为采取措施后可达到的减排效果。';
$lang['intro5']='图表方式显示的每月煤电费';
$lang['intro6']='随时显示有效的节能措施。点击标题可查看详细说明。★代表获益，指的是将购置费计算在内后依然可收回成本的节能措施。点击右列，采取措施后的效果会显示在中间的图表上。';
$lang['intro7']='可在浏览器中保存您输入的信息。';
$lang['intro8']='您只需回答本页面中的20个问题，即可得到详细诊断信息。点击“Done”立刻开始。';

//---------- 3 easy mode page -----------------------------------------------
$lang['home_easy_title']='低碳家庭简单诊断';
$lang['home_easy_step1']='问题';
$lang['home_easy_step2']='对比';
$lang['home_easy_step3']='特点';
$lang['home_easy_step4']='措施';
$lang['home_easy_toptitle']='不考虑节省一些煤电费吗？';
$lang['home_easy_top1']='“节能”不是让你忍受不便，而是使自己的生活更加富足，舒适，也是为了子孙后代的幸福生活。';
$lang['home_easy_top2']='只需回答简单的问题，即可得到与您的生活相匹配的节能措施。试试3分钟低碳家庭诊断吧。';
$lang['home_easy_top3sm']='※本软件完全免费。无需填写姓名、邮箱等个人信息。';
$lang['home_easy_top_button_start']='开始诊断';
$lang['home_easy_top_button_about']='说明';

$lang['home_easy_p5title']='请回答问题';
$lang['home_easy_p5_1']='请选择您最合适的项目。不清楚的问题可直接跳过。';
$lang['home_easy_p5_button_next']='看结果';

$lang['home_easy_p2title']='与平均家庭相比';
$lang['home_easy_p2_button_next']='确定主要原因';

$lang['home_easy_p3title']='您的生活特点';
$lang['home_easy_p3_1']='这是关于二氧化碳排放源的分析结果。左边是您家，右边是与您家类似家庭的碳排放标准值。';
$lang['home_easy_p3_button_next']='推荐的措施';
$lang['home_easy_p4title_pre']='共';
$lang['home_easy_p4title_after']='个推荐措施';
$lang['home_easy_p4_button_next']='最推荐的措施';
$lang['home_easy_p4_1']='以下是根据您的家庭情况定制推荐的节能措施。点击标题查看详细说明。';
$lang['home_easy_p4_2']='以上仅是粗略的分析。还可根据更详细的诊断推荐更为匹配的措施。';
$lang['home_easy_p4_button_next2']='进行更详细的诊断';
$lang['home_easy_p4_button_next3']='考虑更换家电的用户';
$lang['home_easy_measure_show']= 'function(num) {return "第 "+ num + "个建议措施"};';


//--5 maintenance page-----------------
$lang['home_maintenance_message']='以下是您选择的措施。您在执行了吗？';
$lang['home_maintenance_list']='已选择的措施';
$lang['home_maintenance_selected']='选择了这个措施';

//-- 6 action page-----------------
$lang['home_action_title']='低碳生活简单诊断';
$lang['home_action_step1']='问题';
$lang['home_action_step2']='评价';
$lang['home_action_step3']='对策';
$lang['home_action_toptitle']='面向低碳生活的家庭';
$lang['home_action_top1']='用一些小窍门就可以减少碳排放量';
$lang['home_action_top2']='';
$lang['home_action_axis1']='可持续性';
$lang['home_action_axis2']='节能设备';
$lang['home_action_axis3']='节能行为';
$lang['home_action_label1']='赞！';
$lang['home_action_label2']='还可以';
$lang['home_action_label3']='有点可惜';
$lang['home_action_good_point']='做得好的地方';
$lang['home_action_bad_point']='可以改进的地方';

//--99 list page-----------------
$lang['home_list_message']='将从这里选出适合您的措施';

//--createpage-----------------

$lang["younow"]='当前情况';
$lang["youafter"]='采取措施后';
$lang["average"]='平均';
$lang["compare"]='对照';
$lang["comparetoaverage"]='';
$lang["co2emission"]='二氧化碳排放量';
$lang["co2reductiontitle"]='CO2减排效果';
$lang["fee"]='煤电费';
$lang["feereductiontitle"]='减少煤电费';
$lang["initialcosttitle"]='初期投资额';
$lang["loadperyear"]='一年负担额';
$lang["primaryenergy"]='初级能源';
$lang["ohter"]='其他';



//----------for office -----------------------------------------------
$lang['office_title']='低碳办公室简单诊断';
$lang["officecall"]='贵公司';
$lang["officecount"]='办公室';
$lang["totaloffice"]='整个办公室';
$lang["officenow"]='当前情况';
$lang["compareoffice"]='function() {return "同样规模的" + target};';


$lang['button_demand']='需求';

//----------7 lifegame -----------------------------------------------
$lang['home_lifegame_title']='';
$lang['home_lifegame_toptitle']='';
$lang['home_lifegame_top1']='';
$lang['home_lifegame_top2']='';
$lang['home_lifegame_top3']='';
$lang['home_lifegame_top3b']='';
$lang['home_lifegame_toptitle4']='';
$lang['home_lifegame_top4']='';
$lang['home_lifegame_toptitle5']='';
$lang['home_lifegame_top5']='';
$lang['home_lifegame_toptitle6']='';
$lang['home_lifegame_top6']='';
$lang['home_lifegame_top6b']='';
$lang['home_lifegame_toptitle7']='';
$lang['home_lifegame_top7']='';
$lang['home_lifegame_toptitle90']='';
$lang['home_lifegame_top90']='';
$lang['home_lifegame_toptitle99']='';
$lang['home_lifegame_top99']='';


$lang['button_end']='结束';
$lang['button_agree']='设置';
$lang['button_commit']='执行';
$lang['home_lifegame_button_sel99']='';
$lang['home_lifegame_button_sel3a']='';
$lang['home_lifegame_button_sel3b']='';

//----------8 uchieco web -----------------------------------------------
$lang['home_uchieco_title']='';



