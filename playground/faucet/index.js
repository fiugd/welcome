import { setupUI } from './diagram.js';

const state = {
	targetTemp: 75,
	hotTemp: 49,
	coldTemp: 50,
	glassTemp: undefined,
	glassFill: [],
	mixTemp: 0,
	hotFlow: 50,
	coldFlow: 50,
	waterLevel: 0,
	fillInterval: null
};

const hotWaterStream = new ReadableStream({
	async pull(controller) {
		let hotTemp = state.hotTemp;
		if (hotTemp < 90) {
			hotTemp += 1;
			state.hotTemp = hotTemp;
		} else {
			hotTemp = 90;
		}
		controller.enqueue(hotTemp);
	}
});

const coldWaterStream = new ReadableStream({
	async pull(controller) {
		const coldTemp = 50;
		controller.enqueue(coldTemp);
	}
});

const hotReader = hotWaterStream.getReader();
const coldReader = coldWaterStream.getReader();

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
			Promise.all([hotReader.read(), coldReader.read()]).then(
				([hotResult, coldResult]) => {
					const hotTemp = Number(hotResult.value);
					const coldTemp = Number(coldResult.value);

					const coldFlow = state.coldFlow / 100;
					const hotFlow = state.hotFlow / 100;

					const thisSquirt =
						(hotTemp * hotFlow + coldTemp * coldFlow) /
						(coldFlow + hotFlow);

					state.glassFill.push(thisSquirt);

					const glassAverage =
						state.glassFill.reduce((a, b) => a + b) /
						state.glassFill.length;

					if (glassAverage < state.targetTemp) {
						state.hotFlow = 99;
						state.coldFlow = 0;
					} else {
						const tempDifference = glassAverage - state.targetTemp;
						const adjustmentFactor = 0.1;

						if (tempDifference > 0) {
							state.hotFlow = Math.max(
								0,
								state.hotFlow - adjustmentFactor
							);
							state.coldFlow = Math.min(
								1,
								state.coldFlow + adjustmentFactor
							);
						} else {
							state.hotFlow = Math.min(
								1,
								state.hotFlow + adjustmentFactor
							);
							state.coldFlow = Math.max(
								0,
								state.coldFlow - adjustmentFactor
							);
						}
					}

					state.hotFlow = Math.round(state.hotFlow * 100);
					state.coldFlow = Math.round(state.coldFlow * 100);

					state.hotFlow = Math.min(99, Math.max(0, state.hotFlow));
					state.coldFlow = Math.min(99, Math.max(0, state.coldFlow));

					console.log({
						hotTemp,
						coldTemp,
						thisSquirt,
						glassAverage
					});
					state.glassTemp = Math.round(glassAverage);
					state.mixTemp = Math.round(thisSquirt);
				}
			);
		}, 100);
	};
	const onFillStop = () => {
		state.fillInterval && clearInterval(state.fillInterval);
	};

	const ui = setupUI({ onFillStart, onFillStop });
	startLoop({ ui });
};

document.addEventListener('DOMContentLoaded', domContentLoaded);
