<?php // set to Language/*.php ========================



//----------system title-----------------------------------------------
$lang["code"]='fr';
$lang['home_title']='Diagnostic d\'économie d\'énergie domestique';
$lang['home_joy_title']='Diagnostic d\'économie d\'énergie de la maison (facilité facile)';

$lang['countfix_pre_after']='1';

//--energy -----------------
$lang["show_electricity"]='TRUE';
$lang["show_gas"]='TRUE';
$lang["show_kerosene"]='TRUE';
$lang["show_briquet"]='FALSE';
$lang["show_area"]='TRUE';
$lang["show_gasoline"]='TRUE';

$lang["electricitytitle"]='Électrique';
$lang["gastitle"]='gaz';
$lang["kerosenetitle"]='kérosène';
$lang["briquettitle"]='Briquettes';
$lang["areatitle"]='Chauffage urbain';
$lang["gasolinetitle"]='de l\'essence';
$lang["electricityunit"]='kWh';
$lang["gasunit"]='m3';
$lang["keroseneunit"]='L';
$lang["briquetunit"]='kg';
$lang["areaunit"]='MJ';
$lang["gasolineunit"]='L';

//--common unit-----------------
$lang['point_disp']='function(num) {return num + "points"};';

$lang["priceunit"]='Euro';
$lang['co2unit']='kg';
$lang['energyunit']='GJ';
$lang['monthunit']='moice';
$lang['yearunit']='an';

//--common page-----------------
$lang["startPageName"]='Dans l\'ensemble (simple)';
$lang['header_attension']='(Il n\'y a pas de garantie de la valeur numérique proposée car il s\'agit d\'un modèle d\'opération. Vous pouvez développer selon vos besoins.)';
$lang["dataClear"]='Supprimez toutes les données d\'entrée. Ça va.?';
$lang["savetobrowser"]='Il a été enregistré dans le navigateur.';
$lang["savedataisshown"]='Les valeurs enregistrées sont les suivantes.';

//--question page-----------------
$lang["QuestionNumber"]='function(numques, nowques) {return  "（" + nowques + " sur " + numques + " questiones）"};';


//--compare-----------------
$lang["youcall"]='toi';
$lang["youcount"]='Ménage';
$lang["totalhome"]='Tout le ménage';
$lang["comparehome"]='function(target) {return "La même taille de ménage "+target+"Accueil"};';


$lang["rankin100"]='function(count) {return "Le rang est " + count +" dans les 100."};';


$lang["rankcall"]='';
$lang["co2ratio"]='function(ratio) {return "L\'émission de CO2 est" + ratio +"fois par rapport à la moyenne"};';


$lang["co2compare06"]='C\'est beaucoup moins que la moyenne. C\'est une très belle vie.';
$lang["co2compare08"]='Il est inférieur à la moyenne. C\'est une vie merveilleuse.';
$lang["co2compare10"]='C\'est à peu près le même niveau que la moyenne.';
$lang["co2compare12"]='C\'est un peu plus élevé que la moyenne. Il semble y avoir beaucoup de place pour réduire les coûts des services publics en raison de l\'amélioration.';
$lang["co2compare14"]='C\'est plus grand que la moyenne. Il semble y avoir beaucoup de place pour réduire les coûts des services publics en raison de l\'amélioration.';
$lang["rankcomment"]='function(same,youcount,rank) {return "est 100, en ce sens que votre rang est #" + youcount + "<br>"};';





//itemize-----------
$lang["itemize"]='Panne';
$lang["itemname"]='Champ';
$lang["percent"]='Pourcentage (%)';
$lang["measure"]='Les mesures';
$lang["merit"]='Bonne qualité';
$lang["select"]='Choix';
$lang["itemizecomment"]='function(main3,sum) {return main3+" sont une grande source et dans les trois champs que vous émettez " + sum+"% de CO2. Ces grandes mesures sur le terrain sont efficaces."};';



//--result-----------------
$lang["effectivemeasures"]='Mesures efficaces';
$lang["comment_combined_reduce"]='function(percent,fee,co2) {return "　Lorsqu\'il est combiné  " + percent+"% annuel " + ( hidePrice != 1  ? fee +"yen du coût de l\'utilité et ":"") + co2+"kg de CO2 peut être réduit. Si vous travaillez déjà, cela signifie que vous faites une éco-vie qui ne produira que ces résultats."};';




$lang["titlemessage"]='function(title) {return  title+" les efforts sont efficaces."};';

$lang["co2reduction"]='function(co2) {return "Annuele " + co2+"kg de CO2 peut être réduit."};';


$lang["reducepercent"]='function(name,percent) {return "cela équivaut à réduire "+ name+" pour " +percent+"%  " };';



$lang["co2minus"]='Vivre sans émissions de CO2 peut être atteint.';
$lang["error"]='* C\'est une estimation approximative car il n\'y a pas d\'entrée détaillée.';

$lang["feereduction"]='function(fee) {return "Vous pouvez enregistrer" + fee+"yen par an."};';


$lang["feenochange"]='Il n\'y a pas de changement dans les dépenses d\'utilité, etc.';

//result payback----------------------------
$lang["initialcost"]='function(price,lifetime,load) {return "Pour acheter neuf, cela coûte environ" + price+" " + lifetime+"année de vie, votre coût total sera "+ load+"yen par an."};';




$lang["payback"]='function(change,totalchange,down) {return "D\'autre part, le coût de l\'utilité sera enregistré pour " + change+ "yen par an, donc le fardeau total sera" + totalchange +(down?"yen, vous pouvez économiser chaque année au total.":"" )};';




$lang["payback1month"]='Vous pouvez revenir dans un mois.';
$lang["paybackmonth"]='function(month) {return "Vous pouvez revenir dans " + month+" mois."};';


$lang["paybackyear"]='function(year) {return "Vous pouvez revenir sur " + year+"an."};';


$lang["paybacknever"]='En outre, il est impossible de prendre la valeur d\'origine avec le montant de la réduction des coûts de l\'utilité par la durée de vie des produits.';
$lang["notinstallfee"]='function(fee) {return "Le coût de l\'utilité sera" + fee+"yen moins cher."};';



//monthly-----------
$lang["monthlytitle"]='Coût d\'utilité estimé par mois';
$lang["month"]='Mois';
$lang["energy"]='énergie';


//----------buttons -----------------------------------------------
$lang['button_clear']='Clair';
$lang['button_savenew']='Nouveau stockage';
$lang['button_save']='Enregistrer';
$lang['button_open']='Ouvrir';
$lang['button_close']='Fermer';
$lang['button_showall']='Tout afficher';
$lang["add"]='ajouter';

$lang['button_menu']='munu';
$lang['button_back_toppage']='Retour à la première page';
$lang['button_back']='Retour';
$lang['button_prev']='Précédent';
$lang['button_next']='Suivant';

$lang['button_top']='Haut de page';
$lang['button_input']='Entrée actuelle du statut';
$lang['button_queslist']='Liste de questions';
$lang['button_diagnosis']='Écran de diagnostic';
$lang['button_measures']='Mesurer la contrepartie';
$lang['button_selectcategory']='Paramètre du champ d\'évaluation';
$lang['button_calcresult']='Résultat de calcul';
$lang['button_about']='Commentaire';
$lang['button_fullversion']='Version pleine fonction';
$lang['clear_confirm']='Mode Liste';

$lang['button_co2emission']='Emissions de CO2';
$lang['button_firstenergy']='Quantité d\'énergie primaire';
$lang['button_energyfee']='Frais d\'utilité publique';


//---- 1 button mode -----------
$lang['home_button_intro1']='Nous proposons des mesures efficaces d\'économie d\'énergie en fonction de l\'équipement énergétique dans votre maison et de l\'utiliser. Il y a environ 20 questions sur l\'utilisation de l\'énergie à la maison. Il suffit de répondre aux questions, donc, si vous répondez, vous pouvez proposer des mesures appropriées à votre domicile.';
$lang['home_button_intro2']='L\'information que vous entrez ne peut être visualisée que par votre terminal, elle ne s\'accumule pas sur le serveur.';
$lang['home_button_startdiagnosis']='Début du diagnostic';
$lang['home_button_about']='A propos de ce diagnostic';
$lang['home_button_result']='Voir les résultats';
$lang['home_button_retry']='Réponds à nouveau';
$lang['home_button_average']='Comparaison moyenne';
$lang['home_button_monthly']='Changement mensuel';
$lang['home_button_measure']='Mesures efficaces';
$lang['home_button_resultmessage']='Nous comparons la moyenne avec un graphique. L\'effet lors de l\'exécution de \'mesures efficaces\' s\'affiche dans le graphique du milieu.';
$lang['home_button_measuremessage']='Une liste des contre-mesures efficaces. Si vous sélectionnez \'Sélectionner\', l\'effet sera affiché dans le graphique.';
$lang['home_button_pagemessage']='Vous pouvez répondre en détail en spécifiant le champ. Vous pouvez ajouter des pièces et du matériel avec \'Ajouter\'.';



//---------- 2 focus mode page -----------------------------------------------
$lang['home_focus_title_after']='Mode Liste';

$lang['intro1']='Bienvenue sur un nouveau logiciel de diagnostic d\'économie d\'énergie (D6). En saisissant comment utiliser l\'énergie maintenant, vous pouvez calculer et proposer des mesures efficaces d\'économie d\'énergie.';
$lang['intro2']='Pour autant que vous le compreniez, choisissez comment utiliser l\'énergie actuelle. Je ne me dérange pas si je m\'en fiche, ignore toute question que je ne comprends pas.';
$lang['intro3']='Les résultats d\'analyse selon l\'entrée sont affichés à tout moment.';
$lang['intro4']='C\'est un résultat d\'estimation qui a analysé les émissions de CO2 par but. La gauche est votre situation actuelle. Le droit montre une famille similaire (opérateur commercial) comme comparaison. Le centre affiche des résultats de réduction lorsque les mesures sont sélectionnées.';
$lang['intro5']='Je trace la facture des services publics par mois.';
$lang['intro6']='Des mesures efficaces d\'économie d\'énergie sont affichées de temps en temps. Cliquez sur le titre pour expliquer en détail. Un ★ rentable est une mesure qui peut prendre l\'original même s\'il y a un coût d\'achat. Si vous cliquez sur la colonne de droite et sélectionnez-la, le résultat dans le cas des contre-mesures sera reflété dans le graphique du milieu.';
$lang['intro7']='Vous pouvez enregistrer les informations d\'entrée dans le navigateur.';
$lang['intro8']='Cet écran est limité à environ 20 éléments, mais vous pouvez également effectuer un diagnostic détaillé. Appuyez sur [Terminé] immédiatement pour commencer le diagnostic.';

//---------- 3 easy mode page -----------------------------------------------
$lang['home_easy_title']='Eco-check facile pour une vie confortable';
$lang['home_easy_step1']='Une question';
$lang['home_easy_step2']='Comparaison';
$lang['home_easy_step3']='Caractéristique';
$lang['home_easy_step4']='Mesures';
$lang['home_easy_toptitle']='Pourquoi n\'essayez-vous pas de réduire la facture d\'électricité de la maison?';
$lang['home_easy_top1']='L\'économie d\'énergie est mal comprise au Japon. Il ne s\'agit pas de «supporter» mais d\'enrichir votre vie. Les coûts de la lumière et de la chaleur sont peu coûteux, la vie devient confortable, ce sera aussi pour les futurs enfants.';
$lang['home_easy_top2']='Six questions vous diront quelles mesures ont été bonnes pour votre vie. Veuillez essayer Eco-Check en 3 minutes.';
$lang['home_easy_top3sm']='※ C\'est complètement gratuit. Vous n\'avez pas besoin de saisir des informations pour vous identifier, comme le nom ou l\'adresse électronique.';
$lang['home_easy_top_button_start']='Début du diagnostic';
$lang['home_easy_top_button_about']='Commentaire';

$lang['home_easy_p5title']='Veuillez répondre à  questions';
$lang['home_easy_p5_1']='Choisissez l\'option qui s\'applique à peu près. Si vous ne comprenez pas, vous n\'avez pas à répondre.';
$lang['home_easy_p5_button_next']='Voir les résultats';

$lang['home_easy_p2title']='Comparé aux ménages moyens';
$lang['home_easy_p2_button_next']='Je clarifierai la grande cause';

$lang['home_easy_p3title']='Caractéristiques de votre vie';
$lang['home_easy_p3_1']='C\'est l\'analyse de l\'émission de CO2. La gauche vous montre, la droite montre la valeur standard de la maison dont l\'état vous ressemble.';
$lang['home_easy_p3_button_next']='Mesures recommandées ici';
$lang['home_easy_p4title_pre']='';
$lang['home_easy_p4title_after']=' Mesures recommandées';
$lang['home_easy_p4_button_next']='Les mesures les plus recommandées';
$lang['home_easy_p4_1']='C\'est une mesure d\'économie d\'énergie recommandée adaptée à votre domicile. Cliquez sur le titre pour expliquer en détail. Le ★ mark of profit est une mesure qui peut prendre l\'original même s\'il y a un coût d\'achat.';
$lang['home_easy_p4_2']='C\'est une estimation approximative. Avec un diagnostic détaillé, vous pouvez faire des suggestions qui vous conviennent mieux.';
$lang['home_easy_p4_button_next2']='Un diagnostic plus détaillé peut être fait ici';
$lang['home_easy_p4_button_next3']='Penser à remplacer les appareils ménagers';
$lang['home_easy_measure_show']= 'function(num) {return "Afficher les recommandations à "+ num + "th"};';


//--5 maintenance page-----------------
$lang['home_maintenance_message']='Les mesures que vous avez sélectionnées sont les suivantes. Travaillez-vous dessus?';
$lang['home_maintenance_list']='Mesures sélectionnées';
$lang['home_maintenance_selected']='J\'ai choisi cette contre-mesure';

//-- 6 action page-----------------
$lang['home_action_title']='Eco-vérifier facile pour la vie à faible teneur en carbone';
$lang['home_action_step1']='Une question';
$lang['home_action_step2']='Évaluation';
$lang['home_action_step3']='Mesures';
$lang['home_action_toptitle']='Visez la maison à faible teneur en carbone';
$lang['home_action_top1']='Peut réduire';
$lang['home_action_top2']='D\'une manière simple';
$lang['home_action_axis1']='Durabilité';
$lang['home_action_axis2']='Équipement d\'économie d\'énergie';
$lang['home_action_axis3']='Comportement d\'économie d\'énergie';
$lang['home_action_label1']='C\'est merveilleux!';
$lang['home_action_label2']='Un peu d\'accord';
$lang['home_action_label3']='Un peu désolé';
$lang['home_action_good_point']='Un peu d\'accord';
$lang['home_action_bad_point']='Un peu désolé';

//--99 list page-----------------
$lang['home_list_message']='Choisissez la contre-mesure qui vous convient parmi celles-ci';

//--createpage-----------------

$lang["younow"]='Statut actuel';
$lang["youafter"]='Après les mesures';
$lang["average"]='moyenne';
$lang["compare"]='Comparaison';
$lang["comparetoaverage"]='';
$lang["co2emission"]='Emissions de CO2';
$lang["co2reductiontitle"]='Effet de réduction de CO2';
$lang["fee"]='Coûts des services publics';
$lang["feereductiontitle"]='Réduction du coût de l\'utilité';
$lang["initialcosttitle"]='Montant de l\'investissement initial';
$lang["loadperyear"]='Montant du fardeau annuel';
$lang["primaryenergy"]='Consommation d\'énergie primaire';
$lang["ohter"]='Autre';



//----------for office -----------------------------------------------
$lang['office_title']='Diagnostic facile d\'économie d\'énergie dans les établissements commerciaux';
$lang["officecall"]='Votre entreprise';
$lang["officecount"]='Bureau';
$lang["totaloffice"]='Ensemble complet';
$lang["officenow"]='Statut actuel';
$lang["compareoffice"]='function(target) {return "Sur la même échelle" + target};';


$lang['button_demand']='Demande';

