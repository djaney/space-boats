(function() {
	'use strict';

	/**
	 * User account data model
	 * @class PlayerAccountModel
	 */
	function PlayerAccountModel(name, id, fbid) {
		this.name = name || '';
		this._id = id || 0;
		this.fbid = fbid || 0;
	}


	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].obj = window['space-boats'].obj || {};
	window['space-boats'].obj.PlayerAccountModel = PlayerAccountModel;
}());
