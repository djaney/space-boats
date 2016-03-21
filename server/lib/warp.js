module.exports = {
    warpInit:function(_globalData, client, params){
        var names = _globalData.nearbySystems[_globalData.players[client.id].system];
        client.emit('player:controls', {
            action: params.action,
            data:names
        });
    },
    warpStart:function(io, _globalData, client, params){
        var players = _globalData.players;
        var systemNames = _globalData.systemNames;
        for(var i in players){
            if (i!==client.id && players[i].system==players[client.id].system){

                io.sockets.connected[i].socket.emit('player:remove',{
                    clientId:client.id
                });
            }
        }
        var randomSize = 500;
        var entryPoint = {
            x: Math.random() * randomSize - (randomSize/2),
            y: Math.random() * randomSize - (randomSize/2),
            rotation:  players[client.id].physics[7]
        }
        if (systemNames.indexOf(params.data)>=0){
            players[client.id].system = params.data
            var otherPlayers = [];
            for(var i in players){
                if (i!==client.id && players[i].system==players[client.id].system){
                    io.sockets.connected[i].emit('player:add',{
                        profile:players[client.id].profile,
                        system:players[client.id].system,
                        clientId:client.id,
                        entryPoint:entryPoint
                    });
                    otherPlayers.push({
                        profile:players[i].profile,
                        system:players[i].system,
                        clientId:i
                    });
                }

            }
            client.emit('player:controls', {
                action: params.action,
                data:{
                    otherPlayers: otherPlayers,
                    system: players[client.id].system,
                    entryPoint: entryPoint
                }
            });
        }
    }
};
