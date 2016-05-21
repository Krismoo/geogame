<?php
	require 'vendor/slim/slim/Slim/Slim.php';
	\Slim\Slim::registerAutoloader();
	
	$app = new \Slim\Slim();
	
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
		$data = array('pictures' => []);
		
		$selection = $db->prepare('SELECT * FROM user');
		$success = $selection->execute();
		$results = $selection->fetchAll();
		foreach($results as $index => $row) {
			echo("index: {$index}, id: {$row['ID']}, name: {$row['Name']}<br>");
		}
		
		$json = json_encode($data);
		echo $json;
	});
	
	$app->get('/highscore', function() {
		$data = array('highscore' => []);
		$json = json_encode($data);
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