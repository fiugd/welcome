import { htmlToElement } from '../../.tools/misc.mjs';
import { cleanError } from './td.utils.js';
import { toggleCoords } from './td.state.js';
import GifMaker from './td.gif.js';

const BOTTOM_OFFSET = 65;

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
	const gif = state.record && new GifMaker({
		...state.field
	});
	return { ctx, gif };
};

const render = (state, ctx, gif) => {
	const { width: fieldWidth, height: fieldHeight} = state.field;
	//ctx.fillStyle = '#111';
	ctx.clearRect(0, 0, fieldWidth, fieldHeight);
	ctx.drawImage(state.assets.images.background, 0, 0);

	const bottom = (height) => fieldHeight-height-BOTTOM_OFFSET;
	const center = (x, width) => x - (width/2);

	
	const writeTicker = () => {
		ctx.fillStyle = '#777';
		ctx.font = "15px sans-serif";
		ctx.fillText(state.tick.toString().padStart(5, ' '), 20, 20);
	}
	
	const healthBar = ({ x, y, width, hp, hpMax }) => {
		ctx.strokeStyle = hp > 0 ? '#ddd' : '#111';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 0.5;
		ctx.fillStyle = hp > 0 ? 'green' : 'black';
		ctx.fillRect(x, y-10, width*(hp > 0 ? hp/hpMax : 1), 5);
		ctx.strokeRect(x, y-10, width, 5);
	};
	
	const renderTower = ({ x: centerX, color, dims, status, hp, hpMax }) => {
		const [width, height] = dims;
		const [x, y] = [center(centerX, width), bottom(height)];
		const isDead = status === 'dead';
		healthBar({ x, y, width, hp, hpMax });
		ctx.fillStyle = isDead ? '#111' : color;
		ctx.fillRect(x, y, width, height);
	};

	const renderCharacter = ({ x: centerX, hp, hpMax, color }) => {
		const width = 30;
		const height = 30;
		const [x, y] = [center(centerX, width), bottom(height)];
		healthBar({ x, y, width, hp, hpMax });
		ctx.fillStyle = color;
		ctx.fillRect(x, y, width, height);
		ctx.strokeStyle = '#111';
		ctx.strokeRect(x, y, width, height);
	};

	const globalModeState = toggleCoords(state, 'global');
	globalModeState.towers.forEach(tower => {
		renderTower(tower);
		tower.deployed.forEach(renderCharacter);
		writeTicker();
	});

	if(state.towers[0].status === 'dead'){
		console.log('Red wins!');
	}
	if(state.towers[1].status === 'dead'){
		console.log('Blue wins!');
	}

	if(!state.record) return;
	if(state.towers.find(x => x.status === 'dead')){
		(async () => {
			const image = document.createElement('img');
			(new Array(20)).fill().forEach(() => {
				gif.addFrame(ctx);
			});
			image.src= await gif.finish();
			document.body.append(image);
		})();
	} else {
		gif.addFrame(ctx);
	}
};

const tryRender = (state, ctx, gif) => {
	try {
		render(state, ctx, gif);
		return true;
	} catch(e) {
		console.error(cleanError(e));
		return false;
	}
};

export default class Render {
	constructor({ state }){
		const { ctx, gif } = initDom(state);
		return () => tryRender(state, ctx, gif);
	}
}