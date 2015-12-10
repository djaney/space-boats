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
	 * @param {number} rotationSpeed rotation speed in degrees/second
	 * @param {number} acceleration   acceleration in pixels/second^2
	 * @param {number} maxSpeed      speed in pixels/second
	 */
	function SpaceObject(game,sprName, x, y, rotationSpeed, acceleration, maxSpeed) {
		this.game = game;
		this.sprName = sprName;
		this.x = x;
		this.y = y;
		this.rotationSpeed = rotationSpeed;
		this.acceleration = acceleration;
		this.maxSpeed = maxSpeed;
		this.hyperspaceStep = null;
		this.hyperspaceMaxStep = 10;
		this.hyperspaceMaxScale = 20;
		this.hyperspaceDirection = 0;
		this.hyperspaceCb = null;
		this.socketOptions = {emitPhysics:false, watchPhysics: false};
		// Add the ship to the stage
	    this.spr = this.game.add.sprite(this.x, this.y, this.sprName);
		this.spr.anchor.setTo(0.5, 0.5);
		this.spr.angle = -90; // Point the ship up

		// Enable physics on the ship
	    this.game.physics.enable(this.spr, Phaser.Physics.ARCADE);

		// Set maximum velocity
	    this.spr.body.maxVelocity.setTo(this.maxSpeed, this.maxSpeed); // x, y
	}
	SpaceObject.prototype = new ns.obj.GameObject();
	SpaceObject.prototype.constructor = SpaceObject;
	SpaceObject.prototype.paused = function(){
		alert('ha');
		this.spr.body.acceleration.setTo(0, 0);
		this.update();
	};
	SpaceObject.prototype.hyperspaceEnter = function(cb){
		if(this.hyperspaceStep===null){
			this.hyperspaceStep = 1;
			this.hyperspaceDirection = 1;
			this.spr.anchor.setTo(0, 0.5);
			this.hyperspaceCb = cb || null;
		}
	};

	SpaceObject.prototype.hyperspaceExit = function(cb){
		if(this.hyperspaceStep===null){
			this.hyperspaceStep = this.hyperspaceMaxStep;
			this.hyperspaceDirection = -1;
			this.spr.anchor.setTo(1, 0.5);
			this.hyperspaceCb = cb || null;
		}
	};

	SpaceObject.prototype.update = function(){
		// warp space objects if out of bounds
		// if (this.spr.x > this.game.world.bounds.x + this.game.world.bounds.width) {this.spr.x = this.game.world.bounds.x;}
		// if (this.spr.x < this.game.world.bounds.x) {this.spr.x = this.game.world.bounds.x + this.game.world.bounds.width;}
		// if (this.spr.y > this.game.world.bounds.y + this.game.world.bounds.height) {this.spr.y = this.game.world.bounds.y;}
		// if (this.spr.y < this.game.world.bounds.y) {this.spr.y = this.game.world.bounds.y + this.game.world.bounds.height;}

		if(this.socketOptions.emitPhysics){
			ns.socket.emit('physics:update',{
				x: this.spr.x,
				y: this.spr.y,
				body:{
					angularVelocity: this.spr.body.angularVelocity,
					acceleration: {
						x:this.spr.body.acceleration.x,
						y:this.spr.body.acceleration.y,
					},
					velocity: {
						x:this.spr.body.velocity.x,
						y:this.spr.body.velocity.y,
					},
				},
				rotation: this.spr.rotation,
			});
		}

		// hyperspace
		if(this.hyperspaceStep!==null && this.hyperspaceDirection>0 && this.hyperspaceStep < this.hyperspaceMaxStep){
			// Enter
			this.hyperspaceStep++;
			this.spr.scale.x = this.hyperspaceStep * (this.hyperspaceMaxScale/this.hyperspaceMaxStep);
		}else if(this.hyperspaceStep!==null && this.hyperspaceDirection<0 && this.hyperspaceStep > 1){
			// Leave
			this.hyperspaceStep--;
			this.spr.scale.x = this.hyperspaceStep * (this.hyperspaceMaxScale/this.hyperspaceMaxStep);
		}else if(this.hyperspaceStep!==null){
			// End
			this.hyperspaceStep = null;
			this.spr.scale.x = 1;
			this.spr.anchor.setTo(0.5, 0.5);
			if(typeof this.hyperspaceCb==='function'){
				this.hyperspaceCb();
				this.hyperspaceCb = null;
			}
		}



	};

	SpaceObject.prototype.updatePhysics = function(data){
		if(this.socketOptions.watchPhysics){
			this.spr.x = data.x;
			this.spr.y = data.y;
			this.spr.rotation = data.rotation;
			this.spr.body.angularVelocity = data.body.angularVelocity;
			this.spr.body.acceleration.x = data.body.acceleration.x;
			this.spr.body.acceleration.y = data.body.acceleration.y;
			this.spr.body.velocity.x = data.body.velocity.x;
			this.spr.body.velocity.y = data.body.velocity.y;
			if(this.spr.body.acceleration.x!==0 && this.spr.body.acceleration.y!==0){
				this.spr.frame = 1;
			}else{
				this.spr.frame = 0;
			}
		}
	};


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].obj = window['space-boats'].obj || {};
	window['space-boats'].obj.SpaceObject = SpaceObject;
}());
