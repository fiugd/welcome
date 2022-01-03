const {
	Color,
	FontLoader,
	Mesh,
	MeshLambertMaterial,
	TextGeometry
} = THREE;

const loadFont = (path) => new Promise((resolve) => {
	const fontLoader = new FontLoader();
	fontLoader.load(path, resolve);
});

const textMesh = async (opts) => {
	const { x, y, z, center, text, fontUrl, color, size, height, curveSegments } = opts;
	const font = await loadFont(fontUrl);
	const geometry = new TextGeometry(text, {
		size,
		height,
		curveSegments,
		font,
	});
	if(center){
		geometry.center();
	}
	const mesh = new Mesh(
		geometry,
		new MeshLambertMaterial( { color } )
	);
	if(x) mesh.position.x = x;
	if(y) mesh.position.y = y;
	if(z) mesh.position.z = z;
	return mesh;
}

const setup = async (scene) => {
	//https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-dancing-script/data/typefaces/normal-400.json
	scene.add(await textMesh({
		text: 'GAME',
		fontUrl: 'https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-orbitron/data/typefaces/normal-400.json',
		size: 0.65,
		height: 2,
		curveSegments: 2,
		color: "#9fd",
		center: true,
		y: 2.4
	}));
	
	const kaushan = 'https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-kaushan-script/data/typefaces/kaushan-script-normal-400.json';
	const covered = 'https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-covered-by-your-grace/data/typefaces/covered-by-your-grace-normal-400.json';
	const mountains = 'https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-mountains-of-christmas/data/typefaces/mountains-of-christmas-bold-normal-700.json';
	scene.add(await textMesh({
		text: 'game',
		fontUrl: mountains,
		size: 0.4,
		height: 0.5,
		curveSegments: 12,
		color: "#f4c",
		z: 1,
		x: -0.44,
		y: 1.95
	}));

};

export default { setup };
