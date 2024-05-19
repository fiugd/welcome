import Engine from './engine.js';
import Render from '../visuals/render.js';
import State from './state.js';
import { loadAssets } from '../visuals/assets.js';
import Controls from '../visuals/controls.js';
import TeamUpdates from './update/team.js';
import { chargeMineral, chargeMissile } from './update/player.js';
import { updateGameStatus } from './update/game.js';
import { balancedGame1 } from './games/balanced1.js';
import { getActions } from './actions.js';

const state = new State(balancedGame1().state);
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

(async () => {
	state.assets = await loadAssets();
	engine.start();
})();
