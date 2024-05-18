import ScreenInfo from './screen.js';

const createTopControls = () => {
	const top = document.createElement('div');
	top.classList.add('controls-top');
	top.innerHTML = `
		<div class="effects">
			<div>🙌</div>
			<div>☄</div>
			<div>🧊</div>
			<div>🌪</div>
			<div>🔧</div>
		</div>
		<div class="mineral">
			⬖ 77/170
		</div>
		<div class="pause">I I</div>
	`;
	document.body.insertAdjacentElement('beforeend', top);
	return top;
};

const createBottomControls = () => {
	const bottom = document.createElement('div');
	bottom.classList.add('controls-bottom');
	bottom.innerHTML = `
        <div class="missle">
			<div class="symbol">☢</div>
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
		<div class="mineral">
			<div class="symbol">⬖</div>
			<div>mineral</div>
		</div>
    `;
	document.body.insertAdjacentElement('beforeend', bottom);
	return bottom;
};

const createTicker = () => {
	const ticker = document.createElement('div');
	ticker.classList.add('controls-ticker');
	document.body.append(ticker);
	return ticker;
};

export default class Controls {
	constructor({ showTicker, showScreenInfo } = {}) {
		this.showTicker = showTicker;
		if (showTicker) {
			this.ticker = createTicker();
		}
		if (showScreenInfo) {
			ScreenInfo();
		}
		this.top = createTopControls();
		this.bottom = createBottomControls();
	}
	updateTicker(count) {
		if (!this.showTicker) return;
		this.ticker.innerHTML = count;
	}
}
