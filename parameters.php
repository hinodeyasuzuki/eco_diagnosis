<?php
/* D6 eco home diagnosis system
 *
 *	parameters setting 
 */

$opendate = "2018/03/15";		//release date

//comment out when you need to set parameters under this file================================

//$forceMode = 1;			//set as $_GET["fm"]  1:debug, 3:worker test, 4:packer test, 5;release

//$languageMode ="ja";		//set as $_GET["lang"]  ja en zh fr
//$targetMode = 1;			//set as $_GET["t"] 1 home, 2 office
//$joyfullMode = 0;			//set as $_GET["j"] 0 orginal, 1 joyfull
//$dispMode = 99;			//set as $_GET["v"] 0 PC, 1 smart phone,  2 focus design,  3 easy, 4 guide, 5 result, 6 action, 99 intro
//$focusMode = 1;			//set as $_GET["f"] question focus by include [languageMode]_focus[taretMode]_[focusMode].js
//$introMode = 0;			//set as $_GET["intro"] 0:not  1:show introduction
//$translateMode = 0;		//set as $_GET["translate"] 0:not  1:google translation
//$data = "";				//set as $_GET["data"]
//$hideAverage = 0; 		//set as $_GET["hideaverage"] 0:show,1:hide dont show average
//$hidePrice = 0;			//set as $_GET["hideprice"] 0:show,1:hide   dont show price
//$messhownumber = 7;		//set as $_GET["messhownumber"] dispMode 3/6

$oneAreaRelease = false;		//set true in case of release in one area
								//false: generate related develop link

								
