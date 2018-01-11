開発者向け技術情報

2017年8月14日
有限会社ひのでやエコライフ研究所　鈴木靖文

■■開発環境・言語
EXCEL		診断設定値定義用
PHP			多様な診断モード変更、ログ吐き出し
JavaScript	メインロジック web workerを使用可能

　データはブラウザに保存され、サーバー側には一切保存されません。
　デザイン部分を除き、D6の計算ロジックだけを取り出すことが可能
     main.js(I/O)　-　d6facade.js（D6窓口）で連携。ここでweb workerが切り分けられる。


■■フォルダ構成

index.php			起動ソース
init_office.php		事業所診断時に読み込まれるファイル
  +D6				ロジックソース
	+base				診断共通ロジック
	+china				中国での診断設定
	+japan				日本での診断設定
	 d6facade.js		D6計算ロジック窓口処理ファイル
  +language			言語（翻訳記述）ファイル
	 *.php				PHP（基本デザイン、ボタン名設定） *は言語コード（現在2種類）
	 *_view.js			VIEWで使用するJSによる設定
	 *_about.html		解説（各言語）
  +view				HtmlおよびI/O一式
	+css				CSSファイル
	+forcussetting		質問・対策限定などの設定（診断画面、種類ごと）
		*_home_#.js			言語、home/office、画面種類ごとに切り替え
	+view_*				画面種類ごとの設定　*は画面種コード（現在4種類）
 		onclick_*.js		動作に関する評価
 		layout_*.css		デザインに関する評価
 		template_*.css		テンプレート
    +jstools			その他JSファイル
		createpage.js		一覧表作成
		graph.js			グラフ作成
		d3
