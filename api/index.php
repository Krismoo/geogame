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
	
	define("nPuzzles", 10);
	define("maxTime", 10080); //in minutes
	define("hintpenalty", 3000);
	define("basicpoints", 500);
	define("validRadius", 1000); //in meter
	
	function getDBConnection($connectionString, $user, $pwd) {
		try {
			return new PDO($connectionString, $user, $pwd);
		} catch(PDOException $e) {
			exit('Keine Verbindung: Grund - ' . $e->getMessage());
		}
	}

	define('HOST',"localhost");
	define('DBNAME',"glowych_geogame");
	define('USER',"glowych_geogame");
	define('PWD',"My+5ai!3qy?9i");

	header('Content-type:application/json; charset=utf-8');

	/*
		Start Routing Section
	*/

	function getUser($token, $db) {
		if(!$token) {
			$errorjson = array();
			$errorjson["message"] = "Please login for further requests";
			echo json_encode($errorjson);
			die();
		}
		
		//get user
        $selection = $db->prepare('SELECT * FROM user WHERE CurrentToken = \''.$token.'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		if(sizeof($results) == 1) {
			$user = $results[0];
			return $user;
		} else {
			$errorjson = array();
			$errorjson["message"] = "Please login again.";
			echo json_encode($errorjson);
			die();
		}
	}
	
	$app->get('/pictures', function() use($app){
        $token = $app->request()->params('token');
		
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);

		$user = getUser($token, $db);

		$selection = $db->prepare('SELECT * FROM playround WHERE userid = '.$user['ID'].' AND Finished = 0');
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
			$userid = $user["ID"];
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
			
			$selection = $db->prepare('SELECT * FROM playround WHERE userid = '.$user['ID'].' AND Finished = 0');
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
		
		if(!$request["name"] || !$request["password"]) {
			$errorjson = array();
			$errorjson["message"] = "Param 'name' or 'password' invalid";
			echo json_encode($errorjson);
			die();
		}
		
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

		if(!$request["name"] || !$request["password"]) {
			$errorjson = array();
			$errorjson["message"] = "Param 'name' or 'password' invalid";
			echo json_encode($errorjson);
			die();
		}
		
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

	function nearEnough($lat, $long, $location) {
		return haversineGreatCircleDistance($lat, $long, $location["Latitude"], $location["Longitude"]) < validRadius;
	}
	
	//http://stackoverflow.com/questions/10053358/measuring-the-distance-between-two-coordinates-in-php
	function haversineGreatCircleDistance($latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371000) {
		// convert from degrees to radians
		$latFrom = deg2rad($latitudeFrom);
		$lonFrom = deg2rad($longitudeFrom);
		$latTo = deg2rad($latitudeTo);
		$lonTo = deg2rad($longitudeTo);

		$latDelta = $latTo - $latFrom;
		$lonDelta = $lonTo - $lonFrom;

		$angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
			cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
		return $angle * $earthRadius;
	}
	
	$app->post('/verifylocation', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		if(!isset($request["puzzleid"]) || !isset($request["latitude"]) || !isset($request["longitude"])) {
			$errorjson = array();
			$errorjson["message"] = "Param 'puzzleid', 'latitude' or 'longitude' invalid";
			echo json_encode($errorjson);
			die();
		}
		
		$token = $request["token"];
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		//getpuzzle with puzzleid
		$selection = $db->prepare('SELECT * FROM puzzle WHERE id = \''.$request["puzzleid"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzle = $results[0];
		
		//own playround?
		$selection = $db->prepare('SELECT * FROM playround WHERE id = \''.$puzzle["PlayRoundID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$playround = $results[0];
		
		$selection = $db->prepare('SELECT * FROM user WHERE id = \''.$playround["UserID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzleuser = $results[0];
		
		if($puzzleuser["CurrentToken"] != $request["token"]) {
			$errorjson = array();
			$errorjson["message"] = "Invalid operation";
			echo json_encode($errorjson);
			die();
		}
		
		//already done?
		if($puzzle["done"]) {
			$errorjson = array();
			$errorjson["message"] = "Puzzle already done";
			echo json_encode($errorjson);
			die();
		}
		
		//correct location?
		$selection = $db->prepare('SELECT * FROM location WHERE ID = \''.$puzzle["LocationID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$location = $results[0];
		
		if(!nearEnough($request["latitude"], $request["longitude"], $location)) {
			$errorjson = array();
			$errorjson["message"] = "Your position is not near enough. Would you like to use a hint?";
			echo json_encode($errorjson);
			die();
		}
		
		//calc points
		$enddate = date('Y-m-d H:i:s');
		$startdate = $playround["StartDate"];
		
		//Points for:
		//  every minute less used than 1 week (10080 min)
		//  hint used => -3000
		//  basic points => 500
		$diff = strtotime($enddate) - strtotime($startdate);
		if($diff > maxTime) {
			$timepoints = 0;
		} else {
			$timepoints = maxTime - $diff;
		}
		if($puzzle["hintused"]) {
			$hintpoints = -hintpenalty;
		} else {
			$hintpoints = 0;
		}
		$points = $timepoints + $hintpoints + basicpoints;
		
		//set done (flag & date) and points
		$insertion = $db->prepare('UPDATE puzzle SET done = 1, solved = 1, Enddate = :enddate, points = :points WHERE ID = \''.$puzzle['ID'].'\'');
		$insertion->bindParam(':enddate', $enddate);
		$insertion->bindParam(':points', $points);
		
		$success = $insertion->execute();
		
		if($success) {
			//getallpuzzleofplayround
			$selection = $db->prepare('SELECT * FROM puzzle WHERE PlayRoundID = \''.$playround["ID"].'\'');
			$success = $selection->execute();
			$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
			//alldone?
			$alldone = true;
			for($i = 0; $i < sizeof($puzzles); $i++) {
				if($puzzles[$i]["done"] == 0) {
					$alldone = false;
				}
			}
			if($alldone) {
				//set playround finished
				$insertion = $db->prepare('UPDATE playround SET Finished = 1 WHERE ID = \''.$playround['ID'].'\'');				
				$success = $insertion->execute();
				
				if($success) {
					$resultjson = array();
					$resultjson["message"] = "Puzzle solved and playround finished.";
					echo json_encode($resultjson);
				} else {
					$errorjson = array();
					$errorjson["message"] = "Playround could not be finished.";
					echo json_encode($errorjson);
				}
			} else {
				$resultjson = array();
				$resultjson["message"] = "Puzzle solved.";
				echo json_encode($resultjson);
			}
				
		} else {
			$errorjson = array();
			$errorjson["message"] = "Puzzle could not be solved.";
			echo json_encode($errorjson);
		}
	});

	$app->post('/skippicture', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		if(!isset($request["puzzleid"])) {
			$errorjson = array();
			$errorjson["message"] = "Param 'puzzleid' invalid";
			echo json_encode($errorjson);
			die();
		}
		
		$token = $request["token"];
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		//getpuzzle with puzzleid
		$selection = $db->prepare('SELECT * FROM puzzle WHERE id = \''.$request["puzzleid"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzle = $results[0];
		
		//own playround?
		$selection = $db->prepare('SELECT * FROM playround WHERE id = \''.$puzzle["PlayRoundID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$playround = $results[0];
		
		$selection = $db->prepare('SELECT * FROM user WHERE id = \''.$playround["UserID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzleuser = $results[0];
		
		if($puzzleuser["CurrentToken"] != $request["token"]) {
			$errorjson = array();
			$errorjson["message"] = "Invalid operation";
			echo json_encode($errorjson);
			die();
		}
		
		//already done?
		if($puzzle["done"]) {
			$errorjson = array();
			$errorjson["message"] = "Puzzle already done";
			echo json_encode($errorjson);
			die();
		}
		
		//calc points
		$enddate = date('Y-m-d H:i:s');
		$startdate = $playround["StartDate"];
		
		//Points for:
		//  every minute less used than 1 week (10080 min)
		//  hint used => -3000
		//  basic points => 500
		$diff = strtotime($enddate) - strtotime($startdate);
		if($diff > maxTime) {
			$timepoints = 0;
		} else {
			$timepoints = maxTime - $diff;
		}
		if($puzzle["hintused"]) {
			$hintpoints = -hintpenalty;
		} else {
			$hintpoints = 0;
		}
		$points = $hintpoints;
		
		//set done (flag & date) and points
		$insertion = $db->prepare('UPDATE puzzle SET done = 1, Enddate = :enddate, points = :points WHERE ID = \''.$puzzle['ID'].'\'');
		$insertion->bindParam(':enddate', $enddate);
		$insertion->bindParam(':points', $points);
		
		$success = $insertion->execute();
		
		if($success) {
			//getallpuzzleofplayround
			$selection = $db->prepare('SELECT * FROM puzzle WHERE PlayRoundID = \''.$playround["ID"].'\'');
			$success = $selection->execute();
			$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
			//alldone?
			$alldone = true;
			for($i = 0; $i < sizeof($puzzles); $i++) {
				if($puzzles[$i]["done"] == 0) {
					$alldone = false;
				}
			}
			if($alldone) {
				//set playround finished
				$insertion = $db->prepare('UPDATE playround SET Finished = 1 WHERE ID = \''.$playround['ID'].'\'');				
				$success = $insertion->execute();
				
				if($success) {
					$resultjson = array();
					$resultjson["message"] = "Puzzle skipped and playround finished.";
					echo json_encode($resultjson);
				} else {
					$errorjson = array();
					$errorjson["message"] = "Playround could not be finished.";
					echo json_encode($errorjson);
				}
			} else {
				$resultjson = array();
				$resultjson["message"] = "Puzzle skipped.";
				echo json_encode($resultjson);
			}
				
		} else {
			$errorjson = array();
			$errorjson["message"] = "Puzzle could not be skipped.";
			echo json_encode($errorjson);
		}
		
	});

	$app->post('/usehint', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		$user = getUser($request["token"], $db);
		
		if(!$request["puzzleid"]) {
			$errorjson = array();
			$errorjson["message"] = "Param 'puzzleid' invalid.";
			echo json_encode($errorjson);
			die();
		}
		
		//get puzzle with puzzleid
		$selection = $db->prepare('SELECT * FROM puzzle WHERE id = \''.$request["puzzleid"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzle = $results[0];
		
		//own playround?
		$selection = $db->prepare('SELECT * FROM playround WHERE id = \''.$puzzle["PlayRoundID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$playround = $results[0];
		
		$selection = $db->prepare('SELECT * FROM user WHERE id = \''.$playround["UserID"].'\'');
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzleuser = $results[0];
		
		if($puzzleuser["CurrentToken"] != $request["token"]) {
			$errorjson = array();
			$errorjson["message"] = "Invalid operation";
			echo json_encode($errorjson);
			die();
		}
		
		//not hinted/done/solved
		if($puzzle["hintused"] || $puzzle["done"] || $puzzle["solved"]) {
			$errorjson = array();
			$errorjson["message"] = "Puzzle done or solved or hint already used";
			echo json_encode($errorjson);
			die();
		}
		
		//set hint = 1
		$insertion = $db->prepare('UPDATE puzzle SET hintused = 1 WHERE ID = \''.$puzzle['ID'].'\'');
		
		$success = $insertion->execute();
		
		if($success) {
			$selection = $db->prepare('SELECT * FROM location WHERE id = \''.$puzzle["LocationID"].'\'');
			$success = $selection->execute();
			$results = $selection->fetchAll(PDO::FETCH_ASSOC);
			$location = $results[0];
			
			$returnjson = array();
			$returnjson["hint"] = $location["Hint"];
			echo json_encode($returnjson);
		} else {
			$errorjson = array();
			$errorjson["message"] = "Hint could not be set.";
			echo json_encode($errorjson);
		}
	});

	$app->run();

	$db = null;
