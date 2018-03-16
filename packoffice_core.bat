@echo off
echo ------ D6 package packing for office --------------
REM D6 package packing for office
REM require php command line and php-packer


copy /b .\d6\d6facade.js + .\d6\base\objectcreate.js + .\d6\base\base64.js + .\d6\areaset\acadd.js +  .\d6\areaset\accons.js + .\d6\areaset\acload.js + .\d6\areaset\area.js + .\d6\areaset\unit.js + .\d6\base\energy.js + .\d6\base\consbase.js + .\d6\base\measurebase.js + .\d6\base\doc.js + .\d6\base\d6_calcmonthly.js + .\d6\base\d6_get.js +  .\d6\base\d6_getevaluateaxis.js + .\d6\base\d6_getinput.js + .\d6\base\d6_getmeasure.js + .\d6\base\d6_getdemand.js + .\d6\base\d6_getinput.js + .\d6\base\d6_getmeasure.js + .\d6\base\d6_getdemand.js + .\d6\base\d6.js + .\d6\base\d6_construct.js + .\d6\base\d6_calccons.js + .\d6\base\d6_calcaverage.js + .\d6\base\d6_calcmeasures.js + .\d6\base\d6_setvalue.js + .\d6\base\d6_tools.js d6office.js

copy /b d6office.js + .\d6\office\scenarioset.js + .\d6\office\scenariofix.js +  .\d6\office\consRM.js + .\d6\office\consTotal.js + .\d6\office\consEnergy.js +  .\d6\office\consSeason.js + .\d6\office\consMonth.js + .\d6\office\consHWsum.js +  .\d6\office\consCOsum.js + .\d6\office\consCO.js + .\d6\office\consHTsum.js +  .\d6\office\consHT.js + .\d6\office\consACsum.js + .\d6\office\consAC.js +  .\d6\office\consRFsum.js + .\d6\office\consRF.js + .\d6\office\consCKsum.js +  .\d6\office\consLIsum.js + .\d6\office\consLI.js + .\d6\office\consOTsum.js +  .\d6\office\consOT.js + .\d6\office\consOAsum.js + .\d6\office\consCRsum.js +  .\d6\office\consCR.js + .\d6\office\consCRtrip.js d6office.js

copy /b d6office.js + .\d6\base\d6.js  d6office.js

php .\php-packer\shortoffice.php > .\d6\d6office_core.min.js
copy /b d6office.js .\d6\d6office_core.js
del d6office.js


