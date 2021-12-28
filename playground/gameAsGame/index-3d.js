import TextureAnimator from './modules/textureAnimate.js';
import { animate, load } from './piskel.js';

const {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	TextureLoader,
	BoxGeometry,
	PlaneGeometry,
	MeshBasicMaterial,
	Mesh
} = THREE;

const autoZoom = (camera) => {
	camera.position.z = 20 + (window.innerWidth < 650
		? Math.floor(4500 / window.innerWidth)
		: 0);
};


const setup = () => {
	var scene = new Scene();
	var camera = new PerspectiveCamera(
		10,
		window.innerWidth/(window.innerHeight/2),
		0.1,
		1000
	);
	autoZoom(camera);

	var renderer = new WebGLRenderer({
		antialias:false,
		alpha: true
	});
	renderer.setSize( window.innerWidth, window.innerHeight/2 );
	document.body.appendChild( renderer.domElement );

	return {
		renderer,
		camera,
		scene
	}
};

const { renderer, camera, scene } = setup();

const cubeDims = {
	x: 4,
	y: 5
}
const shaderMat = new THREE.ShaderMaterial( {
	vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
	`,
	fragmentShader: `
varying vec2 vUv;
vec4 colorA = vec4(0.1,0.1,0.1, 1.0);
vec4 colorB = vec4(0.3,0.3,0.3, 1.0);

void main() {
	vec2 center = vec2(
		${cubeDims.x.toFixed(1)},
		${cubeDims.y.toFixed(1)}
	) * vUv;
	vec2 uv = floor(center.xy);
	gl_FragColor = mod(uv.x + uv.y, 2.0) > 0.5
		? colorA
		: colorB;
}
	`
} );

const group = new THREE.Group();
scene.add(group);

const cube = new Mesh(
	new BoxGeometry( cubeDims.x, cubeDims.y, 0),
	shaderMat
	//new MeshBasicMaterial( { color: "grey" } )
);
group.add(cube);

//scene.add( cube );

const addChar = (x,y, mat) => {
	let material;
	material = mat
	if(typeof mat  === "undefined"){
		material = new MeshBasicMaterial( { color: "#333" } )
	}
	if(typeof mat  === "string"){
		material = new MeshBasicMaterial( { color: mat } )
	}
	
	const yScale = 1.3;
	const char = new Mesh(
		new BoxGeometry( 1, 0, yScale ),
		material
	);
	//char.rotation.x = -Math.PI/2 - 0.9
	char.position.z = yScale/2;
	char.position.x = 0.5 - cubeDims.x/2;
	char.position.y = -1*(yScale/1.4) + cubeDims.y/2;

	char.position.x += (x-1);
	char.position.y -= (y-1);
	group.add(char);

	return char;
};


function dummyChars(){
	for(var i=1; i<=cubeDims.x; i++){
		for(var j=1; j<=cubeDims.y; j++){
			if(Math.random() > 0.5) continue;
			addChar(i,j,
				'#' + Math.floor(Math.random()*16777215).toString(16)
			);
		}
	}
}
//dummyChars();

function someChars(){
	addChar(1,2, "red");
	addChar(1,3);
	addChar(3,3, "yellow");
	addChar(1,1, "orange");
	addChar(4,5, "blue");
	addChar(4,4, "indigo");
	addChar(4,3, "limegreen");
	addChar(4,2, "violet");
	addChar(4,1, "pink");
}
//someChars();

group.position.y -= cubeDims.y/2;
camera.position.y -= cubeDims.y/2
group.rotation.x = -0.9;

const charAnimations = [];
const render = function () {
	requestAnimationFrame( render );
	//group.rotation.x += 0.01;
	//group.rotation.y += 0.01;
	renderer.render(scene, camera);
	update();
};

var clock = new THREE.Clock();
function update(){
	var delta = clock.getDelta();
	charAnimations.forEach(annie => {
		annie.update(1000 * delta);
	});
}

/*
	https://stemkoski.github.io/Three.js/Texture-Animation.html
	^^ animate a texture

*/

render();

window.addEventListener(
	'resize', () => {
		camera.aspect = window.innerWidth / (window.innerHeight/2);
		autoZoom(camera);

		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight/2 );
	}
);

const placeChar = async (x, y, url) => {
	const piskel = await load(url);
	const texture = new TextureLoader().load(piskel.all.img);
	texture.repeat.set(
		1/piskel.all.frames,
		1
	);
	// texture, #horiz, #vert, #total, duration.
	charAnimations.push(new TextureAnimator(
		texture,
		piskel.all.frames, 1, piskel.all.frames,
		40*piskel.fps
	));

	const material = new MeshBasicMaterial({
			map: texture,
			transparent: true
	});
	material.map.anisotropy = 0;
	material.map.magFilter = THREE.NearestFilter;
	material.map.minFilter = THREE.NearestMipmapNearestFilter;
	addChar(x,y, material);
};

await placeChar(3,3, './assets/castle-front.piskel');
await placeChar(2,5, './assets/castle.piskel');
