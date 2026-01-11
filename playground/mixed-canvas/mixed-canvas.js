import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js';

const pipe =
	(...fns) =>
	(x) =>
		fns.reduce((v, f) => f(v), x);

class Canvas2D {
	constructor(selector) {
		this.canvas = document.querySelector(selector);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx = this.canvas.getContext('2d', {
			antialias: false,
			depth: false,
			desynchronized: true
		});
	}
}

class Canvas3D {
	constructor(width, height) {
		// Use an off-DOM HTMLCanvasElement for broad compatibility.
		// OffscreenCanvas can be problematic with THREE.WebGLRenderer
		// in some browsers; keep behavior simple and reliable.
		this.canvas = document.createElement('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.isOffscreen = false;
		this.init(this.canvas);
	}

	init(canvas) {
		const { width, height } = canvas;
		const camera = new THREE.PerspectiveCamera(
			70,
			width / height,
			0.01,
			10
		);
		camera.position.z = 0.4;

		const scene = new THREE.Scene();

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			canvas,
			preserveDrawingBuffer: true
		});
		this.render = () => renderer.render(scene, camera);

		this.add3d = (sceneObj) => scene.add(sceneObj);
		this.loop = (fn) => renderer.setAnimationLoop(fn);
	}
}

export default class MixedCanvas {
	constructor(selector) {
		const canvas2d = new Canvas2D(selector || 'canvas');
		this.canvas2d = canvas2d;
		const { width, height } = canvas2d;
		this.width = width;
		this.height = height;
		this.canvas3d = new Canvas3D(width, height);

		this.clear = () => this.canvas2d.ctx.clearRect(0, 0, width, height);

		this.loop = (...args) => {
			const [first, ...rest] = args;
			if (!first) return;

			const defaultFrameTime = 15;
			const firstIsFn = typeof first === 'function';
			const frameTime = firstIsFn ? defaultFrameTime : first;
			console.log(`frame time: ${frameTime}`);
			const ifFirst = firstIsFn ? first : () => {};

			let lastRender = 0;
			const gameLoop = (time) => {
				const timeDiff = time - lastRender;
				if (frameTime > timeDiff) return;
				lastRender = time;
				[ifFirst, ...rest].forEach((a) => a(time));
			};

			this.canvas3d.loop(gameLoop);
		};

		this.add3d = this.canvas3d.add3d;
		this.draw3d = () => {
			this.canvas3d.render();
			try {
				canvas2d.ctx.drawImage(
					this.canvas3d.canvas,
					0,
					0,
					width,
					height
				);
			} catch (e) {
				console.warn('draw3d: drawImage failed', e);
			}
		};

		['drawImage', 'fillText', 'fillRect'].forEach((op) => {
			this[op] = canvas2d.ctx[op].bind(canvas2d.ctx);
		});
		const supported = ['fillStyle', 'font', 'textAlign', 'textBaseline'];
		supported.forEach((prop) => {
			Object.defineProperty(this, prop, {
				set: (value) => {
					canvas2d.ctx[prop] = value;
				}
			});
		});
	}
}

export const ObjParser = async (url) => {
	let objText = await (await fetch(url)).text();
	objText = objText.replace(/ +/g, ' ');

	const linesToArray = (str) =>
		str
			.split('\n')
			.filter((x) => !!x)
			.map((x) => x.trim().split(' ').map(Number));
	let vertices = linesToArray(
		objText
			.split('\n')
			.filter((line) => line.slice(0, 2) === 'v ')
			.map((line) => line.slice(2))
			.join('\n')
	);
	const maxVert = vertices.reduce((all, one) => {
		return Math.max(...[all, ...one.map(Math.abs)]);
	}, 0);
	vertices = vertices.map((x) => x.map((y) => y / maxVert));
	const faces = linesToArray(
		objText
			.split('\n')
			.filter((line) => line.slice(0, 2) === 'f ')
			.map((line) => line.slice(2))
			.join('\n')
	).flat();
	return { vertices, faces };
};

export async function initMixedCanvas({
	canvasSelector = 'canvas',
	objUrl = './teapot.obj'
} = {}) {
	console.log('initMixedCanvas: start', { canvasSelector, objUrl });
	const obj = await ObjParser(objUrl);
	console.log('initMixedCanvas: parsed obj', {
		vertices: obj.vertices.length,
		faces: obj.faces.length
	});
	const canvas = new MixedCanvas(canvasSelector);
	console.log('initMixedCanvas: created MixedCanvas', {
		width: canvas.width,
		height: canvas.height
	});
	const { loop, width, height } = canvas;

	const geometry = new THREE.BufferGeometry();
	const positions = [];
	const colors = [];

	const { vertices, faces } = obj;

	const shape = faces.map((x) => vertices[x - 1]);
	console.log('initMixedCanvas: shape length', shape.length);
	const vColors = vertices.map((x) => [
		Math.random() * 255,
		Math.random() * 255,
		Math.random() * 255,
		235
	]);
	const shapeColors = faces.map((x) => vColors[x - 1]);

	for (let vt in shape) {
		positions.push(...shape[vt].map((x) => x * 0.2));
		colors.push(...shapeColors[vt]);
	}

	const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
	const colorAttribute = new THREE.Uint8BufferAttribute(colors, 4);
	colorAttribute.normalized = true;
	geometry.setAttribute('position', positionAttribute);
	geometry.setAttribute('color', colorAttribute);

	const material = new THREE.RawShaderMaterial({
		uniforms: {
			time: { value: 1.0 }
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		side: THREE.DoubleSide,
		transparent: true
	});

	const geometry2 = new THREE.EdgesGeometry(geometry);
	const material2 = new THREE.LineBasicMaterial({
		color: 0x00bbff,
		transparent: true,
		linewidth: 0.5
	});
	const wireframe = new THREE.LineSegments(geometry2, material2);

	const mesh = new THREE.Mesh(geometry, material);
	mesh.add(wireframe);
	canvas.add3d(mesh);

	const textOffset = 70;

	canvas.fillStyle = '#777c';
	canvas.font = '40px Arial';
	canvas.textAlign = 'center';
	canvas.textBaseline = 'middle';

	const render = () => {
		canvas.clear();
		canvas.draw3d();
		canvas.fillText('Mixed: a 2D canvas', width / 2, textOffset);
		canvas.fillText('...with 3D content!', width / 2, height - textOffset);
	};

	const tick = (time) => {
		mesh.rotation.x = time / 16000;
		mesh.rotation.y = time / 8000;
		mesh.material.uniforms.time.value = time * 0.0005;
	};

	loop(tick, render);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	// Auto-start on page load: call `initMixedCanvas()` once the DOM is ready.
	const start = () => {
		console.log('mixed-canvas: auto-starting on page load');
		initMixedCanvas().catch((e) =>
			console.error('mixed-canvas init error:', e)
		);
	};
	if (document.readyState === 'loading') {
		window.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
}
