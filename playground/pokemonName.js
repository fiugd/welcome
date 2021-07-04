import { importCSS, consoleHelper } from '../.tools/misc.mjs'
import '../shared.styl';
consoleHelper();

const nameMap = {
	a: 'pi',   b: 'mon',
	c: 'fla',  d: 'lu',
	e: 'sa',   f: 'me',
	g: 'ar',   h: 'ka',
	i: 'glu',  j: 'chu',
	k: 'man',  l: 'kar',
	m: 'son',  n: 'tu',
	o: 'mus',  p: 'reg',
	q: 'pa',   r: 'kla',
	s: 'se',   t: 'dor',
	u: 'sun',  v: 'as',
	w: 'mo',   x: 'ge',
	y: 'tron', z: 'ju',
};

function pName (name) {
	const pokename = name
		.toLowerCase()
		.split('')
		.map(x => nameMap[x])
		.join('');
	return (name + ': ').padEnd(9) +
		pokename[0].toUpperCase() +
		pokename.substring(1);
}
const someNames = [
	'Jay', 'Len', 'Lance', 'Athena', 'Isoy', 'Isay', 'Noel', 'Gart'
];
console.info(someNames.map(pName).join('\n'))