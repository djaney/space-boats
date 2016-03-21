module.exports = {
    warpInit:function(_globalData, client, params){
        var names = _globalData._nearbySystems[_globalData._players[client.id].system];
        client.emit('player:controls', {
            action: params.action,
            data:names
        });
    },
    warpStart:function(io, _globalData, client, params){
        var _players = _globalData._players;
        var _systemNames = _globalData._systemNames;
        for(var i in _players){
            if (i!==client.id && _players[i].system==_players[client.id].system){

                io.sockets.connected[i].socket.emit('player:remove',{
                    clientId:client.id
                });
            }
        }
        var randomSize = 500;
        var entryPoint = {
            x: Math.random() * randomSize - (randomSize/2),
            y: Math.random() * randomSize - (randomSize/2),
            rotation:  _players[client.id].physics[7]
        }
        if (_systemNames.indexOf(params.data)>=0){
            _players[client.id].system = params.data
            var otherPlayers = [];
            for(var i in _players){
                if (i!==client.id && _players[i].system==_players[client.id].system){
                    io.sockets.connected[i].emit('player:add',{
                        profile:_players[client.id].profile,
                        system:_players[client.id].system,
                        clientId:client.id,
                        entryPoint:entryPoint
                    });
                    otherPlayers.push({
                        profile:_players[i].profile,
                        system:_players[i].system,
                        clientId:i
                    });
                }

            }
            client.emit('player:controls', {
                action: params.action,
                data:{
                    otherPlayers: otherPlayers,
                    system: _players[client.id].system,
                    entryPoint: entryPoint
                }
            });
        }
    }
};
