module.exports = {
    listen: function(client, _globalData){
        client.on('physics:update', function(params){
            params.timestamp = process.uptime();
            _globalData.players[client.id].physics = params;
            _globalData.players[client.id].lastPhysicsUpdate = process.uptime();
        });
    }
};
