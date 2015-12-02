(function() {
	'use strict';
	var ns = window['space-boats'];

	/**
	 * Objects that float in space
	 * @class SpaceObject
	 * @param {object} game           [description]
	 * @param {string} sprName        name of sprite
	 * @param {number} x              position in x-axis
	 * @param {number} y              position in y-axis
	 * @param {number} ROTATION_SPEED rotation speed in degrees/second
	 * @param {number} ACCELERATION   acceleration in pixels/second^2
	 * @param {number} MAX_SPEED      speed in pixels/second
	 */
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


		// Enable physics on the ship
	    this.game.physics.enable(this.spr, Phaser.Physics.ARCADE);

		// Set maximum velocity
	    this.spr.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED); // x, y
	}
	SpaceObject.prototype = new ns.obj.GameObject();
	SpaceObject.prototype.constructor = SpaceObject;

	SpaceObject.prototype.update = function(){
		// warp space objects if out of bounds
		if (this.spr.x > this.game.world.bounds.x + this.game.world.bounds.width) {this.spr.x = this.game.world.bounds.x;}
		if (this.spr.x < this.game.world.bounds.x) {this.spr.x = this.game.world.bounds.x + this.game.world.bounds.width;}
		if (this.spr.y > this.game.world.bounds.y + this.game.world.bounds.height) {this.spr.y = this.game.world.bounds.y;}
		if (this.spr.y < this.game.world.bounds.y) {this.spr.y = this.game.world.bounds.y + this.game.world.bounds.height;}
	};


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].obj = window['space-boats'].obj || {};
	window['space-boats'].obj.SpaceObject = SpaceObject;
}());
