window.loadGame = (user) ->
    ns = window['space-boats']
    game = new (Phaser.Game)(800, 600, Phaser.AUTO, 'space-boats-game')
    ns.socket = io()
    game.state.add 'boot', ns.Boot
    game.state.add 'preloader', ns.Preloader
    game.state.add 'disconnected', ns.Disconnected
    game.state.add 'game', ns.Game

    ###yo phaser:state new-state-files-put-here ###

    # handle user login
    ns.socket.emit 'account:login', user
    ns.socket.on 'account:login:ack', (ack) ->
        if ack.ack
            user.system = ack.system
            game.state.start 'game', true, true,{
                user: user
                clientId: ack.clientId
                otherPlayers: ack.otherPlayers
                entryPoint: ack.entryPoint
            }

        return
        ns.socket.on 'disconnect', ->
            game.state.start 'disconnected'
            return
        return

if typeof window.fbAsyncInit != 'function'
    window.loadGame
        id: 1234567890
        name: 'Star Lord'
