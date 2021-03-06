const processChunk = o => c => {
	// const layouts = {};
	// const layoutsIt = 0;

	// if(c.layout){
	// 	const key = `{{layout${layoutsIt}}}`;
	// 	layouts[key] = c.layout;
	// 	c.layout = key
	// }
	const x = {
		img: c.base64PNG,
		frameCount: o.frameCount
	};
	x.imageEl = new Image();
	x.imageEl.src=x.img;
	x.loaded = new Promise((resolve) => {
		x.imageEl.onload = resolve;
	});
	return x;
};

const load = async (url) => {
	const parsed = await fetch(url).then(x => x.json());
	const {piskel} = parsed;
	const { width, height } = piskel;

	piskel.layers = piskel.layers.map((x) => JSON.parse(x))
	const { layers } = piskel;
	piskel.images = layers.reduce(
		(a, o) => [ ...a, ...o.chunks.map(processChunk(o)) ],
		[]
	);
	await Promise.all(
		piskel.images.map(x => x.loaded)
	);

	const {frameCount} = piskel.images[0];
	const c = document.createElement('canvas');
	const ctx = c.getContext('2d');
	c.setAttribute('width', width * frameCount);
	c.setAttribute('height', height);
	//ctx.globalCompositeOperation = 'source-over';
	//ctx.clearRect(0, 0, c.width, c.height);

	for(var x of piskel.images){
		//ctx.save();
		ctx.drawImage(x.imageEl, 0, 0);
		//ctx.restore();
	}
	piskel.all = {
		canvas: c,
		width: c.width,
		height: c.height,
		frames: frameCount
	};

	return piskel;
};

const animate = (piskel, parent) => {
	const {images} = piskel;
	const canv = document.createElement('canvas');
	canv.id = "canvas"
	if(parent){
		parent.appendChild(canv);
	} else {
		document.body.appendChild(canv);
	}
	var ctx = document.getElementById('canvas').getContext('2d');
	ctx.globalCompositeOperation = 'source-over';

	canv.width = piskel.width;
	canv.height = piskel.height;

	let i = 0;
	function draw(){
		ctx.clearRect(0, 0, canv.width, canv.height);

		if(i === images[0].frameCount) i = 0;
		images.forEach(x => {
			ctx.save();
			ctx.drawImage(x.imageEl, -1*i*piskel.width, 0);
			ctx.restore();
		})
		i++;
		setTimeout(() => {
			window.requestAnimationFrame(draw);
		}, 1000/piskel.fps)
	}
	window.requestAnimationFrame(draw);
};

export { load, animate };
