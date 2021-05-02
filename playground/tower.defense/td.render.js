import { htmlToElement } from '../../.tools/misc.mjs';
import {
	cleanError
} from './td.utils.js';
import {
	toggleCoords
} from './td.state.js'

const initDom = (state) => {
	const dom = htmlToElement(`
		<div>
			<style>
				body {
					height: 100vh;
					box-sizing: border-box;
					margin-top: 0;
					margin-bottom: 0;
					padding-bottom: 5em;
					overflow: hidden;
				}
			</style>
			<canvas style="width:100%"></canvas>
		</div>
	`);
	document.body.append(dom);
	const canvas = dom.querySelector('canvas');
	canvas.width = state.field.width;
	canvas.height = state.field.height;
	const ctx = canvas.getContext('2d');
	return ctx;
};

const render = (state, ctx) => {
	const { width: fieldWidth, height: fieldHeight} = state.field;
	ctx.fillStyle = '#111';
	ctx.fillRect(0, 0, fieldWidth, fieldHeight);

	const bottom = (height) => fieldHeight-height;
	const center = (x, width) => x - (width/2);

	const renderTower = ({ x, color, dims, status }) => {
		const [width, height] = dims;
		ctx.fillStyle = status === 'dead'
			? '#333'
			: color;
		ctx.fillRect(
			center(x, width), bottom(height),
			width, height
		);
	};

	const renderCharacter = ({ x }) => {
		const width = 30;
		ctx.fillRect(
			center(x, width), bottom(width),
			width, width
		);
	};

	const globalModeState = toggleCoords(state, 'global');
	globalModeState.towers.forEach(tower => {
		renderTower({ ...tower });
		tower.deployed.forEach(renderCharacter);
	});

	if(state.towers[0].status === 'dead'){
		console.log('Red wins!');
	}
	if(state.towers[1].status === 'dead'){
		console.log('Blue wins!');
	}
};

const tryRender = (state, ctx) => {
	try {
		render(state, ctx);
		return true;
	} catch(e) {
		console.error(cleanError(e));
		return false;
	}
};

export default class Render {
	constructor({ state }){
		const ctx = initDom(state);
		return () => tryRender(state, ctx);
	}
}