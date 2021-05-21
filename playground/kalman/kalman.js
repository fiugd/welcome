import * as d3 from 'https://cdn.skypack.dev/d3';
//import { kalman } from './filter1.js';
import { kalman } from './filter2.js';


const graphNode = document.getElementById('reality');
const [width,height] = [2400,400]
const margin = 50;


const noiseFn = (which) => {
	const randNoise = () => (Math.random()-0.5)*.2;
	return ([y, x]) => ([y, x+randNoise()])
};

var sine = (noise) => d3.range(0, 200).map(function(k) {
	var value = [k*0.1, Math.sin(k*0.1)];

	return noise ? noise(value) : value;
});

const computeError = (truth, guess) => {
	return truth.map((tru, i) => {
		return [
			tru[0],
			guess[i][1] - tru[1]
		];
	})
};

const dataSource = {
	"reality": sine(),
	"sensor1": sine(noiseFn("sensor1")),
	"sensor2": sine(noiseFn("sensor2")),
	"sensor3": sine(noiseFn("sensor3")),
};
dataSource.guess = kalman('one')(
	dataSource.sensor1,
	dataSource.sensor2,
	dataSource.sensor3
);
dataSource.error = computeError(
	dataSource.reality,
	dataSource.guess
);


const drawGraph = ({ id, data }) => {
	const element = d3.select('#'+id)
	const svg = element.append('svg');
	const g = svg.append('g');

	svg.attr('viewBox', `0 0 ${width}, ${height}`);
	svg.attr('width', '100%');
	svg.attr('height', '100%');
	
	g.attr('transform', `translate(${margin}, 0)`);

	const xScale = d3.scaleLinear()
		.range([0, width])
		.domain(d3.extent(data, (d) => d[0]));
	const yScale = d3.scaleLinear()
		.range([height, 0])
		.domain(d3.extent(data.slice(0,-50), (d) => d[1]));
	const line = d3.line()
		.x( (d) => xScale(d[0]) )
		.y( (d) => yScale(d[1]) )
		//.curve(d3.curveBasis);

	g.append('path')
		.datum(data)
		.attr('d', line)
		.attr("class", "line")
	g.append('g')
		.attr("class", "axis")
		.attr('transform', `translate(0, ${height/2})`)
		.call(d3.axisBottom(xScale));
	g.append('g')
		.attr("class", "axis")
		.call(d3.axisLeft(yScale).ticks(4));
};


const graphs = [
	"reality", "sensor1", "sensor2", "sensor3", "guess", "error"
].reduce((all, one) => {
	all[one] = {
		id: one,
		graph: drawGraph({ id: one, data: dataSource[one] }),
		element: document.getElementById(one)
	};
	return all;
}, {});

