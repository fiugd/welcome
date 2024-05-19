export const updateGameStatus = (state) => {
	const gameOver = state.towers.find((x) => x.hp <= 0);
	const continueGame = !state.gameOver;
	state.gameOver = gameOver;
	state.tick++;
	return continueGame;
};
