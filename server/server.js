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
		client.emit('account:login:ack',{
			ack:true,
			clientId:client.id
		});
		// add player to all clients
		for(var i in _players){
			if (_players[i].socket.id!==client.id){
				_players[i].socket.emit('player:add',{
					profile:_players[i].profile,
					clientId:client.id
				});
			}
		}
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
			_players[i].socket.emit('physics:update',_physicsUpdates);
		}

	_physicsUpdates = [];

},15);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
