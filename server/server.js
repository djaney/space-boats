var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis').createClient;
var socketRedisAdapter = require('socket.io-redis');
var util = require('./utils.js');
var port = process.env.PORT || 9000;
var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

var Warp = require('./lib/warp');
var System = require('./lib/system');
var Account = require('./lib/account');
var Physics = require('./lib/physics');
var Globals = require('./lib/globals');

var enableCluster = process.env.ENABLE_CLUSTER && 1;


if(cluster.isMaster && enableCluster){
	for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
}else{

	var cwd = __dirname + '/../dist';

	var redisOpt = require('redis-url').parse(redisUrl);
	var socketRedisPub = redis(redisOpt.port, redisOpt.hostname, { auth_pass: redisOpt.password });
	var socketRedisSub = redis(redisOpt.port, redisOpt.hostname, { return_buffers: true, auth_pass: redisOpt.password });
	socketRedisPub.setMaxListeners(0);
	socketRedisSub.setMaxListeners(0);


	io.adapter(socketRedisAdapter({ pubClient: socketRedisPub, subClient: socketRedisSub }));


	app.use(express.static(cwd));
	app.use('/phaser.min.js',express.static(__dirname + '/../node_modules/phaser/build/phaser.min.js'));
	var _globalData = new Globals();

	_globalData.loadPlayers(function(){
		System.init(_globalData);

		io.on('connection', function(client){

			Account.listen(io, client, _globalData);
			Physics.listen(client, _globalData);

			client.on('player:controls', function(params){

				if(params.action == 'warp:init'){
					Warp.warpInit(_globalData, client, params);
				}else if(params.action == 'warp:start'){
					Warp.warpStart(io, _globalData, client, params);

				}
			});
		});


		// slow loop
		setInterval(function(){
			for(var i in _globalData.players){
				if(process.uptime() - _globalData.players[i].lastPhysicsUpdate > 5){
					if(io.sockets.connected[i]){
						io.sockets.connected[i].disconnect();
					}

				}
			}
		},2500);

		// server fast loop
		setInterval(function(){
			var phy = {};
			var players = {};
			for(var i in _globalData.players){
				var sys = _globalData.players.system;
				if( !phy.hasOwnProperty(_globalData.players.system) ){
					phy[sys] = [];
					players[sys] = [];
				}
				players[sys].push(i);
				phy[sys].push({
					type:'player',
					clientId:i,
					physics:_globalData.players[i].physics
				});
			}
			for(var sys in players){
				for(var p in players[sys]){
					if(io.sockets.connected[players[sys][p]]){
						io.sockets.connected[players[sys][p]].emit('physics:update',phy[sys]);
					}

				}
			}

		},100);

		http.listen(port, function(){
			console.log('Listening at port: '+ port);
		});
	});


}
