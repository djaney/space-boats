(function() {
	'use strict';
	var ns = window['space-boats'];


	function SpaceObject(game,sprName, x, y, ROTATION_SPEED, ACCELERATION, MAX_SPEED) {
		this.game = game;
		this.sprName = sprName;
		this.x = x;
		this.y = y;
		this.ROTATION_SPEED = ROTATION_SPEED;
		this.ACCELERATION = ACCELERATION;
		this.MAX_SPEED = MAX_SPEED;

		// Add the ship to the stage
	    this.spr = this.game.add.sprite(this.x, this.y, this.sprName);
	    this.spr.anchor.setTo(0.5, 0.5);
	    this.spr.angle = -90; // Point the ship up

		// Enable physics on the ship
	    this.game.physics.enable(this.spr, Phaser.Physics.ARCADE);

		// Set maximum velocity
	    this.spr.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED); // x, y
	}
	SpaceObject.prototype = new ns.obj.GameObject();
	SpaceObject.prototype.constructor = SpaceObject;

	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].obj = window['space-boats'].obj || {};
	window['space-boats'].obj.SpaceObject = SpaceObject;
}());
