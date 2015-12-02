(function() {
	'use strict';
	var ns = window['space-boats'];
	function Game() {}

	// Load images and sounds
	Game.prototype.preload = function() {
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

		this.game.world.setBounds(0, 0, 2000, 2000);
		// this.game.camera.deadzone = new Phaser.Rectangle(this.game.camera.width,this.game.camera.height,1,1);
		this.game.camera.follow(this.player.spr,Phaser.Camera.FOLLOW_LOCKON);

	};

	// The update() method is called every frame
	Game.prototype.update = function() {
		// watch keys
		this.controls.watchInput();
	};

	Game.prototype.render = function(){
		this.game.debug.cameraInfo(this.game.camera, 32, 32);
		this.game.debug.spriteCoords(this.player.spr, 32, 500);
	};


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].Game = Game;
}());
