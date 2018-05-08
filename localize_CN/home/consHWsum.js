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
D6.consHWsum.precalc_org = D6.consHWsum.precalc;
D6.consHWsum.precalc = function() {
	D6.consHWsum.precalc_org();
	this.tabDayWeek = this.input( "i103",0);
	this.tabDayWeekSummer = this.input( "i104",0);
	this.equipType = this.input( "i101", 3 );
}

