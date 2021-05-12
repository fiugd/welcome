import Engine from './td.engine.js';
import Render from './td.render.js';
import State, { assignId, setHpMax } from './td.state.js'
import { loadAssets } from './td.assets.js';
import { clone, unNest } from './td.utils.js';

const state = new State({
	record: false,
	field: {
		height: 800,
		width: 4000
	},
	towers: [{
		type: 'attacker',
		dims: [200, 343],
		x: window.towerX,
		color: window.towerColor1,
		hp: 2000,
		deployed: [],
		team: [window.basicChar],
	}, {
		type: 'defender',
		dims: [200, 343],
		x: window.towerX,
		color: window.towerColor2,
		hp: 2000,
		deployed: [],
		team: [window.basicOppChar],
	}],
	tick: 0,
});

const moveDeployed = ({ tick, towers }) => {
	const move = char => {
		if(char.target) return;
		char.x += char.move;
	};
	const deployed = towers.reduce(
		(all, one) => ([...all, ...one.deployed]
	), []);
	deployed.forEach(move);
};

const targetOpponents = (state) => {
	const { towers } = state.global();
	towers.forEach((tower, i) => {
		const isAttack = tower.type === "attacker";
		const opponent = towers[isAttack ? 1 : 0];
		const withinRange = (char, opp) => isAttack
			? (char.x + char.range) >= opp.x
			: (char.x - char.range) <= opp.x;
		tower.deployed.forEach((char, j) => {
			if(char.target) return;
			const nearby = [opponent, ...opponent.deployed]
				.filter((opp) => withinRange(char, opp));
			if(!nearby.length) return;
			state.towers[i].deployed[j].target = isAttack
				? nearby.sort((a, b) => b -a)[0].id
				: nearby.sort((a, b) => a - b)[0].id;
		})
	});
};

const attackOpponents = ({ towers }) => {
	const attacking = [...towers[0].deployed, ...towers[1].deployed]
		.filter(x => x.target);
	attacking.forEach(attacker => {
		const target = state.getById(attacker.target);
		if(!target){
			attacker.target = undefined;
			return;
		}
		target.hp -= attacker.attack;
		if(target.hp < 0){
			target.status = 'dead';
			attacker.target = undefined;
		}
	});
	towers.forEach(tower => {
		if(tower.hp <= 0) tower.status = 'dead';
		tower.deployed = tower.deployed
			.filter(x => x.status !== 'dead')
	});
};

const spawnTeam = ({ towers }) => {

	const iterate = (char, deployed) => {
		if(char.spawnTicker) return char.spawnTicker--;
		const newChar = clone(char);
		assignId(newChar);
		setHpMax(newChar);
		deployed.push(newChar);
		char.spawnTicker = char.respawn;
	};
	const spawn = (tower) => tower.team.forEach((char) => {
		iterate(char, tower.deployed);
	});
	towers.forEach(spawn);
};

const gameLoop = () => {
	try {
		spawnTeam(state);
		targetOpponents(state);
		attackOpponents(state);
		moveDeployed(state);
		const gameOver = state.towers.find(x => x.hp <= 0);
		const continueGame = !state.gameOver
		state.gameOver = gameOver;
		state.tick++;
		unNest(state, 'tower(s)/deployed')
			.forEach(({ tower, deployed }) => {
				deployed.tick = typeof deployed.tick === 'undefined'
					? -1
					: deployed.tick;
				deployed.tick++;
			});
		return continueGame;
	} catch(e) {
		console.error(e);
		return false;
	}
};

const render = new Render({ state });

const highPriority = () => {};

const engine = new Engine({
	throttle: 67,
	state,
	highPriority,
	gameLoop,
	tryRender: render
});

(async () => {
	state.assets = await loadAssets();
	engine.start();
})();
