/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsHTsum
*/

DC = D6.consHTsum;

//initialize setting
DC.init = function() {
	this.title = "供暖";
	this.inputGuide = "如何使用整个房子的供暖";
	
};
DC.init();

//change Input data to local value 
DC.precalc = function() {
	this.clear();			//clear data

	//入力値の読み込み
	this.prefecture =this.input( "i021", 6 );		//city, prefecture
	this.heatArea = D6.area.getHeatingLevel(this.prefecture);

	this.person =this.input( "i001", 3 );			//person
	this.houseType =this.input( "i002", 2 );		//standalone / apartment CN
	this.houseSize =D6.consShow["TO"].houseSize;	//home size 

	this.priceHotWater = this.input( "i066" , 1 ) == 1 ? D6.area.averageCostEnergy.hotwater * this.houseSize / 100 : 0;

	this.heatSpace  =this.input( "i201", this.heatArea < 5 ? 0.8 : 0.2 );	//part of heating CN
	this.heatEquip =this.input( "i202", -1 );		//equipment for heating
	this.heatTime  =this.input( "i204", this.heatArea < 5 ? 24 : 4 );		//heat time CN
	this.heatTemp  =this.input( "i205", 21 );		//暖房設定温度
	this.priceEleSpring =this.input( "i0912", -1 );	//電気料金（春秋）
	this.priceEleWinter =this.input( "i0911", -1 );	//電気料金（冬）
	this.priceGasWinter =this.input( "i0921", -1 );	//ガス料金（冬）
	this.consKeros =this.input( "i064", -1 );		//灯油消費量

	this.performanceWindow =this.input( "i041", -1 );	//窓の断熱性能
	this.performanceWall =this.input( "i042", -1 );	//壁の断熱性能 グラスウール換算mm
	this.reformWindow =this.input( "i043", -1 );	//窓の断熱リフォーム
	this.reformfloor =this.input( "i044", -1 );		//天井・床の断熱リフォーム
};

DC.calc = function() {
	//熱量計算
	var heatKcal = this.calcHeatLoad();

	//月平均値への換算
	heatKcal *= D6.area.seasonMonth.winter / 12;
	this.endEnergy = heatKcal;

	//熱源の推計　記入がない場合にはガスか灯油
	if ( this.heatEquip <= 0 ) {
		if ( this.consKeros > 0 
			||D6.area.averageCostEnergy.kerosene > 10 
		) {
			//灯油が標準10元以上もしくは記入がある
			this.heatEquip = 4;
		} else if ( this.priceGasWinter < 0 
				|| this.priceGasWinter > 40 
		) {
			//ガス代が一定ある
			this.heatEquip = 3;
		} else {
			//電気しか使っていない
			this.heatEquip = 1;
		}
	}

	//電気でまかないきれない分の計算
	var elecOver = 0;
	var coef = ( this.heatEquip == 1 ? this.apf : 1 );
	if ( this.heatEquip == 1 || this.heatEquip == 2 ) {
		if ( this.priceEleWinter > 0  ) {
			var priceMaxCons = this.priceEleWinter * 0.7
					/ D6.Unit.price.electricity 
					* D6.Unit.seasonMonth.winter / 12;
			if ( heatKcal / coef /D6.Unit.calorie.electricity > priceMaxCons ) {
				//価格からの最大値を超えて電気が消費されている場合
				var elecOver = heatKcal - priceMaxCons * coef *D6.Unit.calorie.electricity;
				heatKcal -= elecOver;
			}
		}
	}

	//熱源の割り振り
	this.calcACkwh = heatKcal / this.apf /D6.Unit.calorie.electricity;

	if ( this.priceHotWater > 0 ) {
		//熱供給 CN
		this.mainSource = "hotwater";
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	} else if ( this.heatEquip == 1) {
		//エアコン
		//消費電力量　kWh/月
		this.mainSource = "electricity";
		this[this.mainSource] =  this.calcACkwh;

	} else {
		if ( this.heatEquip == 2 ) {
			//電熱暖房 CN
			//消費電力量　kWh/月
			this.mainSource = "electricity";
		} else if ( this.heatEquip == 3 ) {
			//ガス暖房
			//消費ガス量　m3/月
			this.mainSource = "gas";
		} else if ( this.heatEquip == 4 ) {
			//灯油暖房
			//消費灯油量　L/月
			this.mainSource = "kerosene";
		} else if ( this.heatEquip == 7 ) {
			//温水供給
			this.mainSource = "hotwater";
		} else if ( this.heatEquip == 8 ) {
			this.mainSource = "coal";	//CN
		} else {
			//温水供給
			this.mainSource = "hotwater";
		}
		this[this.mainSource] =  heatKcal /D6.Unit.calorie[this.mainSource];
	}
	//電気で賄えない分を割りふる
	if ( elecOver > 0 ) {
		//寒い地域なら灯油
		if (D6.Unit.areaHeating <= 4 && this.priceKeros > 0 ) {
			this.kerosene =  elecOver /D6.Unit.calorie.kerosene;
		} else {
			this.gas =  elecOver /D6.Unit.calorie.gas;
		}
	}
};

//対策計算
DC.calcMeasure = function() {
	//断熱
	if ( !this.isSelected( "mHTuchimadoAll" ) && !this.isSelected( "mHTloweAll" ) && this.houseType != 2){
		this.measures["mHTdoubleGlassAll"].calcReduceRate( this.reduceRateDouble );
	}
	if (  !this.isSelected( "mHTloweAll" ) ){
		this.measures["mHTuchimadoAll"].calcReduceRate( this.reduceRateUchimado );
	}
	if (  this.houseType != 2){
		this.measures["mHTloweAll"].calcReduceRate( this.reduceRateLowe );
	}
};



