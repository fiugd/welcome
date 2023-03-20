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

const kalman = (observation) => {
	kFilter = kFilter || getFilter();
	if(!kFilter) return;

	previousCorrected = kFilter.filter({ previousCorrected, observation });
	return previousCorrected.mean;


// 	const predicted = kFilter.predict({
// 		previousCorrected
// 	});

// 	const correctedState = kFilter.correct({
// 		predicted,
// 		observation
// 	});

// 	// update the previousCorrected for next loop iteration
// 	previousCorrected = correctedState;

// 	return correctedState.mean;
};

export default kalman;
