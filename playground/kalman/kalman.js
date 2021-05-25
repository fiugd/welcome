import * as d3 from 'https://cdn.skypack.dev/d3';
import { kalman as kalman1 } from './filter1.js';
import { kalman as kalman2 } from './filter2.js';

const kalman = kalman2;

const graphNode = document.getElementById('reality');
const [width,height] = [2400,400]
const margin = 50;
const sampleLength = 600;

const blankRange = d3.range(0, sampleLength);
const randNoise = () => (Math.random()-0.5)*.2;
const noiseSrc = {
	sensor1: blankRange.map(x => (0.2*Math.cos(x*3))+(2*randNoise(x))),
	sensor2: blankRange.map(x => (0.5*Math.cos(Math.pow(x, 2)*5))+(0.3*randNoise(x))),
	sensor3: blankRange.map(x => (0.5*Math.cos(Math.pow(x, 1/3)*5))+(0.3*randNoise(x))),
};

const noiseFn = (which) => {
	const randNoise = () => (Math.random()-0.5)*.2;
	return ([y, x], i) => ([y, x+noiseSrc[which][i]])
};

var sine = (noise) => blankRange
	.map(function(k, i) {
		const value = [k*0.1, Math.sin(k*0.1)];
		return noise ? noise(value, i) : value;
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
	"guess": undefined,
	"error": undefined
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
	g.attr('transform', `translate(${margin}, 0)`);

	const xScale = d3.scaleLinear()
		.range([0, width])
		.domain(d3.extent(data, ([x]) => x));
	const yScale = d3.scaleLinear()
		.range([height, 0])
		.domain(d3.extent(data.slice(40,-50), ([x,y]) => y));
	const line = d3.line()
		.x( ([x,y]) => xScale(x) )
		.y( ([x,y]) => yScale(y) )

	console.log(d3.axisLeft(yScale).ticks(4))
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

