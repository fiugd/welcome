export const chargeMineral = (state) => {
	if (state.mineral.charge === 100) return;
	if (state.tick % state.mineral.chargeRate !== 0) return;
	state.mineral.charge += 10;
};
export const chargeMissile = (state) => {
	if (state.missile.charge === 100) return;
	if (state.tick % state.missile.chargeRate !== 0) return;
	state.missile.charge += 10;
};
