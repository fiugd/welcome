export const balancedLongField1 = () => {
	const towerX = 200;
	const towerColor1 = '#24b';
	const towerColor2 = '#934';

	const basicChar = {
		type: 'attacker',
		hp: 3000,
		respawn: 35,
		range: 400,
		attack: 110,
		x: towerX + 140,
		move: 50,
		critChance: 0.07,
		critMult: 5
	};

	const basicOppChar = {
		type: 'defender',
		hp: 3000,
		respawn: 40,
		range: 560,
		attack: 95,
		move: 40,
		x: towerX + 140,
		critChance: 0.1,
		critMult: 5
	};

	return {
		state: {
			throttle: 67,
			record: false,
			field: {
				height: 800,
				width: 5000
			},
			towers: [
				{
					type: 'attacker',
					dims: [200, 343],
					x: towerX,
					color: towerColor1,
					hp: 30000,
					deployed: [],
					team: [basicChar]
				},
				{
					type: 'defender',
					dims: [200, 343],
					x: towerX,
					color: towerColor2,
					hp: 30000,
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
