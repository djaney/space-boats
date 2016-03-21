module.exports = {
    _nearbyDistance: 300,
    init:function(data){
        var systems = data.systems;
        var nearbySystems = data.nearbySystems;
        var systemNames = data.systemNames;
        for(var i in systems){
        	systemNames.push(i);
        	nearbySystems[i] = [];
        	for(var j in systems){
        		if(i!=j){
        			var a = systems[i];
        			var b = systems[j];

        			var distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        			var angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        			if(distance<this._nearbyDistance){
        				nearbySystems[i].push({
        					name: j,
        					angle: angleDeg
        				});
        			}

        		}

        	}
        	if(nearbySystems[i].length==0){
        		console.error(i+" has no nearby system");
        	}
        }
    }
};
