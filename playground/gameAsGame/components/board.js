const {
	BoxGeometry,
	MeshLambertMaterial,
	MeshPhongMaterial,
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
	vec4 colorA = vec4(0.45,0.47,0.45, 1.0);
	vec4 colorB = vec4(0.3,0.32,0.3, 1.0);

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

	const positions = [];
	{
		for(var y=1; y<=cubeDims.y; y++){
			for(var x=1; x<=cubeDims.x; x++){
				var pos = new Mesh(
					new BoxGeometry(1, 1, 0.05),
					new MeshPhongMaterial({
						shininess: 100,
						specular:  "white",
						color: (y+x) % 2
							? "#605f5f"
							: "#1a1015"
					})
				);
				pos.position.x = (cubeDims.x/-2) + x - 0.5;
				pos.position.y = (cubeDims.y/-2) + y - 0.5;
				pos.name = `board[${x}, ${y}]`;
				pos.data = {
					x,
					y: cubeDims.y-y+1,
					dark: !( (y+x) % 2 )
				};
				positions.push(pos);
				group.add(pos)
			}
		}
	}

	const baseDepth = 0.6;
	const boardBase = new Mesh(
		new BoxGeometry( cubeDims.x+0.2, cubeDims.y+0.2, baseDepth),
		new MeshLambertMaterial({
			color: "#432",
			emissiveIntensity: 0.05,
			emissive: new THREE.Color(1, 0, 1),
		})
	);
	boardBase.position.z = -(baseDepth * 0.51);

	group.add(board);
	group.add(boardBase);
	board.name = "chess board";
	return positions;
};

export default { setup };
