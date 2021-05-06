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
			document.body.append(img);
			return;
		}
		let container = document.querySelector(`#${k}`);
		if(!container){
			append(`<pre>${k}: ${[width, height].join(' x ')}</pre>`);
			container = append(`<div id="${k}" style="display:flex"></div>`);
		}
		container.append(img);
	};
	for (var [k,value] of Object.entries(images)){
		if(Array.isArray(value)){
			value.forEach((v, i) => showImage(k, v, i));
			continue;
		}
		showImage(k, value);
	}
};

testSlices();
