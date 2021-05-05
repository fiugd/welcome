const images = {
	background: './td.background.png',
};

const loadImage = (src) => new Promise((resolve, reject) => {
	let img = new Image();
	img.onload = () => resolve(img);
	img.onerror = reject;
	img.src = src;
});


//TODO: should be slicing up assets so they can be used elsewhere

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
	return buffer;
};

/*
const tile = Tile(
	bgimg,
	15, 0.45*fieldHeight, // offset x, y
	20, fieldHeight-(0.45*fieldHeight)-35 // width, height
);
*/

export const loadAssets = async () => {
	const imageKeys = Object.keys(images);
	for(var i=0, len=imageKeys.length; i<len; i++){
		try {
			const key = imageKeys[i];
			images[key] = await loadImage(images[key]);
		}catch(e){}
	}
	return {
		images
	};
}