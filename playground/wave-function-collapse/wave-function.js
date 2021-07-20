import wfc from 'https://cdn.skypack.dev/wavefunctioncollapse';
const { OverlappingModel, SimpleTiledModel } = wfc;

//const exampleImageUrl = '../../examples/image/abitmap.bmp';
const samplesPrefix = 'https://raw.githubusercontent.com/mxgmn/WaveFunctionCollapse/master/samples/';
const exampleImageUrl = samplesPrefix + [
	"3Bricks.png",
	"Angular.png",
	"Cat.png",
	"Cats.png",
	"Cave.png",
	"Chess.png",
	"City.png",
	"ColoredCity.png",
	"Dungeon.png",
	"Fabric.png",
	"Flowers.png",
	"Forest.png",
	"Hogs.png",
	"Knot.png",
	"Lake.png",
	"LessRooms.png",
	"Lines.png",
	"Link.png",
	"Link2.png",
	"MagicOffice.png",
	"Maze.png",
	"Mazelike.png",
	"MoreFlowers.png",
	"Mountains.png",
	"Nested.png",
	"NotKnot.png",
	"Office.png",
	"Office2.png",
	"Paths.png",
	"Platformer.png",
	"Qud.png",
	"RedDot.png",
	"RedMaze.png",
	"Rooms.png",
	"Rule126.png",
	"Sand.png",
	"ScaledMaze.png",
	"Sewers.png",
	"SimpleKnot.png",
	"SimpleMaze.png",
	"SimpleWall.png",
	"Skew1.png",
	"Skew2.png",
	"Skyline.png",
	"Skyline2.png",
	"SmileCity.png",
	"Spirals.png",
	"Town.png",
	"TrickKnot.png",
	"Village.png",
	"Wall.png",
	"WalledDot.png",
	"Water.png",
	"Wrinkles.png",
][14];

const imageDataFromUrl = (imageUrl, startx, starty,width, height) =>
	new Promise(async (resolve) => {
		var response = await fetch(imageUrl);
		var fileBlob = await response.blob();
		var bitmap = await createImageBitmap(fileBlob);
		var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		var context = canvas.getContext('2d');
		context.drawImage(bitmap, 0, 0);
		var myData = context.getImageData(
			startx || 0, starty || 0,
			width || bitmap.width, height || bitmap.height
		);
		resolve(myData);
	});
	
const blankImageData = (width, height) => {
	var canvas = new OffscreenCanvas(width, height);
	var context = canvas.getContext('2d');
	var imgData = context.createImageData(width, height);
	return imgData;
}

function imageDataToImage(imagedata, className) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = imagedata.width;
	canvas.height = imagedata.height;
	ctx.putImageData(imagedata, 0, 0);

	var image = new Image();
	image.src = canvas.toDataURL();
	image.className = className;
	return image;
}

const Render = (content='Wave Function Collapse') => {
	document.body.innerHTML += `
		<div class="container">
			${content}
		</div>
	`;
};

const lcg = (() => {
	function normalizeSeed (seed) {
		if (typeof seed === 'number') {
			seed = Math.abs(seed);
		} else if (typeof seed === 'string') {
			const string = seed;
			seed = 0;

			for(let i = 0; i < string.length; i++) {
				seed = (seed + (i + 1) * (string.charCodeAt(i) % 96)) % 2147483647;
			}
		}

		if (seed === 0) {
			seed = 311;
		}

		return seed;
	}

	return function lcgRandom (seed) {
		let state = normalizeSeed(seed);

		return function () {
			const result = (state * 48271) % 2147483647;
			state = result;
			return result / 2147483647;
		};
	}
})();

(async () => {
	// https://github.com/kchapelier/wavefunctioncollapse/tree/master/example
	// https://github.com/mxgmn/WaveFunctionCollapse

	// I want to be able to animate this
	// http://www.kchapelier.com/wfc-example/simple-tiled-model-animated.html

	// ["OverlappingModel","SimpleTiledModel"]

	const imgData = await imageDataFromUrl(
		//exampleImageUrl, 59,17,15,23
		exampleImageUrl
	);
	const image = imageDataToImage(imgData, 'input');
	Render();
	document.body.append(image)
	//return;

	const [ destWidth, destHeight ] = [ 100, 70 ];
	const model = new OverlappingModel(
		imgData.data,
		imgData.width, imgData.height,
		3, // size of patterns
		destWidth, destHeight,
		true, //source is periodic
		true, //output periodic
		2, //Allowed symmetries from 1 (no symmetry) to 8 (all mirrored / rotated variations)
		//102
	);
	const finished = model.generate(lcg('testt one two'));
	if(!finished) return Render('The generation ended in a contradiction');

	var outputImgData = blankImageData(destWidth, destHeight);
	model.graphics(outputImgData.data);

	document.body.append(imageDataToImage(outputImgData, 'output'));

	//Render(JSON.stringify(Object.keys(wfc)));

})();
