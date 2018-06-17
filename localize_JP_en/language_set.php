<?php // set to Language/*.php ========================



//----------system title-----------------------------------------------
$lang["code"]='en';
$lang['home_title']='Household energy saving diagnosis';
$lang['home_joy_title']='Energy saving diagnosis of home (easy ease)';

$lang['countfix_pre_after']='1';

//--energy -----------------
$lang["show_electricity"]='TRUE';
$lang["show_gas"]='TRUE';
$lang["show_kerosene"]='TRUE';
$lang["show_briquet"]='FALSE';
$lang["show_area"]='FALSE';
$lang["show_gasoline"]='TRUE';

$lang["electricitytitle"]='Electrical';
$lang["gastitle"]='gas';
$lang["kerosenetitle"]='kerosene';
$lang["briquettitle"]='Briquettes';
$lang["areatitle"]='District heat';
$lang["gasolinetitle"]='gasoline';
$lang["electricityunit"]='kWh';
$lang["gasunit"]='m3';
$lang["keroseneunit"]='L';
$lang["briquetunit"]='kg';
$lang["areaunit"]='MJ';
$lang["gasolineunit"]='L';

//--common unit-----------------
$lang['point_disp']='function(num) {return num + "points"};';

$lang["priceunit"]='Yen';
$lang['co2unit']='kg';
$lang['energyunit']='GJ';
$lang['monthunit']='mon';
$lang['yearunit']='year';

//--common page-----------------
$lang["startPageName"]='Overall (simple)';
$lang['header_attension']='(There is no guarantee of the suggested numerical value because it is an operation model.You can develop according to your needs.)';
$lang["dataClear"]='Delete all input data. Are you OK.?';
$lang["savetobrowser"]='It saved in the browser.';
$lang["savedataisshown"]='The saved values ​​are as follows.';

//--question page-----------------
$lang["QuestionNumber"]='function(numques, nowques) {return  "(" + nowques + "th in " + numques + " questions）"};';


//--compare-----------------
$lang["youcall"]='you';
$lang["youcount"]='Household';
$lang["totalhome"]='Whole household';
$lang["comparehome"]='function(target) {return "The same household size"+target+"peoplle"};';


$lang["rankin100"]='function(count) {return "The rank is " + count +" in the 100."};';


$lang["rankcall"]='';
$lang["co2ratio"]='function(ratio) {return "　CO2 emission is" + ratio +"times to the average"};';


$lang["co2compare06"]='It is much less than average. It is a very nice life.';
$lang["co2compare08"]='It is less than average. It is a wonderful life.';
$lang["co2compare10"]='It is about the same level as the average.';
$lang["co2compare12"]='It is somewhat higher than the average. There seems to be plenty of room for reduction in utility costs due to improvement.';
$lang["co2compare14"]='It is larger than the average. There seems to be plenty of room for reduction in utility costs due to improvement.';
$lang["rankcomment"]='function(same,youcount,rank) {return "in 100" + youcount + " same to your home、your rank is #" +   youcount+ "<br>"};';





//itemize-----------
$lang["itemize"]='Breakdown';
$lang["itemname"]='Field';
$lang["percent"]='Percentage (%)';
$lang["measure"]='Measures';
$lang["merit"]='Good value';
$lang["select"]='Choice';
$lang["itemizecomment"]='function(main3,sum) {return main3+"is big source in your home,  and top three items emit" + sum+"% of CO2 form your house.。hese large field measures are effective."};';



//--result-----------------
$lang["effectivemeasures"]='Effective measures';
$lang["comment_combined_reduce"]='function(percent,fee,co2) {return "　You can reduce  " + percent+"%, " + ( hidePrice != 1  ? fee +"yen of energy cost and ":"") + co2+"kg of CO2 emittion annualy.  If you are already working on it, this means that you are doing an eco-life that will only produce these results."};';




$lang["titlemessage"]='function(title) {return  title+" is effective."};';

$lang["co2reduction"]='function(co2) {return "You can reduce " + co2+"kg of CO2 emission."};';


$lang["reducepercent"]='function(name,percent) {return "With these measures you can reduce " +percent+"% from " + name};';



$lang["co2minus"]='Living without CO2 emissions can be achieved.';
$lang["error"]=' * It is rough estimate because there is not detailed entry.';

$lang["feereduction"]='function(fee) {return "You can save" + fee+"yen per year."};';


$lang["feenochange"]='There is no change in utility expenses etc.';

//result payback----------------------------
$lang["initialcost"]='function(price,lifetime,load) {return "To purchase newly, it costs about" + price+"yen (reference price), devided " + lifetime+"year of life, your total cost will be"+ load+"yen per year."};';




$lang["payback"]='function(change,totalchange,down) {return "On the other hand, the utility cost will be saved for " + change+ "yen per year, so the total burden will be" + totalchange +(down?"yen you can save every year in total.":"yen per year." )};';




$lang["payback1month"]='You can get back within a month.';
$lang["paybackmonth"]='function(month) {return "You can get back in" + month+"months"};';


$lang["paybackyear"]='function(year) {return "You can get back on about" + year+"years."};';


$lang["paybacknever"]='In addition, it is impossible to take the original value with the utility cost reduction amount by the products lifetime.';
$lang["notinstallfee"]='function(fee) {return "The utility cost will be" + fee+"yen cheaper."};';



//monthly-----------
$lang["monthlytitle"]='Estimated utility cost per month';
$lang["month"]='Month';
$lang["energy"]='energy';


//----------buttons -----------------------------------------------
$lang['button_clear']='Clear';
$lang['button_savenew']='New storage';
$lang['button_save']='Save';
$lang['button_open']='open';
$lang['button_close']='close';
$lang['button_showall']='Show all';
$lang["add"]='add';

$lang['button_menu']='menu';
$lang['button_back_toppage']='Back to the first page';
$lang['button_back']='Return';
$lang['button_prev']='Forward';
$lang['button_next']='next';

$lang['button_top']='Top';
$lang['button_input']='Entry';
$lang['button_queslist']='Question List';
$lang['button_diagnosis']='Diagnosis page';
$lang['button_measures']='Measure';
$lang['button_selectcategory']='Evaluation field';
$lang['button_calcresult']='Calculation result';
$lang['button_about']='Commentary';
$lang['button_fullversion']='Full function version';
$lang['clear_confirm']='List mode';

$lang['button_co2emission']='CO2 emissions';
$lang['button_firstenergy']='Primary energy';
$lang['button_energyfee']='Utility costs';


//---- 1 button mode -----------
$lang['home_button_intro1']='We will propose effective energy saving measures according to energy equipment in your home and how to use it. There are about 20 questions about how to use energy at home. It is enough to answer questions, so if you answer, you can suggest measures that were appropriate for your home.';
$lang['home_button_intro2']='The information you enter can only be viewed by you using this terminal, it will not accumulate on the server.';
$lang['home_button_startdiagnosis']='Start diagnosis';
$lang['home_button_about']='About this diagnosis';
$lang['home_button_result']='View the results';
$lang['home_button_retry']='Respond again';
$lang['home_button_average']='Average comparison';
$lang['home_button_monthly']='Monthly change';
$lang['home_button_measure']='Effective measures';
$lang['home_button_resultmessage']='We compare the average with a graph. The effect when executing \'effective measures\' is displayed in the middle graph.';
$lang['home_button_measuremessage']='A list of effective countermeasures. If you select the effect will be displayed in the graph.';
$lang['home_button_pagemessage']='You can respond in detail by specifying the field. You can add rooms and equipment with Add.';



//---------- 2 focus mode page -----------------------------------------------
$lang['home_focus_title_after']='List mode';

$lang['intro1']='Welcome to new energy saving diagnosis software (D6). By inputting how to use energy now, you can calculate and propose effective energy saving measures.';
$lang['intro2']='As far as you can understand, please choose how to use the current energy. I do not mind if I do not care about it, skip the question I do not understand.';
$lang['intro3']='Analysis results according to input are displayed at any time.';
$lang['intro4']='It is an estimation result that analyzed CO2 emissions by purpose. The left is your current situation. The right shows a similar family (business operator) as a comparison. The center shows reduction results when measures are selected.';
$lang['intro5']='I am charting the utility bill by month.';
$lang['intro6']='Effective energy saving measures are displayed from time to time. Click on the title to explain in detail. A profitable ★ is a measure that can take the original even if there is a purchase cost. If you click on the right column and select it, the result in the case of countermeasures will be reflected in the middle graph.';
$lang['intro7']='You can save the input information in the browser.';
$lang['intro8']='This screen is limited to about 20 items, but you can also do a detailed diagnosis. Then press [Done] immediately and start diagnosis.';

//---------- 3 easy mode page -----------------------------------------------
$lang['home_easy_title']='Eco-check easy for comfortable living';
$lang['home_easy_step1']='A question';
$lang['home_easy_step2']='Comparison';
$lang['home_easy_step3']='Characteristic';
$lang['home_easy_step4']='Measures';
$lang['home_easy_toptitle']='Why do not you try to lower the houses utility bill?';
$lang['home_easy_top1']=' \'Energy saving\' is misunderstood in Japan. It is not something to \'endure\' but to enrich your life. Costs for light and heat are cheap, life becomes comfortable, and it will also be for the future children.';
$lang['home_easy_top2']='Six questions will tell you what measures were right for your life. Please try eco-check in 3 minutes.';
$lang['home_easy_top3sm']='* It is completely free. You do not need to enter information to identify you, such as name or email address. Since this diagnostic software is executed by downloading the calculation logic itself to the terminal, the entered value is never sent to other than the user terminal.This page uses Google Analitics to understand usage situation.';
$lang['home_easy_top_button_start']='Start diagnosis';
$lang['home_easy_top_button_about']='Commentary';

$lang['home_easy_p5title']='Please answer this questions';
$lang['home_easy_p5_1']='Please choose the option that roughly applies. If you do not understand, you do not have to answer.';
$lang['home_easy_p5_button_next']='View results';

$lang['home_easy_p2title']='Compared to average households';
$lang['home_easy_p2_button_next']='I will clarify the big cause';

$lang['home_easy_p3title']='Characteristics of your life';
$lang['home_easy_p3_1']='It is the result of analyzing where CO2 comes out. The left shows your house , the right shows the standard value of the home whose condition resembles you.';
$lang['home_easy_p3_button_next']='Recommended measures here';
$lang['home_easy_p4title_pre']='';
$lang['home_easy_p4title_after']=' Recommended Measures';
$lang['home_easy_p4_button_next']='The most recommended measures';
$lang['home_easy_p4_1']='It is a recommended energy saving measure tailored to your home. Click on the title to explain in detail. The ★ mark of profit is a measure that can take the original even if there is purchase cost.';
$lang['home_easy_p4_2']='This is rough estimate. With detailed diagnosis, you can make suggestions that more suited you.';
$lang['home_easy_p4_button_next2']='More detailed diagnosis can be done from here';
$lang['home_easy_p4_button_next3']='Thinking of replacing home appliances';
$lang['home_easy_measure_show']= 'function(num) {return "Show recommendations at "+ num + "th"};';


//--5 maintenance page-----------------
$lang['home_maintenance_message']='The measures you have selected are as follows. Are you working on it?';
$lang['home_maintenance_list']='Selected measures';
$lang['home_maintenance_selected']='I have selected this countermeasure';

//-- 6 action page-----------------
$lang['home_action_title']='Easy Check for Low Carbon House';
$lang['home_action_step1']='Questions';
$lang['home_action_step2']='Evaluation';
$lang['home_action_step3']='Measures';
$lang['home_action_toptitle']='Let\'s Change to Low Carbon House';
$lang['home_action_top1']='You can easily find confortable ideas to be low carbon.';
$lang['home_action_top2']='';
$lang['home_action_axis1']='Sustainability';
$lang['home_action_axis2']='Energy Efficiency';
$lang['home_action_axis3']='Saving Energy';
$lang['home_action_label1']='Excellent';
$lang['home_action_label2']='Good';
$lang['home_action_label3']='Bad';
$lang['home_action_good_point']='Good Point';
$lang['home_action_bad_point']='Bad Point';

//--99 list page-----------------
$lang['home_list_message']='Choose the countermeasure suitable for you from among these';

//--createpage-----------------

$lang["younow"]='Current status';
$lang["youafter"]='After measures';
$lang["average"]='average';
$lang["compare"]='Comparison';
$lang["comparetoaverage"]='';
$lang["co2emission"]='CO2 emissions';
$lang["co2reductiontitle"]='CO2 reduction effect';
$lang["fee"]='Utility costs';
$lang["feereductiontitle"]='Reduction of utility cost';
$lang["initialcosttitle"]='Initial investment amount';
$lang["loadperyear"]='Annual burden amount';
$lang["primaryenergy"]='Primary energy consumption';
$lang["ohter"]='Other';



//----------for office -----------------------------------------------
$lang['office_title']='Easy energy saving diagnosis at business establishments';
$lang["officecall"]='Your company';
$lang["officecount"]='Office';
$lang["totaloffice"]='Whole establishment';
$lang["officenow"]='Current status';
$lang["compareoffice"]='function(target) {return "On the same scale" + target};';


$lang['button_demand']='Demand';
