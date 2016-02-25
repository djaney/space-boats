class PlayerAccountModel
    constructor: (name, id, fbid) ->
        super
        @name = name or ''
        @_id = id or 0
        @fbid = fbid or 0
        return

window['space-boats'] = window['space-boats'] or {}
window['space-boats'].obj = window['space-boats'].obj or {}
window['space-boats'].obj.PlayerAccountModel = PlayerAccountModel
