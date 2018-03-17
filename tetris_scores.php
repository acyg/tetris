<?php
    $conn = new mysqli('localhost', 'username', 'password');
    if($err = mysqli_connect_errno()){

		echo "<h2 style='color: white; text-align: center;'>stconnection failed: ".$err."</h2>";
		exit();
    }

    //querying multiple actions has no real benifit
	//$actions = $_REQUEST['actions'];
	//if($actions){
	//	$actions = explode("*", str_replace(" ", "", $actions));
	//}
	//$scores;
	//foreach($actions as $action){
	//}

	$action = $_REQUEST["action"];
	switch($action){
		//update the database
		case 'update':
			$player = $_REQUEST['player'];
			$score = $_REQUEST['score'];
			if($player && $score) 
				update_scores($conn, $player, $score); 
		break;

		//make get scores data from database and and echo as json
		case 'get':
			if(!$conn->query("show databases like 'game_scores'")->num_rows) 
				echo "<h2 style='color: white; text-align: center;'>no score uploaded yet</h2>";
			else{
				$conn->select_db("game_scores");
				if(!$conn->query("show tables like 'tetris_scores'")->num_rows) 
					echo "<h2 style='color: white; text-align: center;'>no score uploaded yet</h2>";
				else echo get_scores($conn); 
			} 
		break;
	}

    function update_scores($conn, $player, $score){
		$max_highest = 10;
		$conn->query("create database if not exists game_scores");
		$conn->select_db("game_scores");
		if(!$conn->query("show tables like 'tetris_scores'")->num_rows){
			$sql = "create table tetris_scores (
					name varchar(30) not null,
					score int,
					date date,
					ip varchar(30)
				);";
			$conn->query($sql);
			push_score($conn, $player, $score);
		} else {
			$result = $conn->query("select count(*) from tetris_scores");
			if($result->fetch_row()[0] < $max_highest){
				push_score($conn, $player, $score);
			} else {
				$result = $conn->query("select score from tetris_scores limit 1 offset ".($max_highest-1).";");
				$score_to_beat = $result->fetch_row()[0]; 
				if($score > $score_to_beat){
					$conn->query("delete from tetris_scores order by score asc limit 1;");
					push_score($conn, $player, $score);
				}
			}
		}
    }
	
    function push_score($conn, $player, $score){

		//update database with a prepared statement
		$push = $conn->prepare("insert into tetris_scores(name, score, date, ip) values(?, ?, ?, ?)");
		$push->bind_param("siss", $player, $score, date('Y-m-d'), $_SERVER['REMOTE_ADDR']);
		$push->execute();
		$push->free_result();
		$push->close();

		//keep the table ordered 
		$conn->query("alter table tetris_scores order by score desc;");

		echo get_scores($conn);
    }

    function free_results($conn){

		//fix for freeing up results after multi_query
		while($conn->next_result()){;}
    }

    function get_scores($conn){
		$result = $conn->query("select name, score, date from tetris_scores;");

		//respond with html table
		//echo"<table><tr>";
		//$row = $result->fetch_assoc();
		//foreach($row as $k => $v){
		//    echo"<th>".$k."</th>";
		//}
		//echo"</tr>";
		//do {
		//    echo"<tr id='".$row['name'].'_'.$row[score]."'>";
		//    foreach($row as $k => $v){
		//	echo"<td>".$v."</td>";
		//    }
		//    echo"</tr>";
		//} while($row = $result->fetch_assoc());
		//echo"</table>";

		//compile all the rows from result
		$json_array = array();
		while($row = $result->fetch_assoc()){
			$json_array[] = $row;
		}

		return json_encode($json_array);
    }
	$conn->close();
?>
