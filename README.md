# eco_diagnosis
Eco Home Diagnosis System to reduce co2 reduction

アンケート入力をもとに、家庭ごとのCO2削減対策を提案するソフトです。その家庭のエネルギー利用状況を分析し、効果的な対策を選んで提案します。
基本は家庭向けですが、小規模事業者の診断にも対応できます。
また、言語設定を変更することで、多言語・他地域の診断ソフトとして作ることができます。EXCELシートに記述して、コードとして書き出すことにより、他言語版として活用できます。

This program can advice how to reduce CO2 emission by some question. In this software over 60 measures is set, calculate each measures by input value, show adive fitted to home. It is made for not only home but also small office.
You can make your area/language software by support of Excel file.

## Third party
* jQuery JavaScript Library: Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
* leanModal v1.1 by Ray Stone - http://finelysliced.com.au
* jQuery Cookie Plugin v1.4.1: Copyright 2006, 2014 Klaus Hartl
* Chart.js http://chartjs.org/ Version: 2.0.2: Copyright 2016 Nick Downie
* d3/d3.js Copyright 2010-2017 Mike Bostock
* PMSI-AlignAlytics/dimple: Copyright 2015 AlignAlytics http://www.align-alytics.com
* php-packer: originally created by Dean Edwards, ported to PHP by Nicolas Martin. Packed for composer and slightly extended by Thomas Lutz.
* intro.js : introjs.com
 
## Release Site
http://www.hinodeya-ecolife.com/diagnosis/

## Install
In order to pack js files, you need Windows, commandline PHP, Excel

php files are used as parameters set, if you want to execute listricted pattern of diagnosis, you can save as .html file.

## making your area/language system
The base advice algolism is set for Japan. 

index.php   access file in oder to manage develop/release, language, etc.

/d6/      main logic files

/view/    design inculde template, css and js as action. there is 8 types of view in original.

/logic_**/  localized files set in this folder


step1)EXCEL setting

You can fill efficent equipment, price, adive message, subsidy information, question text, select options, in order to fit your area and language. And also set messages in your language.

step2)copy excel sheet to /logic_**/language_set.php, /logic_**/home/senario_fix.js

 ** is your country code and language code. Please copy code from excel to program files.

step3)configure index.php

 add new language code if you need. 

step4) access and check

Copyright 2011－2018（C） Yasufumi Suzuki, Hinodeya Insititute for Ecolife co.Ltd.
Released under the MIT license




