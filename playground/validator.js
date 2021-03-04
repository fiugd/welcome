//show-preview

import { importCSS, prism, consoleHelper, htmlToElement } from '../.tools/misc.mjs';
import '../shared.styl';

const log = (msg) => prism('javascript', msg);

const Required = (parent, prop) =>
	typeof parent[prop] !== 'undefined' || `${prop} is required but not present`;
const RequiredIf = (fieldName) => (parent, prop) =>
	!Required(parent, prop) && !Required(parent, fieldName) && `"${fieldName}" is required if "${prop}" is present`;
const IsString = (parent, prop) =>
	typeof parent[prop] === 'string' || `"${prop}" is not a string`;

const validationRules = {
	name: [ Required, IsString ],
	id: [ RequiredIf('idType') ],
	idType: [ RequiredIf('id'), IsString ],
};

const validate = (rules) => (parent, prop) => {
	if(!rules[prop]) return [];
	const error = rules[prop].find(x => typeof x(parent, prop) === 'string');
	return error && error(parent, prop);
};

const myValidator = validate(validationRules);

const test = {
	name: 'hello',
	wee: 'nope',
	id: 2,
	idType: ''
};
const errors = Object.keys(validationRules)
	.reduce((all, one) => {
		const error = myValidator(test, one);
		if(error) return [...all, error];
		return all;
	}, [])

log(`
	${JSON.stringify(test, null, 2)}

	// ${errors.length ? errors.join('\n// ') : 'no errors'}
`.replace(/^	/gm, ''))
