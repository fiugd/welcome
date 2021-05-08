export const clone = x => JSON.parse(JSON.stringify(x))

export const cleanError = (e) => {
	e.stack = e.stack
		.split('\n')
		.filter(x => !x.includes('rxjs'))
		.join('\n');
	return e;
};

export const unNest = (root, path, ancestors={}) => {
	let _path, singular, thisParent;
	const results = [];
	try {
		_path = path.split('/');

		if(_path[0].includes('(')){
			singular = _path[0].split('(')[0];
			_path[0] = _path[0].replace(/\(|\)/g, '');
		}
		thisParent = root[_path[0]];

		if(_path.length === 1){
			for(var i=0, len=thisParent.length; i<len; i++){
				results.push({ ...ancestors, [singular || _path[0]]:thisParent[i] });
			}
			return results;
		}

		for(var i=0, len=thisParent.length; i<len; i++){
			results.push(
				unNest(
					thisParent[i],
					_path.slice(1).join('/'),
					{...ancestors, [singular || _path[0]]: thisParent[i] }
				)
			);
		}
		return results.flat();
	} catch(e){
		debugger;
	}
};
