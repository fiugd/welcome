import State from '../modules/state.js';

const render = (args) => {
	let { itemsProp, template, target } = args;
	const items = State.get(itemsProp) || [];
	const selectedProp = template.getAttribute('selected');
	const isSelected = (() => {
		if (typeof selectedProp !== 'string') return () => false;
		let [prop, globalProp] = selectedProp.split(' IS ');
		prop = prop.trim();
		globalProp = globalProp.trim();
		const globalValue = State.get(globalProp);
		return (item) => item[prop] === globalValue;
	})();
	if ((target?.id || '').startsWith('for-each-')) {
		target = document.getElementById(target.id);
	}

	const children = Array.from(template.children).map((x) =>
		x.cloneNode(true)
	);
	const div = document.createElement('div');

	div.style.width = '100%';
	div.style.height = '100%';

	for (const attrName of template.getAttributeNames()) {
		if (['items', 'selected'].includes(attrName)) continue;
		div.setAttribute(attrName, template.getAttribute(attrName));
	}

	div.innerHTML = '';
	div.id = 'for-each-' + Math.random().toString().replace('0.', '');

	for (const item of items) {
		const itemSelected = isSelected(item);
		for (const child of children) {
			const childClone = child.cloneNode(true);
			const textContentMatches = [
				...childClone.innerHTML.matchAll(/{{(.*?)}}/g)
			].map((x) => x[1]);

			for (const match of textContentMatches) {
				const reg = new RegExp(`{{${match}}}`);
				childClone.innerHTML = childClone.innerHTML.replace(
					reg,
					item[match]
				);
			}
			//childClone.textContent = childClone.textContent.replace();
			//use item to modify childClone

			if (itemSelected) childClone.classList.add('selected');
			div.append(childClone);
		}
	}
	target && target.replaceWith(div);
	return div;
};

const ForEach = (node) => {
	const itemsProp = node.getAttribute('items');
	const listenProp = node.getAttribute('listen') || '';
	let template = node;
	let target = node;
	const updateHandler = () => {
		// const thisState = State.get();
		// console.log({ thisState });
		console.log('ForEach update');
		target = render({ itemsProp, template, target });
	};
	State.subscribe([itemsProp], updateHandler);
	State.subscribe(listenProp.split(','), updateHandler);
	target = render({ itemsProp, template, target });
};

export default ForEach;
