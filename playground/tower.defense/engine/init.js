import Engine from './engine.js';
import Render from '../visuals/render.js';
import State from './state.js';
import { loadAssets } from '../visuals/assets.js';
import Controls from '../visuals/controls.js';
import TeamUpdates from './update/team.js';
import { chargeMineral, chargeMissile } from './update/player.js';
import { updateGameStatus } from './update/game.js';
import { getActions } from './actions.js';

import { balancedGame1 } from './games/balanced1.js';
import { balancedLongField1 } from './games/balancedLongField1.js';
import { fast1 } from './games/fast1.js';

const games = [
	balancedGame1,
	balancedLongField1,
	fast1
	//
];

export const startGame = async ({ menu, which }) => {
	const thisGame = games[which];
	if (typeof thisGame !== 'function') {
		alert('no game selected!');
		return;
	}
	menu.style.display = 'none';
	const state = new State(thisGame().state);
	state.assets = await loadAssets();
	state.actions = getActions(state);

	const gameLoop = () => {
		try {
			if (state.paused) return true;
			chargeMissile(state);
			chargeMineral(state);
			TeamUpdates.spawnTeam(state);
			TeamUpdates.targetOpponents(state);
			TeamUpdates.attackOpponents(state);
			TeamUpdates.moveDeployed(state);
			TeamUpdates.updateDeployedTicks(state);
			const continueGame = updateGameStatus(state);
			if (!continueGame) {
				menu.style.display = 'flex';
			}
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

	const highPriority = () => {
		// this is a non-throttled activity?
	};

	const engine = new Engine({
		state,
		highPriority,
		gameLoop,
		render,
		controls
	});
	engine.start();
};
