@echo off
echo ------ D6 package packing for home --------------
REM D6 package packing for home
REM require php command line and php-packer

if "%~1"=="" (
  echo ERROR: Too few arguments.
  echo USAGE: %~0 languageCode
  exit /b 1
)

copy /b .\localize_%1\home\scenariofix.js + .\localize_%1\areaset\acadd.js + .\localize_%1\areaset\accons.js + .\localize_%1\areaset\acload.js + .\localize_%1\areaset\area.js + .\localize_%1\areaset\unit.js + .\localize_%1\home\scenarioset.js  d6home_1.js

copy /b d6home_1.js  + .\localize_%1\home\consTotal.js +  .\localize_%1\home\consEnergy.js + .\localize_%1\home\consSeason.js + .\localize_%1\home\consHWsum.js + .\localize_%1\home\consHWshower.js +  .\localize_%1\home\consHWtub.js + .\localize_%1\home\consHWdresser.js + .\localize_%1\home\consHWdishwash.js +  .\localize_%1\home\consHWtoilet.js + .\localize_%1\home\consCOsum.js + .\localize_%1\home\consACcool.js + .\localize_%1\home\consHTsum.js +  .\localize_%1\home\consHTcold.js + .\localize_%1\home\consACheat.js + .\localize_%1\home\consAC.js + .\localize_%1\home\consRFsum.js +  .\localize_%1\home\consRF.js + .\localize_%1\home\consLIsum.js + .\localize_%1\home\consLI.js + .\localize_%1\home\consTVsum.js +  .\localize_%1\home\consTV.js + .\localize_%1\home\consDRsum.js + .\localize_%1\home\consCRsum.js + .\localize_%1\home\consCR.js +  .\localize_%1\home\consCRtrip.js + .\localize_%1\home\consCKpot.js + .\localize_%1\home\consCKcook.js + .\localize_%1\home\consCKrice.js +  .\localize_%1\home\consCKsum.js d6home.js

del d6home_1.js

php .\php-packer\shorthome.php > .\dist\d6home_%1.min.js
copy /b d6home.js .\dist_develop\d6home_%1.js
del d6home.js
