const locEl = document.getElementById('latlong');
const sunEl = document.getElementById('sun-contain');
const moonEl = document.getElementById('moon-contain');

const timeAngle = (start, end) => {
	const current = dayjs();
	const date1 = dayjs(start)
	const date2 = dayjs(end);
	return 180 * date1.diff(current) / date1.diff(date2);
};


const cachedFetch = (url, options) => {
	let expiry = 120 * 60 // 5 min default
	if (typeof options === 'number') {
		expiry = options
		options = undefined
	} else if (typeof options === 'object') {
		expiry = options.seconds || expiry
	}
	let cacheKey = url
	let cached = sessionStorage.getItem(cacheKey)
	let whenCached = sessionStorage.getItem(cacheKey + ':ts')
	if (cached !== null && whenCached !== null) {
		let age = (Date.now() - whenCached) / 1000
		if (age < expiry) {
			let response = new Response(new Blob([cached]))
			return Promise.resolve(response)
		} else {
			sessionStorage.removeItem(cacheKey)
			sessionStorage.removeItem(cacheKey + ':ts')
		}
	}
	return fetch(url, options).then(response => {
		response.clone().text().then(content => {
			sessionStorage.setItem(cacheKey, content)
			sessionStorage.setItem(cacheKey+':ts', Date.now())
		})
		return response;
	})
}

const getWeather = async ({lat, long}) => {
	//https://www.weather.gov/documentation/services-web-api
	const stationUrl = `https://api.weather.gov/points/${lat},${long}`;
	const weatherStation = await cachedFetch(stationUrl, { expiry: 10000 }).then(x=>x.json());
	const forecastUrl = weatherStation.properties.forecast;
	const forecast = await cachedFetch(forecastUrl).then(x=>x.json())

	const height = forecast?.properties?.elevation?.value;
	var times = SunCalc.getTimes(new Date(), lat, long, height);
	const {sunset, sunrise} = times;

	//https://www.metaweather.com/api/
	//https://www.7timer.info/bin/astro.php?lon=113.2&lat=23.1&ac=0&unit=metric&output=json&tzshift=0
	return {
		sunrise, sunset,
		weather: forecast?.properties?.periods[0].shortForecast
	}
};

const getColors = async ({lat, long}) => {
	const { sunrise, sunset, weather} = await getWeather({lat, long});
	locEl.innerText = 
`${weather||'weather API error'}
⬆ ${sunrise.toLocaleString()}
⬇ ${sunset.toLocaleString()}
${lat}, ${long}
`;
	moonEl.style.transform = `rotateZ(${timeAngle(sunset, sunrise)}deg)`
	sunEl.style.transform = `rotateZ(${-1*timeAngle(sunrise, sunset)}deg)`

	// use time of day
	// use location

	// create sky colors from this

	//https://codepen.io/billyysea/pen/whjbK
	//https://kwa.ng/procedurally-generated-svg-landscapes/

	return {
		sky: ['#2F1107', '#163C52'],
		ground: ['#0e0000', '#000']
	};
}

const changeColors = ({ sky, ground }, {lat, long}) => {

	const skyEl = document.getElementById('sky');
	skyEl.style.background = `linear-gradient(0deg, ${sky[0]}, ${sky[1]})`;

	const groundEl = document.getElementById('ground');
	groundEl.style.background = `linear-gradient(0deg, ${ground[0]}, ${ground[1]})`;
};

const refresh = async () => {
	const lat = '34.021648';
	const long = '-84.361671';
	
	const colors = await getColors({lat, long});
	//console.log(colors)
	changeColors(colors, {lat, long});
};

refresh();
setInterval(refresh, 60 * 1000);