Boot = ->
Boot.prototype =
    preload: ->
        @load.image 'preloader', 'assets/preloader.gif'
        return
    create: ->
        # configure game
        @game.input.maxPointers = 1
        if @game.device.desktop
            @game.scale.pageAlignHorizontally = true
        else
            @game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
            @game.scale.minWidth = 480
            @game.scale.minHeight = 260
            @game.scale.maxWidth = 640
            @game.scale.maxHeight = 480
            @game.scale.forceOrientation true
            @game.scale.pageAlignHorizontally = true
            @game.scale.setScreenSize true
        @game.state.start 'preloader'
        return
window['space-boats'] = window['space-boats'] or {}
window['space-boats'].Boot = Boot
