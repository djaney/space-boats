window.loadGame = function (user) {
	'use strict';

	var ns = window['space-boats'];
	var game = new Phaser.Game(640, 480, Phaser.AUTO, 'space-boats-game');

	ns.socket = io();

	game.state.add('boot', ns.Boot);
	game.state.add('preloader', ns.Preloader);
	game.state.add('menu', ns.Menu);
	game.state.add('game', ns.Game);
	/* yo phaser:state new-state-files-put-here */
	ns.socket.emit('account:login', user);
	ns.socket.on('account:login:ack', function(ack){
		if(ack){
			game.state.start('game',true,true,{
				user:user
			});
		}

	});

};

if(typeof window.fbAsyncInit!=='function'){
	 window.loadGame({
		id:1234567890,
		name: 'Star Lord'
	 });
}
