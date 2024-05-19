import Engine from './engine.js';
import Render from '../visuals/render.js';
import State, { assignId, setHpMax } from './state.js';
import { loadAssets } from '../visuals/assets.js';
import Controls from '../visuals/controls.js';
import { clone, unNest } from '../utils/utils.js';

const state = new State({
	record: false,
	field: {
		height: 800,
		width: 4000
	},
	towers: [
		{
			type: 'attacker',
			dims: [200, 343],
			x: window.towerX,
			color: window.towerColor1,
			hp: 2000,
			deployed: [],
			team: [window.basicChar]
		},
		{
			type: 'defender',
			dims: [200, 343],
			x: window.towerX,
			color: window.towerColor2,
			hp: 2000,
			deployed: [],
			team: [window.basicOppChar]
		}
	],
	tick: 0,
	missile: {
		charge: 0,
		chargeRate: 30
	},
	mineral: {
		charge: 0, // level charge
		chargeRate: 20, // level charge rate
		level: 1,

		capacity: 170,
		amount: 77
	}
});
state.actions = {
	missileFire: () => {
		state.missile.charge = 0;
	},
	mineralLevel: () => {
		state.mineral.charge = 0;
		state.mineral.level++;
	}
};

const moveDeployed = ({ tick, towers }) => {
	const move = (char) => {
		if (char.target) return;
		char.x += char.move;
	};
	const deployed = towers.reduce((all, one) => [...all, ...one.deployed], []);
	deployed.forEach(move);
};

const targetOpponents = (state) => {
	const { towers } = state.global();
	towers.forEach((tower, i) => {
		const isAttack = tower.type === 'attacker';
		const opponent = towers[isAttack ? 1 : 0];
		const withinRange = (char, opp) =>
			isAttack
				? char.x + char.range >= opp.x
				: char.x - char.range <= opp.x;
		tower.deployed.forEach((char, j) => {
			if (char.target) return;
			const nearby = [opponent, ...opponent.deployed].filter((opp) =>
				withinRange(char, opp)
			);
			if (!nearby.length) return;
			state.towers[i].deployed[j].target = isAttack
				? nearby.sort((a, b) => b - a)[0].id
				: nearby.sort((a, b) => a - b)[0].id;
		});
	});
};

const attackOpponents = ({ towers }) => {
	const attacking = [...towers[0].deployed, ...towers[1].deployed].filter(
		(x) => x.target
	);
	attacking.forEach((attacker) => {
		const target = state.getById(attacker.target);
		if (!target) {
			attacker.target = undefined;
			return;
		}
		target.hp -= attacker.attack;
		if (target.hp < 0) {
			target.status = 'dead';
			attacker.target = undefined;
		}
	});
	towers.forEach((tower) => {
		if (tower.hp <= 0) tower.status = 'dead';
		tower.deployed = tower.deployed.filter((x) => x.status !== 'dead');
	});
};

const spawnTeam = ({ towers }) => {
	const iterate = (char, deployed) => {
		if (char.spawnTicker) return char.spawnTicker--;
		const newChar = clone(char);
		assignId(newChar);
		setHpMax(newChar);
		deployed.push(newChar);
		char.spawnTicker = char.respawn;
	};
	const spawn = (tower) =>
		tower.team.forEach((char) => {
			iterate(char, tower.deployed);
		});
	towers.forEach(spawn);
};

const chargeMineral = (state) => {
	if (state.mineral.charge === 100) return;
	if (state.tick % state.mineral.chargeRate !== 0) return;
	state.mineral.charge += 10;
};
const chargeMissile = (state) => {
	if (state.missile.charge === 100) return;
	if (state.tick % state.missile.chargeRate !== 0) return;
	state.missile.charge += 10;
};

const gameLoop = () => {
	try {
		chargeMissile(state);
		chargeMineral(state);
		spawnTeam(state);
		targetOpponents(state);
		attackOpponents(state);
		moveDeployed(state);
		const gameOver = state.towers.find((x) => x.hp <= 0);
		const continueGame = !state.gameOver;
		state.gameOver = gameOver;
		state.tick++;
		unNest(state, 'tower(s)/deployed').forEach(({ tower, deployed }) => {
			deployed.tick =
				typeof deployed.tick === 'undefined' ? -1 : deployed.tick;
			deployed.tick++;
		});
		return continueGame;
	} catch (e) {
		console.error(e);
		return false;
	}
};

const controls = new Controls({
	state,
	showTicker: false,
	showScreenInfo: false,
	showEffects: true
});
const render = new Render({ state, controls });

const highPriority = () => {};

const engine = new Engine({
	throttle: 67,
	state,
	highPriority,
	gameLoop,
	tryRender: render,
	controls
});

(async () => {
	state.assets = await loadAssets();
	engine.start();
})();
