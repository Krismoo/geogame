<?php
	require 'vendor/slim/slim/Slim/Slim.php';
	\Slim\Slim::registerAutoloader();

	$app = new \Slim\Slim();
	
	define("nPuzzles", 10);
	define("maxTime", 10080); //in minutes
	define("hintpenalty", 3000);
	define("basicpoints", 500);
	
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
        $selection = $db->prepare('SELECT * FROM user WHERE CurrentToken = :token');
		$selection->bindParam(':token', $token);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		if(sizeof($results) == 1) {
			$user = $results[0];
			return $user;
		} else {
			$errorjson = array();
			$errorjson["message"] = "Invalid token";
			echo json_encode($errorjson);
			die();
		}
	}
	
	$app->get('/userpoints', function() use($app){
        $token = $app->request()->params('token');
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		$points = 0;
		$selection = $db->prepare('SELECT * FROM playround WHERE userid = :userid');
		$selection->bindParam(':userid', $user['ID']);
		$success = $selection->execute();
		$userplayrounds = $selection->fetchAll(PDO::FETCH_ASSOC);
		foreach($userplayrounds as $index => $playround) {
			$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = :playroundid');
			$selection->bindParam(':playroundid', $playround['ID']);
			$success = $selection->execute();
			$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
			foreach($puzzles as $index => $puzzle) {
				$points += $puzzle["points"];
			}
		}
		
		$resultjson = array();
		$resultjson["name"] = $user["Name"];
		$resultjson["points"] = $points;
		echo json_encode($resultjson);
	});
	
	$app->get('/config', function() use($app){
        $token = $app->request()->params('token');
		
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);

		$user = getUser($token, $db);

		$resultjson = array();
		$resultjson["tolerance"] = $user["tolerance"];
		echo json_encode($resultjson);
	});
	
	$app->post('/config', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		if(!isset($request["tolerance"]) || $request["tolerance"] < 100 || $request["tolerance"] > 1000) {
			$errorjson = array();
			$errorjson["message"] = "Param 'tolerance' invalid";
			echo json_encode($errorjson);
			die();
		}
		
		$token = $request["token"];
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		$insertion = $db->prepare('UPDATE user SET tolerance = :tolerance WHERE ID = :userid');
		$insertion->bindParam(':userid', $user['ID']);
		$insertion->bindParam(':tolerance', $request["tolerance"]);
		
		$success = $insertion->execute();
		
		if($success) {
			$returnjson = array();
			$returnjson["message"] = "Tolerance set to ".$request['tolerance'].".";
			echo json_encode($returnjson);
		} else {
			$errorjson = array();
			$errorjson["message"] = "Tolerance could not be set.";
			echo json_encode($errorjson);
		}
		
	});
	
	$app->get('/pictures', function() use($app){
        $token = $app->request()->params('token');
		
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);

		$user = getUser($token, $db);

		$selection = $db->prepare('SELECT * FROM playround WHERE userid = :userid AND Finished = 0');
		$selection->bindParam(':userid', $user['ID']);
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
			
			$selection = $db->prepare('SELECT * FROM playround WHERE userid = :userid AND Finished = 0');
			$selection->bindParam(':userid', $user['ID']);
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
		$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = :playroundid');
		$selection->bindParam(':playroundid', $playround['ID']);
		$success = $selection->execute();
		$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);

		$puzzlesWithLocation = array();
		foreach($puzzles as $index => $row) {
			$selection = $db->prepare('SELECT * FROM location WHERE id = :locationid');
			$selection->bindParam(':locationid', $row['LocationID']);
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
			$selection = $db->prepare('SELECT * FROM playround WHERE userid = :userid');
			$selection->bindParam(':userid', $user['ID']);
			$success = $selection->execute();
			$userplayrounds = $selection->fetchAll(PDO::FETCH_ASSOC);
			foreach($userplayrounds as $index => $playround) {
				$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = :playroundid');
				$selection->bindParam(':playroundid', $playround['ID']);
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
		
		$password = sha1($request['password']);
		$selection = $db->prepare('SELECT * FROM user WHERE Name = :name AND Password = :password');
		$selection->bindParam(':name', $request['name']);
		$selection->bindParam(':password', $password);
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);
		
		if(sizeof($users) != 1) {
			$errorjson = array();
			$errorjson["message"] = "Falsches Passwort für User ".$request['name'].".";
			echo json_encode($errorjson);
		} else {
			//return user with new token
			$insertion = $db->prepare('UPDATE user SET CurrentToken = :currenttoken WHERE Name = :name');
			$insertion->bindParam(':name', $request['name']);
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

	$app->post('/logout', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		$token = $request["token"];
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);
		
		$insertion = $db->prepare('UPDATE user SET CurrentToken = :currenttoken WHERE ID = :userid');
		$insertion->bindParam(':currenttoken', $currenttoken);
		$insertion->bindParam(':userid', $user['ID']);
		$currenttoken = "";
		
		$success = $insertion->execute();
		
		if($success) {
			$returnjson = array();
			$returnjson["message"] = "Successfully logged out.";
			echo json_encode($returnjson);
		} else {
			$errorjson = array();
			$errorjson["message"] = "User ".$user['Name']." could not logout.";
			echo json_encode($errorjson);
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

		$selection = $db->prepare('SELECT * FROM user WHERE Name = :name');
		$selection->bindParam(':name', $request["name"]);
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
			$password = sha1($request["password"]);
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

	function nearEnough($lat, $long, $location, $tolerance) {
		return haversineGreatCircleDistance($lat, $long, $location["Latitude"], $location["Longitude"]) < $tolerance;
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
		$selection = $db->prepare('SELECT * FROM puzzle WHERE id = :puzzleid');
		$selection->bindParam(':puzzleid', $request["puzzleid"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzle = $results[0];
		
		//own playround?
		$selection = $db->prepare('SELECT * FROM playround WHERE id = :playroundid');
		$selection->bindParam(':playroundid', $puzzle["PlayRoundID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$playround = $results[0];
		
		$selection = $db->prepare('SELECT * FROM user WHERE id = :userid');
		$selection->bindParam(':userid', $playround["UserID"]);
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
		$selection = $db->prepare('SELECT * FROM location WHERE ID = :locationid');
		$selection->bindParam(':locationid', $puzzle["LocationID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$location = $results[0];
		
		if(!nearEnough($request["latitude"], $request["longitude"], $location, $user["tolerance"])) {
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
		$insertion = $db->prepare('UPDATE puzzle SET done = 1, solved = 1, Enddate = :enddate, points = :points WHERE ID = :puzzleid');
		$insertion->bindParam(':puzzleid', $puzzle['ID']);
		$insertion->bindParam(':enddate', $enddate);
		$insertion->bindParam(':points', $points);
		
		$success = $insertion->execute();
		
		if($success) {
			//getallpuzzleofplayround
			$selection = $db->prepare('SELECT * FROM puzzle WHERE PlayRoundID = :playroundid');
			$selection->bindParam(':playroundid', $playround["ID"]);
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
				$insertion = $db->prepare('UPDATE playround SET Finished = 1 WHERE ID = :playroundid');	
				$insertion->bindParam(':playroundid', $playround['ID']);				
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
		$selection = $db->prepare('SELECT * FROM puzzle WHERE id = :puzzleid');
		$selection->bindParam(':puzzleid', $request["puzzleid"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzle = $results[0];
		
		//own playround?
		$selection = $db->prepare('SELECT * FROM playround WHERE id = :playroundid');
		$selection->bindParam(':playroundid', $puzzle["PlayRoundID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$playround = $results[0];
		
		$selection = $db->prepare('SELECT * FROM user WHERE id = :userid');
		$selection->bindParam(':userid', $playround["UserID"]);
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
		$insertion = $db->prepare('UPDATE puzzle SET done = 1, Enddate = :enddate, points = :points WHERE ID = :puzzleid');
		$insertion->bindParam(':puzzleid', $puzzle['ID']);
		$insertion->bindParam(':enddate', $enddate);
		$insertion->bindParam(':points', $points);
		
		$success = $insertion->execute();
		
		if($success) {
			//getallpuzzleofplayround
			$selection = $db->prepare('SELECT * FROM puzzle WHERE PlayRoundID = :playroundid');
			$selection->bindParam(':playroundid', $playround["ID"]);
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
				$insertion = $db->prepare('UPDATE playround SET Finished = 1 WHERE ID = :playroundid');	
				$insertion->bindParam(':playroundid', $playround["ID"]);				
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
		
		if(!isset($request["puzzleid"])) {
			$errorjson = array();
			$errorjson["message"] = "Param 'puzzleid' invalid.";
			echo json_encode($errorjson);
			die();
		}
		
		//get puzzle with puzzleid
		$selection = $db->prepare('SELECT * FROM puzzle WHERE id = :puzzleid');
		$selection->bindParam(':puzzleid', $request["puzzleid"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzle = $results[0];
		
		//own playround?
		$selection = $db->prepare('SELECT * FROM playround WHERE id = :playroundid');
		$selection->bindParam(':playroundid', $puzzle["PlayRoundID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$playround = $results[0];
		
		$selection = $db->prepare('SELECT * FROM user WHERE id = :userid');
		$selection->bindParam(':userid', $playround["UserID"]);
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
		$insertion = $db->prepare('UPDATE puzzle SET hintused = 1 WHERE ID = :puzzleid');
		$insertion->bindParam(':puzzleid', $puzzle['ID']);
		
		$success = $insertion->execute();
		
		if($success) {
			$selection = $db->prepare('SELECT * FROM location WHERE id = :locationid');
			$selection->bindParam(':locationid', $puzzle["LocationID"]);
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
