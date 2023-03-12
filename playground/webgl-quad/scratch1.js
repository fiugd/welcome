function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const getGraphic = async () => {
	const r = document.querySelector(':root');
	const container = document.createElement('div');
	container.id ="graphic";
	const source = await fetch('./scratch1.svg').then(x => x.text());
	container.innerHTML = `
		<style>
			svg { width: 650px; max-width: 90vw; }</style>
		${source}
	`;
	document.body.append(container);
	const text = {
		up: {
			left: container.querySelector('#upLeftText'),
			right: container.querySelector('#upRightText'),
			middle: container.querySelector('#upMiddleText'),
		},
		down: {
			left: container.querySelector('#downLeftText'),
			right: container.querySelector('#downRightText'),
			middle: container.querySelector('#downMiddleText'),
		},
	};

	let maxX = 0;
	let minX = 0;
	return {
		getPos: () => Number(getComputedStyle(r).getPropertyValue('--subject-x')),
		setPos: (x) => {
			if(x > maxX){
				maxX = x;
				text.down.right.textContent = maxX.toFixed(2)+''
			}
			if(x < minX){
				minX = x;
				text.down.left.textContent = minX.toFixed(2)+''
			}
			text.down.middle.textContent = x.toFixed(2)+'';
			r.style.setProperty('--subject-x', x+'')
		},
	};
};

//TODO: come back to this; need to once-and-for-all a game loop
const loop = ({ update, render }, framerate=60) => {
	const interval = 1000 / framerate;

	const start = async () => {
		let then = performance.now();
		let delta = 0;
		while (true) {
			update();
			//const now = await new Promise(requestAnimationFrame);
			// const now = performance.now()
			// if (now - then < interval - delta) continue;
			// delta = Math.min(interval, delta + now - then - interval);
			// then = now;
			requestAnimationFrame(render);
			await delay(interval);
		}
	};

	return { start };
}

const graphic = await getGraphic();

class Mover {
	pos = 0;
	ascending = true;
	DIFF = 0.1;
	MAX = 9;
	NEG_MAX = this.MAX * -1;

	constructor({ graphic }){
		this.graphic = graphic;
		this.update = this.update.bind(this);
		this.render = () => this.graphic.setPos(this.pos);
	}
	update(){
		const { DIFF, MAX, NEG_MAX } = this;

		if(this.ascending && (this.pos+DIFF > MAX ))
			this.ascending = false;
		if(!this.ascending && (this.pos-DIFF < NEG_MAX))
			this.ascending = true;
		this.pos = this.ascending
			? this.pos + DIFF
			: this.pos - DIFF;
	}
}

const game = loop(new Mover({ graphic }), 30);

setTimeout(game.start, 2000)