<?php
/*
 *　ログイン管理 画面操作システム
 * 
 * SQLiteを使ってユーザによるID管理を行うシステム。管理者はない。
 * 登録・パスワード再発行・メールアドレス（ID）変更等が、メールへのコード送信で行う
 * パスワードだけでなく、メールアドレスもハッシュ化
 * 
 * デザイン（テンプレート）: userlogin.html
 * データベース処理関数・設定：init.php
 * 
 * URL							$page（テンプレート）		機能
 * ./?mode=login				login						ログイン
 * ./?mode=logout				logout						ログアウト
 * ./?mode=create				create						ユーザ登録
 * ./?mode=createconfirm		createconfirm/createcomplete	（ユーザ登録のコード入力）
 * ./?mode=reminder				reminder					パスワード再発行
 * ./?mode=reminderconfirm		reminderconfirm/remindercomplete（パスワード再発行のコード入力）
 * ./?mode=changepassword		changepassword				パスワード変更
 * ./?mode=mailchange			mailchange					メール変更
 * ./?mode=mailchangeconfirm	mailchangeconfirm/mailchangecomplete（メール変更のコード入力）
 * 
 * 
 */

include "init.php";
$userClass = new userClass();

$mode = isset($_GET["mode"]) ? $_GET["mode"] : "login";

switch( $mode ) {
	case "logout":
		if ( !$userClass->is_login() ) {
			$page = "login";
		}
		$error = $userClass->db_logout();
		$page = "logout";
		break;
		
	case "create":
		if ( $userClass->is_login() ) {
			$page = "login";
		}
		$page = "create";
		if ( isset( $_POST["reg"] ) ) {
			if ( isset( $_POST["email"] ) && isset( $_POST["confirm"] ) ) {
				if ( ( $error = $userClass->check_mailaddress($_POST["email"]) ) == "OK" && $_POST["confirm"] == 1 ) {
					if ( ( $error = $userClass->db_createuser($_POST["email"]) ) == "OK" ) {
						$page = "createconfirm";
					}
				}
			} else {
				$error = "入力が不適切でした。再度やりなおしてください。";
			}
		}
		break;

	case "createconfirm":
		if ( $userClass->is_login() ) {
			$page = "login";
		}
		$page = "create";
		if ( isset( $_POST["email"] ) && isset( $_POST["password"] ) && isset( $_POST["password2"] ) && isset( $_POST["mailcode"] ) ) {
			if ( ( $error = $userClass->db_createconfirm( $_POST["email"], $_POST["password"], $_POST["password2"], $_POST["mailcode"] ) ) == "OK" ) {
				$page = "createcomplete";
			}
		} else {
			$error = "入力が不適切でした。最初からやりなおしてください。";
		}
		break;

	case "reminder":
		if ( $userClass->is_login() ) {
			$page = "login";
		}
		$page = "reminder";
		if ( isset( $_POST["email"] ) ) {
			if ( ( $error = $userClass->check_mailaddress($_POST["email"]) ) == "OK" ) {
				if ( ( $error = $userClass->db_reminder($_POST["email"]) ) == "OK" ) {
					$page = "reminderconfirm";
				}
			}
		}
		break;

	case "reminderconfirm":
		if ( $userClass->is_login() ) {
			$page = "login";
		}
		$page = "reminder";
		if ( isset( $_POST["email"] ) && isset( $_POST["password"] ) && isset( $_POST["password2"] ) && isset( $_POST["mailcode"] ) ) {
			if ( ( $error = $userClass->check_mailaddress($_POST["email"]) ) == "OK" ) {
				if ( ( $error = $userClass->db_reminderconfirm( $_POST["email"], $_POST["password"], $_POST["password2"], $_POST["mailcode"] ) ) == "OK" ) {
					$page = "remindercomplete";
				}
			}
		}
		break;

	case "changepassword":
		if ( !$userClass->is_login() ) {
			$page = "login";
		}
		$page = "changepassword";
		if ( isset( $_POST["reg"] ) ) {
			if ( isset( $_POST["nowpassword"] ) && isset( $_POST["password"] ) && isset( $_POST["password2"] )  ) {
				if ( ($error = $userClass->db_changepassword( $_POST["nowpassword"], $_POST["password"], $_POST["password2"] ) ) == "OK" ) {
					$page = "changepasswordcomplete";
				}
			} else {
				$error = "入力が不適切でした。";
			}
		}
		break;

	case "mailchange":
		if ( !$userClass->is_login() ) {
			$page = "login";
		}
		$page = "mailchange";
		if ( isset( $_POST["reg"] ) ) {
			if ( isset( $_POST["email"] ) && isset( $_POST["confirm"] ) ) {
				if ( ( $error = $userClass->check_mailaddress($_POST["email"]) ) == "OK" && $_POST["confirm"] == 1 ) {
					if ( ( $error = $userClass->db_mailchangeuser($_POST["email"]) ) == "OK" ) {
						$_SESSION[$appname]["newmailaddress"] =  $_POST["email"];
						$page = "mailchangeconfirm";
					}
				}
			} else {
				$error = "入力が不適切でした。再度やりなおしてください。";
			}
		}
		break;

	case "mailchangeconfirm":
		if ( !$userClass->is_login() ) {
			$page = "login";
		}
		$page = "mailchange";
		if ( isset( $_POST["password"] ) && isset( $_POST["mailcode"] ) && isset( $_SESSION[$appname]["newmailaddress"]) ) {
			if ( ( $error = $userClass->db_mailchangeconfirm( $_SESSION[$appname]["email"], $_POST["password"], $_POST["mailcode"],$_SESSION[$appname]["newmailaddress"] ) ) == "OK" ) {
				$page = "mailchangecomplete";
				unset( $_SESSION[$appname]["newmailaddress"] );
			}
		} else {
			$error = "入力が不適切でした。最初からやりなおしてください。";
		}
		break;


	case "login":
	default:
		if ( $userClass->is_login() ) {
			$page = "login";
		}
		if ( isset( $_POST["email"] ) && isset( $_POST["password"] ) ) {
			$error = $userClass->db_login( $_POST["email"] ,hash("sha256", $_POST["password"] ));
		}
		if ( $userClass->is_login() ) {
			$page = "logincomplete";
		} else {
			$page = "login";
		}
		break;
}

include "userlogin.html";

?>