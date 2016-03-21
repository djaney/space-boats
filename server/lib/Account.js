module.exports = {
    listen: function(client, _globalData){
        _globalData._players[client.id] = {};
        client.on('account:login', function(u){
    		_globalData._players[client.id].profile = u;
    		// set random system
    		// var playerSystem = util.randomProperty(_globalData._systems);
    		var playerSystem = "Sol";
    		_globalData._players[client.id].system = playerSystem;

    		var randomSize = 500;
    		var entryPoint = {
    			x: Math.random() * randomSize - (randomSize/2),
    			y: Math.random() * randomSize - (randomSize/2),
    			rotation: Math.random() * 360 * (Math.PI/180)
    		}

    		// add player to all clients
    		var otherPlayers = []
    		for(var i in _globalData._players){
    			if (i!==client.id && _globalData._players[i].system==_globalData._players[client.id].system){
    				// notify other players



    				io.sockets.connected[i].emit('player:add',{
    					profile:_globalData._players[client.id].profile,
    					system:_globalData._players[client.id].system,
    					clientId:client.id,
    					entryPoint:entryPoint
    				});
    				otherPlayers.push({
    					profile:_globalData._players[i].profile,
    					system:_globalData._players[i].system,
    					clientId:i
    				});
    			}
    		}
    		// login new player
    		client.emit('account:login:ack',{
    			ack:true,
    			clientId:client.id,
    			system:playerSystem,
    			otherPlayers:otherPlayers,
    			entryPoint:entryPoint
    		});
    		delete otherPlayers;

    	});
        client.on('disconnect', function(){
            // add player to all clients
            for(var i in _globalData._players){
                if (i!==client.id && _globalData._players[i].system==_globalData._players[client.id].system){
                    io.sockets.connected[i].emit('player:remove',{
                        clientId:client.id
                    });
                }
            }
            delete _globalData._players[client.id];

        });
    }
};
