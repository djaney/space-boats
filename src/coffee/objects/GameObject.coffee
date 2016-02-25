class GameObject
    constructor: ->
        @ns = window['space-boats'];

window['space-boats'] = window['space-boats'] or {}
window['space-boats'].obj = window['space-boats'].obj or {}
window['space-boats'].obj.GameObject = GameObject
