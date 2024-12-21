import { setupUI } from './diagram.js';

const state = {
	targetTemp: 75,
	hotTemp: 0,
	coldTemp: 0,
	waterLevel: 0,
	fillInterval: null
};

const startLoop = ({ ui }) => {
	const { elements, setWaterLevel } = ui;
	setInterval(() => {
		setWaterLevel(state.waterLevel);

		Object.keys(elements).forEach((key) => {
			if (typeof state[key] === 'undefined') {
				return;
			}
			let value = state[key];
			if (value < 10) {
				value = '0' + value;
			}
			elements[key].textContent = value;
		});
	}, 100);
};

const domContentLoaded = () => {
	const onFillStart = () => {
		state.fillInterval = setInterval(() => {
			state.waterLevel += 1;
		}, 100);
	};
	const onFillStop = () => {
		state.fillInterval && clearInterval(state.fillInterval);
	};

	const ui = setupUI({ onFillStart, onFillStop });
	startLoop({ ui });
};

document.addEventListener('DOMContentLoaded', domContentLoaded);
