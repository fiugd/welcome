
import {
	players, board, scene, logo, menu
} from './components/index.js';

const menuItems = [{
	name: 'play',
	click: () => {
		console.log('clicked play');
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
	[1,1, './assets/king-front.piskel'],
	[3,1, './assets/bishop-front.piskel'],
	[4,1, './assets/castle-front.piskel'],
	
	[2,2, './assets/queen-front.piskel'],
	
	[1,3, './assets/castle-front.piskel'],
	[4,3, './assets/castle.piskel'],

	[1,4, './assets/bishop-front.piskel'],
	
	[2,5, './assets/castle.piskel'],
	[4,5, './assets/queen-front.piskel'],
];

const { group, renderer, scene: _scene } = scene.setup();

logo.setup(_scene);
board.setup(boardDims, group);

const { animate } = await players.setup(characters, boardDims, group);

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
