
const getGraphic = async () => {
	const r = document.querySelector(':root');
	const container = document.createElement('div');
	container.id ="graphic";
	const source = await fetch('./scratch1.svg').then(x => x.text());
	container.innerHTML = `
		<style>
			svg { width: 50vw; }</style>
		${source}
	`;
	document.body.append(container);
	return {
		getPos: () => Number(getComputedStyle(r).getPropertyValue('--subject-x')),
		setPos: (x) => r.style.setProperty('--subject-x', x+''),
	};
};

const loop = async (fn, framerate=30) => {
	const interval = 1000 / framerate;
	let then = performance.now();
	let delta = 0;
	while (true) {
		const now = await new Promise(requestAnimationFrame);
		if (now - then < interval - delta) continue;
		delta = Math.min(interval, delta + now - then - interval);
		then = now;
		fn();
	}
}

const graphic = await getGraphic();

const mover = (() => {
	let pos = 0;
	let ascending = true;
	const mover = (timestamp=0) => {
		if(ascending && pos >= 35)
			ascending = false;
		if(!ascending && pos <= -35)
			ascending = true;
		pos = ascending ? pos+1 : pos-1;
		graphic.setPos(pos);
	};
	return mover;
})();

loop(mover);