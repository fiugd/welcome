const {
	BoxGeometry,
	MeshLambertMaterial,
	Mesh
} = THREE;

const setup = (cubeDims, group) => {

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
	vec4 colorA = vec4(0.3,0.3,0.3, 1.0);
	vec4 colorB = vec4(0.45,0.45,0.45, 1.0);

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
	const board = new Mesh(
		new BoxGeometry( cubeDims.x, cubeDims.y, 0),
		shaderMat
	);

	const baseDepth = 0.6;
	const boardBase = new Mesh(
		new BoxGeometry( cubeDims.x+0.2, cubeDims.y+0.2, baseDepth),
		new MeshLambertMaterial( { color: "#301a1a" } )
	);
	boardBase.position.z = -(baseDepth * 0.51);

	group.add(board);
	group.add(boardBase);
};

export default { setup };
