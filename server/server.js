var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 9000;
app.use(express.static(__dirname + '/../src'));

var _physicsUpdates = [];
var _players = {};
io.on('connection', function(client){
	_players[client.id] = {
		socket:client
	};
	console.log(client.id + ' connected');
	client.on('disconnect', function(){
		console.log(client.id + ' disconnected');
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
		console.log(_players[client.id].profile.name + ' logged in');

		// add player to all clients
		var otherPlayers = []
		for(var i in _players){
			if (_players[i].socket.id!==client.id){
				// notify other players
				_players[i].socket.emit('player:add',{
					profile:_players[client.id].profile,
					clientId:client.id
				});
				otherPlayers.push({
					profile:_players[i].profile,
					clientId:i
				});
			}
		}
		// login new player
		client.emit('account:login:ack',{
			ack:true,
			clientId:client.id,
			otherPlayers:otherPlayers
		});
		// notify new client of other players
		// client.emit('player:add',otherPlayers);
		delete otherPlayers;

	});

	client.on('physics:update', function(params){
		_physicsUpdates.push({
			type:'player',
			clientId:client.id,
			physics:params
		});
	});

});

// server fast loop
setInterval(function(){
		for(var i in _players){
			var phy = [];
			for(var j in _physicsUpdates){
				if(_physicsUpdates[j].clientId!==_players[i].socket.id){
					phy.push(_physicsUpdates[j]);
				}
			}
			if(phy.length>0){
				_players[i].socket.emit('physics:update',phy);
			}
		}

	_physicsUpdates = [];

},15);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
