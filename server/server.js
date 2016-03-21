var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('./utils.js');
var port = process.env.PORT || 9000;

var Warp = require('./lib/warp');
var System = require('./lib/system');

// if(process.env.NODE_ENV==='production'){
// 	var cwd = __dirname + '/../src';
// }else{
//
// }
var cwd = __dirname + '/../dist';

app.use(express.static(cwd));
app.use('/phaser.min.js',express.static(__dirname + '/../node_modules/phaser/build/phaser.min.js'));

var _globalData = {
	_players: {},
	_systems: require(cwd+ '/map.json'),
	_systemNames: [],
	_nearbySystems: []
} ;

System.init(_globalData);

io.on('connection', function(client){
	_globalData._players[client.id] = {};
	client.on('disconnect', function(){
		// add player to all clients
		for(var i in _globalData._players){
			if (i!==client.id && _globalData._players[i].system==_globalData._players[client.id].system){
				io.sockets.connected[i].emit('player:remove',{
					clientId:client.id
				});
			}
		}
		delete _globalData._players[client.id];

	});

	client.on('account:login', function(u){
		_globalData._players[client.id].profile = u;
		// set random system
		// var playerSystem = util.randomProperty(_globalData._systems);
		var playerSystem = "Sol";
		_globalData._players[client.id].system = playerSystem;

		var randomSize = 500;
		var entryPoint = {
			x: Math.random() * randomSize - (randomSize/2),
			y: Math.random() * randomSize - (randomSize/2),
			rotation: Math.random() * 360 * (Math.PI/180)
		}

		// add player to all clients
		var otherPlayers = []
		for(var i in _globalData._players){
			if (i!==client.id && _globalData._players[i].system==_globalData._players[client.id].system){
				// notify other players



				io.sockets.connected[i].emit('player:add',{
					profile:_globalData._players[client.id].profile,
					system:_globalData._players[client.id].system,
					clientId:client.id,
					entryPoint:entryPoint
				});
				otherPlayers.push({
					profile:_globalData._players[i].profile,
					system:_globalData._players[i].system,
					clientId:i
				});
			}
		}
		// login new player
		client.emit('account:login:ack',{
			ack:true,
			clientId:client.id,
			system:playerSystem,
			otherPlayers:otherPlayers,
			entryPoint:entryPoint
		});
		// notify new client of other players
		// client.emit('player:add',otherPlayers);
		delete otherPlayers;

	});

	client.on('physics:update', function(params){
		params.timestamp = process.uptime();
		_globalData._players[client.id].physics = params;
		_globalData._players[client.id].lastPhysicsUpdate = process.uptime();
	});

	client.on('player:controls', function(params){

		if(params.action == 'warp:init'){
			Warp.warpInit(_globalData, client, params);
		}else if(params.action == 'warp:start'){
			Warp.warpStart(io, _globalData, client, params);

		}
	});
});

setInterval(function(){
	for(var i in _globalData._players){
		if(process.uptime() - _globalData._players[i].lastPhysicsUpdate > 5){
			io.sockets.connected[i].disconnect();
		}
	}
},2500);

// server fast loop
setInterval(function(){
		for(var i in _globalData._players){
			var phy = [];
			for(var j in _globalData._players){
				if(_globalData._players[j].physics && _globalData._players[j].system===_globalData._players[i].system){
					phy.push({
						type:'player',
						clientId:j,
						physics:_globalData._players[j].physics
					});
				}
			}
			if(phy.length>0){
				io.sockets.connected[i].emit('physics:update',phy);
			}
			delete phy;
		}


},100);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
