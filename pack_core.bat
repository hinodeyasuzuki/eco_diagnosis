@echo off
echo ------ D6 package packing for home --------------
REM D6 package packing for home
REM require php command line and php-packer

copy /b .\d6\d6facade.js + .\d6\base\objectcreate.js + .\d6\base\base64.js + .\d6\areaset\acadd.js +  .\d6\areaset\accons.js + .\d6\areaset\acload.js + .\d6\areaset\area.js + .\d6\areaset\unit.js + .\d6\base\energy.js + .\d6\base\consbase.js + .\d6\base\measurebase.js + .\d6\base\doc.js + .\d6\base\d6_calcmonthly.js + .\d6\base\d6_get.js +  .\d6\base\d6_getevaluateaxis.js d6home_1.js

copy /b d6home_1.js + .\d6\base\d6_getinput.js + .\d6\base\d6_getmeasure.js + .\d6\base\d6_getdemand.js +  .\d6\home\scenarioset.js + .\d6\home\scenariofix.js + .\d6\home\consTotal.js +   .\d6\home\consEnergy.js + .\d6\home\consSeason.js + .\d6\home\consHWsum.js +   .\d6\home\consHWshower.js + .\d6\home\consHWtub.js + .\d6\home\consHWdresser.js +  .\d6\home\consHWdishwash.js + .\d6\home\consHWtoilet.js +  .\d6\home\consCOsum.js + .\d6\home\consACcool.js + .\d6\home\consHTsum.js +   .\d6\home\consHTcold.js + .\d6\home\consACheat.js + .\d6\home\consAC.js +  .\d6\home\consRFsum.js + .\d6\home\consRF.js + .\d6\home\consLIsum.js +  .\d6\home\consLI.js + .\d6\home\consTVsum.js + .\d6\home\consTV.js +  .\d6\home\consDRsum.js + .\d6\home\consCRsum.js + .\d6\home\consCR.js +   .\d6\home\consCRtrip.js + .\d6\home\consCKpot.js + .\d6\home\consCKcook.js +  .\d6\home\consCKrice.js + .\d6\home\consCKsum.js d6home_2.js

copy /b d6home_2.js + .\d6\base\d6.js + .\d6\base\d6_construct.js + .\d6\base\d6_calccons.js + .\d6\base\d6_calcaverage.js + .\d6\base\d6_calcmeasures.js + .\d6\base\d6_setvalue.js + .\d6\base\d6_tools.js d6home.js

del d6home_1.js
del d6home_2.js

php .\php-packer\shorthome.php > .\d6\d6home_core.min.js
copy /b d6home.js .\d6\d6home_core.js
del d6home.js
