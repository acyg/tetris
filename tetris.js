//dimensions and settings

var canvas_width = 7;
var canvas_height = 12;
var size = 60;
var speed = 500;
var colors = [
    "red", "blue", "green", "brown", "purple", "cyan", "magenta"
];

var shapes = [

	//tetris shapes
    {
		//J shape
		offsets: [
			[0,0],
			[0,1],
			[-1,1],
			[0,-1]
		]
    },
    {
		//I shape
		offsets: [
			[0,0],
			[0,-1],
			[0,-2],
			[0,1]
		]
    },
    {
		//O shape
		offsets: [
			[0,0],
			[-1,0],
			[-1,-1],
			[0,-1]
		]
    },
    {
		//T shape
		offsets: [
			[0,0],
			[-1,0],
			[0,-1],
			[1,0]
		]
    },
    {
		//L shape
		offsets: [
			[0,0],
			[0,-1],
			[0,1],
			[1,1]
		]
    },    
    {
		//S shape
		offsets: [
			[0,0],
			[-1,0],
			[0,-1],
			[1,-1]
		]
    },
    {
		//Z shape
		offsets: [
			[0,0],
			[-1,-1],
			[0,-1],
			[1,0]
		]
    }
];
var space = {};
var name;

//try to look a specific container 
var container = document.querySelector("#tetris");

function prepare_css(){

	//add css
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "tetris.css";
    document.getElementsByTagName("head")[0].appendChild(link);
}

function top_display_setup(){

	//ask for a player name input
    var display = document.createElement("div");
    display.id = "top_display";
    var ask_name = document.createElement("div");
    ask_name.id = "ask_name";
    var message = document.createElement("h3");
    message.className = "inline";
    message.innerHTML = "Please eneter a player name to begin the game: ";
    ask_name.appendChild(message);
    var input = document.createElement("input");
    input.setAttribute("value", "player");
    ask_name.appendChild(input);
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.innerHTML = "Enter";

	//starts the game when name is entered
    button.addEventListener("click", function(){
		start(input.value);
    });

    ask_name.appendChild(button);
    display.appendChild(ask_name);
	return display;

}

function score_setup(){

	//add score counter
    var score = document.createElement("h2");
    score.id = "score";
    score.innerHTML = "Score : ";
    score.className = "inline";
    var counter = document.createElement("span");
    counter.id = "counter";
    counter.innerHTML = 0;
    score.appendChild(counter);
	return score;	

}

function scoreboard_setup(){

	//initiate the scoreboard area
    var board = document.createElement("div");
    board.id = "scoreboard";
    board.style.width = (canvas_width * size) + "px";
	
	request_scores("get", {}, function(status, result){
		if(status == 200 && result){
			try {
				board.appendChild(json_table(JSON.parse(result)));
			} catch(e) {
				board.innerHTML = result;
			}
		} else {
			var err = document.createElement("h3");
			err.innerHTML = "Error sending Request.";
			err.style.textAlign = "center";
			err.style.color = "white";
			board.appendChild(err);
		}
	});

	return board;
}

function request_scores(option, params, callback){

	//use ajax to get or update scores with myql via php
    var request = new XMLHttpRequest();
    request.onreadystatechange = function(){
		if(this.readyState == 4)
			if(this.status == 200 && this.responseText) 
				callback(200, this.responseText);
			else callback(this.staus, 0);
    }

    request.open("POST", "tetris_scores.php", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	message = "action=" + option;
	Object.keys(params).forEach(function(key){
		message += ("&" + key + "=" + params[key]);
	});

    request.send(message);
}

function json_table(results){

	//returns an filled table element from a json
	var table = document.createElement("table");
	var row = document.createElement("tr");
	var cell;
	
	Object.keys(results[0]).forEach(function(key){
		cell = document.createElement("th");
		cell.innerHTML = key;
		row.appendChild(cell);
	});
	table.appendChild(row);
	results.forEach(function(result){
		row = document.createElement("tr");
		Object.values(result).forEach(function(value){
			cell = document.createElement("td");
			cell.innerHTML = value;
			row.id = row.id + "_" + value;
			row.appendChild(cell);
		});
		table.appendChild(row);
	});

	return table;
}

function setup(){

	//execute all setups
    prepare_css();
    container.appendChild(top_display_setup());
    container.appendChild(score_setup());
    container.appendChild(scoreboard_setup());
    canvas_obj.setup();
}

function greed_player(player_name){

	//swap in greeting message in top display to prevent multiple setup initiation
    name = player_name;
    var display = document.querySelector('#tetris #top_display');
    display.removeChild(document.querySelector('#tetris #ask_name'));
    var greed = document.createElement('h3');
    greed.innerHTML = "Thank you for playing - "+name;
    greed.className = "inline";
    display.appendChild(greed);
}

function start(player_name){

	//registers player, enable controls and starts the game
    greed_player(player_name);
    document.addEventListener("keydown", controls_handler); 
    update();
}

var canvas_obj = {

	//canvas object
    canvas: document.createElement("canvas"),
    ctx: null,
    counter: 0,
    setup: function(){
		var canvas_container = document.createElement("div");
		canvas_container.id = "canvas_container";
		this.canvas.width = size * canvas_width;
		this.canvas.height = size * canvas_height;
		canvas_container.appendChild(this.canvas);
		container.appendChild(canvas_container);
		this.ctx = this.canvas.getContext("2d");

		//setup block object with canvas's context
		block.setup(this.ctx);
    },
    draw: function(top, bottom) {

		//fills cells according to information recorded in the space object
		for(var i = bottom;i != top;i--){
			if(space[i] !== undefined){
				Object.keys(space[i]).forEach(function(key){
					canvas_obj.ctx.fillStyle = space[i][key];
					canvas_obj.ctx.fillRect(key * size, i * size, size, size);
				});
			}
		}
    },
    handle_completed: function(completed){

		//add to score
		switch(completed.length){
			case 1:
				this.counter += 1000;
				break;
			case 2:
				this.counter += 3000;
				break;
			case 3:
				this.counter += 6000;
				break;
			case 4:
				this.counter += 10000;
				break;
		}

		//update the space object base on the rows completed
		var current = completed.pop();
		var bottom = current;
		var target = current - 1;
		var next = completed.length ? completed.pop() : 0;

		while(space[target] !==  undefined){
			if(target == next){
				do{
					next = completed.length ? completed.pop() : 0;
					target--;
				} while(target == next);
			}
			space[current] = space[target];
			current--;
			target--;
		}
		while(space[current] !== undefined){
			delete space[current];
			current--;
		}

		//clear and redraw the changed section
		this.clear(0, 0, canvas_width * size, (bottom + 1) * size); 
		this.draw(0, bottom);
		this.update_score();
	},
    update_score: function(){
		document.querySelector('#tetris #counter').innerHTML = this.counter;
	},
	clear: function(x, y, width, height){
		this.ctx.clearRect(x, y, width, height);
	}
};

var block = {
	//player controlled block object
    shape: null,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    landed: false,
    ctx: null,
    setup: function(ctx){
		this.x = Math.floor(canvas_width / 2);
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.landed = false;
		var pick = Math.floor(Math.random() * shapes.length);
		this.shape = shapes[pick]; 
		this.ctx = ctx;
		this.ctx.fillStyle = colors[pick];
		this.draw();
    },
    try_rotate: function(drt){

		//modify shape's offsets to rotate the block
		//x = y, y = -x to transform for turn right
		//x = -y, y =x to transform for turn left
		var new_offsets = [];
		var offsets = this.shape.offsets;
		for(var i = 0;i < offsets.length;i++){
			new_offsets.push([offsets[i][1] * drt, -offsets[i][0] * drt]);
		}
		if(this.can_move(this.dx, this.dy, new_offsets)){
			this.erase();	
			this.shape.offsets = new_offsets;
			this.draw();
			return true;
		} else return false;
    },
    try_move: function(dx, dy){
		if(this.can_move(this.dx+dx, this.dy+dy, this.shape.offsets)){
			this.dx += dx;
			this.dy += dy;
			return true;
		} else return false;
    },
    can_move: function(dx, dy, offsets){
		
		//check with canvas width and height and space object to validate a move
		var new_x = this.x + dx;
		var new_y = this.y + dy;
		for(var i = 0;i < offsets.length;i++){
			var offset_y = new_y + offsets[i][1];
			if(offset_y > canvas_height - 1) return false;
			var offset_x = new_x + offsets[i][0];
			if(offset_x < 0 || offset_x >= canvas_width) return false;
			if(space[offset_y] && space[offset_y][offset_x]) return false;
		}
		return true;
    },
    move: function(dx, dy){
		this.x += dx;
		this.y += dy;
		this.dx = 0;
		this.dy = 0;
	},
	take_space: function(x, y){

		//update space object to take up the current space of the block
		var completed = [];
		this.shape.offsets.forEach(function(offset){
			var offset_y = y + (offset[1]);
			if(space[offset_y] === undefined) space[offset_y] = {};
			space[offset_y][x + (offset[0])] = block.ctx.fillStyle;
			if(Object.keys(space[offset_y]).length == canvas_width){
				
				//push current offset's y onto competed when it completes a row
				completed.push(offset_y);
			}
		});

		//return the completed array if any row is completed
		if(completed.length){
			completed.sort();
			return completed;
		} else return false;
    },
    erase: function(){
		
		//erase current block from canvas
		this.ctx.save();
		this.ctx.globalCompositeOperation = 'destination-out';
		this.draw();
		this.ctx.restore();
    },
    draw: function(){
		
		//draw current block on canvas
		var offsets = this.shape.offsets;
		for(var i = 0;i < offsets.length;i++){
			this.ctx.fillRect((this.x + offsets[i][0]) * size, (this.y + offsets[i][1]) * size, size, size);
		}
	},
	drop: function(){
		
		//try to drop down by 1 space
		if(!this.try_move(0,1)) this.landed = true;
    }
}

//setup the game only if there is an empty "tetris" div element 
//and use it as the wrapper. 
//compiler complains if not placed after all objects definitions.
if(container && 
    container.tagName == "DIV" && 
    container.childNodes.length == 0){
    container.style.width = (size * canvas_width * 2 + 10) + "px";
    setup();
}

function update(){

	//update game state
    block.drop();
    block.erase();
    block.move(block.dx, block.dy);
    block.draw();
    if(block.landed) {

		//let the canvas handle any completed rows
		var completed;
		if(completed = block.take_space(block.x, block.y)){ 
			canvas_obj.handle_completed(completed);
		}

		//checks if blocks has piled to top
		if(space[0] === undefined){ 
			block.setup(block.ctx);
			setTimeout(update, speed);
		} else {
			game_over();
		}
    } else setTimeout(update, speed); //continue to the next frame
}

function game_over(){

	//handle when the game is over
	//use ajax to check/update high score with database via php
	request_scores("update", 
		{player : name, score : canvas_obj.counter}, function(status, result){

		//an updated table is returned if you got a top score 
		if(status == 200){
			if(result){
				var board = document.querySelector('#tetris #scoreboard');
				board.removeChild(board.childNodes[0]);
				board.appendChild(json_table(JSON.parse(result)));
				alert("Game over. You got a high score. Check out the score board.");
			} else alert("Game over. You did not get a high score.");
		} else alert("Game over. Try again for a higher score."); 
	});
}

function controls_handler(e){

	//directional and spin controls
    var code = e.keyCode ? e.keyCode : e.charCode ? e.charCode : 0;
    switch(code){
	case 37:
	    block.try_move(-1,0);
	    break;
	case 39:
	    block.try_move(1,0);
	    break;
	case 40:
	    block.try_move(0,1);
	    break;
	case 65:
	    block.try_rotate(-1);
	    break;
	case 68:
	    block.try_rotate(1);
	    break;
    }
}
