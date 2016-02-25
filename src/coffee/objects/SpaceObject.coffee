
class SpaceObject extends GameObject
    constructor: (game, sprName, x, y, rotation, rotationSpeed, acceleration, maxSpeed) ->
        super
        @game = game
        @sprName = sprName
        @x = x
        @y = y
        @rotationSpeed = rotationSpeed
        @acceleration = acceleration
        @maxSpeed = maxSpeed
        @hyperspaceStep = null
        @hyperspaceMaxStep = 10
        @hyperspaceMaxScale = 20
        @hyperspaceDirection = 0
        @hyperspaceCb = null
        @isCoordsLoaded = true
        @socketOptions =
            emitPhysics: false
            watchPhysics: false
        # Add the ship to the stage
        @spr = @game.add.sprite(@x, @y, @sprName)
        @spr.anchor.setTo 0.5, 0.5
        @spr.angle = -90
        # Point the ship up
        @spr.rotation = rotation
        # Point the ship up
        # Enable physics on the ship
        @game.physics.enable @spr, Phaser.Physics.ARCADE
        # Set maximum velocity
        @spr.body.maxVelocity.setTo @maxSpeed, @maxSpeed
        # x, y
        @lastPhysicsUpdate = @game.time.now



    paused: ->
        @spr.body.acceleration.setTo 0, 0
        @update()

    hyperspaceEnter: (cb) ->
        if @hyperspaceStep == null
            @hyperspaceStep = 1
            @hyperspaceDirection = 1
            @spr.anchor.setTo 0, 0.5
            @hyperspaceCb = cb or null

    hyperspaceExit: (cb) ->
        if @hyperspaceStep == null
            @hyperspaceStep = @hyperspaceMaxStep
            @hyperspaceDirection = -1
            @spr.anchor.setTo 1, 0.5
            @hyperspaceCb = cb or null

    update: ->
        if @socketOptions.emitPhysics and @game.time.now - (@lastPhysicsUpdate) > 100
            @ns.socket.emit 'physics:update', [
                @spr.x
                @spr.y
                @spr.body.angularVelocity
                @spr.body.acceleration.x
                @spr.body.acceleration.y
                @spr.body.velocity.x
                @spr.body.velocity.y
                @spr.rotation
            ]
            @lastPhysicsUpdate = @game.time.now
        # hyperspace
        if @hyperspaceStep != null and @hyperspaceDirection > 0 and @hyperspaceStep < @hyperspaceMaxStep
            # Enter
            @hyperspaceStep++
            @spr.scale.x = @hyperspaceStep * @hyperspaceMaxScale / @hyperspaceMaxStep
        else if @hyperspaceStep != null and @hyperspaceDirection < 0 and @hyperspaceStep > 1
            # Leave
            @hyperspaceStep--
            @spr.scale.x = @hyperspaceStep * @hyperspaceMaxScale / @hyperspaceMaxStep
        else if @hyperspaceStep != null
            # End
            @hyperspaceStep = null
            @spr.scale.x = 1
            @spr.anchor.setTo 0.5, 0.5
            if typeof @hyperspaceCb == 'function'
                @hyperspaceCb()
                @hyperspaceCb = null

    updatePhysics: (data) ->
        if @socketOptions.watchPhysics
            lateSync = @hasOwnProperty('physicsTimestamp') and data.timestamp < @physicsTimestamp
            interpolationPercent = if @isCoordsLoaded then 0.2 else 1
            Point = Phaser.Point
            finalPoint = Point.interpolate(new Point(@spr.x, @spr.y), new Point(data[0], data[1]), interpolationPercent)
            if !lateSync
                @spr.x = finalPoint.x
                @spr.y = finalPoint.y
                @spr.rotation = data[7]
            @physicsTimestamp = data.timestamp
            # this.spr.body.angularVelocity = data.body.angularVelocity;
            @spr.body.acceleration.x = data[3]
            @spr.body.acceleration.y = data[4]
            @spr.body.velocity.x = data[5]
            @spr.body.velocity.y = data[6]
            if @spr.body.acceleration.x != 0 and @spr.body.acceleration.y != 0
                @spr.frame = 1
            else
                @spr.frame = 0
            if !@isCoordsLoaded
                @isCoordsLoaded = true
                obj = this
                obj.spr.alpha = 1

window['space-boats'] = window['space-boats'] or {}
window['space-boats'].obj = window['space-boats'].obj or {}
window['space-boats'].obj.SpaceObject = SpaceObject
