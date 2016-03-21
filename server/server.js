var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('./utils.js');
var port = process.env.PORT || 9000;

var Warp = require('./lib/Warp');
var System = require('./lib/System');
var Account = require('./lib/Account');
var Physics = require('./lib/Physics');

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
	for(var i in _globalData._players){
		if(process.uptime() - _globalData._players[i].lastPhysicsUpdate > 5){
			io.sockets.connected[i].disconnect();
		}
	}
},2500);

// server fast loop
setInterval(function(){
	var phy = {};
	var players = {};
	for(var i in _globalData._players){
		var sys = _globalData._players.system;
		if( !phy.hasOwnProperty(_globalData._players.system) ){
			phy[sys] = [];
			players[sys] = [];
		}
		players[sys].push(i);
		phy[sys].push({
			type:'player',
			clientId:i,
			physics:_globalData._players[i].physics
		});
	}
	for(var sys in players){
		for(var p in players[sys]){
			io.sockets.connected[players[sys][p]].emit('physics:update',phy[sys]);
		}
	}

},100);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
