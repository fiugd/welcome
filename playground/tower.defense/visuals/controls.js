import ScreenInfo from './screen.js';

const createTopControls = ({ showEffects, state } = {}) => {
	const top = document.createElement('div');
	top.classList.add('controls-top');

	const effects = showEffects
		? `
			<div>🙌</div>
			<div>☄</div>
			<div>🧊</div>
			<div>🌪</div>
			<div>🔧</div>
		`
		: '';

	top.innerHTML = `
		<div class="effects">
			${effects}
		</div>
		<div class="mineral">
			⬖ 77/170
		</div>
		<div class="pause button">I I</div>
	`;
	const pauseButton = top.querySelector('.pause.button');
	pauseButton.addEventListener('click', () => {
		pauseButton.innerText = state.paused ? 'I I' : '▶';
		pauseButton.style.backgroundColor = state.paused ? '' : '#478347';
		pauseButton.style.color = state.paused ? '' : 'white';
		state.actions.pauseToggle();
	});
	document.body.insertAdjacentElement('beforeend', top);
	return top;
};

const createBottomControls = ({ state }) => {
	const bottom = document.createElement('div');
	bottom.classList.add('controls-bottom');
	bottom.innerHTML = `
        <div class="missile button">
			<div class="symbol">☢</div>
			<div class="progress p-0 vertical orange"></div>
			<div>missile</div>
		</div>
        <div class="team">
			<div class="symbol-smaller">웃</div>
			<div>team 1</div>
		</div>
        <div class="team">
			<div class="symbol-smaller">웃</div>
			<div>team 2</div>
		</div>
		<div class="team">
			<div class="symbol-smaller">웃</div>
			<div>team 3</div>
		</div>
		<div class="team">
			<div class="symbol-smaller">웃</div>
			<div>team 4</div>
		</div>
		<div class="team">
			<div class="symbol-smaller">웃</div>
			<div>team 5</div>
		</div>
		<div class="mineral button">
			<div class="symbol">⬖</div>
			<div class="progress p-0 vertical blue"></div>
			<div>mineral</div>
		</div>
    `;
	document.body.insertAdjacentElement('beforeend', bottom);
	const missileButton = bottom.querySelector('.missile.button');
	const missileButtonProgress = bottom.querySelector(
		'.missile.button .progress'
	);
	missileButton.addEventListener('click', () => {
		if (!missileButtonProgress.classList.contains(`p-100`)) return;
		state.actions.missileFire();
	});
	const mineralButton = bottom.querySelector('.mineral.button');
	const mineralButtonProgress = bottom.querySelector(
		'.mineral.button .progress'
	);
	mineralButton.addEventListener('click', () => {
		if (!mineralButtonProgress.classList.contains(`p-100`)) return;
		state.actions.mineralLevel();
	});
	return bottom;
};

const createTicker = () => {
	const ticker = document.createElement('div');
	ticker.classList.add('controls-ticker');
	document.body.append(ticker);
	return ticker;
};

export default class Controls {
	constructor({ state, showTicker, showScreenInfo, showEffects } = {}) {
		this.showTicker = showTicker;
		if (showTicker) {
			this.ticker = createTicker();
		}
		if (showScreenInfo) {
			ScreenInfo();
		}
		this.top = createTopControls({ state, showEffects });
		this.bottom = createBottomControls({ state });
	}
	updateTicker(count) {
		if (!this.showTicker) return;
		this.ticker.innerHTML = count;
	}
	updateProgress(which, amount) {
		const el = this.bottom.querySelector(`.${which} .progress`);
		if (el.classList.contains(`p-${amount}`)) return;
		const progressClasses = [
			'p-0',
			'p-10',
			'p-20',
			'p-30',
			'p-40',
			'p-50',
			'p-60',
			'p-70',
			'p-80',
			'p-90',
			'p-100'
		];
		el.classList.remove(...progressClasses);
		el.classList.add(`p-${amount}`);
	}
}
