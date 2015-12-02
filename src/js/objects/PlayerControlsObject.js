(function() {
	'use strict';
	var ns = window['space-boats'];
	/**
	 * Handle controls
	 * @class PlayerControlsObject
	 * @param {object} game   game object
	 * @param {object} player SpaceObject to control
	 */
	function PlayerControlsObject(game, player) {
		this.game = game;
		this.player = player;
		// Capture certain keys to prevent their default actions in the browser.
		// This is only necessary because this is an HTML5 game. Games on other
		// platforms may not need code like this.
		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT,
			Phaser.Keyboard.UP,
			Phaser.Keyboard.DOWN
		]);
	}
	PlayerControlsObject.prototype = new ns.obj.GameObject();
	PlayerControlsObject.prototype.constructor = PlayerControlsObject;
	/**
	 * Watch the input stream. Must be called in game state update
	 * @method watchInput
	 */
	PlayerControlsObject.prototype.watchInput = function(){
		// Keep the ship on the screen
	    if (this.player.spr.x > this.game.width) {this.player.spr.x = 0;}
	    if (this.player.spr.x < 0) {this.player.spr.x = this.game.width;}
	    if (this.player.spr.y > this.game.height) {this.player.spr.y = 0;}
	    if (this.player.spr.y < 0) {this.player.spr.y = this.game.height;}

	    if (this.leftInputIsActive()) {
	        // If the LEFT key is down, rotate left
	        this.player.spr.body.angularVelocity = -this.player.ROTATION_SPEED;
	    } else if (this.rightInputIsActive()) {
	        // If the RIGHT key is down, rotate right
	        this.player.spr.body.angularVelocity = this.player.ROTATION_SPEED;
	    } else {
	        // Stop rotating
	        this.player.spr.body.angularVelocity = 0;
	    }

	    if (this.upInputIsActive()) {
	        // If the UP key is down, thrust
	        // Calculate acceleration vector based on this.angle and this.ACCELERATION
	        this.player.spr.body.acceleration.x = Math.cos(this.player.spr.rotation) * this.player.ACCELERATION;
	        this.player.spr.body.acceleration.y = Math.sin(this.player.spr.rotation) * this.player.ACCELERATION;

	        // Show the frame from the spritesheet with the engine on
	        this.player.spr.frame = 1;
	    } else {
	        // Otherwise, stop thrusting
	        this.player.spr.body.acceleration.setTo(0, 0);

	        // Show the frame from the spritesheet with the engine off
	        this.player.spr.frame = 0;
	    }
	}



	/**
	 * This function should return true when the player activates the "go left" control
	 * In this case, either holding the right arrow or tapping or clicking on the left
	 * side of the screen.
	 * @method leftInputIsActive
	 * @return {boolean}
	 */
	PlayerControlsObject.prototype.leftInputIsActive = function() {
	    var isActive = false;

	    isActive = this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
	    isActive |= (this.game.input.activePointer.isDown &&
	        this.game.input.activePointer.x < this.game.width/4);

	    return isActive;
	};

	/**
	 * This function should return true when the player activates the "go right" control
	 * In this case, either holding the right arrow or tapping or clicking on the right
	 * side of the screen.
	 * @method rightInputIsActive
	 * @return {boolean}
	 */
	PlayerControlsObject.prototype.rightInputIsActive = function() {
	    var isActive = false;

	    isActive = this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
	    isActive |= (this.game.input.activePointer.isDown &&
	        this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

	    return isActive;
	};


	/**
	 * This function should return true when the player activates the "jump" control
	 * In this case, either holding the up arrow or tapping or clicking on the center
	 * part of the screen.
	 * @method upInputIsActive
	 * @return {boolean}
	 */
	PlayerControlsObject.prototype.upInputIsActive = function() {
	    var isActive = false;

	    isActive = this.game.input.keyboard.isDown(Phaser.Keyboard.UP);
	    isActive |= (this.game.input.activePointer.isDown &&
	        this.game.input.activePointer.x > this.game.width/4 &&
	        this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);

	    return isActive;
	};

	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].obj = window['space-boats'].obj || {};
	window['space-boats'].obj.PlayerControlsObject = PlayerControlsObject;
}());
