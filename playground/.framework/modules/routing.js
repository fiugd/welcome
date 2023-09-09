import StateManager from './state.js';

const hashChangeHandler = (event) => {
	const hash = (location.hash || '').replace('#/', '');
	StateManager.update({ path: 'route', value: hash });
};

const setup = () => {
	addEventListener('hashchange', hashChangeHandler);
};
export default { setup };
