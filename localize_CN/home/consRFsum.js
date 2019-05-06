/* 2017/12/10  version 1.0
 * coding: utf-8, Tab as 4 spaces
 *
 * Home Energy Diagnosis System Ver.6
 * consRFsum.js
 *
 * calculate consumption and measures related to refrigerator in your hourse
 * total use
 *
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 *
 * @author Yasufumi Suzuki, Hinodeya Institute for Ecolife co.ltd.
 *								2011/01/21 original PHP version
 *								2011/05/06 ported to ActionScript3
 * 								2016/04/12 ported to JavaScript
 * 								2017/12/10 ver.1.0 set functions
 * 								2018/03/14 			global setting fix
 */

/*performance and price of equipment
 * 	parameter
 *		year : product year include future1
 *		level : 1:good, 2:ordinal
 *		size : L less than or equal to
 *	return value
 *		ret.pr1 : price of good one
 *		ret.pr2 : price of ordninal one
 *		ret.pf1 : performance of good one
 *		ret.pf2 : performance of ordninal one
 */
D6.consRFsum.equip = function(year, size) {
	var sizeThreshold = [200, 400, 1000]; //last is maxsize

	//definition of equip [size][year][code]
	//	code: pf1,pf2 performance 1 is good one
	//				pr1,pr2 price 1 is good one
	var defEquip = {
		200: {
			1900: { pf1: 250, pf2: 350, pr1: 5000, pr2: 4000 },
			2005: { pf1: 250, pf2: 350, pr1: 5000, pr2: 4000 },
			2015: { pf1: 200, pf2: 300, pr1: 5000, pr2: 4000 },
			2030: { pf1: 200, pf2: 250, pr1: 5000, pr2: 4000 }
		},
		400: {
			1900: { pf1: 450, pf2: 550, pr1: 7000, pr2: 6000 },
			1995: { pf1: 400, pf2: 500, pr1: 7000, pr2: 6000 },
			2015: { pf1: 300, pf2: 350, pr1: 6000, pr2: 5000 },
			2030: { pf1: 250, pf2: 300, pr1: 6000, pr2: 5000 }
		},
		1100: {
			1900: { pf1: 700, pf2: 900, pr1: 12000, pr2: 10000 },
			1995: { pf1: 600, pf2: 800, pr1: 12000, pr2: 10000 },
			2015: { pf1: 400, pf2: 700, pr1: 10000, pr2: 9000 },
			2030: { pf1: 400, pf2: 500, pr1: 10000, pr2: 9000 }
		}
	};

	return this.getEquipParameters(year, size, sizeThreshold, defEquip);
};
