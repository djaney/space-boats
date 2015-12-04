var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 9000;
app.use(express.static(__dirname + '/../src'));


io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});


http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
