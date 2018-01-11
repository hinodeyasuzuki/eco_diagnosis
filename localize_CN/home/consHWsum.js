/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsHWsum
*/

DC = D6.consHWsum;		// short cut

//initialize-------------------------------
DC.init = function() {
	this.title = "热水器";				//consumption title for person
	this.inputGuide = "如何使用热水供应一般";		//guidance in question
	
};
DC.init();	// initialize when this class is loaded


//change Input data to local value 
DC.paramSet = function() {
	// use answers for calclation
	this.person =this.input( "i001", 3 );				//世帯人数
	this.housetype =this.input( "i002", 2 );			//戸建て集合 CN
	this.tabDayWeek =this.input( "i103", 0 );			//浴槽にためる日数 CN
	this.tabDayWeekSummer =this.input( "i104", 0 );		//浴槽にためる日数夏 CN
	this.showerMinutes =this.input( "i105"
			, this.showerWaterMinutes * this.person );	//シャワー時間（分）
	this.showerMinutesSummer =this.input( "i106"
			, this.showerWaterMinutes * this.person );	//シャワー時間（分）夏
	this.savingShower =this.input( "i116", -1 );		//節水シャワーヘッド
	this.tabKeepHeatingTime =this.input( "i108"
			, (this.person > 1 ? 3 : 0 ) );				//保温時間
	this.keepMethod =this.input( "i110", 5 );			//追い焚きの方法（割）
	this.tabInsulation =this.input( "i117", -1 );		//断熱
	this.tabHeight =this.input( "i107", 8 );			//お湯張りの高さ（割）
	
	this.equipType = this.input( "i101", -1 );			//給湯器の種類
	this.priceGas = D6.consShow["TO"].priceGas;			//月ガス代
	this.priceKeros = D6.consShow["TO"].priceKeros;		//冬の月灯油代

	this.dresserMonth = this.input( "i114", 4 );		//洗面でのお湯を使う期間（月）
	this.dishWashMonth = this.input( "i115", 4 );		//食器洗いでのお湯を使う期間（月）　99は食洗機
	this.dishWashWater = this.input( "i113", 3 );		//食器洗いで水を使うようにしているか 1いつも、4していない
	this.cookingFreq = this.input( "i802", 6 );			//調理の頻度（割）
	
	this.keepSeason =this.input( "i131", 4 );			//トイレ保温をしているか 1:通年、4していない CN
};

