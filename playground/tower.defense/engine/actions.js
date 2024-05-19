export const getActions = (state) => {
	return {
		pauseToggle: () => {
			state.paused = !state.paused;
		},
		missileFire: () => {
			if (state.paused) return;
			state.missile.charge = 0;
		},
		mineralLevel: () => {
			if (state.paused) return;
			state.mineral.charge = 0;
			state.mineral.level++;
		}
	};
};
