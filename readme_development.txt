3 level of Fix Method

/parameters.php --------------------------
  get parameters setting.
  if you don't need change paramters any more and no need to log by php, access this page and save as html file.


/localize_**/language_set.php ------------------------
  set translation make definition with excel file.

/localize_**/view/* ------------------------
/localize_**/home/* ------------------------
/localize_**/areaset/* ------------------------
  set localization definition with excel file.



■基本構造
・国のコード XXを決める
・ベースとなるlocalize_XX をコピーする
・localize_XX/view/ のファイル名のコードを変換する
・index.php の82行目以降の $countryListに追記する

■EXCELの翻訳
・excel_setting/のベースとなる EXCELをコピーする（現在はver3)
・単純変換はgoogle spreadsheetで行う
  https://docs.google.com/spreadsheets/d/1gVPuOqPBAr4vO3NZI_52GZ1Aq96GuwPN31c8e8fDfrc/edit#gid=856039961
  inputシートのA1セルに言語を設定すると、全ての項目を翻訳してくれる
  ・field
  ・item
  ・input       ※単位は「1円」などとして翻訳し、1を戻す
  ・measures
  ・language    ※関数になっている場合には変数名も翻訳されるので戻す TODO
  ・scenariofix ※これは直接 localize_XX/home/scenariofix.jsに書き込む

  ※関数部分でエラーが発生しやすいので注意

■地域設定
  ・国の中で気候が異なる数か所を選んで設定する。日本の都市として近いものを選ぶ
  ・localize_XX/area/area.jsに設定する
    ・prefName
    ・prefHeatingLevel
    ・prefTemplature
    ・seasonMonth 平均的な季節の月数の設定
    ・prefKakeiEnergy
    ・prefHotWaterPrice
    ・prefSeasonFactorArray

■集約処理の設定 Gruntfile.js
・他の地域設定にならって、集約ファイルを設定する
(node.jsは d6_uchieco/uchieco_logic からもってくる)

■標準値の設定
・特に冷暖房時間など、標準を変えておかないと無記入時に、地域に合わない値となる

■地域に合わせた機器等の設定
・通貨の設定
・平均的光熱費の設定
・その地域で選ぶことができる機器・対策の選択（現地調査）
・選択肢の範囲（現地調査）


■その他
・about.htmlなどは個別に翻訳する必要がある

■実行・テスト
&pm=1でテスト
&pm=5で正式実行（圧縮ファイル）
lang=XXで国指定


---------------------------------------------------------------
                             [Base computing] - [Base Measures list] - [Base Question] - [Base user interface]

1.translation(google)                                  *                   *
2.local data set(web search)         *
3.translation(natives)                                 *                   *
4.local energy/equipment(natives)    *                 *                   *
5.fit usage(natives)                 *                                     *                     *




