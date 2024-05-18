export const clone = (x) => JSON.parse(JSON.stringify(x));

export const cleanError = (e) => {
	e.stack = e.stack
		.split('\n')
		.filter((x) => !x.includes('rxjs'))
		.join('\n');
	return e;
};

export const unNest = (root, path, ancestors = {}) => {
	let _path, singular, thisParent;
	const results = [];
	try {
		_path = path.split('/');

		if (_path[0].includes('(')) {
			singular = _path[0].split('(')[0];
			_path[0] = _path[0].replace(/\(|\)/g, '');
		}
		thisParent = root[_path[0]];

		if (_path.length === 1) {
			for (var i = 0, len = thisParent.length; i < len; i++) {
				results.push({
					...ancestors,
					[singular || _path[0]]: thisParent[i]
				});
			}
			return results;
		}

		for (var i = 0, len = thisParent.length; i < len; i++) {
			results.push(
				unNest(thisParent[i], _path.slice(1).join('/'), {
					...ancestors,
					[singular || _path[0]]: thisParent[i]
				})
			);
		}
		return results.flat();
	} catch (e) {
		debugger;
	}
};

// see also https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
export const colorShade = (col, amt) => {
	col = col.replace(/^#/, '');
	if (col.length === 3)
		col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

	let [r, g, b] = col.match(/.{2}/g);
	[r, g, b] = [
		parseInt(r, 16) + amt,
		parseInt(g, 16) + amt,
		parseInt(b, 16) + amt
	];

	r = Math.max(Math.min(255, r), 0).toString(16);
	g = Math.max(Math.min(255, g), 0).toString(16);
	b = Math.max(Math.min(255, b), 0).toString(16);

	const rr = (r.length < 2 ? '0' : '') + r;
	const gg = (g.length < 2 ? '0' : '') + g;
	const bb = (b.length < 2 ? '0' : '') + b;

	return `#${rr}${gg}${bb}`;
};

export function appendCSSRule(css) {
	const style = document.createElement('style');
	style.appendChild(document.createTextNode(css));
	document.head.appendChild(style);
}
