//console.log(Pablo)
//debugger;

const demo1 = (demoElement) => {
	const svg = Pablo(demoElement)
		.svg({
				width: 220,
				height: 220
		});
	const rect = svg.rect({width:200, height:100});
	const rectClick = function(){
		const currentColor = rect.attr('fill');
		const color = currentColor === 'red'
			? 'turquoise'
			: 'red';
		rect.attr('fill', color);
		
		const [currentRot] = rect.transform('rotate');
		const rotation = (currentRot+45) >= 360
			? 0
			: currentRot + 45;
		rect.transform('rotate', rotation)
		console.log(currentRot)
	}
	rect
		.transform('translate', 0)
		.transform('rotate', 45)
		.attr('fill', 'turquoise')
		.attr('transform-origin', 'center')
		.on('click', rectClick);
};

const demoElement = document.createElement('div');
document.body.append(demoElement);

demo1(demoElement);