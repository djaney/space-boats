(function() {
	'use strict';

	function Disconnected() {}

	Disconnected.prototype = {
		create: function () {
			var text = this.add.text(this.game.width * 0.5, this.game.height * 0.5,
				'Disconnected', {font: '42px Arial', fill: '#ffffff', align: 'center'
			});
			text.anchor.set(0.5);
			this.game.camera.follow(text);
		},


	};

	window['space-boats'] = window['space-boats'] || {};
	window['space-boats'].Disconnected = Disconnected;
}());
