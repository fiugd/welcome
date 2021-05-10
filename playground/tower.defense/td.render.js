import { cleanError, colorShade } from './td.utils.js';
import { toggleCoords } from './td.state.js';
import GifMaker from './td.gif.js';
import { htmlToElement } from '../../.tools/misc.mjs';

const BOTTOM_OFFSET = 65;

const initDom = (state) => {
	const dom = document.querySelector('.container');
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
	const bottom = (height) => fieldHeight-height-BOTTOM_OFFSET;
	const center = (x, width) => x - (width/2);

	const {
		background: bgimg, bgMid, bgTop, bgBottom,
		teeRunBlue, teeRunRed, teeAttackBlue, teeAttackRed
	} = state.assets.images;

	const drawBackground = () => {
		// image, dx, dy
		// image, dx, dy, dWidth, dHeight
		// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight

		//draw skewed, middle part
		const hScale = 1;
		const vScale = 1;
		const hSkew = 0;
		const vSkew = -1.8;
		const skewOffSet = 90;
		ctx.transform(hScale, hSkew, vSkew, vScale, 0, 0);
		ctx.fillStyle = ctx.createPattern(bgMid, "repeat");
		ctx.fillRect(
			skewOffSet-fieldWidth, bgTop.height-1+21.5,
			fieldWidth*3, bgMid.height
		);
		ctx.resetTransform();

		//draw unskewed top part
		ctx.drawImage(
			bgTop,
			0,0,fieldWidth, bgTop.height
		);
		ctx.drawImage(
			bgTop,
			0,bgTop.height-5, //sx sy
			fieldWidth, 5, // sw sh
			0,bgTop.height-5, //dx dy
			fieldWidth, 25 //dw dh
		);

		//draw unskewed bottom part
		ctx.drawImage(
			bgBottom,
			0, bgTop.height+bgMid.height-1,
			fieldWidth, bgBottom.height
		);
	};

	const writeTicker = () => {
		ctx.fillStyle = '#777';
		ctx.font = "15px sans-serif";
		ctx.fillText(state.tick.toString().padStart(5, ' '), 20, 20);
	}
	
	const healthBar = ({ x, y, width, hp, hpMax }) => {
		ctx.strokeStyle = '#111';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 0.5;
		ctx.fillStyle = '#0002'
		ctx.fillRect(x, y-10, width, 5);
		ctx.fillStyle = '#DE9900'; //orange
		ctx.fillRect(x, y-10, width*(hp > 0 ? hp/hpMax : 0), 5);
		ctx.strokeRect(x, y-10, width, 5);
	};
	
	const shadow = ({ x, y, width, height }) => {
		const radius = width/2;
		ctx.fillStyle = '#00000020';
		//ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.ellipse(x+radius, y+height, radius, radius/3, 0, 0, Math.PI * 2);
		ctx.fill();
	};
	
	const renderTower = ({ x: centerX, color, dims, status, hp, hpMax, type }) => {
		const [width, height] = dims;
		const [x, y] = [center(centerX, width), bottom(height)];
		const isDead = status === 'dead';
		healthBar({ x, y: y-5, width, hp, hpMax });
		shadow({ x: x-10, y: y+2, width: width+20, height: height });

		let grd = ctx.createLinearGradient(x, 0, x+width, 0);
		if(!isDead){
			grd.addColorStop(0, type === 'attacker' ? colorShade(color, -90) : color);
			grd.addColorStop(1, type === 'attacker' ? color : colorShade(color, -90));
		} else {
			grd.addColorStop(0, type === 'attacker' ? '#111' : '#444');
			grd.addColorStop(1, type === 'attacker' ? '#444' : '#111');
		}

		ctx.fillStyle = grd;
		ctx.fillRect(x, y, width, height);
		ctx.beginPath();
		const radius = width/2;
		ctx.ellipse(x+radius, y+height, radius, radius/3, 0, 0, Math.PI * 2);
		ctx.fill()
		
		ctx.beginPath();
		ctx.ellipse(x+radius, y, radius, radius/5, 0, 0, Math.PI * 2);
		ctx.fill()
	};

	const renderCharacter = ({ x: centerX, hp, hpMax, color, type, target, tick=0 }) => {
		const frame = {
			defender: target
				? teeAttackRed[tick % 6]
				: teeRunRed[tick % 6],
			attacker: target
				? teeAttackBlue[tick % 6]
				: teeRunBlue[tick % 6]
		}[type];
		const scale = 0.7;
		const sprite = {
			x: center(centerX, frame.width*scale),
			y: bottom(frame.height*scale)+10,
			width: frame.width*scale,
			height: frame.height*scale,
			img: frame,
		};
		const shadowX = type === "attacker"
			? target ? sprite.x+10 : sprite.x-5
			: sprite.x
		shadow({ ...sprite, width: 30, x: shadowX, y: sprite.y-2 });
		ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height);
		hp > 0 && healthBar({ ...sprite, hp, hpMax, x: center(centerX, 20), width: 20 });
	};

	ctx.clearRect(0, 0, fieldWidth, fieldHeight);
	drawBackground();

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