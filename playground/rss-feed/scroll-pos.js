
const ready = (() => {
	let readyResolve;
	const p = new Promise((r) => readyResolve = r);
	const listener = () => {
		removeEventListener("RSSdone", listener);
		readyResolve();
	};
	addEventListener("RSSdone", listener);
	return p;
})();

class State {
	heightKey = 'rssfeed-height';
	scrollKey = 'rssfeed-scroll';

	constructor(){
		this._minHeight = sessionStorage.getItem(this.heightKey);
		this._scrollPos = sessionStorage.getItem(this.scrollKey);
	}

	get minHeight(){
		return this._minHeight;
	}
	set minHeight(h){
		this._minHeight = h;
		sessionStorage.setItem(this.heightKey, h);
	}

	get scrollPos(){
		return this._scrollPos;
	}
	set scrollPos(p){
		this._scrollPos = p;
		sessionStorage.setItem(this.scrollKey, p);
	}
}

/*
TODO: what happens if the size of the window has changed since last time (Desktop)?
*/

(async () => {
	await ready;

	const state = new State();

	state.minHeight = state.minHeight || document.body.clientHeight;
	document.body.style.minHeight = state.minHeight + 'px';

	if(state.scrollPos){
		window.scrollTo(0, state.scrollPos);
	}

	const saveScroll = () => state.scrollPos = window.scrollY;
	addEventListener('scroll', saveScroll);
	addEventListener('resize', saveScroll);
	addEventListener("beforeunload", saveScroll);
})();
