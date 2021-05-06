const proxy = 'https://api.allorigins.win/raw?url=';

const images = {
	background: 'td.background.png',
	bgTop: ({ background: bg }) => Tile(
		bg,
		0, // xoff
		0, // yoff
		bg.width,
		84
	),
	bgMid: ({ background: bg }) => Tile(
		bg,
		0,
		84,
		96, // width
		84
	),
	bgBottom: ({ background: bg }) => Tile(
		bg,
		0,
		168,
		bg.width,
		32
	),
	teeGames: 'sprites/teeGames.png',
	teeRun1: ({ teeGames: img }) => Tile(img,0,300,img.width,100),
};

const loadImage = (src, root) => new Promise((resolve, reject) => {
	if(typeof src === 'function') {
		try {
			return resolve(src(images));
		} catch(e){
			console.log(e);
			return '';
		}
	}
	let img = new Image();
	img.onload = () => resolve(img);
	img.onerror = reject;
	img.src = src.slice(0,4) === 'http'
		? proxy + src
		: root + src;
});

const Tile = (inputCanvas, offsetX, offsetY, width, height) => {
	const buffer = document.createElement('canvas');
	const b_ctx = buffer.getContext('2d');
	buffer.width = width;
	buffer.height = height;
	// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
	b_ctx.drawImage(inputCanvas,
		offsetX, offsetY,
		width, height,
		0, 0,
		buffer.width, buffer.height
	);
	const image = new Image();
	image.src = buffer.toDataURL();
	return image;
};

export const loadAssets = async ({ root = './'}={}) => {
	const imageUrls = Object.entries(images)
		.filter(([k,v]) => typeof v !== 'function');

	const slices = Object.entries(images)
		.filter(([k,v]) => typeof v === 'function');

	for(var im of imageUrls){
		try {
			const [key] = im;
			images[key] = await loadImage(images[key], root);
		}catch(e){}
	}
	for(var im of slices){
		try {
			const [key] = im;
			images[key] = await loadImage(images[key], root);
		}catch(e){}
	}

	return { images };
}