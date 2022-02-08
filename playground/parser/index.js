/*
	some help from: https://omrelli.ug/nearley-playground/

	codemirror mode: https://codemirror.net/mode/ebnf/index.html
*/

const version = '2.20'; //nearley version

const test = `
6 * 7
1 times 9
sin 42
`.trim().split('\n');

const exampleGrammar = `
@{%
	// Moo lexer documention is here:
	// https://github.com/no-context/moo

	const moo = require("moo")
	const lexer = moo.compile({
		ws:     /[ \t]+/,
		number: /[0-9]+/,
		times: /\\*|times/,
		word: /[a-z]+/,
	});
%}

# Pass your lexer with @lexer:
@lexer lexer

main -> trig | multiplication {% ([first]) => first %}

# %token matches any token of that type
multiplication -> %number %ws %times %ws %number {% ([first, , , , second]) => first * second %}

# literal strings match lexed tokens with their exact text
trig -> "sin" %ws %number {% ([, ,third]) => Math.sin(third) %}
`.trim();



window.require = (p) => window[p];

function warn(opts, str) {
	opts.out("WARN"+"\t" + str + "\n");
}

function lintNames(grm, opts) {
	var all = [];
	grm.rules.forEach(function(rule) {
		all.push(rule.name);
	});
	grm.rules.forEach(function(rule) {
		rule.symbols.forEach(function(symbol) {
			if (!symbol.literal && !symbol.token && symbol.constructor !== RegExp) {
				if (all.indexOf(symbol) === -1) {
					warn(opts,"Undefined symbol `" + symbol + "` used.");
				}
			}
		});
	});
}

function lint(grm, opts) {
	if (!opts.out) opts.out = console.error;
	lintNames(grm, opts);
}

const parse = (compiledGrammar, input) => {
	const parserGrammar = nearley.Grammar.fromCompiled(compiledGrammar);
	const parser = new nearley.Parser(parserGrammar);
	parser.feed(input);
	return parser.results;
};

const compile = async (input, opts={}) => {
	const { default: NearlyBoot } = await import('./nearlyBoot.js');
	const results = parse(NearlyBoot, input);
	const c = Compile(results[0], { ...opts, version });
	if (!opts.quiet) lint(c, { out: console.warn, version });
	return eval(generate(c,opts.export));
}

const render = (text, className) => {
	document.body.innerHTML = `
	<pre class="${className||''}">${text}</pre>
	`.trim();
};

try {
	const opts = { export: 'exampleParse' };
	const exampleParser = await compile(exampleGrammar, opts);
	const parser = (input) => [
		input,
		parse(window.exampleParse, input)
	].join(' => ');
	render(test.map(parser).join('\n'));
} catch(e){
	render(e, 'error');
}

