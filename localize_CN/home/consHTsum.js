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

	this.prefecture =this.input( "i021", 6 );		//city, prefecture
	this.heatArea = D6.area.getHeatingLevel(this.prefecture);

	this.person =this.input( "i001", 3 );			//person
	this.houseType =this.input( "i002", 2 );		//standalone / apartment CN
	this.houseSize =D6.consShow["TO"].houseSize;	//home size 
	this.heatSpace  =this.input( "i201",
			this.heatArea <= 2 ? 0.6 :
			this.heatArea == 3 ? 0.25 : 0.2
		);											//heating area m2
		

	// original set
	this.heatTime  =this.input( "i204", 
			this.heatArea == 1 ? 24 :
			this.heatArea == 2 ? 10 :
			this.heatArea == 3 ? 6 : 6
		);											//heating time

	// original hotwater set
	this.priceHotWater = this.input( "i066" , 1 ) == 1 ? D6.area.averageCostEnergy.hotwater * this.houseSize / 100 : 0;

	this.heatSpace  =this.input( "i201", this.heatArea < 5 ? 0.8 : 0.2 );	//part of heating CN
	this.heatMonth  = this.input( "i206", D6.area.seasonMonth.winter );	//heating month

	//original set
	this.heatEquip =this.input( "i202", 
			this.heatArea <= 2 ? 6 : -1
		 );		//heating equipment

	this.heatTemp  =this.input( "i205", 21 );		//heating temperature setting
	this.priceEleSpring =this.input( "i0912", -1 );	//electricity charge in spring/fall
	this.priceEleWinter =this.input( "i0911", -1 );	//electricity charge in winter
	this.priceGasSpring =this.input( "i0922", -1 );	//gas charge in spring/fall
	this.priceGasWinter =this.input( "i0921", -1 );	//gas charge in winter
	this.consKeros =this.input( "i064", -1 );		//consumption of kerosene
	this.hotwaterEquipType = this.input( "i101", -1 );	//hot water temperature

	this.performanceWindow =this.input( "i041", -1 );	//performance of window
	this.performanceWall =this.input( "i042", -1 );	//performance of wall insulation
	this.reformWindow =this.input( "i043", -1 );	//reform to change window
	this.reformfloor =this.input( "i044", -1 );		//reform to change floor

};



