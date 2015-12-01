(function() {
	'use strict';

	function Game() {}

	Game.prototype = {
		create: function () {
			this.game.stage.backgroundColor = 0x333333;
		},

		update: function () {

		},

		onInputDown: function () {
		}
	};

	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].Game = Game;
}());
