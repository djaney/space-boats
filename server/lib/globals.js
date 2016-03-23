var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var clientPub = require('redis').createClient(redisUrl);
var clientSub = require('redis').createClient(redisUrl);
var Player = require('./player');

var Globals = function() {
    var _this = this;
    clientSub.on('message',function(channel, message){
        console.log(channel, message);
        if(channel==Player.CH_CREATE){
            var id = JSON.parse(message);
            if(!_this._players.hasOwnProperty(id)){
                _this._players[id] = new Player(id, false);
            }

        }
        if(channel==Player.CH_DESTROY){
            var id = JSON.parse(message);
            if(_this._players.hasOwnProperty(id)){
                delete _this._players[id]
            }

        }
    });
    clientSub.subscribe(Player.CH_CREATE);
    clientSub.subscribe(Player.CH_DESTROY);
};
Object.defineProperty(Globals.prototype, 'players', {
    get: function() {

        return this._players;
    },
    set: function(val) {
        console.log('set');
        this._players = val;
    }
});
Object.defineProperty(Globals.prototype, 'systems', {
    get: function() {
        return this._systems;
    },
    set: function(val) {
        this._systems = val;
    }
});
Object.defineProperty(Globals.prototype, 'systemNames', {
    get: function() {
        return this._systemNames;
    },
    set: function(val) {
        this._systemNames = val;
    }
});
Object.defineProperty(Globals.prototype, 'nearbySystems', {
    get: function() {
        return this._nearbySystems;
    },
    set: function(val) {
        this._nearbySystems = val;
    }
});
module.exports = Globals;
