import * as d3 from 'https://cdn.skypack.dev/d3';

const drawGraph = ({ id, title, data=[], width=300, height=100, margin=20 }) => {
	const X_SCALE = 1000;

	const element = d3.select('#'+id);
	const titleEl = element.append('div');
	titleEl.text(title || '---');
	titleEl.classed('graphTitle', true);

	const svg = element.append('svg');
	svg.classed('graphSVG', true);

	const g = svg.append('g');
	svg.attr('viewBox', `0 0 ${width}, ${height}`);
	g.attr('transform', `translate(15, -10)`);

	const xScale = d3.scaleLinear()
		.range([0, width-30])
	const yScale = d3.scaleLinear()
		.range([height, 0])

	const line = d3.line()
		.x( ({ x,y }) => xScale(x) )
		.y( ({ x,y }) => yScale(y) )
	const numTicks = 4;

	//console.log(d3.axisLeft(yScale).ticks(4))
	g.append('path')
		.attr("class", "line")
		.attr('transform', `translate(10,0)`)
		.datum(data)
		.attr('d', line)
	g.append('g')
		.attr("class", "axis x")
		.attr('transform', `translate(10, ${height-10})`)
		.call(d3.axisBottom(xScale))
		.call(g => g.select(".domain").remove());
	g.append('g')
		.attr("class", "axis y")
		.call(d3.axisLeft(yScale).ticks(numTicks));

	const xAxis = d3.select(`#${id} .axis.x`);
	const yAxis = d3.select(`#${id} .axis.y`);
	const graphLine = svg.select(".line");

	let counter = 0;
	const updateGraph = (value) => {
		data.push({
			x: counter,
			y: value
		});
		xScale.domain(d3.extent([
			counter>X_SCALE ? counter-X_SCALE : 0,
			counter>X_SCALE ? counter : X_SCALE
		]));
		//yScale.domain(d3.extent(data, d => d.y*1.5));
		yScale.domain([-19, 19]);
		xAxis
			.call(d3.axisBottom(xScale))
			.call(g => g.select(".domain").remove());
		yAxis
			.call(d3.axisLeft(yScale).ticks(numTicks))
			.call(g => g.select(".domain").remove());
		counter += 1;
		graphLine
			.datum(data.length > X_SCALE ? data.slice(-X_SCALE) : data)
			.attr("d", line)
	};
	return { update: updateGraph }
};

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

	//drawGraph({ id: "graph1", data: [] });
	// drawGraph({ id: "graph2", data: [] });
	// drawGraph({ id: "graph3", data: [] });

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
		graph: (title) => {
			const graph = drawGraph({
				id: "graph" + (graphs.length+1),
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
