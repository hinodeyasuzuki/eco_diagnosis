/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * disp.js 
 * 
 * display data create main Class
 * 		combined with disp_input.js, disp_demand.js, disp_measue.js
 * 
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * showResultTable()		get collective result
 *
 * dataAverage()			get average value
 * getAverageTable()		get average table data set
 *
 * getItemizeTable()		itemize
 * getItemizeGraph()
 * dataItemize()			get itemized value
 * 
 * getMonthlyGraph()		monthly graph data
 * 
 */

 //resolve D6
var D6 = D6||{};

D6.disp = 
{
	//result total values
	//	param
	//		consName : ex. "consTotal"
	//  return
	//		graphItemize,graphMonthly,average,cons,measure
	showResultTable : function(consName){
		var ret = [];
		if ( consName ) {
			if ( !D6.logicList[consName] ) consName = "consTotal";
			this.nowConsPageName = consName;
		}
		consName = this.nowConsPageName;
		
		//get consCode
		var consCode = D6.consListByName[consName][0].consCode;

		//create collective result
		ret.graphItemize = this.getItemizeGraph(consCode);
		ret.common = D6.getCommonParameters();
		
		ret.graphMonthly = this.getMonthlyGraph();		
		ret.average = this.getAverageTable(consCode);
		ret.averageData = this.dataAverage();
		ret.cons = this.getItemizeTable(consCode);
		ret.measure = this.getMeasureTable(consName);

		return ret;
	},
	
	
	//compare to average value 
	// params
	//		consCode : consumption category
	// return
	//		you and average params
	getAverageTable  : function ( consCode ){
		var ret = [];
		ret.you = D6.consShow[consCode].co2Original*12;		//yearly co2 emission
		ret.after = D6.consShow[consCode].co2*12;			//yearly co2 after set measures
		ret.av = D6.average.consList[consCode].co2*12;		//yearly average co2
		ret.youc = D6.consShow[consCode].costOriginal*12;	//yearly cost
		ret.afterc = D6.consShow[consCode].cost*12;			//yearly cost after set measures
		ret.avc = D6.average.consList[consCode].cost*12;	//yearly average cost
		ret.rank100 = D6.rankIn100( ret.you/ret.av);		//rank( 1-100 )
		ret.afterrank100 = D6.rankIn100( ret.after/ret.av);	//rank after set measures( 1-100 )
		ret.samehome = D6.scenario.defSelectValue["sel021"][Math.max(1,D6.doc.data["i021"])];
			//same home's name
		ret.sameoffice = D6.scenario.defSelectValue["sel001"][Math.max(1,D6.doc.data["i001"])];
			//same office's name
		ret.consCode = consCode;
		return ret;
		
	},
	
	//average compare result 
	dataAverage : function()
	{		
		var ret = [];
		ret.cost = [];
		ret.co2 = [];
		ret.cost[1] = D6.area.averageCostEnergy;
		ret.co2[1] = D6.area.averageCO2Energy;
		ret.co2[1].total = ret.co2[1].electricity + ret.co2[1].gas + ret.co2[1].kerosene + ret.co2[1].car;
		
		ret.cost[0] = [];
		ret.cost[0].electricity = D6.consTotal.priceEle;
		ret.cost[0].gas = D6.consTotal.priceGas;
		ret.cost[0].kerosene = D6.consTotal.priceKeros;
		ret.cost[0].car = D6.consTotal.car * D6.Unit.price.gasoline;

		ret.co2[0] = [];
		ret.co2[0].electricity = D6.consTotal.electricity * D6.Unit.co2.electricity;
		ret.co2[0].gas = D6.consTotal.gas * D6.Unit.co2.gas;
		ret.co2[0].kerosene = D6.consTotal.kerosene * D6.Unit.co2.kerosene;
		ret.co2[0].car = D6.consTotal.car * D6.Unit.co2.gasoline;
		ret.co2[0].total = D6.consTotal.co2Original;
		return ret;
	},

	//itemized value
	// parameter
	// 		consCode : consumption category
	// result
	//		ret[nowConsCode] : itemized data for table( all items )
	//
	getItemizeTable  : function (consCode){
		var ret = [];
		var cons;
		var i = 0;

		for ( var cid in D6.consList ) {
			cons = D6.consList[cid];
			ret[i] = [];

			//name
			ret[i].title = cons.title;
			ret[i].consName = cons.consName;
			ret[i].subID = cons.subID;
			ret[i].sumConsName = cons.sumConsName;
			ret[i].sumCons2Name = cons.sumCons2Name;
			ret[i].countCall = cons.countCall;

			//co2
			ret[i].co2 = cons.co2;
			ret[i].co2Total = D6.consShow["TO"].co2;

			//each energy 
			ret[i].electricity = cons.electricity;
			ret[i].nightelectricity = cons.nightelectricity;
			ret[i].gas = cons.gas;
			ret[i].water = cons.water;
			ret[i].coal = cons.coal;
			ret[i].hotwater = cons.hotwater;
			ret[i].kerosene = cons.kerosene;
			ret[i].car = cons.car;
			ret[i].color = cons.color;
			i++;
		}
		return ret;
	},

	
	//itemize graph data set
	// parameters
	//		consCode: consumption code
	//		sort:sort target (co2,energy,money)
	// result
	//		itemized co2 graph data
	getItemizeGraph  : function ( consCode, sort ){
		var otherCaption = "other";

		if ( consCode ) {
			this.nowConsCode = consCode;
		}
		consCode = this.nowConsCode;
		if ( sort ) {
			this.nowSortTarget = sort;
		}
		sort = this.nowSortTarget;
		
		//graph data
		var menu = {
			co2: {sort:"co2", title:"kg", round:1, divide:1},
			energy: {sort:"jules", title:"GJ", round:1, divide:1000},
			money: {sort:"cost", title:"yen", round:10,divide:1},	// same code to view
		};
		var show = menu[(sort ? sort : "co2")];

		var ret = [];

		//in function getItemizeGraph( return one target of graph data )
		// params
		//		target:   co2/jules/cost
		//		scenario:  
		//		original: "original" or "" 
		//		consCode: 2 charactors
		// result
		//		ret[]	
		var gdata = function( target, scenario, original, consCode ){
			var sorttarget = show.sort;
			if( original ) sorttarget += "Original";
			var sum = 0;
			var data = [];
			var di = 0;
			if ( consCode =="TO") {
				//in case of Total consumption
				for ( var cid in target ) {
					if ( cid == "TO" ) continue;
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] = Math.round(target[cid][sorttarget]/target[consCode][sorttarget]*1000)/10;
					data[di][show.title] = Math.round(target[cid][sorttarget]*12/show.divide*show.round)/show.round;
					data[di]["item"] = target[cid].title;
					di++;
					sum += target[cid][sorttarget];
				}
				data[di] = {};
				data[di]["compare"] = scenario;
				data[di]["ratio"] = Math.round((target["TO"][sorttarget] - sum)/target["TO"][sorttarget]*1000)/10;
				data[di][show.title] = Math.round((target["TO"][sorttarget] - sum)*12/show.divide*show.round)/show.round;
				data[di]["item"] = otherCaption;

			} else {
				//each consumption exclude consTotal
				if ( target[consCode].partCons ) {
					var target2 = target[consCode].partCons;
					for ( var cid in target2 ) {
						//if ( target2[cid].title == target[consCode].title ) continue;
						data[di] = {};
						data[di]["compare"] = scenario;
						data[di]["ratio"] = Math.round(target2[cid][sorttarget]/target[consCode][sorttarget]*1000)/10;
						data[di][show.title] = Math.round(target2[cid][sorttarget]*12/show.divide*show.round)/show.round;
						data[di]["item"] = target2[cid].title + 
							( target2[cid].subID > 0 ? 
								":" +  
								( D6.viewparam.countfix_pre_after == 1 ? 
									target2[cid].countCall + target2[cid].subID : 
									target2[cid].subID + target2[cid].countCall )
							:  "" );
						di++;
						sum += target2[cid][sorttarget];
					}
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] = Math.round((target[consCode][sorttarget] - sum)/target[consCode][sorttarget]*1000)/10;
					data[di][show.title] = Math.round((target[consCode][sorttarget] - sum)*12/show.divide*show.round)/show.round;
					data[di]["item"] = otherCaption;
				} else {
					data[di] = {};
					data[di]["compare"] = scenario;
					data[di]["ratio"] = 1000/10;
					data[di][show.title] = Math.round(target[consCode][sorttarget]*12/show.divide*show.round)/show.round;
					data[di]["item"] = target[consCode].title;
					di++;
				}
			}
			return data;
		};

		var captions = ["you", "after", "average"];		//same code to view
		var averageCaption ="";
		if ( D6.targetMode == 1 ){
			averageCaption = D6.scenario.defSelectValue["sel021"][D6.area.area];
		} else {
			averageCaption = D6.scenario.defSelectValue["sel001"][Math.max(1,D6.doc.data["i001"])];
		}
		var data = gdata( D6.consShow, captions[0],true,consCode );
		Array.prototype.push.apply(data, gdata( D6.consShow, captions[1] ,false,consCode));
		Array.prototype.push.apply(data, gdata( D6.average.consList, captions[2],false,consCode) );

		//graph color list ( get from each cons** class )
		var clist = [];
		for ( var cid in D6.consShow ) {
			if ( cid == "TO" ) continue;
			if ( consCode == "TO" || cid == consCode ) {
				clist.push( { title:D6.consShow[cid].title, 
						//co2:D6.consShow[cid].co2, 
						target:D6.consShow[cid][show.sort + "Original"], 
						color:D6.consShow[cid].color });
			}
		}

		//graph order set(sort)
		var ord = [];
		if ( consCode =="TO") {
			D6.ObjArraySort( clist, "target","desc" );
			for ( var cid in clist ) {
				ord.push(clist[cid].title);
			}
			ord.push(otherCaption);
		} else {
			ord.push(clist.title);
		}

		ret.data = data;
		ret.yaxis = show.title;
		ret.ord = ord;
		ret.clist = clist;
		ret.averageCaption = averageCaption;
		ret.captions = captions;
		ret.consTitle = D6.consShow[consCode].title;

		return ret;
	},

	//CO2 itemize array
	//
	// return
	//		consObject array ( [0] is consTotal ) only for graph
	//		
	dataItemize : function()
	{
		var consShow = D6.consShow;

		var cons_temp = new Array();
		var cons_rebuild = new Array();
		var ci;

		//remove consTotal
		for ( ci in consShow ) {
			if ( consShow[ci].consCode != "TO" ) {
				cons_temp.push( consShow[ci] );
			}
		}
		
		//sort
		var NUMERIC = 16;			//function parameter stable definition
		var DESCENDING = 2;		//function parameter stable definition
		cons_temp.sortOn( "co2", NUMERIC | DESCENDING );	//sort
		
		//add consTotal as top
		cons_temp.unshift( consShow["TO"] );

		return cons_temp;
	},


	//monthly graph data
	//
	// return
	//		ret.data[]	graph data
	//		ret.yaxis	title
	getMonthlyGraph  : function ( ){
		var retall = [];
		var menu = {
			co2: {sort:"co2", title:"kg", round:1, divide:1},
			energy: {sort:"jules", title:"MJ", round:1, divide:1000},
			money: {sort:"cost", title:"yen", round:1,divide:1},
		};
		var show = menu["money"];
		var ene1 = [
			{ r:0, ene:"electricity", name:D6.Unit.name["electricity"]},
			{ r:1, ene:"gas", name:D6.Unit.name["gas"]},
			{ r:2, ene:"kerosene", name:D6.Unit.name["kerosene"]},
			{ r:3, ene:"coal", name:D6.Unit.name["coal"]},
			{ r:4, ene:"hotwater", name:D6.Unit.name["hotwater"]},
			{ r:5, ene:"car", name:D6.Unit.name["car"]}
		];
		var ene2 = [];
		
		var ret = [];
		var ri = 0;
		var captions = [];
		var e;
		for ( var m=1 ; m<=12 ; m++ ){
			captions[m-1] = m;
			for ( e=0 ; e<ene1.length ;e++ ){
				if ( !D6.consShow["TO"].monthlyPrice[ene1[e].ene] ) continue;
				ret[ri] = [];
				ret[ri]["month"] = m;
				ret[ri][show.title] = Math.round(D6.consShow["TO"].monthlyPrice[ene1[e].ene][m-1]/show.divide*show.round)/show.round;
				ret[ri]["energyname"] = ene1[e].ene;
				ri++;
			}
		}
		retall.data = ret;
		retall.yaxis = show.title;
		return retall;
	}
};

