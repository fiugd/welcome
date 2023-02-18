const getTarget = () => {
	const _target = document.getElementById('testContainer');
	let target;
	if(_target){
		target = _target;
	} else {
		target = document.createElement('div');
		target.id = "testContainer";
		document.body.append(target);
	}
	return target;
};

export const html = (tag, content, parent) => {
	const el = document.createElement(tag);
	el.innerHTML = content;
	(parent || document.body).append(el);
	return el;
};

export const [STYLE, DIV, PRE] = ['style', 'div', 'pre'].map(tag =>
	(content) => html(tag, content, getTarget())
);

export const tabTrim = (x) => x.replace(/^[ \t]+/gm, '').trim()