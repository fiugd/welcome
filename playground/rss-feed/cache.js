function setWithExpiry(key, value, ttl) {
	if(["undefined", undefined].includes(value)) return;
	const now = new Date()
	const item = {
		expiry: now.getTime() + ttl,
		value: value,
	};
	sessionStorage.setItem(key, JSON.stringify(item))
}

function getWithExpiry(key) {
	const itemStr = sessionStorage.getItem(key)
	if (!itemStr) return;

	const item = JSON.parse(itemStr)
	const now = new Date()
	if (now.getTime() > item.expiry) {
		sessionStorage.removeItem(key)
		return;
	}
	return item.value
}

const cache = async ({ fn, key, ttl=100000 }) => {
	const cached = getWithExpiry(key);
	if(cached) return cached;
	console.log('cache not exist');
	const newValue = await fn(key);
	setWithExpiry(key, newValue, ttl);
	return newValue;
};
export default cache;