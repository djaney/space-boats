(function() {
	'use strict';
	var ns = window['space-boats'];
	function Game() {
		this.worldSize = 640;
		this.starCount = 300;

		this.cameraPos = new Phaser.Point(0, 0);
		this.stars = [];
	}

	// Load images and sounds
	Game.prototype.preload = function() {
		this.game.time.advancedTiming = true;
	    this.game.load.spritesheet('ship', '/assets/ship.png', 32, 32);
		this.game.load.image('starfield', '/assets/starfield.gif');
	};

	// Setup the example
	Game.prototype.create = function() {

		// generate stars
		// var tinyStar = this.game.add.graphics(0, 0);
	    // tinyStar.beginFill(0xFFFFFF, 1);
	    // tinyStar.drawRect(1, 1, 1, 1);
		//
		// // this.tinyStar = this.game.add.sprite(0, 0, tinyStar);
		// this.tinyStar = tinyStar;
		// this.starTexture = this.game.add.renderTexture(this.worldSize, this.worldSize, 'starTexture');
		// this.bgStars = this.game.add.sprite(0, 0, this.starTexture);
		// for (var i = 0; i < this.starCount; i++){
		// 	var s = 0.1;
		// 	var t = this.starTexture;
		// 	var x = Math.floor(Math.random() * this.worldSize);
		// 	var y = Math.floor(Math.random() * this.worldSize);
		// 	var loopProgress = i / this.starCount;
		//
		// 	this.stars.push( { x: x, y: y, speed: s, texture: t, sprite: this.tinyStar });
		// }

		this.bgStars = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'starfield');

		// create player
		this.player = new ns.obj.SpaceObject(this.game,'ship', this.game.width/2, this.game.height/2, 180, 200, 250);
		this.game.world.setBounds((this.worldSize/2*-1) + this.player.spr.x, (this.worldSize/2*-1) + this.player.spr.y, this.worldSize, this.worldSize);
		// create controls object
		this.controls = new ns.obj.PlayerControlsObject(this.game, this.player);

		// some sprite settings
		this.player.spr.anchor.setTo(0.5, 0.5);
	    this.player.spr.angle = -90; // Point the ship up

		this.game.camera.follow(this.player.spr);



	};

	// The update() method is called every frame
	Game.prototype.update = function() {
		// watch keys
		this.controls.update();
		this.player.update();
		this.game.world.setBounds((this.worldSize/2*-1) + this.player.spr.x, (this.worldSize/2*-1) + this.player.spr.y, this.worldSize, this.worldSize);


		// var playerVelocity = this.player.spr.body.newVelocity;
		// for (var i = 0; i < this.stars.length; i++){
		// 	//  Update the stars y position based on its speed
		//
		//
		// 	if (this.stars[i].x > this.worldSize) {
		// 		this.stars[i].x = 0;
		// 	}
		// 	if (this.stars[i].x < 0) {
		// 		this.stars[i].x = this.worldSize;
		// 	}
		//
		// 	if (this.stars[i].y > this.worldSize) {
		// 		this.stars[i].y = 0;
		// 	}
		// 	if (this.stars[i].y < 0) {
		// 		this.stars[i].y = this.worldSize;
		// 	}
		//
		// 	this.stars[i].x -= playerVelocity.x * this.stars[i].speed;
		// 	this.stars[i].y -= playerVelocity.y * this.stars[i].speed;
		// 	this.stars[i].texture.renderXY(this.stars[i].sprite, this.stars[i].x, this.stars[i].y, i === 0);
		//
		// }
		// this.bgStars.x = (this.worldSize/2*-1) + this.player.spr.x;
		// this.bgStars.y = (this.worldSize/2*-1) + this.player.spr.y;

		this.bgStars.tilePosition.x = -this.player.spr.x;
		this.bgStars.tilePosition.y = -this.player.spr.y;
		this.bgStars.x = this.player.spr.x - (this.game.width/2);
		this.bgStars.y = this.player.spr.y - (this.game.height/2);
	};

	Game.prototype.render = function(){
		this.game.debug.text('x: '+(this.player.spr.x || '--'), 2, 16, '#00ff00');
		this.game.debug.text('y: '+(this.player.spr.y || '--'), 2, 16 * 2, '#00ff00');
		this.game.debug.text('fps: '+(this.game.time.fps || '--'), 2, 16 * 3, '#00ff00');
	};


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].Game = Game;
}());
