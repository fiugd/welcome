function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
};

export default loop;
