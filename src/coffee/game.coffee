do ->
    ns = window['space-boats']
    # Load images and sounds
    class Game
        constructor: ->
            @worldSize = 800
            @cameraPos = new (Phaser.Point)(0, 0)
            @players = {}
            return



        preload: ->
            @game.time.advancedTiming = true
            @game.load.spritesheet 'ship', '/assets/ship.png', 32, 32
            @game.load.image 'starfield', '/assets/starfield.gif'
            return

        init: (params) ->
            ns.gameParams = params;
            @user = params.user
            @clientId = params.clientId
            @otherPlayers = params.otherPlayers
            @entryPoint = params.entryPoint
            return

        # Setup the example

        create: ->
            _this = this
            @players = {}
            @hudSettings = radar:
                diameter: @game.width * 0.15
                margin: 10
            _this.game.stage.disableVisibilityChange = true
            @bgStars = @game.add.tileSprite(0, 0, @game.width, @game.height, 'starfield')
            # create player
            @player = new SpaceObject(@game, 'ship', @entryPoint.x, @entryPoint.y, @entryPoint.rotation, 180, 200, 250)
            @player.socketOptions.emitPhysics = true
            # this.player.socketOptions.watchPhysics = true;
            @player.user = @user
            # initialize world bounds
            @game.world.setBounds @worldSize / 2 * -1 + @player.spr.x, @worldSize / 2 * -1 + @player.spr.y, @worldSize, @worldSize
            # create controls object
            @controls = new PlayerControlsObject(@game, @player)
            # camera follows player
            @game.camera.follow @player.spr
            # create HUD
            @hud = @game.add.graphics(0, 0)
            @hud.fixedToCamera = true

            @player.hyperspaceExit()
            # physics updates
            @physicsUpdateCb = (data) ->
                for i of data
                    if data[i].type == 'player' and _this.players.hasOwnProperty(data[i].clientId)
                        player = _this.players[data[i].clientId]
                        player.updatePhysics data[i].physics
                return

            ns.socket.on 'physics:update', @physicsUpdateCb
            # player add

            @playerAddCb = (d) ->
                if !d
                    return
                dataArr = []
                if Array.isArray(d)
                    dataArr = d
                else
                    dataArr = [ d ]
                for i of dataArr
                    data = dataArr[i]
                    # create player
                    x = if data.entryPoint then data.entryPoint.x else 0
                    y = if data.entryPoint then data.entryPoint.y else 0
                    rotation = if data.entryPoint then data.entryPoint.rotation else 0
                    player = new SpaceObject(_this.game, 'ship', x, y, rotation, 180, 200, 250)
                    if data.entryPoint
                        player.hyperspaceExit()
                    else
                        player.spr.alpha = 0
                        player.isCoordsLoaded = false
                    # some sprite settings
                    player.user = data.profile
                    player.socketOptions.emitPhysics = false
                    player.socketOptions.watchPhysics = true
                    _this.players[data.clientId] = player
                return

            ns.socket.on 'player:add', @playerAddCb
            # player add

            @playerRemoveCb = (data) ->
                if _this.players.hasOwnProperty(data.clientId)
                    _this.players[data.clientId].hyperspaceEnter ->
                        _this.game.world.remove _this.players[data.clientId].spr
                        delete _this.players[data.clientId]
                        return
                return

            ns.socket.on 'player:remove', @playerRemoveCb


            @playerControls = (data) ->
                _this.controls.consumeControls data

            ns.socket.on 'player:controls', @playerControls

            # add other players
            @playerAddCb @otherPlayers
            delete @otherPlayers
            return

        shutdown: ->
            ns.socket.removeListener 'physics:update', @physicsUpdateCb
            ns.socket.removeListener 'player:add', @playerAddCb
            ns.socket.removeListener 'player:remove', @playerRemoveCb
            ns.socket.removeListener 'player:controls', @playerControls
            return

        # The update() method is called every frame

        update: ->
            # watch keys
            @controls.update()
            # player object step
            @player.update()
            for i of @players
                @players[i].update()
            # world bounds must follow player
            @game.world.setBounds @worldSize / 2 * -1 + @player.spr.x, @worldSize / 2 * -1 + @player.spr.y, @worldSize, @worldSize
            # moving background
            @bgStars.tilePosition.x = -@player.spr.x
            @bgStars.tilePosition.y = -@player.spr.y
            # background follow camera
            @bgStars.x = @player.spr.x - (@game.width / 2)
            @bgStars.y = @player.spr.y - (@game.height / 2)
            return

        render: ->
            @game.debug.text 'x: ' + (@player.spr.x or '--'), 2, 16, '#00ff00'
            @game.debug.text 'y: ' + (@player.spr.y or '--'), 2, 16 * 2, '#00ff00'
            @game.debug.text 'rotation: ' + (@player.spr.rotation or '--'), 2, 16 * 3, '#00ff00'
            @game.debug.text 'fps: ' + (@game.time.fps or '--'), 2, 16 * 4, '#00ff00'
            @game.debug.text 'System: ' + @user.system, 2, 16 * 5, '#00ff00'
            @game.debug.text 'Warp: ' + @controls.isWarpControlVisible, 2, 16 * 6, '#00ff00'
            # draw radar
            @hud.clear()
            # radar body
            @hud.beginFill 0x0BFF0B, 0.5
            @hud.drawCircle @game.width - (@hudSettings.radar.diameter / 2) - (@hudSettings.radar.margin), @hudSettings.radar.diameter / 2 + @hudSettings.radar.margin, @hudSettings.radar.diameter
            @hud.endFill()
            # radar center
            @hud.beginFill 0x0BFF0B, 0.5
            @hud.lineStyle 1, 0x0BFF0B, 0.5
            @hud.moveTo @game.width - (@hudSettings.radar.diameter / 2) - (@hudSettings.radar.margin), @hudSettings.radar.margin
            @hud.lineTo @game.width - (@hudSettings.radar.diameter / 2) - (@hudSettings.radar.margin), @hudSettings.radar.margin + @hudSettings.radar.diameter
            @hud.endFill()
            @hud.beginFill 0x0BFF0B, 0.5
            @hud.lineStyle 1, 0x0BFF0B, 0.5
            @hud.moveTo @game.width - (@hudSettings.radar.diameter) - (@hudSettings.radar.margin), @hudSettings.radar.diameter / 2 + @hudSettings.radar.margin
            @hud.lineTo @game.width - (@hudSettings.radar.margin), @hudSettings.radar.diameter / 2 + @hudSettings.radar.margin
            @hud.endFill()
            # render other players in the radar
            for i of @players
                p = @players[i]
                xDiff = (p.spr.x - (@player.spr.x)) * 0.01
                yDiff = (p.spr.y - (@player.spr.y)) * 0.01
                distance = @game.math.distance(0, 0, xDiff, yDiff)
                if distance < @hudSettings.radar.diameter / 2
                    @hud.beginFill 0x0B0BFF, 0.5
                    @hud.lineStyle 0
                    @hud.drawCircle @game.width - (@hudSettings.radar.diameter / 2) - (@hudSettings.radar.margin) + xDiff, @hudSettings.radar.diameter / 2 + @hudSettings.radar.margin + yDiff, 3
                    @hud.endFill()
            return

    window['space-boats'] = window['space-boats'] or {}
    window['space-boats'].Game = Game
    return

# ---
# generated by js2coffee 2.1.0
