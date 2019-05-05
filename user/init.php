<?php
/* DB用初期設定・model関連関数
 * 
 * SQLiteを使ってユーザによるID管理を行うシステム。管理者はない。
 * index.phpとuserlogin.htmlで、ユーザインターフェースが実装されている。
 * 
 *  $_SESSION[$appname]["email"] ユーザid
 * 
 *
 *  is_login() 	true/false
 *
 *  get_profile($key)			save as hash
 *  set_profile($key,$value)
 *  get_data($key)
 *  set_data($key,$value)
 *
 */
if ( !isset($config) ) $config = [];

$config["appname"] = "d6_1708";				//セッションの重複を避けるためのコード
$config["sitetitle"] = "家庭の省エネ診断";

//保存ファイルの設定
if( strcmp($_SERVER['HTTP_HOST'] , 'localhost') == 0 ){
	$config["basefolder"]  = "D:/txt/www/d6/";
	$config["baseurl"] = "http://localhost/d6/";
	$config["topurl"]  = $config["baseurl"] . "base/";
}else{
	$config["basefolder"]  = "/home/hinodeya-ecolife/diagnosis/";
	$config["baseurl"] = "https://www.hinodeya-ecolife.com/diagnosis/";
	$config["topurl"]  = $config["baseurl"] . "base/";
}

//DBの設置場所：WEBアクセスがされない場所が望ましい
$config["dbfolder"] = "D:/txt/www/d6/user/";
$config["dbname"] = "d6user.db";


session_start();
$appname = $config["appname"];
if ( !isset($_SESSION[$appname]) ) $_SESSION[$appname] = [];
if ( !isset($_SESSION[$appname]["login"]) ) $_SESSION[$appname]["login"] = false;

class userClass
{
	function __construct() {
	}

	//ログインしているか状態を返す　true/false
	public function is_login() {
		global $config;
		return $_SESSION[$config["appname"]]["login"];
	}

	//データのkeyの値を設定する
	public function set_data( $key, $value ) {
		$this->set_common( $key, $value, "data" );
	}

	//プロフィールのkeyの値を設定する
	public function set_profile( $key, $value ) {
		$this->set_common( $key, $value, "profile" );
	}

	//データのkeyの値を返す
	public function get_data( $key ) {
		return $this->get_onekeydata( $key, "data" );
	}

	//プロフィールのkeyの値を返す
	public function get_profile( $key ) {
		return $this->get_onekeydata( $key, "profile" );
	}

	//データを配列で返す
	public function get_dataarray() {
		return $this->get_getarray( "data" );
	}

	//プロフィールを配列で返す
	public function get_profilearray() {
		return $this->get_getarray( "profile" );
	}

	//キーの文字を制限
	private function sanitizekey( $key ) {
		$key = trim(mb_convert_kana($key, 'as', 'UTF-8'));
		// 半角英数字 - _ 以外の文字列は除去
		$hankaku = preg_replace('/[^a-zA-Z0-9_-]/', '', $key);
		return $hankaku;
	}

	//キー値を置き換え・追加
	private function set_common( $key, $value, $column ) {
		global $config;
		$appname = $config["appname"];
		$email = $_SESSION[$appname]["email"];
		$key = $this->sanitizekey( $key );

		//保存すべきデータ
		$savedata = $key . ":" . base64_encode( $value );
		//保存データの取得
		$data = $this->get_onecolumn( $column );
		//置換部位の特定
		$arr = explode( ",", $data );
		$fg_replace  = false;
		foreach( $arr as $i => $onedata ) {
			$kv = explode( ":", $onedata );
			if ( $key == $kv[0] ) {
				$arr[$i] = $savedata;
				$fg_replace = true;
				break;
			}
		}
		if ( !$fg_replace ) {
			array_push( $arr, $savedata );
		}
		//再結合
		$data = implode( "," , $arr );

		//データ保存
		$db = $this->db_pdo();
		$sql = "UPDATE user SET " . $column . "='" . $data . "' WHERE email='" . hash("sha256", $email) . "'";
		
		return $results = $db->query($sql);
	}

	private function get_getarray( $column ) {
		$data = $this->get_onecolumn( $column ) ;
		$arr = explode( ",", $data );
		$ret = [];
		foreach( $arr as $onedata ) {
			if ( $onedata ) {
				$kv = explode( ":", $onedata );
				$ret[$kv[0]] = base64_decode($kv[1]);
			}
		}
		return $ret;
	}

	//$keyに対応する文字列を取得
	private function get_onekeydata( $key, $column ) {
		$key = $this->sanitizekey($key);

		$data = $this->get_onecolumn( $column ) ;
		$arr = explode( ",", $data );
		foreach( $arr as $onedata ) {
			$kv = explode( ":", $onedata );
			if ( $key == $kv[0] ) {
				return base64_decode( $kv[1] );
			}
		}
		return "";
	}

	//生データkey=base64　が連結した文字列を取得
	private function get_onecolumn( $column ) {
		global $config;
		$appname = $config["appname"];
		$email = $_SESSION[$appname]["email"];

		$db = $this->db_pdo();

		$sql = "SELECT data,profile FROM user WHERE email='" . hash("sha256", $email) . "'";
		$results = $db->query($sql);
		$result = $results->fetchAll();
		return  isset($result[0][$column]) ? $result[0][$column] : "";

	}

	//db構造
	//	id			unique
	//	email		login id	hash
	//	passoword	password hash
	//	mailcode	メール送信コード
	//	mailtime	メール送信時
	//	data		診断データ
	//	profile		他プロファイル


	//DB基本アクセス作成
	private function db_pdo() {
		global $config;
		$db =new PDO("sqlite:".$config["dbfolder"] .$config["dbname"], null, null);
		if (!$db) {
		   die('接続失敗です。'.$sqliteerror);
		}
		return $db;
	}


	//ログイン
	public function db_login( $email, $hashpassword ) {
		global $config;
		$db = $this->db_pdo();

		$sql = "SELECT id,data,profile FROM user WHERE email='" . hash("sha256", $email) . "' AND password='". $hashpassword ."'";

		if( !($results = $db->query($sql)) ) {
			return "ID（メールアドレス）かパスワードが適切でありません。";
		}
		$result = $results->fetchAll();
		if ( count($result ) != 1 ) {
			return "ID（メールアドレス）かパスワードが違っています。";
		}
		$sql = "UPDATE user SET last_login=" . time() . " WHERE email='" . hash("sha256", $email) . "'";
		if (!$db->query($sql)) {
	   		return "メール作成クエリーが失敗しました。";
		}

		$appname = $config["appname"];
		$_SESSION[$appname]["email"] = $email;
		$_SESSION[$appname]["hashpassword"] = $hashpassword;
		$_SESSION[$appname]["login"] = true;
		return "OK";
	}

	//ログアウト
	public function db_logout() {
		global $config;
		$appname = $config["appname"];
		$_SESSION[$appname]["email"] = "";
		$_SESSION[$appname]["hashpassword"] = "";
		$_SESSION[$appname]["login"] = false;
		return "OK";
	}

	//登録メールにコードをつけて送信
	public function db_createuser( $email ) {
		global $config;
		$db = $this->db_pdo();
		
		$mailcode = mt_rand( 111111, 999999 );
		$sql = "SELECT * FROM user WHERE email='" . hash("sha256", $email) . "' ";
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count($result) >= 1 ) {
			if ( $result[0]["password"] == "" ) {
				//有効でないユーザがある
				$sql = "UPDATE user SET mailcode=" . $mailcode . ", mailtime=" . time() . " WHERE email='" . hash("sha256", $email)  . "' ";
			} else {
				return "OK";		//ユーザ名を推測されないように送る
			}
		} else {
			//新規
			$sql = "INSERT INTO user (email, mailcode, mailtime) VALUES ( '". hash("sha256", $email) . "'," . $mailcode . "," . time() . ")";
		}
		if (!$db->query($sql)) {
	   		return "メールコード作成クエリーが失敗しました。";
		}

		$subject = $config["sitetitle"] . "ユーザ登録";
		$message = $config["sitetitle"] . "への登録ありがとうございます。登録依頼に基づいてメールを送信しています。\n\n";
		$message .= " 登録中の画面から、以下のコードを入力して、登録作業を進めてください。\n\n";
		$message .= "　コード（数値6桁）: " . $mailcode . "\n\n";
		$message .= " 心当たりがない場合には、申し訳ありませんが無視してください。\n";
		$message .= " ----------------------------------------\n";
		$message .= $config["sitetitle"] . "  " . $config["baseurl"] . "\n";
		mb_send_mail ( $email , $subject , $message  );
	  	return "OK";
	}

	// 送付されたコードで登録
	public function db_createconfirm( $email, $password, $password2, $mailcode ) {
		$db = $this->db_pdo();
		if ( $password != $password2 ) {
			return "パスワードが一致しません。";
		}
		$sql = "SELECT id, mailtime FROM user WHERE email='". hash("sha256", $email) . "'AND mailcode=" . (int)($mailcode) ;
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count($result) == 0 ){
	   		return '該当するアドレスがありません。';
		}
		if ( $result[0]["mailtime"] < time() - ( 3600 * 2 ) ) {
	   		return '有効期間外です。';
		}
		$sql = "UPDATE user SET password='" . hash("sha256", $password) . "', mailtime=0 WHERE email='". hash("sha256", $email) . "'";
		$results = $db->query($sql);
		return $this->db_login( $email, hash("sha256", $password) );	//ログイン
	}

	//リマインダーメールにコードをつけて送信
	public function db_reminder( $email ) {
		global $config;
		$db = $this->db_pdo();
		
		$mailcode = mt_rand( 111111, 999999 );
		$sql = "SELECT id FROM user WHERE email='" . hash("sha256", $email) . "'";
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count($result) == 0 ) {
			return "なし";	//ユーザ存在を確認できないように OK
		}

		$sql = "UPDATE user SET mailcode=" . $mailcode . ", mailtime=" . time() . " WHERE email='" . hash("sha256", $email) . "'";
		if (!$db->query($sql)) {
	   		return "メール作成クエリーが失敗しました。";
		}

		$subject = $config["sitetitle"] . "パスワード変更";
		$message = $config["sitetitle"] . "のパスワード変更依頼に基づいてメールを送信しています。\n\n";
		$message .= " 設定中の画面から、以下のコードを入力して、パスワード変更作業を進めてください。\n\n";
		$message .= "　コード（数値6桁）: " . $mailcode . "\n\n";
		$message .= " ----------------------------------------\n";
		$message .= $config["sitetitle"] . "  " . $config["baseurl"] . "\n";

		mb_send_mail ( $email , $subject , $message  );
		return "OK";
	}


	// 送付されたコードでパスワード変更
	public function db_reminderconfirm( $email, $password, $password2, $mailcode ) {
		$db = $this->db_pdo();
		if ( $password != $password2 ) {
			return "パスワードが一致しません。";
		}
		$sql = "SELECT id, mailtime FROM user WHERE email='". hash("sha256", $email) . "'AND mailcode=" . (int)($mailcode) ;
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count( $result ) == 0 ){
	   		return '該当するアドレスがありません。';
		}
		if ( $result[0]["mailtime"] < time() - ( 3600 * 2 ) ) {
	   		return '有効期間外です。';
		}
		$sql = "UPDATE user SET password='" . hash("sha256", $password) . "', mailtime=0 WHERE email='". hash("sha256", $email) . "'";
		if ( !($results = $db->query($sql) ) ){
	   		return '更新に失敗しました。';
		}
		return db_login( $email, hash("sha256", $password) );	//ログイン
	}

	// 送付されたコードで登録
	public function db_changepassword( $nowpassword, $password, $password2 ) {
		global $config;
		$appname = $config["appname"];

		$db = $this->db_pdo();
		if ( $password != $password2 ) {
			return "パスワードが一致しません。";
		}
		$sql = "SELECT id FROM user WHERE email='". hash("sha256", $_SESSION[$appname]["email"]) . "' AND password='" . hash("sha256", $nowpassword) . "'" ;
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count($result) == 0 ){
	   		return '現在のパスワードが間違っています。';
		}
		$sql = "UPDATE user SET password='" . hash("sha256", $password) . "', mailtime=0 WHERE email='". hash("sha256", $_SESSION[$appname]["email"]) . "'";
		if ( !($results = $db->query($sql) ) ){
	   		return '更新に失敗しました。';
		}
		return "OK";
	}


	//メール変更　コードをつけて送信
	public function db_mailchangeuser( $email ) {
		global $config;
		$appname = $config["appname"];

		$db = $this->db_pdo();
		
		$mailcode = mt_rand( 111111, 999999 );
		$sql = "SELECT * FROM user WHERE email='" . hash("sha256", $email) . "' ";
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count($result) >= 1 ) {
			return "すでに登録されています";
		}

		$sql = "UPDATE user SET mailcode=" . $mailcode . ", mailtime=" . time() . " WHERE email='" . hash("sha256", $_SESSION[$appname]["email"])  . "' ";
		if (!$db->query($sql)) {
	   		return "メールコード作成クエリーが失敗しました。";
		}

		$subject = $config["sitetitle"] . "メールアドレス変更";
		$message = $config["sitetitle"] . "のご利用ありがとうございます。登録依頼に基づいてメールを送信しています。\n\n";
		$message .= " 登録中の画面から、以下のコードを入力して、登録作業を進めてください。\n\n";
		$message .= "　コード（数値6桁）: " . $mailcode . "\n\n";
		$message .= " 心当たりがない場合には、申し訳ありませんが無視してください。\n";
		$message .= " ----------------------------------------\n";
		$message .= $config["sitetitle"] . "  " . $config["baseurl"] . "\n";
		mb_send_mail ( $email , $subject , $message  );
	  	return "OK";
	}

	// 送付されたコードで登録
	public function db_mailchangeconfirm( $email, $password, $mailcode, $newmail ) {
		$db = $this->db_pdo();
		$sql = "SELECT id, mailtime FROM user WHERE email='". hash("sha256", $email) . "' AND password='". hash("sha256", $password) . "' AND mailcode=" . (int)($mailcode) ;
		$results = $db->query($sql);
		$result = $results->fetchAll();
		if ( count($result) == 0 ){
	   		return '該当するアドレスがありません。';
		}
		if ( $result[0]["mailtime"] < time() - ( 3600 * 2 ) ) {
	   		return '有効期間外です。';
		}
		$sql = "UPDATE user SET email='" . hash("sha256", $newmail) . "', mailtime=0 WHERE email='". hash("sha256", $email) . "'";
		$results = $db->query($sql);
		return "OK";
	}


	//メールの有効性チェック
	public function check_mailaddress( $email ) {
		if (!preg_match("/^([a-zA-Z0-9])+([\+a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/", $email ) ){
			return "メールアドレスとして正しくありません。";
		}
		return "OK";
	}


	//************************ 以下必要時以外は有効にしない **********************************************

	//*** DB初期作成 ***
	public function db_databasecreate() {
		return;
		//only one time
		$db = $this->db_pdo();
		$sql = "create table user (id int autoincliment, email text, password text, mailcode int, mailtime int,data text, profile text, create_at int, last_login int)";

		if (!$db->query($sql)) {
	   		die('作成クエリーが失敗しました。'.$sqliteerror);
		}
	}


	//*** DBダンプ ***
	public function db_databasedump() {
		global $config;
		$appname = $config["appname"];

		if( !$this->is_login() ) {
			$db = $this->db_pdo();
			$sql = "SELECT * from user";

			if (!($result = $db->query($sql)) ) {
		   		die('作成クエリーが失敗しました。'.$sqliteerror);
			}

			//---表示-----
			echo "データベース値<br>";
			foreach( $result as $i => $data ) {
				echo "ID:" .$data["id"] . "　Email:" . substr($data["email"],0,5) . "　PW:" . substr($data["password"],0,5) . "　CD:" . $data["mailcode"]. "　MT:" . $data["mailtime"]. "　data:" . substr($data["data"],0,10). "　prof:" . substr($data["profile"],0,10) . "<br>";
			}

			echo "セッション値<br>";
			print_r($_SESSION);

		} else {
			$email = $_SESSION[$appname]["email"];
			echo "ユーザ：" . $email . "<br>";
			print_r( $this->get_profilearray() );
			echo "<br>データ<br>";
			print_r( $this->get_dataarray() );
		}
	}
}

