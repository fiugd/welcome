import drawGraph from './graph.js';

const getGraphic = async () => {
	const r = document.querySelector(':root');
	const container = document.createElement('div');
	container.id ="graphic";
	const source = await fetch('./scratch1.svg').then(x => x.text());
	container.innerHTML = `
		<style>
			svg { width: 650px; max-width: 90vw; }
			.graph {
				flex: 1;
				width: 100%;
				background: #8080801a;
				margin-top: 0.5em;
			}
			.graph + .graph {
				margin-top: 0.5em;
			}
			.graph > svg {
				width: auto;
				max-width: unset;
				pointer-events: none;
				margin: 0 0.5em;
			}
			#graphContainer {
				display: flex;
				width: 650px; max-width: 90vw;
				flex-direction: column;
			}
			.graph text {
				fill: currentColor;
				font-size: 0.4em;
			}
			.graph .line {
				fill: none;
				stroke: currentColor;
				stroke-width: 1;
			}
			.graph .axis path,
			.graph .axis line {
				fill: none;
				stroke: currentColor;
				color: currentColor;
				shape-rendering: crispEdges;
			}
			.graphTitle {
				margin: 0.7em 0 0.25em 0;
				width: 100%;
				text-align: center;
			}
		</style>
		${source}
		<div id="graphContainer">
			<div id="graph1" class="graph"></div>
			<div id="graph2" class="graph"></div>
			<div id="graph3" class="graph"></div>
		</div>
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
	const graphs = [];
	return {
		graph: (title, ymin, ymax) => {
			const graph = drawGraph({
				id: "graph" + (graphs.length+1),
				ymin, ymax,
				title,
				data: []
			});
			graphs.push(graph);
			return graph;
		},
		setDisplay: (which, value) => {
			const [y, x] = which.split('.');
			if(!text[y]?.[x]) return;
			text[y][x].textContent = value.toFixed(2);
		},
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

class Graphic {
	constructor(){
		this.ready = getGraphic().then(x => {
			this.getPos = x.getPos.bind(this);
			this.setPos = x.setPos.bind(this);
			this.setDisplay = x.setDisplay.bind(this);
			this.graph = x.graph.bind(this);
		});
	}
}

export default Graphic;
