// microlibraries: https://subscription.packtpub.com/book/web-development/9781838645571/1/ch01lvl1sec04/modules-microlibraries
const d3 = await Promise.all([
	import("https://cdn.skypack.dev/d3-scale"),
	import("https://cdn.skypack.dev/d3-selection"),
	import("https://cdn.skypack.dev/d3-axis"),
	import("https://cdn.skypack.dev/d3-shape"),
	import("https://cdn.skypack.dev/d3-array"),
]).then(d3 => Object.assign({}, ...d3));

//the whole d3
//import·*·as·d3·from·'https://cdn.skypack.dev/d3';

const drawGraph = ({
	id, title, data=[], width=300, height=100, margin=20,
	ymin, ymax
}) => {
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
		if(!ymin || !ymax){
			yScale.domain(d3.extent(data, d => d.y*1.5));
		} else {
			yScale.domain([ymin, ymax]);
		}
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

export default drawGraph;
