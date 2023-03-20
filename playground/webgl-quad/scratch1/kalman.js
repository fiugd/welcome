
/*
	https://www.npmjs.com/package/kalman-filter

	https://www.youtube.com/watch?v=hQUkiC5o0JI
	
*/

import kalmanFilter from 'https://cdn.skypack.dev/kalman-filter';
const {KalmanFilter} = kalmanFilter;

const getFilter = () => {
	try {
		return new KalmanFilter({
			// observation: {
			// 	dimension: 3,
			// },
			R: 0.0001,
			Q: 0.0051
		});
	} catch(e){
		console.log(e);
	}
}

let previousCorrected;
let kFilter;

//dissociate the predict and the correct functions
const dissociated = true;

const kalman = (observation) => {
	kFilter = kFilter || getFilter();
	if(!kFilter) return;

	if(!dissociated){
		previousCorrected = kFilter.filter({ previousCorrected, observation });
		return previousCorrected.mean;
	}

	const predicted = kFilter.predict({
		previousCorrected
	});
	const correctedState = kFilter.correct({
		predicted,
		observation
	});
	previousCorrected = correctedState;
	return correctedState.mean;
};

export default kalman;


export const wip = async ({ graphic }) => {
	await graphic.ready;
	const actualGraph = graphic.graph('actual position', -15, 15);
	const sensor1Graph = graphic.graph('sensor1', -15, 15);
	const sensor2Graph = graphic.graph('sensor2', -15, 15);
	const sensor3Graph = graphic.graph('sensor3', -15, 15);
	const kalmanGraph = graphic.graph('kalman position', -15, 15);
	const diffGraph = graphic.graph('diff position', -5, 5);

	const noise = (scale) => (Math.random()-0.5) * scale;

	const huge = 1e8;
	const kalman = (() => {
		const config = {
			//... I am a bit lost here.  Happy to share what I've tried
			observation: {
				dimension: 3,
				stateProjection: [[1],[1],[1]],
				covariance: [1,1,1],
			},
			dynamic: {
				dimension: 1,
				transition: [[1]],
				covariance: [0],
				init: {
					mean: [[0]],
					covariance: [
						[huge],
					],
				},
			}
		};
		const kFilter = new KalmanFilter(config);

		let previousCorrected;
		return (observation) => {
			// previousCorrected = kFilter.filter({previousCorrected, observation});
			// return previousCorrected.mean;
			const predicted = kFilter.predict({
				previousCorrected
			});

			const correctedState = kFilter.correct({
				predicted,
				observation
			});

			 return correctedState.mean;
		};
	})();

	let counter = 0;
	const step = () => {
		if(counter++ > 1000) return;

		const actual = Math.sin(counter/100) * 10;
		const sensor1 = (Math.random() > 0.75 ? noise(10): actual + noise(5));
		const sensor2 = (Math.random() > 0.75 ? actual + noise(30): actual + noise(5));
		const sensor3 = actual + noise(20);
		const [[kalmanMean]] = kalman([sensor1, sensor2, sensor3]);

		// expecting to minimize diff
		const diff = kalmanMean - actual;
		// console.log({ kalmanMean, actual, diff });
		
		actualGraph.update(actual);
		sensor1Graph.update(sensor1);
		sensor2Graph.update(sensor2);
		sensor3Graph.update(sensor3);

		kalmanGraph.update(kalmanMean);
		diffGraph.update(diff);

		setTimeout(step, 1);
	};

	step();
};