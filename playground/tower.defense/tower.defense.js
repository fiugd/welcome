import Engine from './td.engine.js';
import Render from './td.render.js';
import State, { assignId, setHpMax } from './td.state.js'
import { loadAssets } from './td.assets.js';
import { clone } from './td.utils.js';

const towerX = 60;

const basicChar = {
	color: '#67b',
	hp: 2150,
	respawn: 19,
	range: 150,
	attack: 28,
	x: towerX + 35,
	move: 11
};

const basicOppChar = {
	color: '#b76',
	hp:250,
	respawn: 43,
	range: 370,
	attack: 67,
	x: towerX + 35,
	move: 10
};

const state = new State({
	record: true,
	field: {
		height: 200,
		width: 1000
	},
	towers: [{
		type: 'attacker',
		dims: [30, 70],
		x: towerX,
		color: '#25b',
		hp: 2000,
		deployed: [],
		team: [basicChar],
	}, {
		type: 'defender',
		dims: [30, 70],
		x: towerX,
		color: '#b23',
		hp: 2000,
		deployed: [],
		team: [basicOppChar],
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

// towers spawn characters (use spawn timer)
// characters move or attack
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
		return continueGame;
	} catch(e) {
		console.error(e);
		return false;
	} 
};

const highPriority = () => {}; //animation events?

const engine = new Engine({
	throttle: 150,
	state,
	highPriority,
	gameLoop,
	tryRender: new Render({ state }),
});

(async () => {
	state.assets = await loadAssets();
	engine.start();
})();
