@echo off
echo ------ D6 package packing for home --------------
REM D6 package packing for home
REM require php command line and php-packer

if "%~1"=="" (
  echo ERROR: Too few arguments.
  echo USAGE: %~0 languageCode
  exit /b 1
)

copy /b .\d6\d6facade.js + .\d6\base\objectcreate.js + .\d6\base\base64.js + .\d6\areaset\acadd.js +  .\d6\areaset\accons.js + .\d6\areaset\acload.js + .\d6\areaset\area.js + .\d6\areaset\unit.js + .\localize_%1\areaset\acadd.js + .\localize_%1\areaset\accons.js + .\localize_%1\areaset\acload.js + .\localize_%1\areaset\area.js + .\localize_%1\areaset\unit.js + .\d6\base\energy.js + .\d6\base\consbase.js + .\d6\base\measurebase.js + .\d6\base\doc.js + .\d6\base\monthly.js + .\d6\base\disp.js +  .\d6\base\evaluateaxis.js d6home_1.js

copy /b d6home_1.js + .\d6\base\disp_input.js + .\d6\base\disp_measure.js + .\d6\base\disp_demand.js +  .\d6\home\scenarioset.js + .\d6\home\scenariofix.js + .\d6\home\consTotal.js +   .\d6\home\consEnergy.js + .\d6\home\consSeason.js + .\d6\home\consHWsum.js +   .\d6\home\consHWshower.js + .\d6\home\consHWtub.js + .\d6\home\consHWdresser.js +  .\d6\home\consHWdishwash.js + .\d6\home\consHWtoilet.js +  .\d6\home\consCOsum.js + .\d6\home\consACcool.js + .\d6\home\consHTsum.js +   .\d6\home\consHTcold.js + .\d6\home\consACheat.js + .\d6\home\consAC.js +  .\d6\home\consRFsum.js + .\d6\home\consRF.js + .\d6\home\consLIsum.js +  .\d6\home\consLI.js + .\d6\home\consTVsum.js + .\d6\home\consTV.js +  .\d6\home\consDRsum.js + .\d6\home\consCRsum.js + .\d6\home\consCR.js +   .\d6\home\consCRtrip.js + .\d6\home\consCKpot.js + .\d6\home\consCKcook.js +  .\d6\home\consCKrice.js + .\d6\home\consCKsum.js d6home_2.js

copy /b d6home_2.js + .\localize_%1\home\scenarioset.js + .\localize_%1\home\scenariofix.js + .\localize_%1\home\consTotal.js +  .\localize_%1\home\consEnergy.js + .\localize_%1\home\consSeason.js + .\localize_%1\home\consHWsum.js + .\localize_%1\home\consHWshower.js +  .\localize_%1\home\consHWtub.js + .\localize_%1\home\consHWdresser.js + .\localize_%1\home\consHWdishwash.js +  .\localize_%1\home\consHWtoilet.js + .\localize_%1\home\consCOsum.js + .\localize_%1\home\consACcool.js + .\localize_%1\home\consHTsum.js +  .\localize_%1\home\consHTcold.js + .\localize_%1\home\consACheat.js + .\localize_%1\home\consAC.js + .\localize_%1\home\consRFsum.js +  .\localize_%1\home\consRF.js + .\localize_%1\home\consLIsum.js + .\localize_%1\home\consLI.js + .\localize_%1\home\consTVsum.js +  .\localize_%1\home\consTV.js + .\localize_%1\home\consDRsum.js + .\localize_%1\home\consCRsum.js + .\localize_%1\home\consCR.js +  .\localize_%1\home\consCRtrip.js + .\localize_%1\home\consCKpot.js + .\localize_%1\home\consCKcook.js + .\localize_%1\home\consCKrice.js +  .\localize_%1\home\consCKsum.js + .\d6\base\d6.js d6home.js

del d6home_1.js
del d6home_2.js

php .\php-packer\shorthome.php > .\localize_%1\d6home.min.js
copy /b d6home.js .\localize_%1\d6home.js
del d6home.js
