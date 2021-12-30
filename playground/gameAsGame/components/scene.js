const {
	Scene, Clock, Group, Mesh,
	PerspectiveCamera,
	WebGLRenderer,

	HemisphereLight,

	BoxGeometry,
	PlaneGeometry,

	MeshBasicMaterial,
	MeshLambertMaterial,
} = THREE;

var camera, renderer, scene;

const autoZoom = () => {
	camera.position.z = 45 + (window.innerWidth < 650
		? Math.floor(4500 / window.innerWidth)
		: 0);
};

const setup = () => {
	THREE.Cache.enabled = true;

	scene = new Scene();
	const height = window.innerHeight;
	camera = new PerspectiveCamera(
		10,
		window.innerWidth/height,
		0.1,
		1000
	);
	autoZoom(camera);

	renderer = new WebGLRenderer({
		antialias:false,
		alpha: true
	});
	renderer.setSize( window.innerWidth, height );
	document.body.appendChild( renderer.domElement );

	const group = new Group();
	scene.add(group);

	const light = new HemisphereLight(
		'white', //"#fef",
		'#623', //"#465",
		1.5
	);
	scene.add(light);

	scene.position.y += 1;

	return {
		group,
		scene,
		renderer: {
			render: () => renderer.render(scene, camera)
		}
	}
};

window.addEventListener(
	'resize', () => {
		const height = window.innerHeight;
		camera.aspect = window.innerWidth / height;
		autoZoom();
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, height );
	}
);

export default {
	setup
};

