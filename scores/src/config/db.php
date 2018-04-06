<?php

class db {

    private $dbhost = 'localhost';
    private $dbuser = 'username';
    private $dbpass = 'password';
    private $dbname = 'game_scores';

    public function connect() {
        $conn = new mysqli($this->dbhost, $this->dbuser, $this->dbpass, $this->dbname);
        if ($conn->connect_errno) {
            echo $conn->connect_error;
            exit();
        }

        return $conn;
    }

}
