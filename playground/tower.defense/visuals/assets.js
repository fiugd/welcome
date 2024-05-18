const proxy = 'https://api.allorigins.win/raw?url=';

window.towerColor1 = window.towerColor1 || '#24b';
window.towerColor2 = window.towerColor2 || '#934';

const redColor = towerColor2;
const blueColor = towerColor1;

function cloneCanvas(oldCanvas) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = oldCanvas.width;
	canvas.height = oldCanvas.height;
	ctx.drawImage(oldCanvas, 0, 0);
	return { canvas, ctx };
}

const subD = (numb, width, fn) =>
	!numb || numb === 1
		? fn(0, width)
		: new Array(numb).fill().map((a, i, all) => fn(i, width / numb));

const transparent = (canvas, ctx) => {
	const tolerance = 75;
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	const start = [data[0], data[1], data[2]];

	const diff = ([r, g, b], [r2, g2, b2]) =>
		[r - r2, g - g2, b - b2].reduce((all, one) => all + Math.abs(one), 0);

	const startDiff = (d) => diff(d, start);

	for (var i = 0, len = data.length; i < len; i += 4) {
		const thisDiff = startDiff([data[i], data[i + 1], data[i + 2]]);
		if (thisDiff >= tolerance) continue;
		data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
	}
	ctx.putImageData(imageData, 0, 0);
};

const colorize = (color) => (canvas, ctx) => {
	const clone = cloneCanvas(canvas);
	const { width, height } = canvas;

	clone.ctx.drawImage(canvas, 0, 0, width, height);

	clone.ctx.globalCompositeOperation = 'normal';
	clone.ctx.fillStyle = color + 'b';
	clone.ctx.fillRect(0, 0, width, height);

	clone.ctx.globalCompositeOperation = 'destination-in';
	clone.ctx.drawImage(canvas, 0, 0, width, height);

	ctx.drawImage(clone.canvas, 0, 0);
};

const flipH =
	(x = 0, y = 0) =>
	(canvas, ctx) => {
		const clone = cloneCanvas(canvas);
		const { width, height } = canvas;
		clone.ctx.clearRect(0, 0, width, height);
		clone.ctx.translate(x + width / 2, y + width / 2);
		clone.ctx.scale(-1, 1);
		clone.ctx.translate(-(x + width / 2), -(y + width / 2));
		clone.ctx.drawImage(canvas, x, y, width, height);
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(clone.canvas, 0, 0);
	};

const images = {
	background: 'assets/background-linerangers1.png',
	bgTop: ({ background: bg }) =>
		Tile()(
			bg,
			0, // xoff
			0, // yoff
			bg.width,
			84
		),
	bgMid: ({ background: bg }) =>
		Tile()(
			bg,
			0,
			84,
			96, // width
			84
		),
	bgBottom: ({ background: bg }) => Tile()(bg, 0, 168, bg.width, 32),
	teeGames: 'assets/teeGames.png',
	teeRunBlue: ({ teeGames: img }) =>
		subD(6, 378 - 186, (i, w) =>
			Tile((c, ct) => {
				transparent(c, ct);
				colorize(blueColor)(c, ct);
			})(img, 15 + i * (w + 1), 285 + 84, w, 56)
		),
	teeRunRed: ({ teeGames: img }) =>
		subD(6, 378 - 186, (i, w) =>
			Tile((c, ct) => {
				transparent(c, ct);
				colorize(redColor)(c, ct);
				flipH()(c, ct);
			})(img, 15 + i * (w + 1), 285 + 84, w, 56)
		),
	teeAttackBlue: ({ teeGames: img }) =>
		subD(6, 378 - 28, (i, w) =>
			Tile((c, ct) => {
				transparent(c, ct);
				colorize(blueColor)(c, ct);
			})(img, 15 + i * (w + 1), 285 + 602, w, 58)
		),
	teeAttackRed: ({ teeGames: img }) =>
		subD(6, 378 - 28, (i, w) =>
			Tile((c, ct) => {
				transparent(c, ct);
				colorize(redColor)(c, ct);
				flipH()(c, ct);
			})(img, 15 + i * (w + 1), 285 + 602, w, 58)
		)
};

const loadImage = (src, root) =>
	new Promise((resolve, reject) => {
		if (typeof src === 'function') {
			try {
				return resolve(src(images));
			} catch (e) {
				console.log(e);
				return '';
			}
		}
		let img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src.slice(0, 4) === 'http' ? proxy + src : root + src;
	});

const Tile = (process) => (inputCanvas, offsetX, offsetY, width, height) => {
	const buffer = document.createElement('canvas');
	const b_ctx = buffer.getContext('2d');
	buffer.width = width;
	buffer.height = height;
	// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
	b_ctx.drawImage(
		inputCanvas,
		offsetX,
		offsetY,
		width,
		height,
		0,
		0,
		buffer.width,
		buffer.height
	);
	if (process) process(buffer, b_ctx);
	const image = new Image();
	image.src = buffer.toDataURL();
	return image;
};

export const loadAssets = async ({ root = './' } = {}) => {
	const imageUrls = Object.entries(images).filter(
		([k, v]) => typeof v !== 'function'
	);

	const slices = Object.entries(images).filter(
		([k, v]) => typeof v === 'function'
	);

	for (var im of imageUrls) {
		try {
			const [key] = im;
			images[key] = await loadImage(images[key], root);
		} catch (e) {}
	}
	for (var im of slices) {
		try {
			const [key] = im;
			images[key] = await loadImage(images[key], root);
		} catch (e) {}
	}

	return { images };
};
