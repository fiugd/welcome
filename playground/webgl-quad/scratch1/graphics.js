const getGraphic = async () => {
	const r = document.querySelector(':root');
	const container = document.createElement('div');
	container.id ="graphic";
	const source = await fetch('./scratch1.svg').then(x => x.text());
	container.innerHTML = `
		<style>
			svg { width: 650px; max-width: 90vw; }</style>
		${source}
	`;
	document.body.append(container);
	const text = {
		up: {
			left: container.querySelector('#upLeftText'),
			right: container.querySelector('#upRightText'),
			middle: container.querySelector('#upMiddleText'),
		},
		down: {
			left: container.querySelector('#downLeftText'),
			right: container.querySelector('#downRightText'),
			middle: container.querySelector('#downMiddleText'),
		},
	};

	let maxX = 0;
	let minX = 0;
	return {
		getPos: () => Number(getComputedStyle(r).getPropertyValue('--subject-x')),
		setPos: (x) => {
			if(x > maxX){
				maxX = x;
				text.down.right.textContent = maxX.toFixed(2)+''
			}
			if(x < minX){
				minX = x;
				text.down.left.textContent = minX.toFixed(2)+''
			}
			text.down.middle.textContent = x.toFixed(2)+'';
			r.style.setProperty('--subject-x', x+'')
		},
	};
};

export default getGraphic;
