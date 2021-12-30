import { load } from '../modules/piskel.js';
import TextureAnimator from '../modules/textureAnimate.js';

const {
	Clock,
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	TextureLoader,
	BoxGeometry,
	PlaneGeometry,
	MeshBasicMaterial,
	MeshLambertMaterial,
	Mesh
} = THREE;

const addChar = (x,y, mat, cubeDims, group) => {
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

const placeChar = (charAnimations, cubeDims, group) => async (x, y, url) => {
	const piskel = await load(url);
	const { canvas, frames } = piskel.all;
	const texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	//texture.repeat.set( 1/frames, 1);

	// texture, #horiz, #vert, #total, duration.
	const animator = new TextureAnimator(
		texture,
		frames, 1, frames,
		1000/piskel.fps
	);
	charAnimations.push(animator);

	const material = new MeshBasicMaterial({
		map: texture,
		transparent: true
	});
	material.map.anisotropy = 0;
	material.map.magFilter = THREE.NearestFilter;
	material.map.minFilter = THREE.NearestMipmapNearestFilter;
	addChar(x,y, material, cubeDims, group);
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
	//addChar(3,3, "yellow");
	addChar(1,1, "orange");
	addChar(4,5, "blue");
	addChar(4,4, "indigo");
	addChar(4,3, "limegreen");
	addChar(4,2, "violet");
	addChar(4,1, "pink");
}
//someChars();

const animate = (clock, charAnimations) => {
	const delta = clock.getDelta();
	for(var x of charAnimations){
		x.update(1000 * delta);
	};
};

const setup = async (characters, cubeDims, group) => {
	const charAnimations = [];
	const _placeChar = placeChar(
		charAnimations, cubeDims, group
	);
	for(var charArgs of characters){
		await _placeChar(...charArgs);
	}
	const clock = new Clock();
	return {
		animate: () => animate(clock, charAnimations)
	};
};

export default { setup };
