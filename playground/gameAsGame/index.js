
import {
	players, board, scene, logo, menu
} from './components/index.js';

import controls from './modules/controls.js';

const menuItems = [{
	name: 'play',
	click: () => {
		console.log('clicked play');
	}
}, {
	name: 'create',
	click: () => {
		console.log('clicked create');
	}
}, {
	name: 'collect',
	click: () => {
		console.log('clicked collect');
	}
}]

menu.setup(menuItems);

const boardDims = {
	x: 4,
	y: 5
};

const characters = [
	[1,1, './assets/bishop-front.piskel'],
	[2,1, './assets/king-front.piskel'],
	[3,1, './assets/knight.piskel'],
	[4,1, './assets/castle-front.piskel'],
	
	[2,3, './assets/queen-front.piskel'],
	
	[1,3, './assets/castle-front.piskel'],
	[3,3, './assets/castle.piskel'],
	[4,3, './assets/knight.piskel'],

	[1,4, './assets/bishop-front.piskel'],
	
	[2,5, './assets/castle.piskel'],
	[4,5, './assets/queen-front.piskel'],
];

const {
	camera,
	group,
	renderer,
	scene: _scene
} = scene.setup();

logo.setup(_scene);
const _board = board.setup(boardDims, group);

const {
	animate,
	players: _players
} = await players.setup(characters, boardDims, group);

group.position.y -= 1;
group.rotation.x = -0.9;
//group.rotation.x = -Math.PI/2;

let added = 0
let it = 0.00015;
const render = () => {
	group.rotation.x -= it;
	group.rotation.z += it;
	added += it;
	if(Math.abs(added) > 0.1) it *= -1;
	renderer.render();
	animate();
	requestAnimationFrame( render );
};
requestAnimationFrame( render );

const context = {
	camera,
	objects: [_board, ..._players],
	scene: group,
	board: _board,
	players: _players,
	renderer
};
const events = {
	hover: (player, square) => {
		player.color(square.dark ? "#8CF" : "#BFF");
		square.color(square.dark ? "#04D" : "#4AF");
	},
	select: (player, square) => {
		player.color(square.dark ? "#D8D" : "#FAD");
		square.color(square.dark ? "#D08" : "#D5A");
	}
}
controls.setup(context, events);
