import * as THREE from 'https://cdn.skypack.dev/three';

class Canvas2D {
	constructor(selector){
		this.canvas = document.querySelector(selector);
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx = this.canvas.getContext("2d", {
			antialias: false,
			depth: false,
			desynchronized: true
		});
	}
}

class Canvas3D {
	constructor(width, height){
		this.canvas = new OffscreenCanvas(width, height);
		this.init(this.canvas);
	}

	init(canvas){
		const {width, height} = canvas;
		const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
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
	constructor(selector){
		const canvas2d = new Canvas2D('canvas');
		this.canvas2d = canvas2d;
		const {width, height} = canvas2d;
		this.width = width;
		this.height = height;
		this.canvas3d = new Canvas3D(width, height);
		
		this.clear = () => this.canvas2d.ctx.clearRect(0,0,width,height)
		this.loop = this.canvas3d.loop;
		this.add3d = this.canvas3d.add3d;
		this.draw3d = () => {
			this.canvas3d.render();
			canvas2d.ctx.drawImage(this.canvas3d.canvas, 0,0, width, height);
		};

		['drawImage', 'fillText', 'fillRect']
			.forEach(op => {
				this[op] = canvas2d.ctx[op].bind(canvas2d.ctx);
			});
		const supported = ['fillStyle', 'font', 'textAlign', 'textBaseline'];
		supported.forEach(prop => {
			Object.defineProperty(this, prop, {
				set: (value) => { canvas2d.ctx[prop] = value; }
			});
		});
	}
}



