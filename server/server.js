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
	console.log('a user connected');
	client.on('disconnect', function(){
		if(_players[client.id].profile){
			console.log(_players[client.id].profile.name + ' disconnected');
		}else{
			console.log('user disconnected');
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
