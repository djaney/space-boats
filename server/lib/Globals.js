var Globals = function() {};
Object.defineProperty(Globals.prototype, 'flag', {
    get: function() {
        return '[' + this._flag + ']';
    },
    set: function(val) {
        this._flag = val;
    }
});
module.exports = Globals;
