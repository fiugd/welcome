export const clone = x => JSON.parse(JSON.stringify(x))

export const cleanError = (e) => {
	e.stack = e.stack
		.split('\n')
		.filter(x => !x.includes('rxjs'))
		.join('\n');
	return e;
}