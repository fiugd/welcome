import * as rxjs from 'https://cdn.skypack.dev/rxjs';
import * as operators from 'https://cdn.skypack.dev/rxjs/operators';
const {
	animationFrameScheduler, of
} = rxjs;;
const {
	takeWhile, filter, tap, repeat
} = operators;

const throttle = (MIN_TIME, state) => () => {
	const curr = performance.now();
	if(state.time && (curr - state.time) < MIN_TIME)
		return false;
	state.time = curr;
	return true;
};

export default class Engine {
	constructor(args){
		const {
			state,
			throttle: throttleAmount,
			highPriority,
			gameLoop,
			tryRender
		} = args;

		const gameSteps = [
			repeat(),
			tap(highPriority),
			filter(throttle(throttleAmount, state)),
			takeWhile(gameLoop),
			takeWhile(tryRender),
		];

		const loop = of(
			null, animationFrameScheduler
		)
			.pipe(...gameSteps);
		this.start = loop.subscribe.bind(loop);
	}
}