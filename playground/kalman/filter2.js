import KalmanFilter from 'https://cdn.skypack.dev/kalmanjs'

const oneObs = (s1, s2, s3) => {
	const source = s1;
	const delayAmount = 6;
	const ampCompensate = 1.21;
	const kalmanFilter = new KalmanFilter({
		R: 0.0001,
		Q: 0.0051
	});
	const delay = (amt, arr) => {
		const newArr = [];
		for(var i=0, len=arr.length; i<len; i++){
			newArr.push([
				arr[i][0],
				arr[i+amt] ? arr[i+amt][1] : 0
			])
		}
		return newArr;
	};
	(new Array(delayAmount)).fill()
		.forEach((x,i) => {
			kalmanFilter.filter(0)
			//kalmanFilter.filter(source[i][1])
		})
	const corrected = delay(delayAmount, source).map((s) => ([
		s[0],
		kalmanFilter.filter(s[1])*ampCompensate
	]));
	return corrected;
};

export const kalman = (which) => (s1,s2,s3) => {
	const filters = {
		one: oneObs,
	};
	return filters[which](s1,s2,s3);
};
