/**
* Home-Eco Diagnosis for JavaScript
* 
* ConsTotal
*/

DC = D6.consTotal;		//temporaly set as DC

//initialize
DC.init = function() {
	//construction definition
	this.title = "整体";
	this.inputGuide = "有关地区和房子的基本信息";

};
DC.init();

//Documentからの変換
DC.paramSet = function() {
	this.person =this.input( "i001", 3 );			//世帯人数

	//solar
	this.solarSet =this.input( "i051", 0 );					//太陽光発電の設置　あり=1
	this.solarKw =this.input( "i052", this.solarSet * 3.5 );	//太陽光発電の設置容量(kW)
	this.solarYear =this.input( "i053", 0 );				//太陽光発電の設置年
	
	//electricity
	this.priceEle = this.input( "i061"
			,D6.area.averageCostEnergy.electricity );	//月電気代
	this.priceEleSpring = this.input( "i0912" ,-1 );
	this.priceEleSummer = this.input( "i0913" ,-1 );
	this.priceEleWinter = this.input( "i0911" ,-1 );

	this.priceEleSell =this.input( "i062", 0 );		//月売電
				
	//gas
	this.priceGas =this.input( "i063"
			,D6.area.averageCostEnergy.gas );			//月ガス代
	this.priceGasSpring =this.input( "i0932" ,-1 );
	this.priceGasSummer =this.input( "i0933" ,-1 );
	this.priceGasWinter =this.input( "i0931" ,-1 );

	this.houseType =this.input( "i002", 2 );			//戸建て集合
	this.houseSize =this.input( "i003", 
			( this.person == 1 ? 60 : (80 + this.person * 10) ) );
													//家の広さ

	this.heatEquip =this.input( "i202", -1 );			//主な暖房機器

	//coal
	this.priceCoal = this.input( "i065" ,D6.area.averageCostEnergy.coal );
	this.priceCoalSpring =this.input( "i0942" ,-1 );
	this.priceCoalSummer =this.input( "i0943" ,-1 );
	this.priceCoalWinter =this.input( "i0941" ,-1 );

	this.priceHotWater = this.input( "i066" , 1 ) == 1 ? D6.area.averageCostEnergy.hotwater * this.houseSize / 100 : 0;

	if( this.priceKerosWinter == -1 ) {
		if (D6.area.averageCostEnergy.kerosene < 1000 ) {
			this.priceKeros =this.input( "i064", 0 );		//冬の月灯油代0（円)
		} else {
			this.priceKeros =this.input( "i064"
				,D6.area.averageCostEnergy.kerosene 
				/ D6.area.seasonMonth.winter * 12 );	//月灯油代標準値（円)　入力は冬
		}
	}

	this.priceCar =this.input( "i075"
			,D6.area.averageCostEnergy.car );			//月車燃料代
	this.equipHWType = this.input( "i101", 1 );			//給湯器の種類

	this.generateEleUnit = D6.area.unitPVElectricity;	//地域別の値を読み込む
		
	//灯油・ガスが無記入の場合は、平均値としてガスに灯油分を加えておく
	if (D6.area.averageCostEnergy.kerosene < 1000 ) {
		if (this.input( "i063", -1 ) < 0 			//ガスの記入がない
			&&this.input( "i0931", -1 ) < 0 
			&&this.input( "i0932", -1 ) < 0 
			&&this.input( "i0933", -1 ) < 0 
		) {
			//灯油分のエネルギーをガスに追加
			this.keros2gas =D6.area.averageCostEnergy.kerosene
					/D6.Unit.price.kerosene
					*D6.Unit.calorie.kerosene
					/D6.Unit.calorie.gas
					*D6.Unit.price.gas;
			this.priceGasSpring += this.keros2gas;
			this.priceGasWinter += this.keros2gas;				
		}
	}

	//季節別の光熱費の入力のパターン（初期値　-1:無記入）
	this.seasonPrice =  {
			electricity :	[ this.priceEleWinter, this.priceEleSpring, this.priceEleSummer ],		//電気
			gas :			[ this.priceGasWinter, this.priceGasSpring, this.priceGasSummer ],		//ガス
			kerosene:		[ this.priceKeros, this.priceKerosSpring,this.priceKerosSummer ], 		//灯油
			coal :			[ -1, -1,-1 ], 
			hotwater :		[ -1, -1,-1 ],
			car :			[ -1, -1,-1 ] 		//ガソリン
	};

	//毎月の消費量の入力のパターン（初期値　-1：無記入）
	this.monthlyPrice = {
			electricity :	[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			gas :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			kerosene :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			coal :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			hotwater :		[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ],
			car :			[ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ] 
	};
};


//消費量の計算
DC.calc = function( ){

	this.clear();			//結果の消去
	var ret;					//return values

	//入力値の読み込み
	this.paramSet();

	//季節係数の読込（全エネルギー）
	var seasonConsPattern = D6.area.getSeasonParamCommon();

	//電気の推計
	ret = D6.calcMonthly( this.priceEle, this.seasonPrice["electricity"], this.monthlyPrice["electricity"], seasonConsPattern.electricity, "electricity" );
	this.priceEle = ret.ave;
	this.seasonPrice["electricity"] = ret.season;
	this.monthlyPrice["electricity"] = ret.monthly;
		//光熱費の記入がないときには、分野の単純積み上げとする
	this.noConsData = ret.noConsData 
					&& ( this.input( "i061", -1) == -1 );
					//&& !D6.averageMode;
		
	//depend on hot water equipment
	if ( this.equipHWType == 5 ) {
		this.averagePriceElec = this.ratioNightHWElec *D6.Unit.price.nightelectricity 
						+ ( 1 - this.ratioNightHWElec ) *D6.Unit.price.electricity;
		this.allDenka = true;
		
	} else if (this.equipHWType == 6 ) {
		this.averagePriceElec = this.ratioNightEcocute *D6.Unit.price.nightelectricity 
						+ ( 1 - this.ratioNightEcocute ) *D6.Unit.price.electricity;
		this.allDenka = true;
		
	} else {
		this.averagePriceElec =D6.Unit.price.electricity;
		this.allDenka = false;
	}

	//base price
	var priceBase;
	if ( this.allDenka ) {
		priceBase = D6.Unit.price.nightelectricity;
	} else {
		priceBase = 0;
	}

	//solar generation
	var generateEle = this.generateEleUnit * this.solarKw / 12;
	
	//solar sell price 
	var pvSellUnitPrice = D6.Unit.price.sellelectricity;

	//PV installed
	if ( this.solarKw > 0 ) {
		// gross = electricity consumed in home include self consumption amount
		this.grossElectricity = ( 1 - this.solarSaleRatio ) * generateEle 
					+ Math.max(0, ( this.priceEle 
												-  this.priceEleSell
												+ this.solarSaleRatio * generateEle * pvSellUnitPrice 
												- priceBase ) 
											) / this.averagePriceElec;
		this.electricity = this.grossElectricity - generateEle;
	} else {
		//not installed
		this.electricity = ( this.priceEle - priceBase ) / this.averagePriceElec;
		this.grossElectricity = this.electricity;
	}

	//gas
	ret = D6.calcMonthly( this.priceGas, this.seasonPrice["gas"], this.monthlyPrice["gas"], seasonConsPattern.gas, "gas" );
	this.priceGas = ret.ave;
	this.seasonPrice["gas"] = ret.season;
	this.monthlyPrice["gas"] = ret.monthly;

	this.gas = ( this.priceGas -D6.Unit.priceBase.gas ) 
											/D6.Unit.price.gas;

	//coal
	ret = D6.calcMonthly( this.priceCoal, this.seasonPrice["coal"], this.monthlyPrice["coal"], seasonConsPattern.coal, "coal" );
	this.priceCoal = ret.ave;
	this.seasonPrice["coal"] = ret.season;
	this.monthlyPrice["coal"] = ret.monthly;
	
	this.coal = this.priceCoal / D6.Unit.price.coal;

	//hotwater
	ret = D6.calcMonthly( this.priceHotWater, this.seasonPrice["hotwater"], this.monthlyPrice["hotwater"], seasonConsPattern.hotwater, "hotwater" );
	this.priceHotWater = ret.ave;
	this.hotwater = this.priceHotWater / D6.Unit.price.hotwater;
	this.seasonPrice["hotwater"] = ret.season;
	this.monthlyPrice["hotwater"] = ret.monthly;

	//gasoline
	ret = D6.calcMonthly( this.priceCar, this.seasonPrice["car"], this.monthlyPrice["car"], seasonConsPattern.car, "car" );
	this.priceCar = ret.ave;
	this.seasonPrice["car"] = ret.season;
	this.monthlyPrice["car"] = ret.monthly;

	this.car = this.priceCar / D6.Unit.price.car;
	
};


//対策計算
DC.calcMeasure = function( ) {
	var mes;

	var solar_reduceVisualize = this.reduceHEMSRatio;		//モニターによる消費電力削減率
	var solar_sellPrice = 1;				//売電単価

	//mTOsolar-----------------------------------------
	mes = this.measures[ "mTOsolar" ];		//set mes
	mes.copy( this );
	
	// not installed and ( stand alone or desired )
	if ( this.solarKw == 0 
		&& ( this.houseType != 2 || this.replace_solar ) 
	) {
		// monthly generate electricity
		var solar_generate_kWh = this.generateEleUnit * this.standardSize / 12;

		// saving by generation
		var solar_priceDown = solar_generate_kWh * this.solarSaleRatio * solar_sellPrice 
						+ solar_generate_kWh * ( 1 - this.solarSaleRatio ) *D6.Unit.price.electricity;

		// saving by visualize display
		var solar_priceVisualize = this.electricity * solar_reduceVisualize
							*D6.Unit.price.electricity;
		
		//electricity and cost
		mes.electricity = this.electricity * ( 1 - solar_reduceVisualize ) - solar_generate_kWh;
		mes.costUnique = this.cost - solar_priceDown - solar_priceVisualize;	
		
		//initial cost 
		mes.priceNew = this.standardSize * mes.priceOrg;	
		//comment add to original definition
		mes.advice = D6.scenario.defMeasures['mTOsolar']['advice'] 
			+ "<br>　标准" + this.standardSize + "kW的是该类型的计算结果。";
	}

	//mTOhems HEMS-----------------------------------------
	mes = this.measures[ "mTOhems" ];		//set mes
	mes.copy( this );
	
	//pv system is not installed  --- pv system includes visualize display
	if ( !this.isSelected( "mTOsolar" ) ) {
		mes.electricity = this.electricity * ( 1 - this.reduceHEMSRatio );
	}
	
	//mTOsolarSmall ベランダ太陽光------------------------------------------
	mes = this.measures[ "mTOsolarSmall" ];		//set mes
	mes.copy( this );
	var watt_panel = 50;			// install panel size (W)
	var eff = 0.3;						// effectiveness to roof 
	mes.electricity -= watt_panel / 1000 * eff * this.generateEleUnit / 12 ;

};

