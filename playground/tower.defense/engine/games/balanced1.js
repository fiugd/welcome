export const balancedGame1 = () => {
	const towerX = 200;
	const towerColor1 = '#24b';
	const towerColor2 = '#934';

	const basicChar = {
		type: 'attacker',
		hp: 3000,
		respawn: 40,
		range: 400,
		attack: 110,
		x: towerX + 140,
		move: 40
	};

	const basicOppChar = {
		type: 'defender',
		hp: 3000,
		respawn: 40,
		range: 560,
		attack: 95,
		move: 40,
		x: towerX + 140
	};

	return {
		state: {
			throttle: 67,
			record: false,
			field: {
				height: 800,
				width: 2300
				// width: 4000
			},
			towers: [
				{
					type: 'attacker',
					dims: [200, 343],
					x: towerX,
					color: towerColor1,
					hp: 2000,
					deployed: [],
					team: [basicChar]
				},
				{
					type: 'defender',
					dims: [200, 343],
					x: towerX,
					color: towerColor2,
					hp: 2000,
					deployed: [],
					team: [basicOppChar]
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
		}
	};
};
