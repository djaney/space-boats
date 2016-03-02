class PlayerAccountModel
    constructor: (name, id, fbid) ->
        super
        @name = name or ''
        @_id = id or 0
        @fbid = fbid or 0
        return
