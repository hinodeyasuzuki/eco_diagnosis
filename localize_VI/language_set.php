<?php // set to Language/*.php ========================
// 
// 
// 
//----------system title-----------------------------------------------
$lang["code"]='vi';
$lang['home_title']='Tiết kiệm năng lượng chẩn đoán của nhà';
$lang['home_joy_title']='Tiết kiệm năng lượng chẩn đoán của nhà (phiên bản vô tư)';

$lang['countfix_pre_after']='2';

//--energy -----------------
$lang["show_electricity"]=True;
$lang["show_gas"]=True;
$lang["show_kerosene"]=True;
$lang["show_briquet"]=False;
$lang["show_area"]=False;
$lang["show_gasoline"]=True;

$lang["electricitytitle"]='điện';
$lang["gastitle"]='khí';
$lang["kerosenetitle"]='dầu lửa';
$lang["briquettitle"]='bánh';
$lang["areatitle"]='heat huyện';
$lang["gasolinetitle"]='xăng';
$lang["electricityunit"]='kWh';
$lang["gasunit"]='m3';
$lang["keroseneunit"]='L';
$lang["briquetunit"]='kg';
$lang["areaunit"]='MJ';
$lang["gasolineunit"]='L';

//--common unit-----------------
$lang['point_disp']='function(num) {return num + "điểm"};';

$lang["priceunit"]='vòng tròn';
$lang['co2unit']='kg';
$lang['energyunit']='GJ';
$lang['monthunit']='tháng';
$lang['yearunit']='năm';







//--common page-----------------
$lang["startPageName"]='Toàn bộ (đơn giản)';
$lang['header_attension']='(Không có bảo đảm giá trị bằng số đề xuất cho mô hình hoạt động. Bạn có thể được phát triển phù hợp với nhu cầu.)';
$lang["dataClear"]='Tất cả các dữ liệu đầu vào để xóa. Bạn có chắc chắn bạn muốn.';
$lang["savetobrowser"]='Nó đã được lưu trong trình duyệt.';
$lang["savedataisshown"]='giá trị duy trì là như sau.';

//--question page-----------------
$lang["QuestionNumber"]='function(numques, nowques) {return "(" + Numques + "trong câu hỏi" + nowques + "thứ câu hỏi)"};';


//--compare-----------------
$lang["youcall"]='bạn';
$lang["youcount"]='hộ gia đình';
$lang["totalhome"]='Toàn bộ gia đình';
$lang["comparehome"]='function(muc) {return "Trong cùng kích thước hộ gia đình" + muc + "nhà"};';


$lang["rankin100"]='function(count) {return "100" + count + "trung cấp"};';


$lang["rankcall"]='nơi';
$lang["co2ratio"]='function(T) {return "Lượng khí thải CO2, tỷ lệ trung bình" + T + "The bội."};';


$lang["co2compare06"]='Nó thấp hơn đáng kể so với mức trung bình. Đó là một cuộc sống rất tốt đẹp.';
$lang["co2compare08"]='Nó là khá ít so với trung bình. Đẹp sống.';
$lang["co2compare10"]='Đó là mức độ giống như bình thường.';
$lang["co2compare12"]='Đó là số tiền lớn hơn một chút so với mức trung bình. Phòng cho các chi phí tiện ích bị giảm bởi sự cải thiện là kích cỡ có khả năng.';
$lang["co2compare14"]='Một số lượng lớn hơn so với mức trung bình. Phòng cho các chi phí tiện ích bị giảm bởi sự cải thiện là kích cỡ có khả năng.';
$lang["rankcomment"]='function(cùng, youcount, c) {return "Nếu có được, nhiều hơn từ ít" + cùng + "là 100" + youcount + c + youcount + "là thứ. <br>"};';





//itemize-----------
$lang["itemize"]='Breakdown';
$lang["itemname"]='đồng ruộng';
$lang["percent"]='Tỷ lệ (%)';
$lang["measure"]='Biện pháp đối phó';
$lang["merit"]='Ưu đãi';
$lang["select"]='sự lựa chọn';
$lang["itemizecomment"]='function(main3, sum) {return main3 + "một tỷ lệ lớn, trong này ba lĩnh vực" + sum + "chiếm%. Để bảo vệ chống lại khu vực rộng lớn như vậy có hiệu quả."};';



//--result-----------------
$lang["effectivemeasures"]='biện pháp hữu hiệu';
$lang["comment_combined_reduce"]='function(percent,fee,co2) {return "　You can reduce  " + percent+"%, " + ( hidePrice != 1  ? fee +"yen of energy cost and ":"") + co2+"kg of CO2 emittion annualy.  If you are already working on it, this means that you are doing an eco-life that will only produce these results."};';




$lang["titlemessage"]='function(title) {return title + "cách tiếp cận có hiệu quả."};';

$lang["co2reduction"]='function(co2) {return "Hàng năm" + co2 + "Bạn có thể làm giảm CO2 trong kg."};';


$lang["reducepercent"]='function(a,b) {return a+b};';



$lang["co2minus"]='Cuộc sống mà không phát ra khí CO2 có thể đạt được.';
$lang["error"]='※ là tương đối vì không có xâm nhập của chi tiết.';

$lang["feereduction"]='function(ph) {return "Đồng yên giao dịch nỗ lực này." + ph +"Năm về" };';


$lang["feenochange"]='Thay đổi trong hóa đơn tiện ích, vv không có.';

//result payback----------------------------
$lang["initialcost"]='function(a, b, c) {return a+","+b+","+c};';




$lang["payback"]='function(a, b, c) {return a+","+b+","+c};';




$lang["payback1month"]='Phải mất bản gốc để trong vòng một tháng.';
$lang["paybackmonth"]='function(tháng) {return "Giới thiệu" + tháng + "bạn mất bản gốc trong tháng."};';


$lang["paybackyear"]='function(năm) {return "Tôi lấy bản gốc trong năm nay." + năm + "Giới thiệu"};';


$lang["paybacknever"]='Cần lưu ý rằng, cho đến khi tuổi thọ của sản phẩm, bạn sẽ không thể để mất bản gốc trong tiện ích chi phí tiết kiệm.';
$lang["notinstallfee"]='function(phí) {return "Chi phí Utility là khoảng một năm" + phí + "yên sẽ rẻ hơn."};';



//monthly-----------
$lang["monthlytitle"]='chi phí tiện ích ước tính cho mỗi tháng';
$lang["month"]='tháng';
$lang["energy"]='năng lượng';


//----------buttons -----------------------------------------------
$lang['button_clear']='trong sáng';
$lang['button_savenew']='tập tin mới';
$lang['button_save']='lưu trữ';
$lang['button_open']='mở';
$lang['button_close']='gần';
$lang['button_showall']='hiển thị tất cả';
$lang["add"]='thêm vào';

$lang['button_menu']='thực đơn';
$lang['button_back_toppage']='Trở về trang đầu tiên';
$lang['button_back']='trả lại';
$lang['button_prev']='trước';
$lang['button_next']='Để tiếp theo';

$lang['button_top']='đỉnh';
$lang['button_input']='Mục hiện tại';
$lang['button_queslist']='Danh sách câu hỏi';
$lang['button_diagnosis']='màn hình chẩn đoán';
$lang['button_measures']='Các biện pháp nghiên cứu';
$lang['button_selectcategory']='bộ lĩnh vực thẩm định';
$lang['button_calcresult']='Kết quả tính toán';
$lang['button_about']='bình luận';
$lang['button_fullversion']='Đầy đủ chức năng';
$lang['clear_confirm']='chế độ List';

$lang['button_co2emission']='lượng khí thải CO2';
$lang['button_firstenergy']='lượng năng lượng sơ cấp';
$lang['button_energyfee']='chi phí tiện ích';


//---- 1 button mode -----------
$lang['home_button_intro1']='Và thiết bị năng lượng trong nhà của bạn, tùy thuộc vào việc sử dụng nó, và đề xuất một biện pháp tiết kiệm năng lượng hiệu quả. Có một câu hỏi của khoảng 20 câu hỏi về cách sử dụng năng lượng trong nhà. Vì nó là khá một câu hỏi để được trả lời chỉ trong, và nhận được câu trả lời, chúng tôi có thể đề nghị các biện pháp đó là trong nhà của bạn.';
$lang['home_button_intro2']='Để biết thông tin nhập vào, bạn chỉ có thể xem sử dụng thiết bị đầu cuối này, sẽ không được lưu trữ trên máy chủ.';
$lang['home_button_startdiagnosis']='chẩn đoán Bắt đầu';
$lang['home_button_about']='Về chẩn đoán này';
$lang['home_button_result']='Nhìn vào kết quả';
$lang['home_button_retry']='Re-câu trả lời';
$lang['home_button_average']='so sánh trung bình';
$lang['home_button_monthly']='thay đổi tháng';
$lang['home_button_measure']='biện pháp hữu hiệu';
$lang['home_button_resultmessage']='Tôi đã thực hiện một sự so sánh giữa mức trung bình trong đồ thị. Hiệu lực thi hành trong trường hợp chạy "các biện pháp hiệu quả" sẽ được hiển thị ở trung tâm của đồ thị.';
$lang['home_button_measuremessage']='Là một danh sách các biện pháp hữu hiệu. Nếu bạn đánh dấu vào "lựa chọn", hiệu quả sẽ được hiển thị trong một đồ thị.';
$lang['home_button_pagemessage']='Bạn có thể tái câu trả lời một cách chi tiết bằng cách xác định lĩnh vực này. Bạn có thể thêm một phòng và trang thiết bị trong "Add".';



//---------- 2 focus mode page -----------------------------------------------
$lang['home_focus_title_after']='chế độ List';

$lang['intro1']='Chào mừng bạn đến phần mềm chẩn đoán tiết kiệm năng lượng mới (D6). Bằng cách nhập sử dụng hiện nay năng lượng, nó có thể được đề xuất để tính toán các biện pháp tiết kiệm năng lượng hiệu quả.';
$lang['intro2']='Trong phạm vi hiểu, hãy chọn cách sử dụng hiện nay năng lượng. Nó không quan trọng xấp xỉ thậm chí, xin vui lòng bỏ qua những câu hỏi mà không biết.';
$lang['intro3']='Phân tích các kết quả tương ứng với đầu vào sẽ được hiển thị bất cứ lúc nào.';
$lang['intro4']='Người ta ước tính các kết quả phân tích bằng cách sử dụng các khí thải CO2. Bên trái là tình hình hiện tại của bạn. Ngay như một sự so sánh, nó cho thấy cùng một nhà (kinh doanh). Các trung tâm được chỉ định để giảm kết quả khi bạn chọn các biện pháp.';
$lang['intro5']='Đây là hóa đơn tiện ích của tháng trong đồ thị.';
$lang['intro6']='các biện pháp tiết kiệm năng lượng hiệu quả sẽ được hiển thị bất cứ lúc nào. Khi bạn click vào tiêu đề, nó sẽ là một cách chi tiết mô tả. Ưu đãi ★ là những biện pháp mà ngay cả nếu có một chi phí mua mất bản gốc. Khi bạn chọn bằng cách nhấp vào cột bên phải, kết quả trong trường hợp các biện pháp, sẽ được phản ánh ở trung tâm của đồ thị.';
$lang['intro7']='Bạn có thể lưu trữ các thông tin đầu vào cho trình duyệt.';
$lang['intro8']='Màn hình này là câu hỏi duy nhất mà bị hạn chế về trình tự của 20 mặt hàng, nhưng bạn tốt hơn có thể chẩn đoán. Hãy bắt đầu với việc chẩn đoán ngay lập tức nhấn nút [Done] trong.';

//---------- 3 easy mode page -----------------------------------------------
$lang['home_easy_title']='Dễ dàng Eco kiểm tra cho một cuộc sống thoải mái';
$lang['home_easy_step1']='câu hỏi';
$lang['home_easy_step2']='sự so sánh';
$lang['home_easy_step3']='đặc trưng';
$lang['home_easy_step4']='Biện pháp đối phó';
$lang['home_easy_toptitle']='Tại sao chúng ta không làm giảm giá trị của hóa đơn tiện ích của ngôi nhà';
$lang['home_easy_top1']='Tại Nhật Bản nó đã được hiểu lầm là "tiết kiệm năng lượng". Không có nghĩa là "để đưa lên" điều, nó được thiết kế để làm giàu cho cuộc sống hơn. chi phí tiện ích cũng trở nên rẻ hơn, cuộc sống trở nên thoải mái, vì vậy nó cũng sẽ cho các em trong tương lai.';
$lang['home_easy_top2']='Một câu hỏi đơn giản, cho thấy các biện pháp đã được trong cuộc sống của bạn. Hãy cố gắng sinh thái séc lon trong 3 phút.';
$lang['home_easy_top3sm']='※ là hoàn toàn miễn phí. Chẳng hạn như tên và địa chỉ e-mail, nhập thông tin để nhận dạng bạn, bạn không cần. phần mềm chẩn đoán này, để thực hiện logic tính toán riêng của mình tải về thiết bị đầu cuối, nó không gửi giá trị đầu vào cho các thiết bị đầu cuối không sử dụng. Trang này sử dụng Google Anarlitics để nắm bắt tình hình sử dụng.';
$lang['home_easy_top_button_start']='chẩn đoán Bắt đầu';
$lang['home_easy_top_button_about']='bình luận';

$lang['home_easy_p5title']='Hãy trả lời câu hỏi này';
$lang['home_easy_p5_1']='Vui lòng chọn các tùy chọn khác nhau xấp đúng. Nếu bạn không biết, bạn không cần phải trả lời.';
$lang['home_easy_p5_button_next']='Nhìn vào kết quả';

$lang['home_easy_p2title']='So với các hộ gia đình trung bình';
$lang['home_easy_p2_button_next']='Nó sẽ tiết lộ một sự nghiệp lớn';

$lang['home_easy_p3title']='Đặc điểm của cuộc sống của bạn';
$lang['home_easy_p3_1']='Nó là kết quả của CO2 được phân tích những gì đã đi ra từ đâu. Còn lại bạn, chương trình đúng các giá trị tiêu chuẩn của điều kiện nhà cũng tương tự như của bạn.';
$lang['home_easy_p3_button_next']='Các biện pháp khuyến khích ở đây.';
$lang['home_easy_p4title_pre']=
$lang['home_easy_p4title_after']='Một trong những biện pháp khuyến khích';
$lang['home_easy_p4_button_next']='Các biện pháp của hầu hết các đề nghị';
$lang['home_easy_p4_1']='Phù hợp với ngôi nhà của bạn, đó là các biện pháp tiết kiệm năng lượng được khuyến cáo. Khi bạn click vào tiêu đề, nó sẽ là một cách chi tiết mô tả. Ưu đãi ★ dấu là biện pháp mà ngay cả nếu có một chi phí mua mất bản gốc.';
$lang['home_easy_p4_2']='Đây là một ước tính sơ bộ. Trong chẩn đoán chi tiết, nó cũng có thể là một đề nghị nữa mà là ở bạn.';
$lang['home_easy_p4_button_next2']='Hơn chẩn đoán có thể từ đây.';
$lang['home_easy_p4_button_next3']='Nếu bạn đang nghĩ đến mua một đồ gia dụng mới';
$lang['home_easy_measure_show']= 'function(num) {return num + "th trưng bày Đề xuất"};';


//--5 maintenance page-----------------
$lang['home_maintenance_message']='Biện pháp được lựa chọn của bạn như sau. Bạn đã giải quyết?';
$lang['home_maintenance_list']='Các biện pháp được lựa chọn';
$lang['home_maintenance_selected']='Chọn biện pháp đối phó này';

//-- 6 action page-----------------
$lang['home_action_title']='Dễ dàng kiểm tra Eco cho cuộc sống carbon thấp';
$lang['home_action_step1']='câu hỏi';
$lang['home_action_step2']='đánh giá';
$lang['home_action_step3']='Biện pháp đối phó';
$lang['home_action_toptitle']='Mục tiêu carbon thấp dùng nhà';
$lang['home_action_top1']='Nó có thể giúp giảm';
$lang['home_action_top2']='Một cách đơn giản';
$lang['home_action_axis1']='phát triển bền vững';
$lang['home_action_axis2']='thiết bị tiết kiệm năng lượng';
$lang['home_action_axis3']='Tiết kiệm năng lượng hành vi';
$lang['home_action_label1']='Tuyệt vời!';
$lang['home_action_label2']='Vâng Vâng tốt';
$lang['home_action_label3']='Một chút thất vọng';
$lang['home_action_good_point']='điều tốt đẹp';
$lang['home_action_bad_point']='Cải tiến';

//--99 list page-----------------
$lang['home_list_message']='Bạn biện pháp lựa chọn cẩn thận là bạn từ này';

//--createpage-----------------

$lang["younow"]='bạnTình trạng hiện';
$lang["youafter"]='sau khi các biện pháp';
$lang["average"]='mức trung bình';
$lang["compare"]='sự so sánh';
$lang["comparetoaverage"]='mức trung bìnhsự so sánh';
$lang["co2emission"]='lượng khí thải CO2';
$lang["co2reductiontitle"]='tác dụng giảm CO2';
$lang["fee"]='chi phí tiện ích';
$lang["feereductiontitle"]='Tiện ích chi phí giảm';
$lang["initialcosttitle"]='đầu tư ban đầu';
$lang["loadperyear"]='gánh nặng hàng năm';
$lang["primaryenergy"]='tiêu thụ năng lượng sơ cấp';
$lang["other"]='nếu không thì';



//----------for office -----------------------------------------------
$lang['office_title']='Văn phòng chẩn đoán tiết kiệm năng lượng đơn giản';
$lang["officecall"]='công ty của bạn';
$lang["officecount"]='văn phòng';
$lang["totaloffice"]='Toàn bộ văn phòng';
$lang["officenow"]='văn phòngTình trạng hiện';
$lang["compareoffice"]='function(muc) {return "Trong cùng một tỷ lệ" +muc};';


$lang['button_demand']='nhu cầu';

//----------7 lifegame -----------------------------------------------
$lang['home_lifegame_title']='CO2 tồn zero kỷ nguyên';
$lang['home_lifegame_toptitle']='Thu nhập hàng tháng của bạn tăng lên 10.000 yên!';
$lang['home_lifegame_top1']='Cho dù nền kinh tế đang trở nên tốt hơn, nhưng tôi không biết những gì là công việc của bạn đã được công nhận, doanh thu đã tăng 10.000 yen một tháng. Xin chúc mừng. Gì? Nó không phải là một trán lớn? Vâng nó là tốt ngay cả khi không quá khiêm tốn.';
$lang['home_lifegame_top2']='Những gì để sử dụng nó, nhưng bạn miễn phí, nhưng nếu bạn tiêu thụ quá nhiều tự do, nó đã trở nên rõ ràng rằng loài người không thể tồn tại trên hành tinh này. Khí hậu là một sự thay đổi (nóng lên toàn cầu) vấn đề. Trong thế kỷ 21 có thể không có khả năng sử dụng dầu mỏ và than đá, nó đã được thoả thuận trên thế giới. Vì vậy, sử dụng 10.000 yen điều này mỗi tháng, xin vui lòng để không phát thải CO2 của cuộc sống của bạn.';
$lang['home_lifegame_top3']='Cám ơn. Nó không quan trọng bị đe dọa trong nhiều năm, nhưng khi sống let của zero. Tuy nhiên tiền để trả thêm là 10.000 yen mỗi tháng.';
$lang['home_lifegame_top3b']='Bằng cách bạn đang có, có lẽ, <br> <ul> <li> cử nhân 25 tuổi, căn hộ Gurashi </ li> <li> tiện ích chi phí Nhật Bản trung bình </ li> </ ul> Bạn có đã được một cuộc sống ?';
$lang['home_lifegame_toptitle4']='Vui lòng chọn các sáng kiến';
$lang['home_lifegame_top4']='Kể từ khi đầu tiên của ngân sách vẫn có sẵn chỉ có 10.000 yen. Đó là giải quyết trong vòng chưa đầy 10.000 yên, đó là để không mất nhiều nỗ lực tiền có cái gì đó như thế này. Tuy nhiên, chỉ có bạn không thể chọn lên đến 3 mục có một lựa chọn duy nhất. Được lựa chọn nhiều hơn, con người sẽ quên.';
$lang['home_lifegame_toptitle5']='Cảm ơn bạn đã nỗ lực';
$lang['home_lifegame_top5']='○○, nó được thực hiện ○○ nỗ lực. Vì lý do này ○ yên số tiền được sử dụng, và phần còn lại bây giờ là ○ triệu.';
$lang['home_lifegame_toptitle6']='Hiệu lực thi hành đã xuất hiện';
$lang['home_lifegame_top6']='Nhưng, mỗi tháng ○ yên hiện nay rẻ hơn bổ sung bởi các sáng kiến. Nếu so với các trường hợp đó đã không làm bất cứ điều gì, trong một xếp chồng lên nhau cho đến nay, đã trở thành rẻ hơn ○ yen mỗi tháng. lượng khí thải CO2, đã trở thành từ trạng thái ban đầu để giảm ○%.';
$lang['home_lifegame_top6b']='Một năm trôi qua, những phút mà doanh thu được nâng lên, 120.000 yen sẽ được sử dụng ngoài. Bên cạnh đó, việc giảm chi phí tiện ích của một năm, bạn có thể sử dụng ○ triệu. Tiền để chi tiêu đã tăng lên đến ○ yên từ ○ triệu.';
$lang['home_lifegame_toptitle7']='Bây giờ nỗ lực thời gian';
$lang['home_lifegame_top7']='Hiện nay, ngân sách có sẵn nằm yên ○ 250.000. Để giải quyết vấn đề trong phạm vi số tiền này, nó là để không mất nhiều nỗ lực tiền có cái gì đó như thế này. Vui lòng chọn mục để được giải quyết.';
$lang['home_lifegame_toptitle90']='Vui lòng chọn thiết lập của bạn';
$lang['home_lifegame_top90']='Nếu bạn chọn hiện tại của cuộc sống, các mô phỏng sẽ bắt đầu thực sự đi đến CO2 bằng không từ hiện tại.';
$lang['home_lifegame_toptitle99']='Nó đã chết. Đó là cổ vũ cho công việc tốt.';
$lang['home_lifegame_top99']='Con người không thể ngăn chặn sự tiến triển của sự nóng lên toàn cầu, nó đã được lặp đi lặp lại rằng thành phố đang bị tàn phá bởi một cơn bão khổng lồ. Và là tình trạng thiếu nước nghiêm trọng tại thủ đô sản xuất lương thực của thế giới, thức ăn không đủ trên thế giới, chiến tranh so với thực phẩm đã xảy ra ở nhiều nơi. May mắn thay, bạn đang có, mà không cần phải nhìn thấy anh ấy buồn em ít đau khổ, tôi đã có thể an toàn đi đến một thế giới khác. Tôi hạnh phúc cho bạn';


$lang['button_end']='Thoát';
$lang['button_agree']='Để thiết lập';
$lang['button_commit']='chạy';
$lang['home_lifegame_button_sel99']='Tôi xin lỗi, tôi sẽ làm.';
$lang['home_lifegame_button_sel3a']='Sự khác biệt bạn';
$lang['home_lifegame_button_sel3b']='Vâng, đó là tốt.';

//----------8 uchieco web -----------------------------------------------
$lang['home_uchieco_title']='Của Eco chẩn đoán WEB';



