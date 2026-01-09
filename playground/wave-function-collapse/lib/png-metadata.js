import { encodeChunks, extractChunks } from './png-chunks.js';

function createPngTextChunk(keyword, text) {
	const keywordBytes = new TextEncoder().encode(keyword);
	const textBytes = new TextEncoder().encode(text);
	const chunkData = new Uint8Array(
		keywordBytes.length + 1 + textBytes.length
	);
	chunkData.set(keywordBytes);
	chunkData[keywordBytes.length] = 0;
	chunkData.set(textBytes, keywordBytes.length + 1);

	return {
		name: 'tEXt',
		data: chunkData
	};
}

export async function savePngWithMetadata(canvas, metadata) {
	return new Promise((resolve) => {
		canvas.toBlob(async (blob) => {
			const arrayBuffer = await blob.arrayBuffer();
			const uint8 = new Uint8Array(arrayBuffer);
			const chunks = extractChunks(uint8);

			// Remove existing metadata chunk if present
			const metadataChunkIndex = chunks.findIndex(
				(chunk) => chunk.name === 'tEXt'
			);
			if (metadataChunkIndex !== -1) {
				chunks.splice(metadataChunkIndex, 1);
			}

			const textChunk = createPngTextChunk(
				'metadata',
				JSON.stringify(metadata)
			);
			// Insert before IEND
			chunks.splice(chunks.length - 1, 0, textChunk);
			const encoded = encodeChunks(chunks);
			resolve(new Blob([encoded], { type: 'image/png' }));
		}, 'image/png');
	});
}

export async function extractMetadataFromPng(imageUrl) {
	try {
		const response = await fetch(imageUrl);
		const arrayBuffer = await response.arrayBuffer();
		const uint8 = new Uint8Array(arrayBuffer);
		const chunks = extractChunks(uint8);
		const textChunk = chunks.find((chunk) => chunk.name === 'tEXt');
		if (textChunk) {
			const text = new TextDecoder().decode(textChunk.data);
			const [, metadataStr] = text.split('\0');
			return JSON.parse(metadataStr);
		}
		return null;
	} catch (error) {
		console.log('No PNG metadata found:', error.message);
		return null;
	}
}

export function applyMetadataToForm(metadata) {
	if (!metadata) return;
	if (metadata.patternSize)
		document.getElementById('patternSize').value = metadata.patternSize;
	if (metadata.destWidth)
		document.getElementById('destWidth').value = metadata.destWidth;
	if (metadata.destHeight)
		document.getElementById('destHeight').value = metadata.destHeight;
	if (metadata.periodicInput !== undefined)
		document.getElementById('periodicInput').checked =
			metadata.periodicInput;
	if (metadata.periodicOutput !== undefined)
		document.getElementById('periodicOutput').checked =
			metadata.periodicOutput;
	if (metadata.symmetry)
		document.getElementById('symmetry').value = metadata.symmetry;
	if (metadata.seed) document.getElementById('lcgSeed').value = metadata.seed;
	if (metadata.ground !== undefined) window.ground = metadata.ground;
}

export function getMetadataFromForm() {
	return {
		patternSize: document.getElementById('patternSize').value,
		destWidth: document.getElementById('destWidth').value,
		destHeight: document.getElementById('destHeight').value,
		periodicInput: document.getElementById('periodicInput').checked,
		periodicOutput: document.getElementById('periodicOutput').checked,
		symmetry: document.getElementById('symmetry').value,
		seed: document.getElementById('lcgSeed').value,
		ground: window.ground
	};
}

export async function downloadInputImageWithMetadata() {
	const img = document.getElementById('inputImage');
	if (!img.src) {
		alert('No input image loaded');
		return;
	}

	const fileName = document.getElementById('exampleSelect').value;
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	ctx.drawImage(img, 0, 0);

	const blob = await savePngWithMetadata(canvas, getMetadataFromForm());
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
}
