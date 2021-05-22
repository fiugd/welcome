const graphEls = () => Array.from(document.querySelectorAll('.graph'));
const collapsedEls = () => Array.from(document.querySelectorAll('.collapse'));
const setCollapsed = () => sessionStorage.setItem(
	'kalman-collapse',
	collapsedEls().map(x => x.id).join(',')
);
const getCollapsed = () => (sessionStorage.getItem('kalman-collapse')||'').split(',');
const updateCollapsed = (stored) => graphEls().forEach(x => {
	console.log(x.id)
	if(stored.includes(x.id)) return x.classList.add('collapse');
	x.classList.remove('collapse');
});



updateCollapsed(getCollapsed())

document.body.addEventListener('click', (event) => {
	const {target} = event;
	if(target.classList.contains('collapse')){
		target.classList.remove('collapse');
		setCollapsed();
		return;
	}
	if(target.classList.contains('graph')){
		target.classList.add('collapse');
		setCollapsed();
		return;
	}
});