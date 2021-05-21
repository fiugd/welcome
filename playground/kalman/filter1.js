import kalmanFilter from 'https://cdn.skypack.dev/kalman-filter';
const {KalmanFilter} = kalmanFilter;

const oneObs = (s1, s2, s3) => {
	const source = s1;
	const kFilter = new KalmanFilter();
	const obs = source.map(x => x[1]);
	const res = kFilter.filterAll(obs);
	return source.map((x, i) => ([
		source[i][0],
		res[i][0]
	]));
};

const threeObs = (s1, s2, s3) => {
	const kFilter = new KalmanFilter({
		observation: 3,
		dynamic: 'constant-position'
	});
	const obs = s1.map((x,i) => {
		return [
			s1[i][1],
			s2[i][1],
			s3[i][1]
		];
	})
	const res = kFilter.filterAll(obs);
	return s1.map((x, i) => ([
		s1[i][0],
		ave(res[i])
	]));
};

export const kalman = (which) => (s1,s2,s3) => {
	const filters = {
		one: oneObs,
		three: threeObs
	};
	return filters[which](s1,s2,s3);
};
