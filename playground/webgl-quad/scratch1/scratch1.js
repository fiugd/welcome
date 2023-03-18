import Graphic from './graphics.js';
import GameLoop from './gameloop.js';

import MoveA from './moveA.js';
import MoveB from './moveB.js';

const FRAME_RATE = 30;
const READY_DELAY = 1;

const game = GameLoop(
	new MoveB({ graphic: new Graphic() }),
	FRAME_RATE
);

setTimeout(game.start, READY_DELAY);
