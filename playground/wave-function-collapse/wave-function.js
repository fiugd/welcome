import wfc from 'https://cdn.skypack.dev/wavefunctioncollapse';
const { OverlappingModel } = wfc;

const samplesPrefix =
	'https://raw.githubusercontent.com/mxgmn/WaveFunctionCollapse/master/samples/';

function updateInputImage() {
	const select = document.getElementById('exampleSelect');
	const img = document.getElementById('inputImage');
	const placeholder = document.getElementById('inputLoadingPlaceholder');
	const fileName = select.value;

	placeholder.style.display = 'flex';
	img.style.display = 'none';
	img.src = samplesPrefix + fileName;
	img.alt = fileName;

	img.onload = () => {
		placeholder.style.display = 'none';
		img.style.display = 'block';
	};

	img.onerror = () => {
		placeholder.style.display = 'none';
	};
}

function clearOutput() {
	const outputContainer = document.querySelector('.output-container');
	if (outputContainer) {
		// Remove only child elements except the loading placeholder
		const children = Array.from(outputContainer.children);
		children.forEach((child) => {
			if (child.id !== 'loadingPlaceholder') {
				child.remove();
			}
		});
		const loadingPlaceholder =
			document.getElementById('loadingPlaceholder');
		if (loadingPlaceholder) {
			loadingPlaceholder.innerHTML = '<div class="spinner"></div>';
			loadingPlaceholder.style.display = 'flex';
		}
	}
}

function hideLoading() {
	const loadingPlaceholder = document.getElementById('loadingPlaceholder');
	if (loadingPlaceholder) {
		loadingPlaceholder.style.display = 'none';
	}
}

function showError(message) {
	const loadingPlaceholder = document.getElementById('loadingPlaceholder');
	if (loadingPlaceholder) {
		loadingPlaceholder.innerHTML = `<p style="color: #ff6b6b; font-weight: 600;">${message}</p>`;
		loadingPlaceholder.style.display = 'flex';
	}
}

async function generateAndRender() {
	clearOutput();
	const fileName = document.getElementById('exampleSelect').value;
	const patternSz = +document.getElementById('patternSize').value;
	const width = +document.getElementById('destWidth').value;
	const height = +document.getElementById('destHeight').value;
	const periodicIn = document.getElementById('periodicInput').checked;
	const periodicOut = document.getElementById('periodicOutput').checked;
	const sym = +document.getElementById('symmetry').value;
	const seed = document.getElementById('lcgSeed').value;

	const exampleImageUrl = samplesPrefix + fileName;
	const imgData = await imageDataFromUrl(exampleImageUrl);

	const outputContainer = document.querySelector('.output-container');
	if (!outputContainer) return;

	const model = new OverlappingModel(
		imgData.data,
		imgData.width,
		imgData.height,
		patternSz,
		width,
		height,
		periodicIn,
		periodicOut,
		sym
	);
	const finished = model.generate(lcg(seed));
	hideLoading();
	if (!finished) {
		showError('The generation ended in a contradiction');
		return;
	}

	var outputImgData = blankImageData(width, height);
	model.graphics(outputImgData.data);
	outputContainer.appendChild(imageDataToImage(outputImgData, 'output'));
}

const imageDataFromUrl = (imageUrl, startx, starty, width, height) =>
	new Promise(async (resolve) => {
		var response = await fetch(imageUrl);
		var fileBlob = await response.blob();
		var bitmap = await createImageBitmap(fileBlob);
		var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		var context = canvas.getContext('2d');
		context.drawImage(bitmap, 0, 0);
		var myData = context.getImageData(
			startx || 0,
			starty || 0,
			width || bitmap.width,
			height || bitmap.height
		);
		resolve(myData);
	});

const blankImageData = (width, height) => {
	var canvas = new OffscreenCanvas(width, height);
	var context = canvas.getContext('2d');
	var imgData = context.createImageData(width, height);
	return imgData;
};

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

function renderElement(content = 'Wave Function Collapse') {
	const div = document.createElement('div');
	div.className = 'container';
	div.innerHTML = content;
	return div;
}

const lcg = (() => {
	function normalizeSeed(seed) {
		if (typeof seed === 'number') {
			seed = Math.abs(seed);
		} else if (typeof seed === 'string') {
			const string = seed;
			seed = 0;
			for (let i = 0; i < string.length; i++) {
				seed =
					(seed + (i + 1) * (string.charCodeAt(i) % 96)) % 2147483647;
			}
		}
		if (seed === 0) {
			seed = 311;
		}
		return seed;
	}
	return function lcgRandom(seed) {
		let state = normalizeSeed(seed);
		return function () {
			const result = (state * 48271) % 2147483647;
			state = result;
			return result / 2147483647;
		};
	};
})();

function generateRandomSeed() {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	const words = [];
	const wordCount = Math.floor(Math.random() * 3) + 2; // 2-4 words

	for (let i = 0; i < wordCount; i++) {
		const wordLength = Math.floor(Math.random() * 5) + 3; // 3-7 chars
		let word = '';
		for (let j = 0; j < wordLength; j++) {
			word += chars[Math.floor(Math.random() * chars.length)];
		}
		words.push(word);
	}

	return words.join(' ');
}

window.addEventListener('DOMContentLoaded', () => {
	updateInputImage();
	generateAndRender();

	document.getElementById('exampleSelect').addEventListener('change', () => {
		updateInputImage();
	});
	document.getElementById('generateBtn').addEventListener('click', () => {
		generateAndRender();
	});
	document.getElementById('randomSeedBtn').addEventListener('click', () => {
		document.getElementById('lcgSeed').value = generateRandomSeed();
		generateAndRender();
	});
});
