<?php
	require 'vendor/slim/slim/Slim/Slim.php';
	\Slim\Slim::registerAutoloader();

	$app = new \Slim\Slim();
	
	/**
	*  Constants
	**/
	define("nPuzzles", 10);
	define("maxTime", 10080); //in minutes
	define("hintpenalty", 3000);
	define("basicpoints", 500);
	
	/**
	*  Constructor for DBConnection
	*  $connectionString => 'mysql:host='.HOST.';dbname='.DBNAME
	**/
	function getDBConnection($connectionString, $user, $pwd) {
		try {
			return new PDO($connectionString, $user, $pwd);
		} catch(PDOException $e) {
			exit('Keine Verbindung: Grund - ' . $e->getMessage());
		}
	}

	/**
	*  DB related Constants
	**/
	define('HOST',"localhost");
	define('DBNAME',"glowych_geogame");
	define('USER',"glowych_geogame");
	define('PWD',"My+5ai!3qy?9i");

	//Result is json-format
	header('Content-type:application/json; charset=utf-8');

	/**
	*  returns User of $token
	**/
	function getUser($token, $db) {
		if(!$token) {
			//$token null or empty
			$errorjson = array();
			$errorjson["message"] = "F&uuml;r weitere Anfragen bitte einloggen.";
			$errorjson["success"] = 0;
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
			$errorjson["success"] = 0;
			$errorjson["message"] = "Ung&uml;ltiges Token";
			echo json_encode($errorjson);
			die();
		}
	}
	
	
	/**
	*  Start Routing Section
	**/
	
	/**
	*  GET /userpoints
	*  params:
	*    token
	**/
	$app->get('/userpoints', function() use($app){
        $token = $app->request()->params('token');
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		$points = 0;
		//get Playrounds of user
		$selection = $db->prepare('SELECT * FROM playround WHERE userid = :userid');
		$selection->bindParam(':userid', $user['ID']);
		$success = $selection->execute();
		$userplayrounds = $selection->fetchAll(PDO::FETCH_ASSOC);
		//get Puzzles of each playround
		foreach($userplayrounds as $index => $playround) {
			$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = :playroundid');
			$selection->bindParam(':playroundid', $playround['ID']);
			$success = $selection->execute();
			$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
			//add points of each puzzle
			foreach($puzzles as $index => $puzzle) {
				$points += $puzzle["points"];
			}
		}
		
		//return name/points array
		$resultjson = array();
		$resultjson["name"] = $user["Name"];
		$resultjson["success"] = 1;
		$resultjson["points"] = $points;
		echo json_encode($resultjson);
	});
	
	/**
	*  GET /config
	*  params:
	*    token
	**/
	$app->get('/config', function() use($app){
        $token = $app->request()->params('token');
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		//return tolerance array
		$resultjson = array();
		$resultjson["success"] = 1;
		$resultjson["tolerance"] = $user["tolerance"];
		echo json_encode($resultjson);
	});
	
	/**
	*  POST /config
	*  params:
	*    token
	*    tolerance
	**/
	$app->post('/config', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		//valid tolerance parameter
		if(!isset($request["tolerance"]) || $request["tolerance"] < 100 || $request["tolerance"] > 1000) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Parameter 'tolerance' ung&uuml;ltig";
			echo json_encode($errorjson);
			die();
		}
		
		$token = $request["token"];
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		//set new tolerance parameter
		$insertion = $db->prepare('UPDATE user SET tolerance = :tolerance WHERE ID = :userid');
		$insertion->bindParam(':userid', $user['ID']);
		$insertion->bindParam(':tolerance', $request["tolerance"]);
		$success = $insertion->execute();
		
		if($success) {
			//return message array
			$returnjson = array();
			$returnjson["message"] = "Tolerance auf ".$request['tolerance']." gesetzt.";
			$returnjson["success"] = 1;
			echo json_encode($returnjson);
		} else {
			//DB Exception
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Tolerance konnte nicht gesetzt werden.";
			echo json_encode($errorjson);
		}
		
	});
	
	/**
	*  GET /pictures
	*  params:
	*    token
	**/
	$app->get('/pictures', function() use($app){
        $token = $app->request()->params('token');
        $db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);

		//get unfinished playround of user
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
				//DB Exception
				$errorjson = array();
				$errorjson["success"] = 0;
				$errorjson["message"] = "Spielrunde konnte nicht erstellt werden.";
				echo json_encode($errorjson);
				die();
			} 
			
			//get 'new' unfinished playround of user (& its ID)
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
				//Not possible to link enough locations
				
				//Delete Playround again
				$deletion = $db->prepare('DELETE FROM playround WHERE ID = :playroundid');
				$deletion->bindParam(':playroundid', $playroundid);
				$success = $deletion->execute();
				if($success) {
					$errorjson = array();
					$errorjson["success"] = 0;
					$errorjson["message"] = "Zu wenige Locations in der Datenbank.";
					echo json_encode($errorjson);
					die();
				} else {
					//DB-Exception
					$errorjson = array();
					$errorjson["success"] = 0;
					$errorjson["message"] = "Spielrunde (ID=".$playroundid.") konnte nicht wieder gel&ouml;scht werden.";
					echo json_encode($errorjson);
					die();
				}
				
				
			}
			
			//3. create n puzzles (linked to playround and 1 random location)
			for($i = 0; $i < nPuzzles; $i++) {				
				$insertion = $db->prepare('INSERT INTO puzzle (PlayroundID, LocationID) VALUES (:playroundid, :locationid)');
				$insertion->bindParam(':playroundid', $playroundid);
				$insertion->bindParam(':locationid', $locationid);
				$locationid = $locations[$i]["ID"];
				
				$success = $insertion->execute();
				
				if(!$success) {
					//DB-Exception
					$errorjson = array();
					$errorjson["success"] = 0;
					$errorjson["message"] = "Puzzle $i konnte nicht erstellt werden.";
					echo json_encode($errorjson);
					die();
				}
			}
			
		}
		
		//get Puzzles of unfinished playround)
		$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = :playroundid');
		$selection->bindParam(':playroundid', $playround['ID']);
		$success = $selection->execute();
		$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);

		//get location for each puzzle
		$puzzlesWithLocation = array();
		foreach($puzzles as $index => $row) {
			$selection = $db->prepare('SELECT * FROM location WHERE id = :locationid');
			$selection->bindParam(':locationid', $row['LocationID']);
			$success = $selection->execute();
			$results = $selection->fetchAll(PDO::FETCH_ASSOC);
			//add location as field of puzzle
			$row["location"] = $results[0]; // ID, Source, Hint, Latitude, Longitude
			//clear secret fields
			$row["location"]["Latitude"] = "";
			$row["location"]["Longitude"] = "";
			if(!$row["hintused"]) {
				$row["location"]["Hint"] = "";
			}
			if($row["done"]) {
				$row["donetxt"] = ($row["solved"] ? "gel&ouml;st" : "&uuml;bersprungen");
			}
			array_push($puzzlesWithLocation, $row);
		}
		
		//return array of puzzles with associated location
		$json = json_encode($puzzlesWithLocation);
		echo $json;
	});

	/**
	*  GET /highscore
	*  params:
	*    -
	**/
	$app->get('/highscore', function() {
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);

		$highscore = array();

		//get all users
		$selection = $db->prepare('SELECT * FROM user');
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);
		//get all playrounds of user
		foreach($users as $index => $user) {
			$highscore[$user["Name"]] = 0;
			$selection = $db->prepare('SELECT * FROM playround WHERE userid = :userid');
			$selection->bindParam(':userid', $user['ID']);
			$success = $selection->execute();
			$userplayrounds = $selection->fetchAll(PDO::FETCH_ASSOC);
			//get all puzzles of playround
			foreach($userplayrounds as $index => $playround) {
				$selection = $db->prepare('SELECT * FROM puzzle WHERE playroundid = :playroundid');
				$selection->bindParam(':playroundid', $playround['ID']);
				$success = $selection->execute();
				$puzzles = $selection->fetchAll(PDO::FETCH_ASSOC);
				//add points to user's score
				foreach($puzzles as $index => $puzzle) {
					$highscore[$user["Name"]] += $puzzle["points"];
				}
			}
		}

		//Format array to { 'name':<NAME>, 'score': <SCORE> }
		$highscoreObjects = array();
		foreach($highscore as $name => $score) {
			array_push($highscoreObjects, array('name'=>$name,'score'=>$score));
		}

		/**
		*  Sort function: Score-Field
		**/
		function scorecmp($a, $b)
		{
			return strcmp($b["score"], $a["score"]);
		}
		//sort highscores
		usort($highscoreObjects, "scorecmp");

		$json = json_encode($highscoreObjects);
		echo $json;
	});

	/**
	*  POST /login
	*  params:
	*    name
	*    password
	**/
	$app->post('/login', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		//validate name/password parameters
		if(!$request["name"] || !$request["password"]) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Parameter 'name' oder 'password' ung&uuml;ltig.";
			echo json_encode($errorjson);
			die();
		}
		
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		//encrypt password
		$password = sha1($request['password']);
		
		//get user with name/password combination
		$selection = $db->prepare('SELECT * FROM user WHERE Name = :name AND Password = :password');
		$selection->bindParam(':name', $request['name']);
		$selection->bindParam(':password', $password);
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);
		
		if(sizeof($users) != 1) {
			//invalid login parameters
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Falsches Passwort f&uuml;r User ".$request['name'].".";
			echo json_encode($errorjson);
		} else {
			//return user with new token
			$insertion = $db->prepare('UPDATE user SET CurrentToken = :currenttoken WHERE Name = :name');
			$insertion->bindParam(':name', $request['name']);
			$insertion->bindParam(':currenttoken', $currenttoken);
			//create new random token
			$currenttoken = createToken();
			
			$success = $insertion->execute();
			
			if($success) {
				//return name/currenttoken array
				$returnjson = array();
				$returnjson["success"] = 1;
				$returnjson["name"] = $request['name'];
				$returnjson["currenttoken"] = $currenttoken;
				echo json_encode($returnjson);
			} else {
				//DB-Exception
				$errorjson = array();
				$errorjson["success"] = 0;
				$errorjson["message"] = "User $name konnte nicht eingeloggt werden.";
				echo json_encode($errorjson);
			}
		}
	});

	/**
	*  POST /logout
	*  params:
	*    token
	**/
	$app->post('/logout', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		$token = $request["token"];
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		$user = getUser($token, $db);
		
		//clear token
		$insertion = $db->prepare('UPDATE user SET CurrentToken = :currenttoken WHERE ID = :userid');
		$insertion->bindParam(':currenttoken', $currenttoken);
		$insertion->bindParam(':userid', $user['ID']);
		$currenttoken = "";
		
		$success = $insertion->execute();
		
		if($success) {
			//return message array
			$returnjson = array();
			$returnjson["success"] = 1;
			$returnjson["message"] = "Erfolgreich ausgeloggt.";
			echo json_encode($returnjson);
		} else {
			//DB-Exception
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "User ".$user['Name']." konnte nicht ausgeloggt werden.";
			echo json_encode($errorjson);
		}
	});
	
	/**
	*  POST /register
	*  params:
	*    name
	*    password
	**/
	$app->post('/register', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);

		//validate name/password parameters
		if(!$request["name"] || !$request["password"]) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Parameter 'name' oder 'password' ung&uuml;ltig";
			echo json_encode($errorjson);
			die();
		}
		
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);

		//get user with same name
		$selection = $db->prepare('SELECT * FROM user WHERE Name = :name');
		$selection->bindParam(':name', $request["name"]);
		$success = $selection->execute();
		$users = $selection->fetchAll(PDO::FETCH_ASSOC);

		if(sizeof($users) > 0) {
			//register not possible (user already existing)
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "User ".$users[0]['Name']." besteht bereits.";
			echo json_encode($errorjson);
		} else {
			//create user
			//return user with new token
			$insertion = $db->prepare('INSERT INTO user (Name, Password, CurrentToken) VALUES (:name, :password, :currenttoken)');
			$insertion->bindParam(':name', $name);
			$insertion->bindParam(':password', $password);
			$insertion->bindParam(':currenttoken', $currenttoken);
			$name = $request["name"];
			//encrypt password
			$password = sha1($request["password"]);
			$currenttoken = createToken();

			$success = $insertion->execute();

			if($success) {
				//return name/currenttoken array
				$returnjson = array();
				$returnjson["success"] = 1;
				$returnjson["name"] = $name;
				$returnjson["currenttoken"] = $currenttoken;
				echo json_encode($returnjson);
			} else {
				//DB-Exception
				$errorjson = array();
				$errorjson["success"] = 0;
				$errorjson["message"] = "User $name konnte nicht erstellt werden.";
				echo json_encode($errorjson);
			}
		}
	});
	
	/**
	*  Token-function: Creates random string of length $length
	**/
	function createToken($length = 10) {
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$charactersLength = strlen($characters);
		$randomString = '';
		for ($i = 0; $i < $length; $i++) {
			$randomString .= $characters[rand(0, $charactersLength - 1)];
		}
		return $randomString;
	}

	/**
	*  Distance comparing function
	*  Params:
	*    $lat, $long -> userposition
	*    $location   -> puzzlelocation
	*    $tolerance  -> user's tolerance config
	**/
	function nearEnough($lat, $long, $location, $tolerance) {
		return haversineGreatCircleDistance($lat, $long, $location["Latitude"], $location["Longitude"]) < $tolerance;
	}
	
	/**
	*  Distance calculating function
	*  Params:
	*    $lat, $long of user and puzzle
	*    $earthRadius in a certain unit (default: meter) -> result returned in same unit
	**/
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
	
	/**
	*  POST /verifylocation
	*  params:
	*    token
	*    puzzleid
	*    latitude
	*    longitude
	**/
	$app->post('/verifylocation', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		//Validate parameters
		if(!isset($request["puzzleid"]) || !isset($request["latitude"]) || !isset($request["longitude"])) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Parameter 'puzzleid', 'latitude' oder 'longitude' ung&uuml;ltig";
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
		
		//get playround owner
		$selection = $db->prepare('SELECT * FROM user WHERE id = :userid');
		$selection->bindParam(':userid', $playround["UserID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzleuser = $results[0];
		
		//compare user and playround owner
		if($puzzleuser["CurrentToken"] != $request["token"]) {
			//foreign playround
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Ung&&uml;ltige Operation";
			echo json_encode($errorjson);
			die();
		}
		
		//already done?
		if($puzzle["done"]) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Puzzle bereits gemacht";
			echo json_encode($errorjson);
			die();
		}
		
		//correct location?
		$selection = $db->prepare('SELECT * FROM location WHERE ID = :locationid');
		$selection->bindParam(':locationid', $puzzle["LocationID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$location = $results[0];
		
		//calc distance
		if(!nearEnough($request["latitude"], $request["longitude"], $location, $user["tolerance"])) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Ihre Position ist nicht nah genug. Wollen Sie den Hinweis nutzen?";
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
		$tolerancepoints = 1000 - $user["tolerance"];
		$points = $timepoints + $hintpoints + basicpoints + $tolerancepoints;
		
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
					//return message/puzzleid/reload array (playround finished)
					$resultjson = array();
					$resultjson["success"] = 1;
					$resultjson["message"] = "Puzzle gel&ouml;st und Spielrunde beendet.";
					$resultjson["puzzleid"] = $request["puzzleid"];
					$resultjson["reload"] = 1;
					echo json_encode($resultjson);
				} else {
					//DB-Exception
					$errorjson = array();
					$errorjson["success"] = 0;
					$errorjson["message"] = "Spielrunde konnte nicht beendet werden.";
					echo json_encode($errorjson);
				}
			} else {
				//return message/puzzleid/reload array (playround not finished)
				$resultjson = array();
				$resultjson["success"] = 1;
				$resultjson["message"] = "Puzzle gel&ouml;st.";
				$resultjson["puzzleid"] = $request["puzzleid"];
				$resultjson["reload"] = 0;
				echo json_encode($resultjson);
			}
				
		} else {
			//DB-Exception
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Puzzle konnte nicht gel&ouml;st werden.";
			echo json_encode($errorjson);
		}
	});

	/**
	*  POST /skippicture
	*  params:
	*    token
	*    puzzleid
	**/
	$app->post('/skippicture', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		//validate parameter
		if(!isset($request["puzzleid"])) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Parameter 'puzzleid' ung&uuml;ltig";
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
		
		//get playround owner
		$selection = $db->prepare('SELECT * FROM user WHERE id = :userid');
		$selection->bindParam(':userid', $playround["UserID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzleuser = $results[0];
		
		//compare user and playround owner
		if($puzzleuser["CurrentToken"] != $request["token"]) {
			//foreign playround
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Ung&uuml;ltige Operation";
			echo json_encode($errorjson);
			die();
		}
		
		//already done?
		if($puzzle["done"]) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Puzzle bereits gemacht";
			echo json_encode($errorjson);
			die();
		}
		
		//calc points		
		//Points for:
		//  hint used => -3000
		if($puzzle["hintused"]) {
			$hintpoints = -hintpenalty;
		} else {
			$hintpoints = 0;
		}
		$points = $hintpoints - 2000; //basic points for skipping
		
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
					//return message/puzzleid/reload array (playround finished)
					$resultjson = array();
					$resultjson["success"] = 1;
					$resultjson["message"] = "Puzzle &uuml;bersprungen und Spielrunde beendet";
					$resultjson["puzzleid"] = $request["puzzleid"];
					$resultjson["reload"] = 1;
					echo json_encode($resultjson);
				} else {
					//DB-Exception
					$errorjson = array();
					$errorjson["success"] = 0;
					$errorjson["message"] = "Spielrunde konnte nicht beendet werden.";
					echo json_encode($errorjson);
				}
			} else {
				//return message/puzzleid/reload array
				$resultjson = array();
				$resultjson["success"] = 1;
				$resultjson["message"] = "Puzzle &uuml;bersprungen.";
				$resultjson["puzzleid"] = $request["puzzleid"];
				$resultjson["reload"] = 0;
				echo json_encode($resultjson);
			}
				
		} else {
			//DB-Exception
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Puzzle konnte nicht &uuml;bersprungen werden.";
			echo json_encode($errorjson);
		}
		
	});

	/**
	*  POST /usehint
	*  params:
	*    token
	*    puzzleid
	**/
	$app->post('/usehint', function() use ($app) {
		$request = json_decode($app->request->getBody(),true);
		
		$db = getDBConnection('mysql:host='.HOST.';dbname='.DBNAME, USER, PWD);
		
		$user = getUser($request["token"], $db);
		
		//validate parameter
		if(!isset($request["puzzleid"])) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Parameter 'puzzleid' ung&uuml;ltig.";
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
		
		//get playround owner
		$selection = $db->prepare('SELECT * FROM user WHERE id = :userid');
		$selection->bindParam(':userid', $playround["UserID"]);
		$success = $selection->execute();
		$results = $selection->fetchAll(PDO::FETCH_ASSOC);
		$puzzleuser = $results[0];
		
		//compare user and playround owner
		if($puzzleuser["CurrentToken"] != $request["token"]) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Ung&uuml;ltige Operation";
			echo json_encode($errorjson);
			die();
		}
		
		//already hinted/done/solved?
		if($puzzle["hintused"] || $puzzle["done"] || $puzzle["solved"]) {
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Puzzle gemacht oder Hinweis bereits freigeschaltet.";
			echo json_encode($errorjson);
			die();
		}
		
		//set hint = 1
		$insertion = $db->prepare('UPDATE puzzle SET hintused = 1 WHERE ID = :puzzleid');
		$insertion->bindParam(':puzzleid', $puzzle['ID']);
		
		$success = $insertion->execute();
		
		if($success) {
			// get location for hint
			$selection = $db->prepare('SELECT * FROM location WHERE id = :locationid');
			$selection->bindParam(':locationid', $puzzle["LocationID"]);
			$success = $selection->execute();
			$results = $selection->fetchAll(PDO::FETCH_ASSOC);
			$location = $results[0];
			
			//return hint/puzzleid array
			$returnjson = array();
			$returnjson["success"] = 1;
			$returnjson["hint"] = $location["Hint"];
			$returnjson["puzzleid"] = $request["puzzleid"];
			echo json_encode($returnjson);
		} else {
			//DB-Exception
			$errorjson = array();
			$errorjson["success"] = 0;
			$errorjson["message"] = "Hinweis konnte nicht freigeschaltet werden.";
			echo json_encode($errorjson);
		}
	});

	$app->run();

	$db = null;
