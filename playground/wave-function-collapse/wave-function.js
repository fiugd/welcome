// import wfc from 'https://cdn.skypack.dev/wavefunctioncollapse';
import wfc from './vendor/wavefunctioncollapse.js';
import {
	savePngWithMetadata,
	extractMetadataFromPng,
	applyMetadataToForm,
	getMetadataFromForm,
	downloadInputImageWithMetadata
} from './lib/png-metadata.js';
const { OverlappingModel } = wfc;

// const samplesPrefix =
// 	'https://raw.githubusercontent.com/mxgmn/WaveFunctionCollapse/master/samples/';

const samplesPrefix = './vendor/WaveFunctionCollapse/samples/';

let currentModel = null;
let currentInputImageData = null;

function updateInputImage() {
	const select = document.getElementById('exampleSelect');
	const img = document.getElementById('inputImage');
	const placeholder = document.getElementById('inputLoadingPlaceholder');
	const fileName = select.value;

	// Save to localStorage
	localStorage.setItem('selectedInputImage', fileName);

	placeholder.style.display = 'flex';
	img.style.display = 'none';
	img.src = samplesPrefix + fileName;
	img.alt = fileName;

	img.onload = async () => {
		placeholder.style.display = 'none';
		img.style.display = 'block';
		const metadata = await extractMetadataFromPng(samplesPrefix + fileName);
		if (metadata) {
			applyMetadataToForm(metadata);
		}
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
	// Hide info button when output is cleared
	document.getElementById('infoBtn').style.display = 'none';
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

	const ground = window.ground || undefined;

	const model = new OverlappingModel(
		imgData.data,
		imgData.width,
		imgData.height,
		patternSz,
		width,
		height,
		periodicIn,
		periodicOut,
		sym,
		ground
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
	// Store model and input image data for pattern display
	currentModel = model;
	currentInputImageData = imgData;
	// Show info button when output image exists
	document.getElementById('infoBtn').style.display = 'flex';
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
	// Center content inside the output pane
	div.style.textAlign = 'center';
	div.style.display = 'flex';
	div.style.alignItems = 'center';
	div.style.justifyContent = 'center';
	div.style.padding = '0.5rem 0';
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

function setupInfoModal() {
	const infoBtn = document.getElementById('infoBtn');
	const infoModal = document.getElementById('infoModal');
	const closeModal = document.getElementById('closeModal');

	infoBtn.addEventListener('click', () => {
		infoModal.style.display = 'flex';
	});

	closeModal.addEventListener('click', () => {
		infoModal.style.display = 'none';
	});

	infoModal.addEventListener('click', (e) => {
		if (e.target === infoModal) {
			infoModal.style.display = 'none';
		}
	});
}

window.addEventListener('DOMContentLoaded', () => {
	// Restore selected input image from localStorage
	const savedImage = localStorage.getItem('selectedInputImage');
	if (savedImage) {
		const select = document.getElementById('exampleSelect');
		select.value = savedImage;
	}

	updateInputImage();

	// Show instructional message in output pane on first load
	const outputContainer = document.querySelector('.output-container');
	if (outputContainer) {
		const nonPlaceholderChildren = Array.from(
			outputContainer.children
		).filter((c) => c.id !== 'loadingPlaceholder');
		if (nonPlaceholderChildren.length === 0) {
			const msg = renderElement(
				'<p style="margin:0.5rem 0;color:#666">Click the <strong>Generate</strong> button to create an image.</p>'
			);
			outputContainer.appendChild(msg);
		}
	}

	setupInfoModal();

	document.getElementById('exampleSelect').addEventListener('change', () => {
		updateInputImage();
	});
	document.getElementById('inputImage').addEventListener('click', () => {
		downloadInputImageWithMetadata();
	});
	document.getElementById('generateBtn').addEventListener('click', () => {
		generateAndRender();
	});
	document.getElementById('randomSeedBtn').addEventListener('click', () => {
		document.getElementById('lcgSeed').value = generateRandomSeed();
		generateAndRender();
	});

	function displayPatternsInModal() {
		if (!currentModel) {
			document.getElementById('modalBody').innerHTML =
				'<p>No patterns available</p>';
			return;
		}

		const modalBody = document.getElementById('modalBody');
		modalBody.innerHTML = '';

		const patternsContainer = document.createElement('div');
		patternsContainer.style.display = 'grid';
		patternsContainer.style.gridTemplateColumns =
			'repeat(auto-fill, minmax(80px, 1fr))';
		patternsContainer.style.gap = '10px';
		patternsContainer.style.padding = '10px';

		for (let i = 0; i < currentModel.patterns.length; i++) {
			const tile = createPatternTile(currentModel.patterns[i], i);
			patternsContainer.appendChild(tile);
		}

		modalBody.appendChild(patternsContainer);
	}

	function createPatternTile(pattern, index) {
		const container = document.createElement('div');
		container.style.textAlign = 'center';

		const canvas = document.createElement('canvas');
		const patternSize =
			parseInt(document.getElementById('patternSize').value) || 3;
		const zoomFactor = 20;
		canvas.width = patternSize * zoomFactor;
		canvas.height = patternSize * zoomFactor;
		canvas.style.border = '1px solid #ccc';
		canvas.title = `Pattern ${index}`;

		const ctx = canvas.getContext('2d');

		// Get color palette from input image
		if (!currentInputImageData) {
			ctx.fillStyle = '#999';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			container.appendChild(canvas);
			const indexLabel = document.createElement('div');
			indexLabel.style.fontSize = '12px';
			indexLabel.style.marginTop = '4px';
			indexLabel.style.fontWeight = 'bold';
			indexLabel.textContent = index;
			container.appendChild(indexLabel);
			return container;
		}

		const colors = new Map();
		const imageData = currentInputImageData;
		const data = imageData.data;

		// Extract unique colors from input image
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];
			const colorKey = `${r},${g},${b},${a}`;
			if (!colors.has(colorKey)) {
				colors.set(colorKey, { r, g, b, a });
			}
		}
		const colorArray = Array.from(colors.values());

		// Draw pattern cells
		for (let y = 0; y < patternSize; y++) {
			for (let x = 0; x < patternSize; x++) {
				const colorIndex =
					pattern[y * patternSize + x] % colorArray.length;
				const color = colorArray[colorIndex];
				ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
				ctx.fillRect(
					x * zoomFactor,
					y * zoomFactor,
					zoomFactor,
					zoomFactor
				);
			}
		}

		container.appendChild(canvas);

		// Add index label below the tile
		const indexLabel = document.createElement('div');
		indexLabel.style.fontSize = '12px';
		indexLabel.style.marginTop = '4px';
		indexLabel.style.fontWeight = 'bold';
		indexLabel.textContent = index;
		container.appendChild(indexLabel);

		return container;
	}

	// Update setupInfoModal to call displayPatternsInModal when showing
	const originalSetupInfoModal = setupInfoModal;
	setupInfoModal = function () {
		originalSetupInfoModal();
		const infoBtn = document.getElementById('infoBtn');
		if (infoBtn) {
			infoBtn.addEventListener('click', () => {
				displayPatternsInModal();
				document.getElementById('modal').style.display = 'flex';
			});
		}
	};
	setupInfoModal();
});
