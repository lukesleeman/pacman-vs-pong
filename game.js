function runGame(){

	$(".controlSelect").hide();
	$("#cr-stage").show();
	$("#pause").fadeIn(750);
	
	document.onkeydown=function(event){return event.keyCode!=38 && event.keyCode!=40 && event.keyCode!=32};


	
	var gameInfo = {
		height : 500, width :500 ,
		paddle_height: 70, paddle_width : 20,
		pacman_size : 60,
		paddle_start_y : 200,
		speed : 4,
		paddle_speed : 7,
		animation_speed: 15,
		paddle_left_human : false,
		paddle_right_human : false,
	};
	
	Crafty.init(gameInfo.height, gameInfo.width);
	Crafty.background('black');
	
	$("#cr-stage")[0].focus();
	

	// Determine settings from buttons
	if($('#leftHuman').is(":checked")){
		gameInfo.paddle_left_human = true;
	}
	if($('#rightHuman').is(":checked")){
		gameInfo.paddle_right_human = true;
	}
	
	if($('#fast').is(":checked")){
		gameInfo.speed = 8;
		gameInfo.paddle_speed = 14;
		
	}
	
	// Setup our sprites
	Crafty.sprite(gameInfo.pacman_size, "pacman.png", {
			stop: [0, 0]
		});
		
		
	Crafty.audio.add({
		eat: ["pacman_eatfruit.mp3",
				"pacman_eatfruit.wav",
				"pacman_eatfruit.ogg"],
		hit: ["pong_hit.mp3",
				"pong_hit.wav",
				"pong_hit.ogg"],
				
		out: ["pong_out.mp3",
				"pong_out.wav",
				"pong_out.ogg"],
		});
	
	Crafty.scene("game", function() {
		//Paddles
		Crafty.e("Paddle, 2D, DOM, Color, Multiway")
			.color('white')
			.attr({ x: gameInfo.paddle_width, 
					y: gameInfo.paddle_start_y, 
					w: gameInfo.paddle_width, 
					h: gameInfo.paddle_height })
			.multiway(gameInfo.paddle_speed, { W: -90, S: 90 })
			.bind('EnterFrame', function () {
				if(gameInfo.paddle_left_human) return;
			
				//AI
				var ball = Crafty(Crafty("Ball")[0]);
				if(ball.y > this.y + gameInfo.paddle_height){
					this.y += gameInfo.paddle_speed;
				}
				else if(ball.y < this.y){
					this.y -= gameInfo.paddle_speed
				}
				
				// Make sure we are not over the top or bottom
				if(this.y < 0){
					this.y = 0;
				} else if(this.y > gameInfo.height - gameInfo.paddle_height){
					this.y = gameInfo.height - gameInfo.paddle_height;
				}
			});
			
			
		Crafty.e("Paddle, 2D, DOM, Color, Multiway")
			.color('white')
			.attr({ x: gameInfo.width - (gameInfo.paddle_width * 2), 
					y: gameInfo.paddle_start_y, 
					w: gameInfo.paddle_width, 
					h: gameInfo.paddle_height })
			.multiway(gameInfo.paddle_speed, { U: -90, J: 90 })
			.bind('EnterFrame', function () {
				if(gameInfo.paddle_right_human) return;
				
				// AI
				var ball = Crafty(Crafty("Ball")[0]);
				if(ball.y > this.y + gameInfo.paddle_height){
					this.y += gameInfo.paddle_speed;
				}
				else if(ball.y < this.y){
					this.y -= gameInfo.paddle_speed;
				}
				
				// Make sure we are not over the top or bottom
				if(this.y < 0){
					this.y = 0;
				} else if(this.y > gameInfo.height - gameInfo.paddle_height){
					this.y = gameInfo.height - gameInfo.paddle_height;
				}
			});
			
			
			
	
		//Ball
		Crafty.e("Ball, 2D, DOM, Color, Collision")
			.color('white')
			.attr({ x: 300, 
					y: 150, 
					w: gameInfo.paddle_width, 
					h: gameInfo.paddle_width, 
					dX: gameInfo.speed * 2, 
					dY: Crafty.math.randomInt(2, 4) })
			.bind('EnterFrame', function () {
				//hit floor or roof
				if (this.y <= 0 || this.y >= gameInfo.height)
					this.dY *= -1;
	
				if (this.x > gameInfo.width - (gameInfo.paddle_width * 2)) {
					Crafty.audio.play("out");
					Crafty("LeftPoints").each(function () { 
						this.text(++this.points + " Points") });
						
					resetBall(this);
				}
				if (this.x < gameInfo.paddle_width) {
					Crafty.audio.play("out");
					Crafty("RightPoints").each(function () { 
						this.text(++this.points + " Points") });
						
					resetBall(this);
				}
	
				this.x += this.dX;
				this.y += this.dY;
			})
			.onHit('Paddle', function (hitData) {
				Crafty.audio.play("hit");
				// Figure out how far we are from the padle
				var hitPaddle = hitData[0].obj;
				var distance = this.y - (hitPaddle.y + gameInfo.paddle_height /2 )
			
				this.dX *= -1;
				this.dY = distance / 7;
				
				// Make sure we are not to far left or right
				if(this.x < gameInfo.paddle_width * 2){
					this.x = gameInfo.paddle_width * 2;
				}
				else if(this.x > gameInfo.width - (gameInfo.paddle_width * 3)){
					this.x =  gameInfo.width - (gameInfo.paddle_width * 3);
				}
		})
	
		// Pacman
		Crafty.e("Pacman, 2D, DOM, stop, SpriteAnimation, Keyboard, Collision")
			//.color('yellow')
			.attr({ x: 100, 
					y: 100, 
					w: gameInfo.pacman_size, 
					h: gameInfo.pacman_size,
					direction: 'NONE'})
			.animate('PacmanUp', [[4,0],[0,0]])
			.animate('PacmanDown', [[2,0],[0,0]])
			.animate('PacmanLeft', [[3,0],[0,0]])
			.animate('PacmanRight', [[1,0],[0,0]])
			
			
			.bind('KeyDown', function () { 
				if (this.isDown('UP_ARROW')) {
					this.direction =  'UP';
					this.stop();
					this.animate('PacmanUp', gameInfo.animation_speed, -1);
				}
				
				if (this.isDown('DOWN_ARROW')){
					this.direction =  'DOWN';
					this.stop();
					this.animate('PacmanDown', gameInfo.animation_speed, -1);
				}
				
				if (this.isDown('LEFT_ARROW')) {
					this.direction =  'LEFT';
					this.stop();
					this.animate('PacmanLeft', gameInfo.animation_speed, -1);
				}
				
				if (this.isDown('RIGHT_ARROW')) {
					this.direction =  'RIGHT';
					this.stop();
					this.animate('PacmanRight', gameInfo.animation_speed, -1);
				}
			})
			.bind('EnterFrame', function () {
				// Move in our direction
				if (this.direction === 'UP'){
					this.y = this.y-gameInfo.speed;
				}
				if (this.direction === 'DOWN'){
					this.y = this.y+gameInfo.speed;
				}
				if (this.direction === 'LEFT'){
					this.x = this.x-gameInfo.speed;
				}
				if (this.direction === 'RIGHT'){
					this.x = this.x+gameInfo.speed;
				}
				
				// Figure out if we have hit something or moved to the edge
				if(this.y < 0){
					this.direction = 'NONE';
					this.y = 0;
					this.stop();
				}
				if(this.y > gameInfo.height  - gameInfo.pacman_size){
					this.direction = 'NONE';
					this.y = gameInfo.height  - gameInfo.pacman_size;
					this.stop();
				}
				if(this.x < 0){
					this.direction = 'NONE';
					this.x = 0;
					this.stop();
				}
				if(this.x > gameInfo.width  - gameInfo.pacman_size){
					this.direction = 'NONE';
					this.x =  gameInfo.width  - gameInfo.pacman_size;
					this.stop();
				}
			})
			.onHit('Ball', function () {
				Crafty.audio.play("eat");
			
				// Increment points
				Crafty("PacmanPoints").each(function () { 
						this.text(++this.points + " Points") });
						
				// Reset ball
				Crafty("Ball").each(function () { 
						resetBall(this);
					});
			});
			
		
		//Score boards
		Crafty.e("LeftPoints, DOM, 2D, Text")
			.attr({ x: gameInfo.paddle_width, y: gameInfo.paddle_width, w: 120, h: 20, points: 0 })
			.text("0 Points")
			.textColor("#FFFFFF");
		Crafty.e("RightPoints, DOM, 2D, Text")
			.attr({ x: gameInfo.width - 140, y: gameInfo.paddle_width, w: 120, h: 20, points: 0 })
			.text("0 Points")
			.textColor("#FFFFFF");
		Crafty.e("PacmanPoints, DOM, 2D, Text")
			.attr({ x: (gameInfo.width / 2) - 70, y: gameInfo.paddle_width, w: 140, h: 20, points: 0 })
			.text("0 Points")
			.textColor("#FFFF00");
				
	});
	
	
	var resetBall = function(ball){
		ball.x = gameInfo.width / 2;
		ball.dX *= -1;
		
		// Randomize the y position of the ball
		var pacman =  Crafty(Crafty("Pacman")[0]);
		
		// Select a position in the middle half of the board, as close to its current
		// position and as far away from pacman as possible
		
		// So, if we are out of the middle move us in
		var halfHeight = gameInfo.height / 2;
		var topOfZone = halfHeight / 2;
		var bottomOfZone = topOfZone + halfHeight;
		
		if(ball.y < topOfZone){
			ball.y = topOfZone;
		}
		else if(ball.y > bottomOfZone){
			ball.y = bottomOfZone;
		}
		
		// Now if we are too close to pacman move us away from him
		var topOfPacManZone = pacman.y - (gameInfo.paddle_width * 2);
		var bottomOfPacManZone = pacman.y + gameInfo.pacman_size + (gameInfo.paddle_width * 2);
		var middleOfPacMan = pacman.y + (gameInfo.pacman_size / 2);
		
		if(ball.y > topOfPacManZone && ball.y < bottomOfPacManZone){
			// Is the shorter move to go up or to go down?
			if(ball.y > middleOfPacMan) { // Go down
				ball.y = bottomOfPacManZone + gameInfo.pacman_size;
			}
			else { // Go up
				ball.y = topOfPacManZone - gameInfo.paddle_width - gameInfo.pacman_size;
			}
		}
		
		// Set the direction to move us away from pacman
		if(ball.y > middleOfPacMan){ // Go down
			ball.dY = Math.abs(ball.dY);
		}
		else { // Go up
			ball.dY = Math.abs(ball.dY) * -1;
		}
		
		// Make it easier for the paddles to get the ball!
		ball.dY = ball.dY / 2;

		
	}
	
	Crafty.scene('game');
}

function pauseGame(){
	Crafty.pause();
	if($("#pauseButton").html() === "Pause"){
		$("#pauseButton").html("Start");
	}
	else{
		$("#pauseButton").html("Pause");
	}
}