import { clone } from '../utils/utils.js';

export const toggleCoords = (state, coordMode) => {
	const stateClone = clone(state);
	stateClone.towers.forEach((tower) => {
		const isAttack = tower.type === 'attacker';
		const flipX = (x) =>
			isAttack
				? x
				: coordMode === 'global'
				? state.field.width - x
				: Math.abs(x - state.field.width);
		tower.x = flipX(tower.x);
		tower.coordMode = coordMode;
		tower.deployed.forEach((char) => {
			char.x = flipX(char.x);
		});
	});
	return stateClone;
};

const assignId = (x) => (x.id = Math.random().toString().slice(2));
const setHpMax = (x) => (x.hpMax = x.hp);

const spawnCharInstance = (char, deployed) => {
	const newChar = clone(char);
	assignId(newChar);
	setHpMax(newChar);
	deployed.push(newChar);
};

const getById = (state, id) =>
	[
		...state.towers,
		...state.towers[0].deployed,
		...state.towers[1].deployed
	].find((x) => x.id === id);

export default class State {
	constructor(initial) {
		const state = initial;
		[
			...state.towers,
			...state.towers[0].deployed,
			...state.towers[1].deployed
		].forEach((x) => {
			assignId(x);
			setHpMax(x);
		});

		state.getById = (id) => getById(state, id);
		state.spawnCharInstance = spawnCharInstance;

		state.global = () => toggleCoords(state, 'global');
		return state;
	}
}
