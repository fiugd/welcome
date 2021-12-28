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
	
	const {frameCount} = piskel.images[0];
	var c = document.createElement('canvas');
	c.setAttribute('width', width * frameCount);
	c.setAttribute('height', height);
	const ctx = c.getContext('2d');
	piskel.images.forEach(x => {
		ctx.save();
		ctx.drawImage(x.imageEl, 0, 0);
		ctx.restore();
	})
	piskel.all = {
		img: c.toDataURL('image/png'),
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
