const {
	Scene, Clock, Group, Mesh,
	PerspectiveCamera,
	WebGLRenderer,

	HemisphereLight,
	PointLight,

	BoxGeometry,
	PlaneGeometry,

	MeshBasicMaterial,
	MeshLambertMaterial,
} = THREE;

var camera, renderer, scene;

// const height = 1536;
// const width = 2048;
const height = 1024;
const width = 768;

const autoZoom = () => {
	camera.position.z = 45 + (width < 650
		? Math.floor(4500 / width)
		: 0);
};



const setup = () => {
	THREE.Cache.enabled = true;

	scene = new Scene();
	camera = new PerspectiveCamera(
		10,
		width/height,
		0.1,
		1000
	);
	autoZoom(camera);

	renderer = new WebGLRenderer({
		antialias:false,
		alpha: true
	});
	renderer.setSize( width, height );
	document.body.appendChild( renderer.domElement );

	const group = new Group();
	scene.add(group);

	const light = new HemisphereLight(
		'white', //"#fef",
		'#444', //"#465",
		1.8
	);
	scene.add(light);

	const point = new PointLight( "#ffbbf0", 0.1, 10 );
	point.position.set( 0, 5, -1 );
	scene.add(point);

	scene.position.y += 1.1;

	return {
		group,
		scene,
		camera,
		renderer: {
			render: () => renderer.render(scene, camera)
		}
	}
};

window.addEventListener(
	'resize', () => {
		//const height = 600; //window.innerHeight;
		//const width = 800; //window.innerWidth;
		// camera.aspect = width / height;
		//autoZoom();
		//camera.updateProjectionMatrix();
		//renderer.setSize( window.innerWidth, height );
	}
);

export default {
	setup
};

