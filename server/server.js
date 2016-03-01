var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require(__dirname + '/utils.js');
var port = process.env.PORT || 9000;

// if(process.env.NODE_ENV==='production'){
// 	var cwd = __dirname + '/../src';
// }else{
//
// }
var cwd = __dirname + '/../dist';

app.use(express.static(cwd));
app.use('/phaser.min.js',express.static(__dirname + '/../node_modules/phaser/build/phaser.min.js'));

var _players = {};
var _systems = require(cwd+ '/map.json');
var _systemNames = [];
for(var i in _systems){
	_systemNames.push(i);
}

io.on('connection', function(client){
	_players[client.id] = {
		socket:client
	};
	client.on('disconnect', function(){
		// add player to all clients
		for(var i in _players){
			if (_players[i].socket.id!==client.id){
				_players[i].socket.emit('player:remove',{
					clientId:client.id
				});
			}
		}
		delete _players[client.id];

	});

	client.on('account:login', function(u){
		_players[client.id].profile = u;
		// set random system
		// var playerSystem = util.randomProperty(_systems);
		var playerSystem = "Sol";
		_players[client.id].system = playerSystem;

		var randomSize = 500;
		var entryPoint = {
			x: Math.random() * randomSize - (randomSize/2),
			y: Math.random() * randomSize - (randomSize/2),
			rotation: Math.random() * 360 * (Math.PI/180)
		}

		// add player to all clients
		var otherPlayers = []
		for(var i in _players){
			if (_players[i].socket.id!==client.id && _players[i].system==_players[client.id].system){
				// notify other players



				_players[i].socket.emit('player:add',{
					profile:_players[client.id].profile,
					system:_players[client.id].system,
					clientId:client.id,
					entryPoint:entryPoint
				});
				otherPlayers.push({
					profile:_players[i].profile,
					system:_players[i].system,
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
		_players[client.id].physics = params;
		_players[client.id].lastPhysicsUpdate = process.uptime();
	});

	client.on('player:controls', function(params){

		if(params.action == 'warp:init'){
			client.emit('player:controls', {
				action: params.action,
				data:_systemNames
			});
		}
	});
});

setInterval(function(){
	for(var i in _players){
		if(process.uptime() - _players[i].lastPhysicsUpdate > 5){
			_players[i].socket.disconnect();
		}
	}
},2500);

// server fast loop
setInterval(function(){
		for(var i in _players){
			var phy = [];
			for(var j in _players){
				if(_players[j].physics && _players[j].system===_players[i].system){
					phy.push({
						type:'player',
						clientId:_players[j].socket.id,
						physics:_players[j].physics
					});
				}
			}
			if(phy.length>0){
				_players[i].socket.emit('physics:update',phy);
			}
			delete phy;
		}


},100);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
