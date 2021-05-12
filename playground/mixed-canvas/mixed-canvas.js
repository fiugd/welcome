import * as THREE from 'https://cdn.skypack.dev/three';

class Canvas2D {
	constructor(selector, width, height){
		this.canvas = document.querySelector(selector);
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext("2d", {
			antialias: false,
			depth: false,
			desynchronized: true
		});
	}
}

class Canvas3D {
	constructor(selector, width, height){
		this.canvas = new OffscreenCanvas(width, height);
		this.init(this.canvas);
	}

	init(canvas){
		const {width, height} = canvas;
		const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
		camera.position.z = 0.4;

		const scene = new THREE.Scene();
		const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
		const material = new THREE.MeshNormalMaterial();
		const mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			canvas,
			preserveDrawingBuffer: true
		});
		this.render = () => renderer.render(scene, camera);
		this.mesh = mesh;
		this.loop = (fn) => renderer.setAnimationLoop(fn);
	}
}

const [width, height] = [400, 300]

const canvas3d = new Canvas3D('.three-dee canvas', width, height);
const {mesh, loop} = canvas3d;

const canvas = new Canvas2D('.two-dee canvas', width, height);
const {ctx} = canvas;
ctx.fillStyle = 'grey';
ctx.font = "30px Verdana";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
const textOffset = 50;

const render = (time) => {
	ctx.clearRect(0,0,width,height);

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;
	canvas3d.render();
	ctx.drawImage(canvas3d.canvas, 0,0, width, height);

	ctx.fillText("This is a 2D canvas", width/2, textOffset);
	ctx.fillText("...with 3D content!", width/2, height-textOffset);
};

loop(render);
