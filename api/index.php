<?php
	require 'vendor/slim/slim/Slim/Slim.php';
	\Slim\Slim::registerAutoloader();
	
	$app = new \Slim\Slim();
	$app->add(new \Slim\Middleware\SessionCookie(array(
		'expires' => '20 minutes',
		'path' => '/',
		'domain' => null,
		'secure' => false,
		'httponly' => false,
		'name' => 'slim_session',
		'secret' => 'CHANGE_ME',
		'cipher' => MCRYPT_RIJNDAEL_256,
		'cipher_mode' => MCRYPT_MODE_CBC
	)));
	
	define("nPuzzles", 2);
	
	function getDBConnection($connectionString, $user, $pwd) {
		try {
			return new PDO($connectionString, $user, $pwd);
		} catch(PDOException $e) {
			exit('Keine Verbindung: Grund - ' . $e->getMessage());
		}
	}
	
	define('HOST',"localhost");
	define('DBNAME',"geogame");
	define('USER',"root");
	define('PWD',"");
	
	header('Content-type:application/json; charset=utf-8');
	
	/*
		Start Routing Section
	*/
	
	$app->get('/pictures', function() {
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		//TODO: Login
		$user = array(
			'id' => 1, 
			'name' => 'rissi',
			'pwd' => 'teeest',
			'token' => 'hjhfzufljnu8655556vdjfhg'
		);
		
		$selection = $db->prepare('SELECT * FROM playround WHERE userid = '.$user['id'].' AND Finished = 0');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		if(sizeof($results) > 0) {
			$playround = $results[0];
		} else {
			//1. create playround (linked to user)
			$insertion = $db->prepare('INSERT INTO playround (UserID, StartDate, Finished) VALUES (:userid, :startdate, :finished)');
			$insertion->bindParam(':userid', $userid);
			$insertion->bindParam(':startdate', $startdate);
			$insertion->bindParam(':finished', $finished);
			$userid = $user["id"];
			//date format 2016-05-30 00:00:00
			$startdate = date('Y-m-d H:i:s');
			$finished = 0;
			
			$success = $insertion->execute();
			
			if(!$success) {
				$errorjson = array();
				$errorjson["message"] = "Playround could not be created";
				echo json_encode($errorjson);
				die();
			} 
			
			$selection = $db->prepare('SELECT * FROM playround WHERE userid = '.$user['id'].' AND Finished = 0');
			$success = $selection->execute();
			$results = $selection->fetchAll(PDO::FETCH_ASSOC);
			$playround = $results[0];
			
			$playroundid = $playround["ID"];
			//2. get all locations (ordered by rand)
			$selection = $db->prepare('SELECT * FROM location ORDER BY RAND()');
			$success = $selection->execute();
			$locations = $selection->fetchAll(PDO::FETCH_ASSOC);
			
			if(sizeof($locations) < nPuzzles) {
				$errorjson = array();
				$errorjson["message"] = "Too less locations in db";
				echo json_encode($errorjson);
				die();
			}
			
			//3. create n puzzles (linked to playround and 1 random location)
			for($i = 0; $i < nPuzzles; $i++) {				
				$insertion = $db->prepare('INSERT INTO puzzle (PlayroundID, LocationID) VALUES (:playroundid, :locationid)');
				$insertion->bindParam(':playroundid', $playroundid);
				$insertion->bindParam(':locationid', $locationid);
				$locationid = $locations[$i]["ID"];
				
				$success = $insertion->execute();
				
				if(!$success) {
					$errorjson = array();
					$errorjson["message"] = "Puzzle $i could not be created";
					echo json_encode($errorjson);
					die();
				}
			}
			
		}
		$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = '.$playround['ID']);
		$success = $selection->execute();
		$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
		
		$puzzlesWithLocation = array();
		foreach($puzzles as $index => $row) {
			$selection = $db->prepare('SELECT * FROM location WHERE id = '.$row['LocationID']);
			$success = $selection->execute();
			$results = $selection->fetchAll(PDO::FETCH_ASSOC);
			$row["location"] = $results[0]; // ID, Source, Hint, Latitude, Longitude
			$row["location"]["Latitude"] = "";
			$row["location"]["Longitude"] = "";
			if(!$row["hintused"]) {
				$row["location"]["Hint"] = ""; //TODO: If not utf8
			}
			array_push($puzzlesWithLocation, $row);
		}
		$json = json_encode($puzzlesWithLocation);
		echo $json;
	});
	
	$app->get('/highscore', function() {
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		$highscore = array();
		
		$selection = $db->prepare('SELECT * FROM user');
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);
		foreach($users as $index => $user) {
			$highscore[$user["Name"]] = 0;
			$selection = $db->prepare('SELECT * FROM playround WHERE userid = '.$user['ID']);
			$success = $selection->execute();
			$userplayrounds = $selection->fetchAll(PDO::FETCH_ASSOC);
			foreach($userplayrounds as $index => $playround) {
				$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = '.$playround['ID']);
				$success = $selection->execute();
				$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
				foreach($puzzles as $index => $puzzle) {
					$highscore[$user["Name"]] += $puzzle["points"];
				}
			}
		}
		
		$highscoreObjects = array();
		foreach($highscore as $name => $score) {
			array_push($highscoreObjects, array('name'=>$name,'score'=>$score));
		}
		
		function scorecmp($a, $b)
		{
			return strcmp($b["score"], $a["score"]);
		}
		usort($highscoreObjects, "scorecmp");
		
		$json = json_encode($highscoreObjects);
		echo $json;
	});
	
	$app->post('/login', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		$selection = $db->prepare('SELECT * FROM user WHERE Name = \''.$request['name'].'\' AND Password = \''.$request['password'].'\'');
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);
		
		if(sizeof($users) != 1) {
			$errorjson = array();
			$errorjson["message"] = "Falsches Passwort für User ".$request['name'].".";
			echo json_encode($errorjson);
		} else {
			//return user with new token
			; 
			$insertion = $db->prepare('UPDATE user SET CurrentToken = :currenttoken WHERE Name = \''.$request['name'].'\'');
			$insertion->bindParam(':currenttoken', $currenttoken);
			$currenttoken = createToken();
			
			$success = $insertion->execute();
			
			if($success) {
				$returnjson = array();
				$returnjson["name"] = $request['name'];
				$returnjson["currenttoken"] = $currenttoken;
				echo json_encode($returnjson);
			} else {
				$errorjson = array();
				$errorjson["message"] = "User $name konnte nicht eingeloggt werden.";
				echo json_encode($errorjson);
			}
		}
	});
	
	$app->post('/register', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		$selection = $db->prepare('SELECT * FROM user WHERE Name = \''.$request['name'].'\'');
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);
		
		if(sizeof($users) > 0) {
			$errorjson = array();
			$errorjson["message"] = "User ".$users[0]['Name']." besteht bereits.";
			echo json_encode($errorjson);
		} else {
			//create user
			//return user with current token
			$insertion = $db->prepare('INSERT INTO user (Name, Password, CurrentToken) VALUES (:name, :password, :currenttoken)');
			$insertion->bindParam(':name', $name);
			$insertion->bindParam(':password', $password);
			$insertion->bindParam(':currenttoken', $currenttoken);
			$name = $request["name"];
			$password = $request["password"];
			$currenttoken = createToken();
			
			$success = $insertion->execute();
			
			if($success) {
				$returnjson = array();
				$returnjson["name"] = $name;
				$returnjson["currenttoken"] = $currenttoken;
				echo json_encode($returnjson);
			} else {
				$errorjson = array();
				$errorjson["message"] = "User $name konnte nicht erstellt werden.";
				echo json_encode($errorjson);
			}
		}
	});
	
	function createToken($length = 10) {
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$charactersLength = strlen($characters);
		$randomString = '';
		for ($i = 0; $i < $length; $i++) {
			$randomString .= $characters[rand(0, $charactersLength - 1)];
		}
		return $randomString;
	}
	
	$app->post('/verifylocation', function() use ($app) {
		//TODO: Login
		
		
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->post('/skippicture', function() use ($app) {
		//TODO: Login
		
		
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->post('/usehint', function() use ($app) {
		//TODO: Login
		
		
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->run();
	
	$db = null;
