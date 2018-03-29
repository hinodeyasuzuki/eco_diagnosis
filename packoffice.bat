@echo off
echo ------ D6 package packing for office --------------
REM D6 package packing for office
REM require php command line and php-packer

if "%~1"=="" (
  echo ERROR: Too few arguments.
  echo USAGE: %~0 languageCode
  exit /b 1
)
copy /b .\localize_%1\office\scenariofix.js + .\localize_%1\areaset\acadd.js + .\localize_%1\areaset\accons.js + .\localize_%1\areaset\acload.js + .\localize_%1\areaset\area.js + .\localize_%1\areaset\unit.js +.\localize_%1\office\scenarioset.js d6office.js

copy /b d6office.js + .\localize_%1\office\consRM.js +  .\localize_%1\office\consTotal.js + .\localize_%1\office\consEnergy.js + .\localize_%1\office\consSeason.js + .\localize_%1\office\consMonth.js + .\localize_%1\office\consHWsum.js + .\localize_%1\office\consCOsum.js + .\localize_%1\office\consCO.js +  .\localize_%1\office\consHTsum.js + .\localize_%1\office\consHT.js + .\localize_%1\office\consACsum.js + .\localize_%1\office\consAC.js +  .\localize_%1\office\consRFsum.js + .\localize_%1\office\consRF.js + .\localize_%1\office\consCKsum.js + .\localize_%1\office\consLIsum.js +  .\localize_%1\office\consLI.js + .\localize_%1\office\consOTsum.js + .\localize_%1\office\consOT.js + .\localize_%1\office\consOAsum.js +  .\localize_%1\office\consCRsum.js + .\localize_%1\office\consCR.js + .\localize_%1\office\consCRtrip.js  d6office.js

php .\php-packer\shortoffice.php > .\dist\d6office_%1.min.js
copy /b d6office.js .\dist_develop\d6office_%1.js
del d6office.js
