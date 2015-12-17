(function() {
	'use strict';
	var ns = window['space-boats'];
	function Game() {
		this.worldSize = 800;
		this.starCount = 300;
		this.cameraPos = new Phaser.Point(0, 0);
		this.stars = [];
		this.players = {};
	}

	// Load images and sounds
	Game.prototype.preload = function() {
		this.game.time.advancedTiming = true;
	    this.game.load.spritesheet('ship', '/assets/ship.png', 32, 32);
		this.game.load.image('starfield', '/assets/starfield.gif');
	};
	Game.prototype.init = function(params){
		console.log(params);
		this.user = params.user;
		this.otherPlayers = params.otherPlayers;
		this.entryPoint = params.entryPoint;
	};
	// Setup the example
	Game.prototype.create = function() {

		var _this = this;
		this.hudSettings = {
			radar:{
				diameter:this.game.width * 0.15,
				margin:10
			}
		};
		_this.game.stage.disableVisibilityChange = true;
		this.bgStars = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'starfield');

		// create player
		this.player = new ns.obj.SpaceObject(this.game,'ship', this.entryPoint.x, this.entryPoint.y, this.entryPoint.rotation, 180, 200, 250);

		this.player.socketOptions.emitPhysics = true;
		// this.player.socketOptions.watchPhysics = true;
		this.player.user = this.user;

		// initialize world bounds
		this.game.world.setBounds((this.worldSize/2*-1) + this.player.spr.x, (this.worldSize/2*-1) + this.player.spr.y, this.worldSize, this.worldSize);

		// create controls object
		this.controls = new ns.obj.PlayerControlsObject(this.game, this.player);

		// camera follows player
		this.game.camera.follow(this.player.spr);

		// create HUD
		this.hud = this.game.add.graphics(0,0);
		this.hud.fixedToCamera = true;


		// physics updates
		this.physicsUpdateCb = function(data){
			for(var i in data){
				if(data[i].type==='player' && _this.players.hasOwnProperty(data[i].clientId)){
					var player = _this.players[data[i].clientId];
					player.updatePhysics(data[i].physics);
				}
			}
		};
		ns.socket.on('physics:update', this.physicsUpdateCb);

		// player add
		this.playerAddCb = function(d){
			if(!d) {return;}
			var dataArr = [];

			if(Array.isArray(d)){
				dataArr = d;
			}else{
				dataArr = [d];
			}
			for(var i in dataArr){
				var data = dataArr[i];
				// create player
				var x = data.entryPoint ? data.entryPoint.x : 0;
				var y = data.entryPoint ? data.entryPoint.y : 0;
				var rotation = data.entryPoint ? data.entryPoint.rotation : 0;
				var player = new ns.obj.SpaceObject(_this.game,'ship', x, y, rotation, 180, 200, 250);
				player.hyperspaceExit();

				// some sprite settings
				player.user = data.profile;
				player.socketOptions.emitPhysics = false;
				player.socketOptions.watchPhysics = true;
				_this.players[data.clientId] = player;
			}


		};
		ns.socket.on('player:add', this.playerAddCb);

		// player add
		this.playerRemoveCb = function(data){
			if(_this.players.hasOwnProperty(data.clientId)){
				_this.players[data.clientId].hyperspaceEnter(function(){
					_this.game.world.remove(_this.players[data.clientId].spr);
					delete _this.players[data.clientId];
				});

			}
		};
		ns.socket.on('player:remove', this.playerRemoveCb);

		// add other players
		this.playerAddCb(this.otherPlayers);
		delete this.otherPlayers;

	};
	Game.prototype.shutdown = function(){
		ns.socket.removeListener('physics:update', this.physicsUpdateCb);
		ns.socket.removeListener('player:add', this.playerAddCb);
		ns.socket.removeListener('player:remove', this.playerRemoveCb);
	};


	// The update() method is called every frame
	Game.prototype.update = function() {
		// watch keys
		this.controls.update();

		// player object step
		this.player.update();

		for(var i in this.players){
			this.players[i].update();
		}

		// world bounds must follow player
		this.game.world.setBounds((this.worldSize/2*-1) + this.player.spr.x, (this.worldSize/2*-1) + this.player.spr.y, this.worldSize, this.worldSize);

		// moving background
		this.bgStars.tilePosition.x = -this.player.spr.x;
		this.bgStars.tilePosition.y = -this.player.spr.y;
		// background follow camera
		this.bgStars.x = this.player.spr.x - (this.game.width/2);
		this.bgStars.y = this.player.spr.y - (this.game.height/2);


	};

	Game.prototype.render = function(){
		this.game.debug.text('x: '+(this.player.spr.x || '--'), 2, 16, '#00ff00');
		this.game.debug.text('y: '+(this.player.spr.y || '--'), 2, 16 * 2, '#00ff00');
		this.game.debug.text('rotation: '+(this.player.spr.rotation || '--'), 2, 16 * 3, '#00ff00');
		this.game.debug.text('fps: '+(this.game.time.fps || '--'), 2, 16 * 4, '#00ff00');
		this.game.debug.text('System: '+this.user.system, 2, 16 * 5, '#00ff00');

		// draw radar
		this.hud.clear();
		// radar body
		this.hud.beginFill(0x0BFF0B, 0.5);
		this.hud.drawCircle(
			this.game.width - (this.hudSettings.radar.diameter/2) - this.hudSettings.radar.margin,
			this.hudSettings.radar.diameter/2 + this.hudSettings.radar.margin,
			this.hudSettings.radar.diameter
		);
		this.hud.endFill();

		// radar center
		this.hud.beginFill(0x0BFF0B, 0.5);
		this.hud.lineStyle(1,0x0BFF0B, 0.5);
		this.hud.moveTo(
			this.game.width - (this.hudSettings.radar.diameter/2) - this.hudSettings.radar.margin,
			this.hudSettings.radar.margin
		);
		this.hud.lineTo(
			this.game.width - (this.hudSettings.radar.diameter/2) - this.hudSettings.radar.margin,
			this.hudSettings.radar.margin + this.hudSettings.radar.diameter
		);
		this.hud.endFill();

		this.hud.beginFill(0x0BFF0B, 0.5);
		this.hud.lineStyle(1,0x0BFF0B, 0.5);
		this.hud.moveTo(
			this.game.width - this.hudSettings.radar.diameter - this.hudSettings.radar.margin,
			this.hudSettings.radar.diameter/2 + this.hudSettings.radar.margin
		);
		this.hud.lineTo(
			this.game.width - this.hudSettings.radar.margin,
			this.hudSettings.radar.diameter/2 + this.hudSettings.radar.margin
		);
		this.hud.endFill();

		// render other players in the radar
		for(var i in this.players){
			var p = this.players[i];
			var xDiff = (p.spr.x - this.player.spr.x) * 0.01;
			var yDiff = (p.spr.y - this.player.spr.y) * 0.01;
			var distance = this.game.math.distance(0,0,xDiff,yDiff);
			if(distance < this.hudSettings.radar.diameter/2){
				this.hud.beginFill(0x0B0BFF, 0.5);
				this.hud.lineStyle(0);
				this.hud.drawCircle(
					this.game.width - (this.hudSettings.radar.diameter/2) - this.hudSettings.radar.margin + xDiff,
					this.hudSettings.radar.diameter/2 + this.hudSettings.radar.margin + yDiff,
					3
				);
				this.hud.endFill();
			}

		}

	};


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].Game = Game;
}());
