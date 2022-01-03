const {
	Vector3,
	Ray,
	Sprite,
	Projector,
	PointsMaterial
} = THREE;

const addParticle = (event, scene) => {
	const { intersect } = event;
	const particleMaterial = new PointsMaterial({
		color: 0xFFFFFF,
		size: 0.01
	});
	const particle = new Sprite( particleMaterial );
	particle.position.x = intersect.point.x;
	particle.position.y = intersect.point.y;
	//particle.position.z = intersect.point.z;
	particle.scale.x = particle.scale.y = 0.015;
	scene.add( particle );
};

const setup = (context, events) => {
	const { hover, select } = events;
	const {
		camera, objects, scene, renderer, board, players
	} = context;
	const domEvents	= new THREEx.DomEvents(
		camera, renderer.domElement
	);
	for(var mesh of board){
		domEvents.addEventListener(mesh, 'mouseover', function(event){
			const {selected, x,y,dark} = event.target.data;
			if(selected) return;
			const player = players.find(({ data }) => data.x === x && data.y === y);
			event.target.colorBak = '#'+event.target.material.color.getHex().toString(16);
			event.target.player = player;
			if(!hover) return;
			const playerColor = player && player.material.color;
			const squareColor = event.target.material.color;
			hover(
				{ x,y, color: (x) => player && playerColor.set(x) },
				{ x,y, dark, color: (x) => squareColor.set(x) }
			);
		}, false)
		domEvents.addEventListener(mesh, 'mouseout', function(event){
			const { selected } = event.target.data;
			if(selected) return;
			event.target.material.color.set(event.target.colorBak);
			if(!event.target.player) return;
			event.target.player.material.color.set("white");
		}, false)
		domEvents.addEventListener(mesh, 'click', (event) => {
			const {x,y,dark, selected} = event.target.data;
			if(selected) return;

			board.forEach(sq => {
				if(!sq.data.selected) return;
				sq.material.color.set(sq.colorBak);
				sq.player && sq.player.material.color.set("white");
				sq.data.selected = false;
			});
			event.target.data.selected = true;
			const player = players.find(({ data }) => data.x === x && data.y === y);
			event.target.player = player;
			if(!select) return;
			const playerColor = player && player.material.color;
			const squareColor = event.target.material.color;
			select(
				{ x,y, color: (x) => player && playerColor.set(x) },
				{ x,y, dark, color: (x) => squareColor.set(x) }
			);
		}, false);
	}
	//domEvents.addEventListener(board, 'mousemove', e => addParticle(e, scene), false);
}

export default { setup };
