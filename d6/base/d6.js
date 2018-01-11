/*  2017/12/16  version 1.0
 * coding: utf-8, Tab as 4 spaces
 * 
 * Home Energy Diagnosis System Ver.6
 * diagnosis.js 
 * 
 * D6 Main Class
 * 
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/17 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 
 * setscenario()				initialize diagnosis structure by scenario file
 * addMeasureEachCons()			add measure definition
 * addConsSetting()				add consumption definition 
 * calcCons()					calculate consumption
 * calcConsAdjust()				adjust consumption
 * calcMeasures()				calculate measure
 * calcMeasuresLifestyle()		calculate all measures and select lifestyle
 * calcMeasuresNotLifestyle()	calculate all measures and select not lifestyle
 * calcMeasuresOne()			calculate in temporal selection
 * measureAdd()					set select flag and not calculate 
 * calcMaxMeasuresList()		automatic select max combination 
 * calcAverage()				get avearage consumption
 * inSet()						input data setter
 * getGid()						get group id
 * getCommonParameters()		result common parameters
 * rankIn100()					get rank				
 * 
 * toHalfWidth()
 * ObjArraySort()
 * 
 * other D6 class
 * 		D6.disp		disp.js, disp_input.js, disp_measure.js
 * 		D6.senario	scenarioset.js
 * 
 */
 
//resolve D6
var D6 = D6||{};

//instances
D6.consList = [];					//consumption full list
D6.consListByName = [];				//consumption list by consname
D6.consShow = [];					//major consumption list by conscode
D6.measureList = [];				//measure list
D6.monthly = [];					//monthly energy
D6.resMeasure = [];					//result of measures list

D6.mesCount = 0;					//count of measures
D6.consCount = 0;					//count of consumptions

D6.average = { consList:""
				};					//average of consumptions 
	
D6.isOriginal = true;					//in case of no measure is selected
D6.sortTarget = "co2ChangeOriginal";	//by which measureas are sorted, changeable by input


/* setscenario -------------------------------------------------------------
 * 		set scenario by definition and create logic structure
 * parameters:
 *		prohibitQuestions		array of prohibitQuestions or "add" code for not initialize
 *		allowedQuestions
 *		defInput
 * return:
 *		none
 * set:
 *		-create new consumption instance in logicList
 *		-link to consList, consListByName, consShow
 *		-each consumption instance include measures, sumCons, subCons etc.
 */
D6.setscenario = function( prohibitQuestions, allowedQuestions, defInput ){
	var i,j,k;
	var notinit = false;

	if ( prohibitQuestions == "add"){
		notinit = true;
	}
	if ( !prohibitQuestions ) {
		prohibitQuestions =[];
	}
	if ( !allowedQuestions ) {
		allowedQuestions =[];
	}

	// step 1 : implementation of logics ------------------------
	if ( !notinit ) {
		D6.scenario.setDefs();		//set questions and measures
		D6.scenario.areafix();		//fix by area
		for ( var d in defInput ) {
			if ( defInput[d][2]) {
				D6.scenario.defInput[defInput[d][0]][defInput[d][1]] = defInput[d][2];
			}
		}
		D6.logicList = D6.scenario.getLogicList();
	}
	var consList = D6.consList;
	var cname;

	// step 2 : Implementation of consumption class -----------
	//
	D6.consCount = 0;	//counter for consList
	var logic;
	var tlogic;

	//create consumption class by logic, children of consTotal
	for( logic in D6.logicList ) {
		tlogic = D6.logicList[logic];
		D6.consListByName[tlogic.consName] = [];	//list by consName

		if ( tlogic.sumConsName == "consTotal" || tlogic.consName == "consTotal" ) {
				
			//fisrt set to consList
			consList[ D6.consCount ] = tlogic;
				
			//set another access path
			D6.consShow[ tlogic.consCode ] = consList[ D6.consCount ];
			D6.consListByName[tlogic.consName].push( consList[ D6.consCount ] );
			D6.consCount++;
		}
	}

	//create consumption class,  grandson of consTotal
	//  create grandson after children
	for( logic in D6.logicList ) {
		tlogic = D6.logicList[logic];								//shortcut

		//not direct connect to consTotal
		//implement by each equips/rooms
		if ( tlogic.sumConsName != "consTotal" && tlogic.consName != "consTotal" ) {
			if ( tlogic.orgCopyNum == 0 ) {
				consList[D6.consCount] = tlogic;
				D6.consListByName[tlogic.consName].push( consList[ D6.consCount ] );
				D6.consCount++;
			} else {
				for ( j = 0 ; j <= tlogic.orgCopyNum ; j++ ) {		// #0 is residue			
					//implementation in consList
					consList[D6.consCount] = D6.object( tlogic );	// set copy
					consList[D6.consCount].setsubID( j );
					
					//another access path
					D6.consListByName[tlogic.consName].push( consList[ D6.consCount ] );
					D6.consCount++;
				}
			}
		}
	}

	// step 3 : resolve relation between consumption classes -------------
	var cons;
	var partconsTemp;
	var partCons;		//partition side classes to this class
	var partCons2nd;	//2nd partition side classes to this class

	for ( i=0 ; i< consList.length ; i++ ){
		//create relation by each cons in consList
		cons = consList[i];
		cons.measures = [];
		cons.partCons = [];

		//get instance of sum side class
		cons.sumCons = this.getTargetConsList( cons.sumConsName );
		cons.sumCons2 = this.getTargetConsList( cons.sumCons2Name );

		//get instance of part side class
		//    part side is not defined in this class definition, so check each
		//    part side class of which sumCons is related to this cons
		partCons = [];
		partCons2nd = [];

		for ( j=0 ; j<consList.length ; j++ ) {
			//check each cons in consList which is part side
			partconsTemp = consList[j];

			// if sum part is defined as this class
			if ( partconsTemp.sumConsName === cons.consName ) {

				//countable rooms/equips or not
				if ( partconsTemp.orgCopyNum >= 1 ) {
				
					if ( cons.orgCopyNum >= 1 ) {
						//if this cons is countable, add only same id
						if ( cons.subID == partconsTemp.subID ){
							cons.partConsName = partconsTemp.consName;
							partCons.push( partconsTemp );
						}
						
					} else {
						//this cons is not countable add each cons as partcons
						cons.partConsName = partconsTemp.consName;
						partCons.push( partconsTemp );
					}
					
				} else {
					//not countable add first cons as partCons
					partCons.push( partconsTemp );
				}
			}

			// if second sum part is defined as this class
			if ( partconsTemp.sumCons2Name == cons.consName ) {

				//countable rooms/equips or not
				if ( partconsTemp.orgCopyNum >= 1 ) {

					//if this cons is countable, add only same id
					if ( cons.orgCopyNum >= 1 ) {
						if ( cons.subID == partconsTemp.subID ){
							cons.partCons2Name = partconsTemp.consName;
							partCons2nd.push( partconsTemp );
						}
							
					} else {
						cons.partCons2Name = partconsTemp.consName;
						partCons2nd.push( partconsTemp );
					}
					
				} else {
					//not countable add first cons as partCons
					partCons2nd.push( partconsTemp );
				}
			}
		}

		//set to this cons 
		if ( partCons.length >= 1 ) {
			cons.partCons = partCons;
		} else {
			cons.partCons = "";
		}
		if ( partCons2nd.length >= 1 ) {
			cons.partCons2 = partCons2nd;
		} else {
			cons.partCons2 = "";
		}
	}

	// step 4 : Implementation of measures -----------------------
	this.mesCount = 0;			//counter of measures 

	//add measures to each cons class
	for ( i in consList ){
		this.addMeasureEachCons( consList[i] );
	}

	// in case of calculate by months, questions should be divided to months
	//	and need dataset of temperature, solar, average consumptions etc.

	// step 5 : set questions/inputs --------------------------
	
	//function to check is prohibited
	var isProhivitedQuestion = function( iname ) {
		// definition in EXCEL
		if ( iname["cons"] == "" ) return true;

		if ( prohibitQuestions.length <= 0 ) {
			if ( allowedQuestions.length <= 0 ) {
				return false;
			} else {
				if ( allowedQuestions.indexOf(iname) >= 0 ) {
					return false;
				} else {
					return true;
				}
			}
		} else {
			if ( prohibitQuestions.indexOf(iname) >= 0 ) {
				return true;
			} else {
				return false;
			}
		}
	};

	var iname;

	// loop each input definition
	for ( iname in D6.scenario.defInput ) {
		//check is prohibited
		if ( isProhivitedQuestion( iname ) ) continue;

		var defInp = D6.scenario.defInput[iname];
		logic = D6.logicList[defInp.cons];

		// if input has relation to consumption
		if ( logic ) {
			if ( logic.orgCopyNum > 0 ) {
				//in case of countable consumption 
				for ( j=0 ; j<logic.orgCopyNum ; j++ ) {
					//create one question as "iname + [1-n]"
					D6.inSet( iname+(j+1),defInp.defaultValue );
				}
			} else {
				//create one question
				D6.inSet( iname, defInp.defaultValue);
			}
		}
	}
		
	//set easy question list
	var ilist = [];
	if ( D6.scenario.defEasyQues ) {
		for( var i in D6.scenario.defEasyQues[0].ques ) {
			if ( isProhivitedQuestion( D6.scenario.defEasyQues[0].ques[i] ) ) continue;
			ilist.push( D6.scenario.defEasyQues[0].ques[i] );
		}
		D6.scenario.defEasyQues[0].ques = [];
		for ( i in ilist ) {
			D6.scenario.defEasyQues[0].ques.push( ilist[i] );
		}
	}

};


// addMeasureEachCons(cons)-----------------------------
//		add measures related to one consumption
//		it works not only initialize but also after
// params
//		cons :  target consumption instance
// return
//		none
// set
//		set new measures to cons.measures
D6.addMeasureEachCons = function( cons ) {
	for ( var mesname in D6.scenario.defMeasures ) {
		if ( cons.consName != D6.scenario.defMeasures[mesname].refCons ) continue;
		this.measureList[this.mesCount] = D6.object(D6.MeasureBase);
		this.measureList[this.mesCount].Constructor( cons, D6.scenario.defMeasures[mesname], this.mesCount );
		cons.measures[mesname] = this.measureList[this.mesCount];
		this.mesCount++;
	}
};



// addConsSetting( consName ) ------------------------------------------------
//		add consumption instance of countable rooms/equipments
//		this function only increment setting number, so after that reconstruct all consumptions
// parameter
//		consName : consumption code(string)
// return
//		none
// set
//		increment the number of consumption setting
//		also increment part side of consumption
D6.addConsSetting = function(consName) {
	var cons = "";
	var pname = "";

	//check consAddSet in each logicList[]
	var rend = false;
	for ( cons in D6.logicList ){
		// same target is listed in consAddSet
		// for example rooms, both heating and cooling has relationship
		// see also consAC.js
		pname = D6.logicList[cons].consAddSet;

		for ( var t in pname ){
			if ( pname[t] == consName || cons == consName ){
				D6.logicList[cons].orgCopyNum = D6.logicList[cons].orgCopyNum + 1;
				for ( var s in pname ){
					D6.logicList[pname[s]].orgCopyNum = D6.logicList[pname[s]].orgCopyNum + 1;
				}
				rend = true;
				break;
			}
		}
		if ( rend ) break;
	}

	if ( !rend ){
		// no consAddSet, ordinal addition
		D6.logicList[consName].orgCopyNum = D6.logicList[consName].orgCopyNum + 1;
	}
};
	

// calcCons() -------------------------------------------------------
//		calculate consumption in consumption instance
// 
D6.calcCons = function() {
	var i,j;
	var ci;

	//area parameters set
	this.area.setCalcBaseParams();

	//pre calculation such as common parameters setting
	for ( i=0 ; i<D6.consList.length ; i++ ) {
		this.consList[i].precalc();
	}
		
	//calculate each consumption at first time
	for ( i=0 ; i<D6.consList.length ; i++ ) {
		this.consList[i].calc();
		this.consList[i].calcCO2();
	}

	//calculate 2nd step 
	for ( i=0 ; i<this.consList.length ; i++ ) {
		this.consList[i].calc2nd();
		this.consList[i].calcCO2();	
	}

	//adjust among each consumption
	this.calcConsAdjust();

	//calculate cost and energy
	for ( i=0 ; i<this.consList.length ; i++ ) {
		this.consList[i].calcCost();
		this.consList[i].calcJules();
		//set as original value, which is in case of no selection
		if ( this.isOriginal ) {
			this.consList[i].co2Original = this.consList[i].co2;
			this.consList[i].costOriginal = this.consList[i].cost;
			this.consList[i].julesOriginal = this.consList[i].jules;
		}
	}
};
	

//calcConsAdjust() --------------------------------------------------
//		adjust among each consumption
//		called from calcCons()
D6.calcConsAdjust = function() {		
	var ci, i, j;
	var consNum;
	var consSum;
	var energySum = D6.object( D6.Energy );
	D6.energyAdj = D6.object(D6.Energy);	//adjust parameters by energy
	var singleArray = true;
	var lastname = "";
		
	// calculate sum of part side consumptions of each consumption exclude total one
	for ( ci in this.consShow ) {
		consSum = this.consShow[ci];

		if ( consSum.consName != "consTotal" ) {
			energySum.clear();
				
			if ( consSum.partCons.length >= 1 ) {
				// countable consumption
				lastname = consSum.partCons[0].consName;
				for ( i=1 ; i<consSum.partCons.length ; i++ ) {
					// sum from 1 not 0. #0 is residue
					energySum.add( consSum.partCons[i] );

					//check if different consName. true:different, false:same
					if ( lastname != consSum.partCons[i].consName) {
						singleArray = false;
					}
				}
				energySum.calcCO2();

				if ( consSum.residueCalc == "no") {
					// refrigerator pattern : each consumption is important
					consSum.copy( energySum );
					consSum.add( consSum.partCons[0] );
					consSum.calcCO2();
				} else {
					// top down pattern : group consumption is important 
					if ( energySum.co2 > consSum.co2 ) {
						//in case of sumup is bigger than sumCons divide each cons
						for ( i=1 ; i<=consNum ; i++ ) {
							consSum.partCons[i].multiply( consSum.co2 / energySum.co2 );
						}
						consSum.partCons[0].clear();
					} else {
						//calculate residue
						if ( singleArray ) {
							//set residue to partCons[0]
							energySum.sub( consSum );
							energySum.multiply( -1 );
							consSum.partCons[0].copy( energySum );
						} else {
							//not to set partCons[0], because #0 is not residue 
							consSum.copy( energySum );
							consSum.add( consSum.partCons[0] );
							consSum.calcCO2();
						}
					}
				}
			}
		}
	}

	// adjust total balance by energy type
	//		if sum of electricity/gas or etc. is over total consumption one, 
	//		adjust each consumption not over total.
	energySum.clear();

	//sum of consumptions to home total
	for ( ci in this.consShow ){
		if ( ci != "TO" ) {
			for ( j in D6.Unit.co2 ){
				energySum[j] += this.consShow[ci][j];
			}
		}
	}

	//parameters existence of extinct total data
	var nodataTotal = this.consShow["TO"].noConsData;
		
	//residue is more than 10% of electricity
	energySum.electricity += this.consShow["TO"].electricity * 0.1;
		
	//execute adjust
	energyAdj = [];
	if ( !nodataTotal ) {
		//in case of exist in total consumption
		for ( j in D6.Unit.co2 ){
			if ( energySum[j] == 0 ) {
				this.energyAdj[j] = 1;
			} else {
				// adjust is less than triple and more than 0.3 times
				this.energyAdj[j] = Math.max( 0.3, Math.min( 3, this.consShow["TO"][j] / energySum[j] ) );
			}
		}

		//execute adjust
		for ( ci in this.consList ){
			if ( this.consList[ci].consName != "consTotal" ) {
				this.consList[ci].calcAdjust( this.energyAdj );
			}
		}

	} else {
		//no total value
		for ( j in D6.Unit.co2 ){
			if ( j == "electricity" ){
				if( this.consShow["TO"][j] < energySum[j] ) {
					this.consShow["TO"][j] = energySum[j];
				}
			} else {
				this.consShow["TO"][j] = energySum[j];
			}
		}
		this.consShow["TO"].calcCO2();
	}
};



// calcMeasures(gid)  calculate all measures -----------------------------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
// once clear selected measures, and set select and calculate one by one
//
D6.calcMeasures = function( gid ) {
	var ret;
	var calcfg = false;
	var i;
	var mid, mlistid, mes;

	var selList = [];	//selected measures' ID

	//save selected measures id
	for( mes in this.measureList ) {
		selList[this.measureList[mes].mesID] =this.measureList[mes].selected;
	}

	//clear selection and calculate
	ret = this.clearSelectedMeasures( gid );

	//set select one by one
	for ( i = 0 ; i < ret.length ; i++ ) {
		mid = ret[i].mesID;
		mlistid = mid;
		mes = this.measureList[mlistid];

		if ( selList[mid] && !mes.selected ) {
			mes.selected = true;
			this.isOriginal = false;

			if ( mes.co2Change < 0 ) {
				//set select in case of useful measures
				mes.co2ChangeSumup = mes.co2Change;
				mes.costChangeSumup = mes.costChange;
				mes.costTotalChangeSumup = mes.costTotalChange;

				mes.addReduction();					//set reduction
				ret = this.calcMeasuresOne( -1 );	//main calculation for next step
			} else {
				mes.co2ChangeSumup = 0;
				mes.costChangeSumup = 0;
				mes.costTotalChangeSumup = 0;
			}
		}
	}

	//set selection property include not useful
	for ( mlistid in this.measureList ) {
		mes = this.measureList[mlistid];
		mes.selected = selList[mes.mesID];
		if ( mes.selected ) {
			this.isOriginal = false;
		}
	}
	var ret2 = [];
	for ( i=0 ; i<ret.length ; i++ ) {
		if ( ret[i].groupID == gid || gid == -1 ) {
			ret2.push( ret[i] );
		}
	}
	this.resMeasure = ret2;
	if ( D6.debugMode ) {
		console.log( "measure calculate in d6.js calcMeasures() --- " );
		console.log( ret2 );
	}
	return ret2;
};


// calcMeasuresLifestyle(gid)  
//		calculate all measures and select lifestyle --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
D6.calcMeasuresLifestyle = function( gid ) {
	var onemes;
	var retLife = new Array();
	var ret = D6.calcMeasures( gid );
		
	// select only related to lifestyle 
	for( onemes in ret ) {
		if ( ret[onemes].lifestyle == 1 ) {
			retLife.push( ret[onemes] );
		}
	}
	return retLife;
};
	

// calcMeasuresNotLifestyle(gid)  
//		calculate all measures and select not lifestyle --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
D6.calcMeasuresNotLifestyle = function( gid ) {
	var onemes;
	var retLife = [];
	var ret = D6.calcMeasures( gid );
		
	// select only not related to lifestyle 
	for( onemes in ret ) {
		if ( ret[onemes].lifestyle != 1 ) {
			retLife.push( ret[onemes] );
		}
	}
	return retLife;
};


// calcMeasuresOne(gid)  
//		calculate all measures in temporal selection --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array include mesID,groupID and lifestyle
//
// called by calcMeasures
//
D6.calcMeasuresOne = function( gid ) {
	var ret;								//return
	var topList;							//list of measures id
	var selectList;							//list of selected measures id
	var i;

	var sortTarget = this.sortTarget;		//sort target
	ret = new Array();
	topList = new Array();
	selectList = new Array();

	//each measures defined in cons object
	for ( i in this.consList ) {
		//target group
		if ( gid == -1 || this.consList[i].groupID == gid ) {
			this.consList[i].calcMeasureInit();
			this.consList[i].calcMeasure();
				
			//in case of equipment/room number is defined and selected #0
			//not evaluate after #1
			if ( this.consList[i].subID >= 1 ){
				var cons0 = this.consListByName[this.consList[i].consName][0];
				for ( var m in cons0.measures ){
					if ( cons0.measures[m].selected ){
						this.consList[i].measures[m].copy( cons0 );
					}
				}
			}
		}
	}
	i=0;
	
	//format return measure data
	for( var mescode in this.measureList ) {
		var mes = this.measureList[mescode];
		mes.calcSave();
		ret[i] = {};
		ret[i][sortTarget] =mes[sortTarget];
		ret[i].mesID =mes.mesID;
		ret[i].groupID =mes.groupID;
		ret[i].lifestyle =mes.lifestyle;
		i++;
	}
	this.ObjArraySort( ret, sortTarget );	//sort
	return ret;
};


// measureAdd(mesId) set select flag and not calculate --------
//
// parameters
//		mesId		measure id which you select
// return
//		none
//
D6.measureAdd = function( mesId ) {
	var gid;
	var ret = "";
		
	gid = this.measureList[mesId].groupID;
	this.measureList[mesId].selected = true;
	this.isOriginal = false;
	//ret = this.calcMeasures( gid );	//recalc -> not calc

	return ret;
};


// measureDelete(mesId) remove select flag and not calculate--------
//
// parameters
//		mesId		measure id which you select
// return
//		none
//
D6.measureDelete = function( mesId ) {
	var gid;
	var ret ="";

	this.measureList[mesId].selected = false;
	gid = this.measureList[mesId].groupID;
	//ret = this.calcMeasures( gid );	//recalc 

	return ret;
};

// clearSelectedMeasures(gid)  clear all selection and calculate all --------
//
// parameters
//		gid		groupid, -1 is total
// return
//		measure array defined in calcMeasuresOne
//
D6.clearSelectedMeasures = function( gid ) {
	var ret;

	this.isOriginal = true;
	ret = this.calcCons();			//calcurate original state consumption
		
	//remove selection
	for ( var i = 0 ; i < D6.measureList.length ; i++ ) {
		if ( this.measureList[i].groupID == gid || gid < 0 ) {
			this.measureList[i].selected = false;
		}
	}
		
	//calculate
	ret = this.calcMeasuresOne( gid );
		
	return ret;
};

	
// calcMaxMeasuresList(gid)
//		automatic select max combination measures --------
//
// parameters
//		gid		groupid, -1 is total
//		count	max selected number
// return
//		measure array defined in calcMeasuresOne
//
D6.calcMaxMeasuresList = function( gid, count )
{
	var resultCalc;
	var ret;
	var pt = 0;
	var maxCO2 = 0;
	var cost = 0;
	var i, j;
	var mes;
	var targetmes;
	var sumCO2 = 0;
	var sumCOST = 0;
		
	if( typeof(gid) == "undefined" ) gid = -1;
	if( typeof(count) == "undefined" || count<1 ) count = 15;
		
	//clear all selection
	resultCalc = this.clearSelectedMeasures( gid );
		
	//search max reduction measure for "count" times
	for ( i = 0 ; i < count ; i++  ) {
		pt = -1;
		maxCO2 = 0;
		for ( j = 0 ; j < this.measureList.length ; j++ ) {
			//max reduction in measureList
			mes = this.measureList[j];
			if ( mes.groupID == gid || gid < 0 ) {
				if ( measureList[j].selected != true 		//skip already selected
					|| !isFinite(mes.co2Change) 
					|| isNaN(mes.co2Change)) 				//useful
				{
					//select max measure
					if ( maxCO2 > mes.co2Change ) {
						maxCO2 = mes.co2Change;
						cost = mes.costChange;
						pt = mes.mesID;
						targetmes = mes;
					}
				}
			}
		}
		if ( pt == -1 ) {
			//end in case of no measures suitable
			break;
		}
		sumCO2 += maxCO2;
		sumCOST += cost;
		resultCalc = this.measureAdd( pt );			//select set to property
		targetmes.addReduction();					//set reduction
		resultCalc = this.calcMeasuresOne( -1 );	//main calculation for next step
	}
	ret = calcMeasures(gid);
	ret.sumCO2 = sumCO2;
	ret.sumCOST = sumCOST;

	return ret;
};



// calcAverage()  get avearage consumption ------------------
//
// parameters
//		none
// return
//		none
//
// set D6.average.consList[]
//
D6.calcAverage = function(){
	D6.averageMode = true;			//not use input parameters
	this.calcCons();				//and calculate, then get average

	this.average.consList = {};
	for( var c in this.consShow ) {
		this.average.consList[c] = {};
		this.average.consList[c].co2 = this.consShow[c].co2;
		this.average.consList[c].cost = this.consShow[c].cost;
		this.average.consList[c].jules = this.consShow[c].jules;
		this.average.consList[c].title = this.consShow[c].title;
	}
	D6.averageMode = false;	
};

	
// inSet(id, val)  input data setter ------------------
//
// parameters
//		id		input id, permit include equip/room code 'ixxxyy'
//		val		input value
//
D6.inSet = function ( id, val ){
	var inpIdDef = id.substr( 0,4 );
	if ( D6.scenario.defInput[inpIdDef].varType == "String" || 
		D6.scenario.defInput[inpIdDef].varType == "Boolean"
	) {	
		//set data
		D6.doc.data[id] = val;
	} else {
		//string data set
		val = D6.toHalfWidth(val);
		D6.doc.data[id] = parseFloat( val ) ? parseFloat( val ) : 0;
	}
};

	
// getGid(consName)  getter group id of consumption ------------------
//
// parameters
//		consName	consumption name
// retrun
//		groupID		0-9
//
D6.getGid  = function( consName ) {
	return D6.logicList[consName].groupID;
};
	

// getTargetConsList(consName)  getter consumption object ------------------
//
// parameters
//		consName	consumption name
// retrun
//		consumption object / object array
//
D6.getTargetConsList  = function( consName )
{
	var i,c=0;
	var target = new Array();
	var ret;

	if ( consName != "" ) {
		for ( i=0 ; i<this.consList.length ; i++ ) {
			if ( this.consList[i].consName == consName ) {
				target[c++] = this.consList[i];
			}
		}
		if ( target.length == 1 ) {
			//in case of single
			ret = target[0];
		} else {
			//in case of array
			ret = target;
		}
	}
	return ret;
};

	
// getCommonParameters()  getter common result parameters such as co2 ------------------
//
// retrun
//		co2,cost
//
D6.getCommonParameters = function(){
	var ret = [];
	ret.co2Original = D6.consListByName["consTotal"][0].co2Original;
	ret.co2 = D6.consListByName["consTotal"][0].co2;
	ret.costOriginal = D6.consListByName["consTotal"][0].costOriginal;
	ret.cost = D6.consListByName["consTotal"][0].cost;
		
	return ret;
};


// rankIn100(ratio)  calculate rank by ratio to average ------------------
//
// parameters
//		ratio	ratio to average
// return
//		rank 1-100
//
D6.rankIn100 = function( ratio ){
	var ret;
	var lognum;

	var width = 0.5;		// set diffusion parameter

	if ( ratio <= 0 ) {
		//in case of minus
		ratio = 0.1;
	}
	lognum = Math.log( ratio );

	if ( lognum < -width ) {
		// rank 1-10
		ret = Math.max( 1, Math.round( ( lognum + 1 ) / width * 10 ) );
	} else if ( lognum < width ) {
		// rank 11-90
		ret = Math.round(( lognum + width ) / ( width * 2) * 80 + 10 );
	} else {
		// rank 91-100
		ret = Math.min( 100, Math.round( ( lognum - width ) / ( width * 2) * 10 ) + 90 );
	}
	return ret;
};

	
// toHalfWidth(strVal)  change double width charactor------------------
//
// parameters
//		strVal	original value
// return
//		halfVal replaced value
//
D6.toHalfWidth = function(strVal){
	if ( !strVal ) return strVal;
	var halfVal = strVal.replace(/[！-～]/g,
		function( tmpStr ) {
		// shift charactor code
			return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
		}
	);
	return halfVal;
};

	
// ObjArraySort(ary, key, order )  object sort ------------------
//
// parameters
//		ary		array/object
//		key		sort target
//		order	incr/desc
// retrun
//		none
//
//	set "ary" sorted
//
D6.ObjArraySort = function(ary, key, order) {
    var reverse = 1;
    if(order && order.toLowerCase() == "desc") 
        reverse = -1;
    ary.sort(function(a, b) {
	        if(a[key] < b[key])
	        return -1 * reverse;
        else if(a[key] == b[key])
	            return 0;
        else
            return 1 * reverse;
    });
};

