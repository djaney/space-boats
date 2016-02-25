class Disconnected

    create: ->
        text = @add.text(@game.width * 0.5, @game.height * 0.5, 'Disconnected',
            font: '42px Arial'
            fill: '#ffffff'
            align: 'center')
        text.anchor.set 0.5
        @game.camera.follow text
        return

window['space-boats'] = window['space-boats'] or {}
window['space-boats'].Disconnected = Disconnected
