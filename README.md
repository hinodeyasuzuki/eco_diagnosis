# eco_diagnosis

このリポジトリでの開発は終了し、ロジックと画面に切り分けて開発を行います。

- new logic git  https://github.com/hinodeyasuzuki/d62
- new view git  https://github.com/hinodeyasuzuki/diagnosis_view


エネルギー消費に関する簡単なアンケート入力をもとに、CO2排出量の分析を行い、約60項目のCO2排出削減対策の中から効果的なものを計算して提案するソフトです。
基本は家庭向けですが、小規模事業者の診断にも対応しています。
言語設定と地域用ロジックを変更することで、多言語・他地域の診断ソフトとして作ることができます。言語管理には、EXCELシートを利用しており、ソースコードが出力されます。

現在メンテナスを中止しており、新しいバージョンをまもなく別にリリースする予定です。(2020/09/06)

This program can advice how to reduce CO2 emission by some question about energy consumption. In this software over 60 measures is set, calculate each measures by input value, show adive fitted to home. It can be used for not only home but also small office.
You can make your area/language software by support of Excel file

I will release new version of diagnosis system soon.(2020/09/06)

## Demo
http://www.hinodeya-ecolife.com/diagnosis/?lang=ja	Japanese Default

You can design visual and diagnosis flow. such as...

http://www.hinodeya-ecolife.com/diagnosis/?v=0&lang=en　detail diagnosis(english)

http://www.hinodeya-ecolife.com/diagnosis/?v=1&lang=en　button desgin

http://www.hinodeya-ecolife.com/diagnosis/?v=2&lang=en　one page diagnosis

http://www.hinodeya-ecolife.com/diagnosis/?v=3&lang=en　easy desgin

http://www.hinodeya-ecolife.com/diagnosis/?v=4&lang=en　information about diagnosis


## Install develop environment
In order to pack js files, you need commandline PHP and MS-Excel

php files are used as parameters set, if you want to execute listricted pattern of diagnosis, you can save as .html file.

## folder and files
index.php   access file in oder to manage develop/release, language, etc.

init_home.php, init_office.php  parameters set for home/office

parameters.php  default parameters set

/d6/      main logic files, commonly used for each language / views

/view/    design inculde template, css and js as action. there is 8 types of view in original.

/localize_**/  localized files set in this folder to config each diagnosis system


## making your area/language system 
### step1)EXCEL setting
The base advice algolism is set for Japan. 

You can fill efficent equipment, price, adive message, subsidy information, question text, select options, in order to fit your area and language. And also set messages in your language.

### step2)copy excel sheet to /localize_**/language_set.php, /localize_**/home/senario_fix.js

 ** is your country code and language code. Please copy code from excel to program files.

### step3)configure parameter.php

 add new language code if you need. 

### step4) access and check



## logig priority

### measure

1. prohibited in localize_**/view/**_home_n.js
2. modified in localize_**/home/senariofix.js, which is defined in Excel file
		- set measure name as #, which means do not show
3. modified in localize_**/home/consCC.js calcMeasure() function
		- override or add calculation functions
		- set another prohibit status
4. see calculation funciton in common function d6/home/calcCC.js
		
## Third party tools
* jQuery JavaScript Library: Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
* leanModal v1.1 by Ray Stone - http://finelysliced.com.au
* jQuery Cookie Plugin v1.4.1: Copyright 2006, 2014 Klaus Hartl
* Chart.js http://chartjs.org/ Version: 2.0.2: Copyright 2016 Nick Downie
* d3/d3.js Copyright 2010-2017 Mike Bostock
* PMSI-AlignAlytics/dimple: Copyright 2015 AlignAlytics http://www.align-alytics.com
* php-packer: originally created by Dean Edwards, ported to PHP by Nicolas Martin. Packed for composer and slightly extended by Thomas Lutz.
* intro.js : introjs.com
 

## copyright
Copyright 2011－2018（C） Yasufumi Suzuki, Hinodeya Insititute for Ecolife co.Ltd.
Released under the MIT license



