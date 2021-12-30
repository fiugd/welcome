
import {
	players, board, scene, logo
} from './components/index.js';

const boardDims = {
	x: 4,
	y: 5
};

const characters = [
	[3,3, './assets/castle-front.piskel'],
	[1,1, './assets/king-front.piskel'],
	[2,2, './assets/queen-front.piskel'],
	[3,1, './assets/bishop-front.piskel'],
	[1,3, './assets/castle-front.piskel'],

	[2,5, './assets/castle.piskel'],
	[1,4, './assets/castle.piskel'],
	[4,3, './assets/castle.piskel'],
];

const { group, renderer, scene: _scene } = scene.setup();

logo.setup(_scene);
board.setup(boardDims, group);

const { animate } = await players.setup(characters, boardDims, group);

group.rotation.x = -0.9;
//group.rotation.x = -Math.PI/2;

const render = () => {
	//group.rotation.x += 0.01;
	//group.rotation.y += 0.01;
	renderer.render();
	animate();
	requestAnimationFrame( render );
};
requestAnimationFrame( render );
