const ScreenInfo = () => {
	const screenInfo = document.createElement('div');
	document.body.append(screenInfo);
	const updateScreenInfo = () => {
		screenInfo.classList.add('screen-info');
		screenInfo.innerHTML = `${screen.width} x ${screen.height}`;
	};
	updateScreenInfo();
	window.addEventListener('resize', updateScreenInfo);
};

export default ScreenInfo;
