(function() {
	'use strict';
	var ns = window['space-boats'];
	function Game() {
		this.worldSize = 1000;
		this.cameraPos = new Phaser.Point(0, 0);
	}

	// Load images and sounds
	Game.prototype.preload = function() {
		this.game.time.advancedTiming = true;
	    this.game.load.spritesheet('ship', '/assets/ship.png', 32, 32);
	};

	// Setup the example
	Game.prototype.create = function() {


	    // Set stage background color
	    this.game.stage.backgroundColor = 0x333333;
		// create player
		this.player = new ns.obj.SpaceObject(this.game,'ship', this.game.width/2, this.game.height/2, 180, 200, 250);
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


	};

	Game.prototype.render = function(){
		this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
	};


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].Game = Game;
}());
