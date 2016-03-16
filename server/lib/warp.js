module.exports = {
    warpStart:function(_players, client, _systemNames, params){
        for(var i in _players){
            if (_players[i].socket.id!==client.id && _players[i].system==_players[client.id].system){
                _players[i].socket.emit('player:remove',{
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
                if (_players[i].socket.id!==client.id && _players[i].system==_players[client.id].system){
                    _players[i].socket.emit('player:add',{
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
