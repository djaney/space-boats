var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var clientPub = require('redis').createClient(redisUrl);
var clientSub = require('redis').createClient(redisUrl);

var Player = function(id, fromSelf) {
    var _this = this;
    if(typeof fromSelf=='undefined'){
        this.fromSelf = true;
    }else{
        this.fromSelf = fromSelf;
    }
    this.id = id;
    this.prefix =  Player.CH+'.'+this.id;
    if(!this.fromSelf){
        clientSub.on('pmessage',function(pattern, channel, message){
            if(channel==_this.prefix+Player.CH_LAST_PHYSICS_UPDATE){
                this._lastPhysicsUpdate = JSON.parse(message);
            }
        });
        clientSub.psubscribe('player.'+this.id+'.*');
    }else{

        clientPub.publish(Player.CH_CREATE,JSON.stringify(this.id));
    }

};
Player.CH = 'player';
Player.CH_CREATE = Player.CH+'.create';
Player.CH_DESTROY = Player.CH+'.destroy';
Player.CH_LAST_PHYSICS_UPDATE = '.lastPhysicsUpdate';
Player.prototype.destroy = function(){
    clientPub.publish(Player.CH_DESTROY,JSON.stringify(this.id));
};
Object.defineProperty(Player.prototype, 'physics', {
    get: function() {
        return this._physics;
    },
    set: function(val) {
        this._physics = val;
    }
});
Object.defineProperty(Player.prototype, 'system', {
    get: function() {
        return this._system;
    },
    set: function(val) {
        this._system = val;
    }
});
Object.defineProperty(Player.prototype, 'lastPhysicsUpdate', {
    get: function() {
        return this._lastPhysicsUpdate;
    },
    set: function(val) {
        this._lastPhysicsUpdate = val;
        clientPub.publish(this.prefix+Player.CH_LAST_PHYSICS_UPDATE,JSON.stringify(this._lastPhysicsUpdate));
    }
});
module.exports = Player;
