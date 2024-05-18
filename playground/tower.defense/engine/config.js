if (document.URL.includes('::preview::')) {
	const container = document.querySelector('.container');
	container.classList.add('dev');
}

window.towerX = 200;
window.towerColor1 = '#24b';
window.towerColor2 = '#934';

window.basicChar = {
	type: 'attacker',
	hp: 3000,
	respawn: 40,
	range: 400,
	attack: 110,
	x: towerX + 140,
	move: 40
};

window.basicOppChar = {
	type: 'defender',
	hp: 3000,
	respawn: 40,
	range: 560,
	attack: 95,
	move: 40,
	x: towerX + 140
};
