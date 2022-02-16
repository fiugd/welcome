/*
	some help from: https://omrelli.ug/nearley-playground/

	codemirror mode: https://codemirror.net/mode/ebnf/index.html
	
	https://en.wikipedia.org/wiki/Comparison_of_parser_generators
	https://www.ics.uci.edu/~pattis/ICS-33/lectures/ebnf.pdf
*/

const version = '2.20'; //nearley version

const code = `
#sample

func say(){
	show("Good day!");
}

a+a;
y=a;
con float eu = 2.71;

ENTER();
intde x;
string sample = "Hello World!";
show(sample,1.1,2,"string");

x++;
x = y[10] + 1;
x=eu + 3.142222;
show("hello", x, y, z, 1.1, 2, null);
say();
EXIT

/*
multiline comment
intdet x;
*/

`.trim() + '';

window.require = (p) => window[p];

const parse = (compiledGrammar, input, verbose=true) => {
	const parserGrammar = nearley.Grammar.fromCompiled(compiledGrammar);
	const parser = new nearley.Parser(parserGrammar, { keepHistory: true });
	parser.feed(input);
	return parser.results;
};

const compile = async (input, opts={}) => {
	const { default: NearlyBoot } = await import('./nearlyBoot.js');
	const results = parse(NearlyBoot, input, false);
	const c = Compile(results[0], { ...opts, version });
	//console.log(generate(c,opts.export));
	return eval(generate(c,opts.export));
}

const render = (text, className) => {
	document.body.innerHTML += `
	<pre class="${className||''}">${text}</pre>
	`.trim();
};

try {
	const opts = { export: 'exampleParse' };
	const grammar = await fetch('./grammar.ne').then(x => x.text());
	await compile(grammar, opts);
	const res = parse(window.exampleParse, code);
	console.log(res)
	render(res); 
} catch(e){
	render(e, 'error');
}

