var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('socket.io-redis');
var util = require('./utils.js');
var port = process.env.PORT || 9000;
var redisUrl = process.env.REDIS_URL || 'localhost:6379';

var Warp = require('./lib/warp');
var System = require('./lib/system');
var Account = require('./lib/account');
var Physics = require('./lib/physics');
var Globals = require('./lib/globals');

var cwd = __dirname + '/../dist';

io.adapter(redis(redisUrl));

app.use(express.static(cwd));
app.use('/phaser.min.js',express.static(__dirname + '/../node_modules/phaser/build/phaser.min.js'));
var _globalData = new Globals();
_globalData.players = {};
_globalData.systems = require(cwd+ '/map.json');
_globalData.systemNames = [];
_globalData.nearbySystems = [];
// var _globalData = {
// 	players: {},
// 	systems: require(cwd+ '/map.json'),
// 	systemNames: [],
// 	nearbySystems: [],
// 	sync: function(){
//
// 	}
// } ;

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
			io.sockets.connected[i].disconnect();
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
			io.sockets.connected[players[sys][p]].emit('physics:update',phy[sys]);
		}
	}

},100);

http.listen(port, function(){
	console.log('Listening at port: '+ port);
});
