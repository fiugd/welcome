const screenCanvas = document.getElementById("screen");
//const loadButton = document.getElementById("load-button");
const romSelector = document.getElementById("rom-selector");

function addRoms(changeHandler){
	const roms = [
		"animation",
		"asma",
		"audio.channels",
		"audio",
		"automata",
		"bifurcan",
		"console.lib",
		"console",
		"controller.buttons",
		"controller.keys",
		"darena",
		"datetime",
		"drum-rack",
		"file.load",
		"file",
		"file.save",
		"hover",
		"label",
		"life",
		"mouse",
		"musictracker",
		"neralie",
		"piano",
		"picture",
		"polycat",
		"proportional-font",
		"screen",
		"shapes",
		"theme",
		"wallpaper"
	];
	romSelector.innerHTML = romSelector.innerHTML + roms.map(r =>
		`<option value="${r}">${r}</option>`
	).join('\n');
	romSelector.onchange = changeHandler;
}

async function fetchArrayBuffer (url) {
		const response = await fetch(url);
		return await response.arrayBuffer();
}

function decodeZ85 (string) {
		const decoder = [
				0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00, 
				0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45, 
				0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
				0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47, 
				0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 
				0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32, 
				0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 
				0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00, 
				0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 
				0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 
				0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 
				0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
		];
		let dest = new Uint8Array(string.length*5/4),
				byte_nbr = 0,
				char_nbr = 0,
				value = 0;

		while (byte_nbr < dest.length) {
				var idx = string.charCodeAt(char_nbr++) - 32;
				value = (value * 85) + decoder[idx];
				if ((char_nbr % 5) == 0) {
						var divisor = 256 * 256 * 256;
						while (divisor >= 1) {
								dest[byte_nbr++] = (value / divisor) | 0;
								divisor >>= 8;
						}
						value = 0;
				}
		}
		return dest.buffer;
}

async function findRomBuffer () {
	const url = new URL(document.location);

	// Try to get an URL from the ?rom query string
	//const romUrl = url.searchParams.get("rom");
	const romUrl = 'https://cdn.jsdelivr.net/gh/aduros/webuxn@1c796b4c/roms/life.rom';
	if (romUrl) {
		return fetchArrayBuffer(romUrl);
	}

	// Try to decode a buffer from the ?raw query string
	if (url.searchParams.has("raw") && url.hash) {
		return decodeZ85(unescape(url.hash.substr(1)));
	}

	// Otherwise wait for input
	loadButton.style.display = "inherit";
	screenCanvas.style.display = "none";

	return new Promise(resolve => {
		const input = document.createElement("input");
		input.type = "file";
		input.onchange = function () {
			const file = input.files[0];
			if (file != null) {
				loadButton.style.display = "none";
				screenCanvas.style.display = "inherit";
				resolve(file.arrayBuffer());
			}
		};
		loadButton.onclick = function () {
			input.click();
		};
	});
}

//ROMS: https://github.com/aduros/webuxn/tree/master/roms
const webuxnBase = "https://cdn.jsdelivr.net/gh/aduros/webuxn@1c796b4c";

(async function () {
	screenCanvas.style.visibility = 'hidden';
	const webuxn = await import(webuxnBase + "/webuxn.js");
	const wasmBuffer = await fetchArrayBuffer("./webuxn.wasm");

	const romSwitch = async (e) => {
		romSelector.style.display = 'none';
		screenCanvas.style.visibility = '';
		const romUrl = `${webuxnBase}/roms/${e.target.value}.rom`;
		const romBuffer = await fetchArrayBuffer(romUrl)
		webuxn.run(wasmBuffer, romBuffer, screenCanvas);
	};
	addRoms(romSwitch);
})();
