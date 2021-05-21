import * as d3 from 'https://cdn.skypack.dev/d3';
import kalmanFilter from 'https://cdn.skypack.dev/kalman-filter';

const {KalmanFilter} = kalmanFilter;
//const kFilter = new KalmanFilter();
const kFilter = new KalmanFilter({
	observation: 3,
	dynamic: 'constant-position'
});

const graphNode = document.getElementById('reality');
const width = 4800, height = 800, margin = 50;


const kalman = (s1, s2, s3) => {
	// todo: make a guess
	//https://github.com/wouterbulten/kalmanjs
	//https://github.com/infusion/Kalman.js/
	//https://github.com/piercus/kalman-filter#readme
	//https://github.com/xonoxitron/AHRS-Sensors-Fusion-JS
	//https://github.com/borismus/sensor-fusion
	//https://josephmalloch.wordpress.com/portfolio/imu-sensor-fusion/

	const obs = s1.map((x,i) => {
		return [s1[i][1], s2[i][1], s3[i][1]];
	})
	
	
	// no filtereing
	//return s1;
	
	// const obs = s1.map(x => x[1]);
	const res = kFilter.filterAll(obs);
	// const sample = (a, off=0) => ([a[off],a[off+1],a[off+2],a[off+3],a[off+4],a[off+5]]);
	//console.log({ length: res.length, sample: sample(res,25), sampleS1: sample(obs,25)})
	const ave = (a) => a.reduce((all,one) => all+one, 0) / a.length;
	return s1.map((x, i) => ([s1[i][0], ave(res[i]) ]));
	

	// take an average
	return s1.map((s, i) => {
		return [
			s[0],
			(s[1] + s2[i][1] + + s2[i][1])/3
		];
	});
};


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
			tru[1] - guess[i][1]
		];
	})
};

const dataSource = {
	"reality": sine(),
	"sensor1": sine(noiseFn("sensor1")),
	"sensor2": sine(noiseFn("sensor2")),
	"sensor3": sine(noiseFn("sensor3")),
};
dataSource.guess = kalman(
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

	// svg.style({
	// 	'width': '100%', //width + 2 * margin,
	// 	'height': '100%', //height + 2 * margin
	// });
	svg.attr('viewBox', `0 0 ${width/4}, ${height/6}`);
	svg.attr('width', '100%');
	svg.attr('height', '100%');
	// g.attr('width', '100%');
	// g.attr('height', '100%');
	
	g.attr(
		'transform',
		'translate(' + margin + ', ' + 0 + ')'
	);

	const xScale = d3.scaleLinear()
		.range([0, width/4])
		.domain(d3.extent(data, (d) => d[0]));
	const yScale = d3.scaleLinear()
		.range([height/6, 0])
		.domain(d3.extent(data, (d) => d[1]));
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
		.attr('transform', 'translate(0, 67)')
		.call(d3.axisBottom(xScale));
	g.append('g')
		.attr("class", "axis")
		.call(d3.axisLeft(yScale));
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

