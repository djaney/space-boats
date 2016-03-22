var Globals = function() {};
Object.defineProperty(Globals.prototype, 'players', {
    get: function() {
        return this._players;
    },
    set: function(val) {
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
