module.exports = {
    _nearbyDistance: 300,
    init:function(data){
        var _systems = data._systems;
        var _nearbySystems = data._nearbySystems;
        var _systemNames = data._systemNames;
        for(var i in _systems){
        	_systemNames.push(i);
        	_nearbySystems[i] = [];
        	for(var j in _systems){
        		if(i!=j){
        			var a = _systems[i];
        			var b = _systems[j];

        			var distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        			var angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        			if(distance<this._nearbyDistance){
        				_nearbySystems[i].push({
        					name: j,
        					angle: angleDeg
        				});
        			}

        		}

        	}
        	if(_nearbySystems[i].length==0){
        		console.error(i+" has no nearby system");
        	}
        }
    }
};
