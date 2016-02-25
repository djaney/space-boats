do ->

    Preloader = ->
        @asset = null
        @ready = false
        return

    Preloader.prototype =
        preload: ->
            @asset = @add.sprite(@game.width * 0.5 - 110, @game.height * 0.5 - 10, 'preloader')
            @load.setPreloadSprite @asset
            # this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
            # this.loadResources();
            @ready = true
            return
        loadResources: ->
            # load your assets here
            return
        create: ->
        update: ->
            # if (!!this.ready) {
            @game.state.start 'menu'
            # }
            return
        onLoadComplete: ->
            # this.ready = true;
            return
    window['space-boats'] = window['space-boats'] or {}
    window['space-boats'].Preloader = Preloader
    return
