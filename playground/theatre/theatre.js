// this will not work in a worker

import state from './state.json' assert { type: "json" };

import Theatre from 'https://cdn.skypack.dev/@theatre/core/dist';
//import Theatre from 'https://cdn.skypack.dev/theatre';
//import studio from 'https://cdn.skypack.dev/@theatre/studio/dist';

window.process = { env: {} };

const project = Theatre.getProject('my project', { state });
//const timeline = project.getTimeline('A timeline');
const sheet = project.sheet('Scene');
const shader = sheet.object('Shader', {
	uniforms: {
		uOpacity: 0.07000000000000006,
		uDeepPurple: 0.74,
		uStrength: 0,
		uPhase: {
			y: -0.68,
			x: 0.31000000000000005
		},
		uOscilation: {
			x: 0.45
		},
		uBrightness: {
			z: -0.44000000000000006,
			y: 0.15000000000000002
		}
	}
});

const div = document.createElement('div');
div.style.cssText = `
	position: absolute;
	width: 100px;
	height: 100px;
	background: white;
`;
document.body.append(div);

shader.onValuesChange(({ uniforms }) => {
	const { uOpacity } = uniforms;
	const normal = Number(((uOpacity-0.045) / 0.045).toFixed(5));
	div.style.opacity = normal;
	div.style.left = normal * 100;
	div.style.top = normal * 100;
});

let it;
const play = ({ range=1, rate }) => {
	if(typeof it === 'undefined'){
		it = 0.1 * rate
	}
	const [start, end] = range;
	requestAnimationFrame(() => {
		let nextIt = sheet.sequence.position + it;
		if(nextIt > end){
			it *= -1;
			nextIt = end + 3*it;
		}
		if(nextIt <= start){
			it *= -1;
			nextIt = start + 3*it;
		}
		sheet.sequence.position = nextIt;
		requestAnimationFrame(() => play({ range, rate }));
	});
}

project.ready.then(() => {
	play({
		range: [0,1.5],
		iterationCount: 100,
		direction: "alternate",
		rate: 1
	});
});

