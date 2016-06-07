<<<<<<< HEAD
    <?php
    require 'vendor/slim/slim/Slim/Slim.php';
    \Slim\Slim::registerAutoloader();

    $app = new \Slim\Slim();

    function getDBConnection($connectionString, $user, $pwd)
    {
        try {
            return new PDO($connectionString, $user, $pwd);
        } catch (PDOException $e) {
            exit('Keine Verbindung: Grund - ' . $e->getMessage());
        }
    }

    define('HOST', "localhost");
    define('DBNAME', "geogame");
    define('USER', "root");
    define('PWD', "");

    header('Content-type:application/json; charset=utf-8');

    /*
        Start Routing Section
    */

    $app->get('/pictures', function () {
        $db = getDBConnection('mysql:host=' . HOST . ';dbname=' . DBNAME, USER, PWD);
        $data = array('pictures' => []);

        $selection = $db->prepare('SELECT * FROM user');
        $success = $selection->execute();
        $results = $selection->fetchAll();
        foreach ($results as $index => $row) {
            echo("index: {$index}, id: {$row['ID']}, name: {$row['Name']}<br>");
        }

        $json = json_encode($data);
        echo $json;
    });

    $app->get('/highscore', function () {
        $UserID = 93; //HARDCODED -> need user ID!!
        $data = array('highscore' => []);
        $db = getDBConnection('mysql:host=' . HOST . ';dbname=' . DBNAME, USER, PWD);

        //GET playround WHERE playround.userID==userID sum(puzzle.points)
        $IDselectionOfPlayrounds = $db->prepare("SELECT ID FROM playround WHERE UserID = $UserID");
        $IDsuccessPl = $IDselectionOfPlayrounds->execute();
        $IDresultsPl = $IDselectionOfPlayrounds->fetchAll();
        echo(json_encode($IDresultsPl)); // TODO: WORKS

        //Here: "(SELECT 'points' FROM puzzle when PlayroundID exists in $resultsPl) then SUM()" kreuzdingsbums oderso?
        $selectionPoints = $db->prepare("SELECT SUM(points) FROM puzzle WHERE PlayRoundID = $IDresultsPl");
        $successPo = $selectionPoints->execute();
        $resultsPo = $selectionPoints->fetchAll();
        echo(json_encode($resultsPo));

        $data['highscore']=123; //works
        $data['highscore']=$resultsPo; //this does not

        $json = json_encode($data);

        //like that?

        echo $json;
    });

    $app->post('/login', function () use ($app) {
        $json = $app->request->getBody();
        //HTTPS
        //Token als Cookie
        echo $json;
    });

    $app->post('/register', function () use ($app) {
        $json = $app->request->getBody();

        echo $json;
    });

    $app->post('/verifylocation', function () use ($app) {
        $json = $app->request->getBody();

        echo $json;
    });

    $app->post('/skippicture', function () use ($app) {
        $json = $app->request->getBody();

        echo $json;
    });

    $app->post('/usehint', function () use ($app) {
        $json = $app->request->getBody();

        echo $json;
    });

    $app->run();

    $db = null;
=======
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
			//TODO: create new playround
			die("create new playround");
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
		$json = $app->request->getBody();
		//HTTPS
		//Token als Cookie
		echo $json;
	});
	
	$app->post('/register', function() use ($app) {
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->post('/verifylocation', function() use ($app) {
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->post('/skippicture', function() use ($app) {
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->post('/usehint', function() use ($app) {
		$json = $app->request->getBody();
		
		echo $json;
	});
	
	$app->run();
	
	$db = null;
>>>>>>> origin/master
