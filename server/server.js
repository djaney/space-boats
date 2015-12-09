var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 9000;
app.use(express.static(__dirname + '/../src'));

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
		_players[client.id].physics = params;
		_players[client.id].lastPhysicsUpdate = process.uptime();
	});

});

setInterval(function(){
	for(var i in _players){
		if(process.uptime() - _players[i].lastPhysicsUpdate > 1){
			_players[i].socket.disconnect();
		}
	}
},45);

// server fast loop
setInterval(function(){
		for(var i in _players){
			var phy = [];
			for(var j in _players){
				if(_players[j].physics){
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


},15);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
