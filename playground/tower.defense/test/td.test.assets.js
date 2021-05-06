//show-preview
import {htmlToElement} from '../../../.tools/misc.mjs'
import {loadAssets} from '../td.assets.js';

const append = (html) => {
	const el = htmlToElement(html);
	document.body.append(el);
	return el;
};

append(`
	<style>
		body { padding: 3em 0.5em; color: #777; }
		/*body { background: #123851; }*/
		img { width: 100%; max-height: 200px; }
		img {object-fit: contain; object-position: left; }
	</style>
`);

const testSlices = async () => {
	const { images } = await loadAssets({ root: '../'});
	const showImage = (k, img, i) => {
		const {width, height} = img;
		if(typeof i === 'undefined'){
			append(`<pre>${k}: ${[width, height].join(' x ')}</pre>`);
			document.body.append(img.cloneNode(true));
			return;
		}
		let container = document.querySelector(`#${k}`);
		if(!container){
			append(`<pre>${k}: ${[width, height].join(' x ')}</pre>`);
			container = append(`<div id="${k}" style="display:flex"></div>`);
		}
		container.append(img.cloneNode(true));
	};
	for (var [k,value] of Object.entries(images)){
		if(Array.isArray(value)){
			value.forEach((v, i) => showImage(k, v, i));
			continue;
		}
		showImage(k, value);
	}
};

const testTeeRun = async () => {
	const { images: { teeRun} } = await loadAssets({ root: '../'});
	append(`<pre>teeRun animated</prev>`);
	console.log(teeRun[0].width / 2)
	const canvas = append(`<canvas 
		width="${teeRun[0].width / 2}"
		height="${teeRun[0].height / 2}"
	></canvas>`);
	canvas.width = teeRun[0].width / 2;
	canvas.height = teeRun[0].height / 2;
	const ctx = canvas.getContext('2d');
	let i =0;
	const frame = () => {
		if(!teeRun[i]) i = 0;
		ctx.drawImage(teeRun[i], 0, 0, teeRun[0].width / 2, teeRun[0].height / 2);
		i++;
	};
	const animate = () => {
		requestAnimationFrame(frame);
		setTimeout(animate, 125);
	};
	animate();
};

(async () => {
	await testSlices();
	await testTeeRun();
})()
