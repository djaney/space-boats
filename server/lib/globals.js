var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var clientPub = require('redis').createClient(redisUrl);
var clientSub = require('redis').createClient(redisUrl);
clientPub.setMaxListeners(0);
clientSub.setMaxListeners(0);
var Player = require('./player');
var cwd = __dirname + '/../../dist';

var Globals = function() {
    var _this = this;
    this.players = {};
    this.systems = require(cwd+ '/map.json');
    this.systemNames = [];
    this.nearbySystems = [];
    clientSub.on('message',function(channel, message){
        if(channel==Player.CH_CREATE){
            var id = JSON.parse(message);
            if(!_this.players.hasOwnProperty(id)){
                _this.players[id] = new Player(id, false);
            }

        }
        if(channel==Player.CH_DESTROY){
            var id = JSON.parse(message);
            if(_this.players.hasOwnProperty(id)){
                delete _this.players[id]
            }

        }
    });
    clientSub.subscribe(Player.CH_CREATE);
    clientSub.subscribe(Player.CH_DESTROY);



};
Globals.prototype.loadPlayers = function(cb){
    var _this = this;
    clientPub.hgetall(Player.CH+'.pool',function(err, obj){
        if(!err){
            for(var i in obj){
                var data = JSON.parse(obj[i]);
                // console.log(data);
                if(data.id){
                    _this.players[data.id] = new Player(data.id, false);
                    _this.players[data.id].physics = data.physics;
                    _this.players[data.id].system = data.system;
                    _this.players[data.id].lastPhysicsUpdate = data.lastPhysicsUpdate;
                }

            }
            cb && cb();
        }else{
            throw err;
        }
    });

}
module.exports = Globals;
