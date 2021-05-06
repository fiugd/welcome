//show-preview
import {htmlToElement} from '../../../.tools/misc.mjs'
import {loadAssets} from '../td.assets.js';

const append = (html) => document.body.append(htmlToElement(html));

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
	for (var [k,value] of Object.entries(images)){
		const {width, height} = value;
		document.body.append(value);
		append(`<pre>${k}: ${[width, height].join(' x ')}</pre>`);
	}
};

testSlices();
