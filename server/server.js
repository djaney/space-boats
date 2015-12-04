var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 9000;
app.use(express.static(__dirname + '/../src'));


io.on('connection', function(client){
	var user = null;
	console.log('a user connected');
	client.on('disconnect', function(){
		if(user){
			console.log(user.name + ' disconnected');
		}else{
			console.log('user disconnected');
		}

	});

	client.on('account:login', function(u){
		user = u;
		console.log(user.name + ' logged in');
		client.emit('account:login:ack',true);
	});

});


http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
