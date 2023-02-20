import Papa from 'https://cdn.skypack.dev/papaparse';
import traverse from 'https://cdn.skypack.dev/traverse';

document.title = "Parsing Objects";
document.body.textContent = 'see dev console output (for now)';

const pokemonCSVUrl = 'https://raw.githubusercontent.com/crosshj/data/main/pokedex.csv';
const pokemon = await new Promise((resolve) => Papa.parse(pokemonCSVUrl, {
	download: true,
	header: true,
	worker: true,
	complete: ({ data, errors, meta }) => resolve(data)
}));

const example = {
	foo: {
		one: 1,
		two: 2,
		three: 3,
	},
	bar: {
		baz: [{
			one: 1,
		}, {
			two: 2,
		}, {
			three: 3,
		}]
	},
};

const flatten = (obj) => {
	const flattened = [];
	const replacer = function(key, value){
		const parent = this;
		flattened.push({ key, value, parent });
		return value;
	};
	JSON.stringify(obj, replacer);
	return flattened;
};

const traversable = traverse(example);

const paths = traversable.paths();
const nodes = traversable.nodes();

const pathNodes = {};
for(const [i,v] of Object.entries(paths)){
	const path = v.join('/');
	const value = typeof nodes[i] === "object"
		? Object.keys(nodes[i])
		: nodes[i];
	pathNodes[path] = value;
}

const expect = {
	"": ["foo", "bar"],
	"foo": ["one", "two", "three"],
	"bar": ["baz"],
	"bar/baz": ["0", "1", "2"],
	"bar/baz/0": ["one"],
	"bar/baz/1": ["two"],
	"bar/baz/2": ["three"],
	"foo/one": 1,
	"foo/two": 2,
	"foo/three": 3,
	"bar/baz/0/one": 1,
	"bar/baz/1/two": 2,
	"bar/baz/2/three": 3,
};
console.log(pathNodes);