import { cleanError, colorShade } from '../utils/utils.js';
import { toggleCoords } from '../engine/state.js';
import GifMaker from './gif.js';

const BOTTOM_OFFSET = 60;

const initDom = (state) => {
	const dom = document.querySelector('.container');
	const canvas = dom.querySelector('canvas');
	canvas.width = state.field.width;
	canvas.height = state.field.height;
	const ctx = canvas.getContext('2d', {
		antialias: false,
		depth: false,
		desynchronized: true
	});
	const gif =
		state.record &&
		new GifMaker({
			...state.field
		});
	ctx.imageSmoothingEnabled = false;
	return { ctx, gif };
};

const render = (state, ctx, gif, controls) => {
	const { width: fieldWidth, height: fieldHeight } = state.field;
	const SCALAR = (x) => x * 4;
	const bottom = (height) => fieldHeight - height - SCALAR(BOTTOM_OFFSET);
	const center = (x, width) => x - width / 2;

	const {
		background: bgimg,
		bgMid,
		bgTop,
		bgBottom,
		teeRunBlue,
		teeRunRed,
		teeAttackBlue,
		teeAttackRed
	} = state.assets.images;

	controls.updateProgress('missile', state.missile.charge || 0);
	controls.updateProgress('mineral', state.mineral.charge || 0);

	const drawGuides = () => {
		const line = (x, y, x1, y2, color = '#555') => {
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x1, y2);
			ctx.stroke();
		};
		const width = 50;
		line(0, 457, width, 457, 'black'); //horizon
		line(0, 229, width, 229); // tower top
		line(0, 229 + 371 - 28, width, 229 + 371 - 28); // tower bottom
		line(0, 229 + 371, width, 229 + 371); // tower shadow bottom
	};

	const drawBackground = () => {
		ctx.drawImage(
			bgimg,
			0,
			0, //dx dy
			fieldWidth,
			fieldHeight //dw dh
		);

		drawGuides();
		return; //build background in assets and remove from here

		// image, dx, dy
		// image, dx, dy, dWidth, dHeight
		// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight

		//draw skewed, middle part
		const hScale = SCALAR(1);
		const vScale = SCALAR(1);
		const hSkew = 0;
		const vSkew = SCALAR(-1.8);
		const skewOffSet = SCALAR(90);
		ctx.transform(hScale, hSkew, vSkew, vScale, 0, 0);
		ctx.fillStyle = ctx.createPattern(bgMid, 'repeat');
		ctx.fillRect(
			skewOffSet - fieldWidth,
			SCALAR(bgTop.height - 1 + 21.5),
			fieldWidth * 3,
			SCALAR(bgMid.height)
		);
		ctx.resetTransform();

		//draw unskewed top part
		ctx.drawImage(bgTop, 0, 0, fieldWidth, SCALAR(bgTop.height));
		ctx.drawImage(
			bgTop,
			0,
			bgTop.height - 5, //sx sy
			bgTop.width,
			5, // sw sh
			0,
			fieldHeight - SCALAR(5), //dx dy
			fieldWidth,
			SCALAR(25) //dw dh
		);

		//draw unskewed bottom part
		ctx.drawImage(
			bgBottom,
			0,
			SCALAR(bgTop.height + bgMid.height) - 1, //dx dy
			fieldWidth,
			SCALAR(bgBottom.height) //dw dh
		);
	};

	const writeTicker = () => {
		controls.updateTicker(state.tick.toString().padStart(5, ' '));
	};
	writeTicker();

	const healthBar = ({ x, y, width, hp, hpMax }) => {
		const healthX = center(x, SCALAR(width));
		const healthWidth = SCALAR(width);
		ctx.strokeStyle = '#111';
		ctx.lineJoin = 'round';
		ctx.lineWidth = SCALAR(0.5);
		ctx.fillStyle = '#0002';
		ctx.fillRect(healthX, y - SCALAR(10), healthWidth, SCALAR(5));
		ctx.fillStyle = '#DE9900'; //orange
		ctx.fillRect(
			healthX,
			y - SCALAR(10),
			healthWidth * (hp > 0 ? hp / hpMax : 0),
			SCALAR(5)
		);
		ctx.strokeRect(healthX, y - SCALAR(10), healthWidth, SCALAR(5));
	};

	const shadow = ({ x, y, width, height }) => {
		const radius = width / 2;
		ctx.fillStyle = '#00000020';
		//ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.ellipse(
			x + radius,
			y + height,
			radius,
			radius / 3,
			0,
			0,
			Math.PI * 2
		);
		ctx.fill();
	};

	const renderTower = ({
		x: centerX,
		color,
		dims,
		status,
		hp,
		hpMax,
		type
	}) => {
		const [width, height] = dims;
		const [x, y] = [center(centerX, width), bottom(height)];
		const isDead = status === 'dead';
		healthBar({
			x: centerX,
			y: y - 20,
			width: width / SCALAR(1),
			hp,
			hpMax
		});
		shadow({ x: x - 40, y: y + 8, width: width + 80, height });

		let grd = ctx.createLinearGradient(x, 0, x + width, 0);
		if (!isDead) {
			grd.addColorStop(
				0,
				type === 'attacker' ? colorShade(color, -90) : color
			);
			grd.addColorStop(
				1,
				type === 'attacker' ? color : colorShade(color, -90)
			);
		} else {
			grd.addColorStop(0, type === 'attacker' ? '#111' : '#444');
			grd.addColorStop(1, type === 'attacker' ? '#444' : '#111');
		}

		ctx.fillStyle = grd;
		const radius = width / 2;
		//center
		ctx.fillRect(x, y + radius / 3, width, height - radius / 3);
		//bottom
		ctx.beginPath();
		ctx.ellipse(
			x + radius,
			y + height,
			radius,
			radius / 3,
			0,
			0,
			Math.PI * 2
		);
		ctx.fill();
		//top
		ctx.beginPath();
		ctx.ellipse(
			x + radius,
			y + radius / 3,
			radius,
			radius / 5,
			0,
			0,
			Math.PI * 2
		);
		ctx.fill();
	};

	const renderCharacter = ({
		x: centerX,
		hp,
		hpMax,
		color,
		type,
		target,
		tick = 0
	}) => {
		const frame = {
			defender: target ? teeAttackRed[tick % 6] : teeRunRed[tick % 6],
			attacker: target ? teeAttackBlue[tick % 6] : teeRunBlue[tick % 6]
		}[type];
		const scale = 0.88;
		const sprite = {
			x: center(centerX, SCALAR(frame.width * scale)),
			y: bottom(SCALAR(frame.height * scale)) + SCALAR(10),
			width: SCALAR(frame.width * scale),
			height: SCALAR(frame.height * scale),
			img: frame
		};
		const shadowX =
			type === 'attacker'
				? target
					? sprite.x + 40
					: sprite.x - 20
				: sprite.x;
		shadow({ ...sprite, width: 120, x: shadowX, y: sprite.y - 8 });
		ctx.drawImage(
			sprite.img,
			sprite.x,
			sprite.y,
			sprite.width,
			sprite.height
		);
		hp > 0 &&
			healthBar({
				...sprite,
				hp,
				hpMax,
				x: centerX,
				width: 20
			});
	};

	ctx.clearRect(0, 0, fieldWidth, fieldHeight);
	drawBackground();

	const globalModeState = toggleCoords(state, 'global');
	globalModeState.towers.forEach((tower) => {
		renderTower(tower);
		tower.deployed.forEach(renderCharacter);
	});

	if (state.towers[0].status === 'dead') {
		console.log('Red wins!');
	}
	if (state.towers[1].status === 'dead') {
		console.log('Blue wins!');
	}

	if (!state.record) return;
	if (state.towers.find((x) => x.status === 'dead')) {
		(async () => {
			const image = document.createElement('img');
			new Array(20).fill().forEach(() => {
				gif.addFrame(ctx);
			});
			image.src = await gif.finish();
			document.body.append(image);
		})();
	} else {
		gif.addFrame(ctx);
	}
};

const tryRender = (state, ctx, gif, controls) => {
	try {
		render(state, ctx, gif, controls);
		return true;
	} catch (e) {
		console.error(cleanError(e));
		return false;
	}
};

export default class Render {
	constructor({ state, controls }) {
		const { ctx, gif } = initDom(state);
		return () => tryRender(state, ctx, gif, controls);
	}
}
