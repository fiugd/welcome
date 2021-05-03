const images = {
	background: './td.background.png',
};

const loadImage = (src) => new Promise((resolve, reject) => {
	let img = new Image();
	img.onload = () => resolve(img);
	img.onerror = reject;
	img.src = src;
})

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