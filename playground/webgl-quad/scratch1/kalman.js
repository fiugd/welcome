
/*
	https://www.npmjs.com/package/kalman-filter

	https://www.youtube.com/watch?v=hQUkiC5o0JI
	
*/

import kalmanFilter from 'https://cdn.skypack.dev/kalman-filter';
import fili from 'https://cdn.skypack.dev/fili';

const {KalmanFilter} = kalmanFilter;
const {IirFilter, CalcCascades} = fili;

const  iirCascadeCalculator = new CalcCascades();
const filterCoeffs = iirCascadeCalculator.lowpass({
	order: 3,
	characteristic: 'tschebyscheff05',
	transform: 'matchedZ',
	Fs: 800, //sampling freq
	Fc: 200, // cutoff freq
	preGain: false 
});
const iirFilter1 =  new IirFilter(filterCoeffs);
const iirFilter2 =  new IirFilter(filterCoeffs);
const iirFilter3 =  new IirFilter(filterCoeffs);


const filterCoeffs2 = iirCascadeCalculator.lowpass({
	order: 3,
	characteristic: 'tschebyscheff05',
	transform: 'matchedZ',
	Fs: 800, //sampling freq
	Fc: 25, // cutoff freq
	preGain: false 
});
const iirFilter4 =  new IirFilter(filterCoeffs2);

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
	return iirFilter4.singleStep(
		correctedState.mean
	);
};

export default kalman;


export const wip = async ({ graphic }) => {
	await graphic.ready;
	const actualGraph = graphic.graph('actual', -15, 15);
	const kalmanGraph = graphic.graph('kalman', -15, 15);
	const diffGraph = graphic.graph('difference', -5, 5);
	const sensor1Graph = graphic.graph('sensor1', -15, 15);
	const sensor2Graph = graphic.graph('sensor2 (LP)', -15, 15);
	const sensor3Graph = graphic.graph('sensor3 (LP)', -15, 15);

	const noise = (scale) => (Math.random()-0.5) * scale;

	const kalman = (() => {
		const baseVariance = 1;
		const huge = 1e8;

		const config = {
			observation: {
				stateProjection: [[1],[1],[1]],
				covariance(o) {
					const variances = o.observation.map(a => {
						if (a[0] === null) {
							return huge;
						}
						return baseVariance;
					});
					return diag(variances);
				},
			},
		};
// 		const config = {
// 			observation: {
// 				dimension: 3,
// 				stateProjection: [[1],[1],[1]],
// 				covariance: [1,1,1],
// 			},
// 			dynamic: {
// 				dimension: 1,
// 				transition: [[1]],
// 				covariance: [[0]],
// 				init: {
// 					mean: [[0]],
// 					covariance: [
// 						[huge],
// 					],
// 				},
// 			}
// 		};
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
			return iirFilter4.singleStep(
				correctedState.mean[0][0]
			);
		};
	})();

	let counter = 0;
	const step = () => {
		if(counter++ > 10000) return;

		const actual = Math.sin(counter/100) * 10;
		// const sensor1 = iirFilter1.singleStep(
		// 	(Math.random() > 0.9 ? noise(10): actual + noise(5))
		// );
		const sensor1 = (Math.random() > 0.9 ? noise(10): actual + noise(5));
	
		const sensor2 = iirFilter2.singleStep(
			(Math.random() > 0.75 ? actual + noise(30): actual + noise(5))
		);
		const sensor3 = iirFilter3.singleStep(
			actual + Math.sin(counter % 10 * 10)*20*Math.random()
		);

		// const filtered1 = iirFilter.singleStep(sensor1);
		// console.log(filtered1)

		const kalmanMean = kalman([sensor1, sensor2, sensor3]);

		// expecting to minimize diff
		const diff = kalmanMean - actual;

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
