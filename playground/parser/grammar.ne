@{%
	const moo = require("moo");
	const lexerRules = {
		'NL': { match: /\n/, lineBreaks: true },
		space: /[ \t]+/,

		"con": "con",
		"pub": "pub",
		"stat": "stat",
		
		"kwintde": "intde",
		"kwintdo":"intdo",
		"kwint":"int",
		"kwsym": "sym",
		"kwstring": "string",
		"kwstruct": "struct",
		"kwfloat": "float",

		"look":"look",
		"class":"class",
		"event":"event",
		"default":"default",

		"for":"for",
		"while":"while",
		"do":"do",
		"if":"if",
		"else":"else",
		"elif":"elif",
		"return":"return",

		"EXIT":"EXIT",
		"and": "and",
		"or":"or",
		"stop":"stop",
		"wipe":"wipe",

		//multiarray: /[_a-z_A-Z][_a-z_A-Z_0-9]*\[[a-z_A-Z_0-9][a-zA-Z_0-9]{0,5}\]\[[a-z_A-Z_0-9][a-zA-Z_0-9]{0,5}\]/,
		//emptyarray: /[_a-z_A-Z][_a-z_A-Z_0-9]*\[\]/,
		//array: /[_a-z_A-Z][_a-z_A-Z_0-9]*\[[a-z_A-Z_0-9][a-zA-Z_0-9]{0,5}\]/,
		identifier: /[a-z_A-Z][_a-z_A-Z_0-9]*/,


		comment: /#.*?$/,
		"mlcommentstart": "/*",
		"mlcommentend": "*/",

		float: /[0-9][0-9]*\.[0-9][0-9]*/,
		integer:/[0-9][0-9]*/,
		"+=": "+=",
		"-=": "-=",
		"*=": "*=",
		"/=": "/=",
		"%=": "%=",
		"==": "==",
		"!=": "!=",
		">=": ">=",
		"<=": "<=",
		inc: '++',
		dec : '--',
		add: '+',
		subtract: '-',
		divide: '/',
		multiply: '*',
		mod:'%',

		stringlit: /"(?:\\["\\]|[(?:\["\\]|[^\n"\\])*"|'(?:\\['\\]|[(?:\['\\]|[^\n'\\])*'/,
		'(':  '(',
		')':  ')',
		'lsquare':  '[',
		'rsquare':  ']',
		'{':  '{',
		'}':  '}',
		'<': '<',
		'>': '>',
		':': ':',
		';': ';',
		',':  ',',
		'&':  '&',
		"equal": "=",
	};

	/*]*/


	const lexer = moo.compile(lexerRules);

	const output = (type, fn) => (d,l,reject) => {
		document.body.innerHTML += `<pre>${l}: ${type}${
			fn ? fn(d) : ''
		}</pre>`;
		//return d;
	};
%}

# Pass your lexer with @lexer:
@lexer lexer

main -> (statement _ %NL):*

statement
	-> %EXIT              {% output('exit') %}
	| %comment            {% output('comment') %}
	| declaration _ ";"   {% output('declaration', (d) => d)%}
	| assignment _ ";"    {% output('assignment: ', (d) => d)%}
	| functionCall _ ";"  {% output('function call: ', (d) => d) %}
	| functionDeclare     {% output('function declare: ', (d) => d)%}
	| unary _ ";"         {% output('unary')%}
	| expression _ ";"    {% output('expression')%}
	| mlComment           {% output('multiline comment')%}
	| _

mlComment -> %mlcommentstart [^]:+ %mlcommentend

# mlComment
# 	-> %mlcommentstart {% function(d) {setState('multilineComment') } %}
#	| %withinMLComment   {% output('multiline comment') %}
#	| %mlcommentend      {% function(d) { setState('') } %}

declaration -> (_ %con):* _ type __ (assignment | %identifier)

functionCall -> %identifier "(" argument_list ")"

functionDeclare -> "func" __ %identifier "(" argument_list ")" _ functionBody

functionBody -> "{" _ ( %NL:* _ statement _ %NL):* _ "}"

argument_list
	-> null
	| _ argument _
	| _ argument _ "," argument_list

argument
	-> %identifier
	| value
	| _

expression
	-> argument _ operation _ argument

assignment 
	-> %identifier _ %equal _ (value | expression | %identifier)

unary 
	-> %identifier "--"
	| %identifier "++"
	| "--" %identifier
	| "++" %identifier

operation
	-> %add
	| %subtract
	| %divide
	| %multiply
	| %mod

type
	-> %kwint
	| %kwintde
	| %kwintdo
	| %kwfloat
	| %kwsym
	| %kwstring
	| %kwstructs

value
	-> %float
	| %integer
	| %stringlit
	| %emptyarray
	| %multiarray
	| array
	
maxInt -> %integer {% function(d,l, reject) {
	const n = Number(d[0].value)
	if(Number.isInteger(n) && n > 10000) return reject;
} %}
array
	-> %identifier %lsquare (_ | maxInt | %identifier | %stringlit) %rsquare

_ -> %space:*  {% function(d) {return null } %}
__ -> %space:+ {% function(d) {return null } %}
