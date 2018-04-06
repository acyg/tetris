//dimensions and settings

var canvas_width = 7;
var canvas_height = 12;
var size = 60;
var speed = 500;

//load images for block
var faces = [
];

for (var i = 0; i < 7; i++) {
    var img = document.createElement('img');
    img.src = "img/face_0" + i + ".jpg";
    faces.push(img);
}

var shapes = [

    //tetris shapes
    {
        //J shape
        offsets: [
            [0, 0],
            [0, 1],
            [-1, 1],
            [0, -1]
        ]
    },
    {
        //I shape
        offsets: [
            [0, 0],
            [0, -1],
            [0, -2],
            [0, 1]
        ]
    },
    {
        //O shape
        offsets: [
            [0, 0],
            [-1, 0],
            [-1, -1],
            [0, -1]
        ]
    },
    {
        //T shape
        offsets: [
            [0, 0],
            [-1, 0],
            [0, -1],
            [1, 0]
        ]
    },
    {
        //L shape
        offsets: [
            [0, 0],
            [0, -1],
            [0, 1],
            [1, 1]
        ]
    },
    {
        //S shape
        offsets: [
            [0, 0],
            [-1, 0],
            [0, -1],
            [1, -1]
        ]
    },
    {
        //Z shape
        offsets: [
            [0, 0],
            [-1, -1],
            [0, -1],
            [1, 0]
        ]
    }
];
var name;

//try to look a specific container 
var container = document.querySelector("#tetris");

function prepare_css() {

    //add css
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "tetris.css";
    document.getElementsByTagName("head")[0].appendChild(link);
}

function top_display_setup() {

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
    button.addEventListener("click", function () {
        start(input.value);
    });

    ask_name.appendChild(button);
    display.appendChild(ask_name);
    return display;

}

function score_setup() {

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

function scoreboard_setup(board) {

	//initiate the scoreboard area
    board.id = "scoreboard";
    board.style.width = (canvas_width * size) + "px";
	board.style.display = "none";

    request_scores("GET", {}, function (result, textStatus, xhr) {
        if (textStatus == "success") {
			if(result.length > 0){
				try {
					var columns = [ "name", "score", "date" ];
					board.appendChild(json_table(result, columns));
				} catch (e) {
					board.appendChild(generate_error("Fail to generate Table."));
				}
			} else board.appendChild(generate_error("No highscores available."));

        } else {
            board.appendChild(generate_error("Error sending Request."));
        }

		$(board).slideDown(500);
    });

	return board;
}

function generate_error(msg) {
	var err = document.createElement("h3");
	err.innerHTML = msg;
	err.className = "error";

	return err;
}

function request_scores(method, sendData, callback) {
	
	/*
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4)
            if (this.status == 200 && this.responseText)
                callback(200, this.responseText);
            else
                callback(this.staus, 0);
    }

    request.open("POST", "tetris_scores.php", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	message = "action=" + option;
    Object.keys(params).forEach(function (key) {
        message += ("&" + key + "=" + params[key]);
    });

	switch(method) {
		case "GET":
			request.open(method, "http://scores/tetris_scores", true);
			break;
		case "POST":
			request.open(method, "http://scores/tetris_scores/add", true);
			request.setRequestHeader("Content-type", "application/json");
			break;	
	}

    request.send(params);
	*/

    //use ajax to get or update scores with myql via php
	var targetUrl;
	switch(method) {
		case "GET":
			targetUrl = "http://scores/api/tetris_scores";
			break;
		case "POST":
			targetUrl = "http://scores/api/tetris_scores/add";
			break;	
	}

		
	$.ajax({
		type: method,
		dataType: 'json',
		url: targetUrl,
		data: sendData
	}).always(callback);
}

function json_table(results, columns) {

    //returns an filled table element from a json
    var table = document.createElement("table");
    var row = document.createElement("tr");
    var cell;

    columns.forEach(function (column) {
        cell = document.createElement("th");
        cell.innerHTML = column;
        row.appendChild(cell);
    });
    table.appendChild(row);

    results.forEach(function (result) {
        row = document.createElement("tr");
        columns.forEach(function (column) {
            cell = document.createElement("td");
            cell.innerHTML = result[column];
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    return table;
}

function setup() {

    //execute all setups
    prepare_css();
    container.appendChild(top_display_setup());
    container.appendChild(score_setup());
    var board = document.createElement("div");
    container.appendChild(board);
	scoreboard_setup(board);
    canvas_obj.setup();
}

function greed_player(player_name) {

    //swap in greeting message in top display to prevent multiple setup initiation
    name = player_name;
    var display = document.querySelector('#tetris #top_display');
    display.removeChild(document.querySelector('#tetris #ask_name'));
    var greed = document.createElement('h3');
    greed.innerHTML = "Thank you for playing - " + name;
    greed.className = "inline";
    display.appendChild(greed);
}

function start(player_name) {

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
    space: {},
    setup: function () {
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
    draw: function () {
        this.clear();
        var space = this.space;

        //fills cells according to information recorded in the space object
        for (var i = 0; i < canvas_height; i++) {
            if (space[i] !== undefined) {
                var keys = Object.keys(space[i]);
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    this.ctx.drawImage(space[i][key],
                            key * size,
                            i * size,
                            size, size);
                }
            }
        }

        //draw the block	
        block.draw();
    },
    handle_completed: function (completed) {

        //sort completed to create bottom up order
        completed.sort(function (a, b) {
            return a - b
        });
        var space = this.space;

        //add to score
        switch (completed.length) {
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
        var target = current - 1;
        var next = completed.length ? completed.pop() : 0;

        while (space[target] !== undefined) {
            if (target == next) {
                do {
                    next = completed.length ? completed.pop() : 0;
                    target--;
                } while (target == next);
            }
            space[current] = space[target];
            current--;
            target--;
        }
        while (space[current] !== undefined) {
            delete space[current];
            current--;
        }

        this.update_score();
    },
    update_score: function () {
        document.querySelector('#tetris #counter').innerHTML = this.counter;
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    id: 0,
    img: null,
    setup: function (ctx) {
        this.x = Math.floor(canvas_width / 2);
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.landed = false;
        this.id = Math.floor(Math.random() * shapes.length);
        this.shape = shapes[this.id];
        this.ctx = ctx;
        //this.ctx.fillStyle = colors[pick];
        this.img = faces[this.id];
        //this.draw();
    },
    try_rotate: function (drt) {

        //modify shape's offsets to rotate the block
        //x = y, y = -x to transform for turn right
        //x = -y, y =x to transform for turn left
        var new_offsets = [];
        var offsets = this.shape.offsets;
        for (var i = 0; i < offsets.length; i++) {
            new_offsets.push([offsets[i][1] * drt, -offsets[i][0] * drt]);
        }
        if (this.can_move(this.dx, this.dy, new_offsets)) {
            this.erase();
            this.shape.offsets = new_offsets;
            this.draw();
            return true;
        } else
            return false;
    },
    try_move: function (dx, dy) {
        if (this.can_move(this.dx + dx, this.dy + dy, this.shape.offsets)) {
            this.dx += dx;
            this.dy += dy;
            return true;
        } else
            return false;
    },
    can_move: function (dx, dy, offsets) {

        //check with canvas width and height and space object to validate a move
        var new_x = this.x + dx;
        var new_y = this.y + dy;
        var space = canvas_obj.space;
        for (var i = 0; i < offsets.length; i++) {
            var offset_y = new_y + offsets[i][1];
            if (offset_y > canvas_height - 1)
                return false;
            var offset_x = new_x + offsets[i][0];
            if (offset_x < 0 || offset_x >= canvas_width)
                return false;
            if (space[offset_y] && space[offset_y][offset_x])
                return false;
        }
        return true;
    },
    move: function (dx, dy) {
        this.x += dx;
        this.y += dy;
        this.dx = 0;
        this.dy = 0;
    },
    take_space: function (x, y) {

        //update space object to take up the current space of the block
        var completed = [];
        var offsets = this.shape.offsets;
        var space = canvas_obj.space;
        for (var i = 0; i < offsets.length; i++) {
            var offset = offsets[i];
            var offseted_y = y + offset[1];
            var offseted_x = x + offset[0];
            if (space[offseted_y] === undefined)
                space[offseted_y] = {};
            space[offseted_y][offseted_x] = this.img;
            if (Object.keys(space[offseted_y]).length == canvas_width) {

                //push current offset's y onto competed when it completes a row
                completed.push(offseted_y);
            }
        }

        //return the completed array if any row is completed
        if (completed.length) {
            return completed;
        } else
            return false;
    },
    erase: function () {

        //erase current block from canvas
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.draw();
        this.ctx.restore();
    },
    draw: function () {

        //draw current block on canvas
        var offsets = this.shape.offsets;
        for (var i = 0; i < offsets.length; i++) {
            var offseted_x = this.x + offsets[i][0];
            var offseted_y = this.y + offsets[i][1];
            this.ctx.drawImage(this.img,
                    offseted_x * size,
                    offseted_y * size,
                    size, size);
        }
    },
    drop: function () {

        //try to drop down by 1 space
        if (!this.try_move(0, 1))
            this.landed = true;
        this.move(block.dx, block.dy);
    }
}

//setup the game only if there is an empty "tetris" div element 
//and use it as the wrapper. 
//compiler complains if not placed after all objects definitions.
if (container &&
        container.tagName == "DIV" &&
        container.childNodes.length == 0) {
    container.style.width = (size * canvas_width * 2 + 10) + "px";
    container.style.height = (size * canvas_height + 70) + "px";
    setup();
}

function update() {

    //update game state
    canvas_obj.draw();
    if (block.landed) {
        //let the canvas handle any completed rows
        var completed;
        if (completed = block.take_space(block.x, block.y)) {
            canvas_obj.handle_completed(completed);
        }

        //checks if blocks has piled to top
        if (canvas_obj.space[0] === undefined) {
            block.setup(block.ctx);

            //give chance to move the block
            canvas_obj.draw();
            setTimeout(function () {
                block.drop();

                //continue to the next frame
                update();
            }, speed);
        } else {
            game_over();
        }
    } else
        setTimeout(function () {
            block.drop();

            //continue to the next frame
            update();
        }, speed);
}

function game_over() {

    //handle when the game is over
    //use ajax to check/update high score with database via php
    request_scores("POST", {"name": name, "score": canvas_obj.counter}, function (result, textStatus, xhr) {
        if (textStatus == "success") {

			console.log(result);
			var resultObj = result['result']; 
			switch(resultObj['code']) {
				case 0:
					alert("Game over. You did not get a high score.");
					break;
				case 1:
					var board = $('#tetris #scoreboard');
					alert("Game over. You got a high score. Check out the score board.");
					board.slideUp(500, function () {
						board.empty();
						scoreboard_setup(board[0]);	
					});
					break;
			}
		} else alert("Game over. Try again for a higher score.");
    });

}

function controls_handler(e) {

    //directional and spin controls
    var code = e.keyCode ? e.keyCode : e.charCode ? e.charCode : 0;
    switch (code) {
        case 37:
            block.try_move(-1, 0);
            break;
        case 39:
            block.try_move(1, 0);
            break;
        case 40:
            block.try_move(0, 1);
            break;
        case 65:
            block.try_rotate(-1);
            break;
        case 68:
            block.try_rotate(1);
            break;
    }
}
