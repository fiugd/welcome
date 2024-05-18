import GIF from 'https://cdn.skypack.dev/gif.js';

export default class GifMaker {
	constructor(opts = {}) {
		this.gif = new GIF({
			workers: 4,
			quality: 10,
			workerScript: 'gif.worker.js',
			//transparent: 0x111100,
			...opts
		});
	}
	addFrame(ctx) {
		this.gif.addFrame(ctx, { copy: true, delay: 150 });
	}
	finish() {
		const thisGif = this.gif;
		const p = new Promise((resolve) => {
			thisGif.on('finished', function (blob) {
				resolve(URL.createObjectURL(blob));
			});
			thisGif.render();
		});
		return p;
	}
}
