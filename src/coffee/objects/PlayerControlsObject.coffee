class PlayerControlsObject
    constructor: (game, player) ->
        @ns = window['space-boats']
        @game = game
        @player = player
        @isWarpControlVisible = false
        @nearestSystems = []
        # Capture certain keys to prevent their default actions in the browser.
        # This is only necessary because this is an HTML5 game. Games on other
        # platforms may not need code like this.
        @game.input.keyboard.addKeyCapture [
            Phaser.Keyboard.A
            Phaser.Keyboard.D
            Phaser.Keyboard.W
            Phaser.Keyboard.X
        ]

    update: ->
        if @leftInputIsActive()
            # If the LEFT key is down, rotate left
            @player.spr.body.angularVelocity = -@player.rotationSpeed
        else if @rightInputIsActive()
            # If the RIGHT key is down, rotate right
            @player.spr.body.angularVelocity = @player.rotationSpeed
        else
            # Stop rotating
            @player.spr.body.angularVelocity = 0
        if @upInputIsActive()
            # If the UP key is down, thrust
            # Calculate acceleration vector based on this.angle and this.ACCELERATION
            @player.spr.body.acceleration.x = Math.cos(@player.spr.rotation) * @player.acceleration
            @player.spr.body.acceleration.y = Math.sin(@player.spr.rotation) * @player.acceleration
            # Show the frame from the spritesheet with the engine on
            @player.spr.frame = 1
        else
            # Otherwise, stop thrusting
            @player.spr.body.acceleration.setTo 0, 0
            # Show the frame from the spritesheet with the engine off
            @player.spr.frame = 0

        if @warpInputIsActive() and !@isWarpControlVisible
            @showWarpControls()
        else if !@warpInputIsActive() and @isWarpControlVisible
            @hideWarpControls()

    render: ->
        console.log @nearestSystems

    leftInputIsActive: ->
        isActive = false
        isActive = @game.input.keyboard.isDown(Phaser.Keyboard.A)
        isActive |= @game.input.activePointer.isDown and @game.input.activePointer.x < @game.width / 4
        isActive

    rightInputIsActive: ->
        isActive = false
        isActive = @game.input.keyboard.isDown(Phaser.Keyboard.D)
        isActive |= @game.input.activePointer.isDown and @game.input.activePointer.x > @game.width / 2 + @game.width / 4
        isActive

    upInputIsActive: ->
        isActive = false
        isActive = @game.input.keyboard.isDown(Phaser.Keyboard.W)
        isActive |= @game.input.activePointer.isDown and @game.input.activePointer.x > @game.width / 4 and @game.input.activePointer.x < @game.width / 2 + @game.width / 4
        isActive

    warpInputIsActive: ->
        isActive = false
        isActive = @game.input.keyboard.isDown(Phaser.Keyboard.X)
        isActive

    # controls handler
    consumeControls: (res) ->
        if res.action == 'warp:init'
            @initWarp res.data
        if res.action == 'warp:start'
            @goWarp res.data
    emitControls: (action, data) ->
        @ns.socket.emit 'player:controls', {
            action: action
            data: data
        }

    # warping
    initWarp: (data) ->
        @nearestSystems = data
    startWarp: (warpTo) ->
        @emitControls 'warp:start', warpTo
    goWarp: (data) ->
        @player.hyperspaceEnter ->
            @ns.gameParams.user.system = data.system;
            @game.state.start 'game', true, true,
                user: @ns.gameParams.user
                clientId: @ns.gameParams.clientId
                otherPlayers: data.otherPlayers
                entryPoint: data.entryPoint
    showWarpControls: ->
        @isWarpControlVisible = true;
        @emitControls 'warp:init'

    hideWarpControls: ->
        @isWarpControlVisible = false
        system = @nearestSystems[Math.floor(Math.random()*@nearestSystems.length)];
        @startWarp system.name
