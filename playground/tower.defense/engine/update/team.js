import { clone, unNest } from '../../utils/utils.js';

export const moveDeployed = (state) => {
	const { tick, towers } = state;
	const move = (char) => {
		if (char.target) return;
		char.x += char.move;
	};
	const deployed = towers.reduce((all, one) => [...all, ...one.deployed], []);
	deployed.forEach(move);
};

export const spawnTeam = (state) => {
	const { towers } = state;
	const iterate = (char, deployed) => {
		if (char.spawnTicker) return char.spawnTicker--;
		state.spawnCharInstance(char, deployed);
		char.spawnTicker = char.respawn;
	};
	const spawn = (tower) =>
		tower.team.forEach((char) => {
			iterate(char, tower.deployed);
		});
	towers.forEach(spawn);
};

export const targetOpponents = (state) => {
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

export const attackOpponents = (state) => {
	const { towers } = state;
	const attacking = [...towers[0].deployed, ...towers[1].deployed].filter(
		(x) => x.target
	);
	attacking.forEach((attacker) => {
		const target = state.getById(attacker.target);
		if (!target) {
			attacker.target = undefined;
			return;
		}
		let damage = attacker.attack;
		const canCrit =
			typeof attacker.critChance === 'number' &&
			typeof attacker.critMult === 'number';
		if (canCrit && Math.random() <= attacker.critChance) {
			damage = attacker.attack * attacker.critMult;
			console.log('critical attack');
		}
		target.hp -= damage;
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

export const updateDeployedTicks = (state) => {
	unNest(state, 'tower(s)/deployed').forEach(({ tower, deployed }) => {
		deployed.tick =
			typeof deployed.tick === 'undefined' ? -1 : deployed.tick;
		deployed.tick++;
	});
};

export default {
	moveDeployed,
	spawnTeam,
	targetOpponents,
	attackOpponents,
	updateDeployedTicks
};
