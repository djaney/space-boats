var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var clientPub = require('redis').createClient(redisUrl);
var clientSub = require('redis').createClient(redisUrl);
clientPub.setMaxListeners(0);
clientSub.setMaxListeners(0);
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
            if(channel==_this.prefix+Player.CH_PHYSICS){
                this._physics = JSON.parse(message);
            }if(channel==_this.prefix+Player.CH_SYSTEM){
                this._system = JSON.parse(message);
            }else if(channel==_this.prefix+Player.CH_LAST_PHYSICS_UPDATE){
                this._lastPhysicsUpdate = JSON.parse(message);
            }
        });
        clientSub.psubscribe(Player.CH+'.'+this.id+'.*');
    }else{
        clientPub.publish(Player.CH_CREATE,JSON.stringify(this.id));
        this.sync();
        // clientPub.hset(Player.CH+'.'+this.id, Player.CH_LAST_PHYSICS_UPDATE, )
    }

};
Player.CH = 'player';
Player.CH_CREATE = Player.CH+'.create';
Player.CH_DESTROY = Player.CH+'.destroy';
Player.CH_PHYSICS = '.physics';
Player.CH_SYSTEM = '.system';
Player.CH_LAST_PHYSICS_UPDATE = '.lastPhysicsUpdate';
Player.prototype.destroy = function(){
    if(this.id){
        clientPub.hdel(Player.CH+'.pool',this.id);
        clientPub.publish(Player.CH_DESTROY,JSON.stringify(this.id));
    }
};
Player.prototype.sync = function(){
    var arr = {
        id: this.id,
        physics: this._physics,
        system: this._system,
        lastPhysicsUpdate: this._lastPhysicsUpdate
    };
    clientPub.hset(Player.CH+'.pool',this.id,JSON.stringify(arr));
};
Object.defineProperty(Player.prototype, 'physics', {
    get: function() {
        return this._physics;
    },
    set: function(val) {
        this._physics = val;
        if(this._physics)
            clientPub.publish(this.prefix+Player.CH_PHYSICS,JSON.stringify(this._physics));
        this.sync();
    }
});
Object.defineProperty(Player.prototype, 'system', {
    get: function() {
        return this._system;
    },
    set: function(val) {
        this._system = val;
        if(this._system)
            clientPub.publish(this.prefix+Player.CH_SYSTEM,JSON.stringify(this._system));
        this.sync();
    }
});
Object.defineProperty(Player.prototype, 'lastPhysicsUpdate', {
    get: function() {
        return this._lastPhysicsUpdate;
    },
    set: function(val) {
        this._lastPhysicsUpdate = val;
        if(this._lastPhysicsUpdate)
            clientPub.publish(this.prefix+Player.CH_LAST_PHYSICS_UPDATE,JSON.stringify(this._lastPhysicsUpdate));
        this.sync();
    }
});
module.exports = Player;
