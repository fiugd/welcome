//show-preview
import Matter from 'https://cdn.skypack.dev/matter-js';

document.head.innerHTML += `<style>

body {
	margin-top: 3em;
	background: #070707;
	position:absolute;
	top:0;bottom:0;left:0;right:0;
	display: flex;
	flex-direction: row;
	flex-direction: row;
	justify-content: center;
	align-items: start;
}
body canvas { background: transparent !important;}
body.pixels canvas { image-rendering: pixelated;}
body canvas { width: 100% !important; height: auto !important; }
body.wide canvas { height: 100% !important; width: auto !important; }
</style>`;

const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Events = Matter.Events;
const Vector = Matter.Vector;
const Body = Matter.Body;

const options = {
	wireframes: false,
	pixelRatio: 2,
};
const gravity = 0.4;
const rects = [
	['#f0f', 380, -50, 60, 60],
	['#3ff', 380, -290, 20, 20],
];
const stable = [
	['yellow', 437, 499, 10, 10],
	['#222', 380, 600, 2000, 11], //ground
	['orange', 357, 250, 10, 10],
	['red', 648, 479, 10, 10],
	['lightblue', 516, 100, 10, 10],
];

const rotate = (object, degrees) => {
	const radians = degrees * 0.0174533;
	const center = {
		x: object.position.x - 5, //(object.width/2),
		y: object.position.y - 5, //(object.height/2)
	};
	Body.rotate(object, radians, center);
};
const rectDraw = (_opts={}) => ([color, ...x]) => {
	const opts = {
		render: {
			fillStyle: 'transparent',
			strokeStyle: color || 'white',
			lineWidth: 0.5
		},
		..._opts
	};
	return Bodies.rectangle(...x, opts);
};
const trailsDraw = () => {
	var cool = false;
	cool = true;
	const trail = [];

	return () => {
		if (trail.length < 2000){
			objects.forEach((o,i) => {
				if(i>1) return
				trail.push({
					position: Vector.clone(o.position),
					speed: o.speed
				});
			});
		}

		Render.startViewTransform(render);
		render.context.globalAlpha = 1;

		const ctx = render.context;
		for (var i = 0; i < trail.length; i += 1) {
				const prevI = cool
					? (i>1 ? i-1 : 0)
					: (i>1 ? i-2 : 0)
				var prev = trail[prevI].position;
				var point = trail[i].position,
				speed = trail[i].speed;

				var hue = 200 + Math.round((1 - Math.min(1, speed / 10)) * 170);
				ctx.strokeStyle = 'hsl(' + hue + ', 100%, 55%)';
				ctx.lineWidth = cool ? 0.2 : 1;
				ctx.beginPath();
				ctx.moveTo(prev.x, prev.y);
				ctx.lineTo(point.x, point.y);
				ctx.stroke();
				render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
				render.context.fillRect(point.x-0.5, point.y-0.5, 1, 1);
		}

		render.context.globalAlpha = 1;
		Render.endViewTransform(render);
	};
};

//TODO: should be a one-liner to rectDraw
const objects = [
	...rects.map(rectDraw()),
	...stable.map(rectDraw({ isStatic: true }))
];
//TODO: should be part of declaration
rotate(objects[1], 44); //green moving
rotate(objects[2], 21); // yellow still
rotate(objects[4], 14); // orange still
rotate(objects[5], 20); //red still
rotate(objects[6], -1.1); //blue still
//TODO: should be part of declaration
objects.forEach((o, i) => {
	if(i>1) return;
	o.restitution = 0.95;
});

document.addEventListener('keydown', (e) => {
	if (e.code !== "Space") return;
	document.location.reload();
});

const engine = Engine.create();
const element = document.body;
const render = Render.create({ element, engine, options });
const runner = Runner.create();

engine.world.gravity.y = gravity;

Events.on(render, 'afterRender', trailsDraw());

//trying to get fast motion working
/*
Events.on(engine, 'afterUpdate', () => {
	engine.timing.timeScale = 1-(7/60);
});
*/

Composite.add(engine.world, objects);
Render.run(render);
Runner.run(runner, engine);

const resize = () => {
	const { clientHeight:height, clientWidth:width } = document.documentElement;
	if(width > height){
		document.body.classList.add('wide');
	} else {
		document.body.classList.remove('wide');
	}
};
window.onresize = resize;
resize();

//document.body.classList.add('pixels');