/*

	move back and forth using:
		- PID controller (WIP)
		- noisy thrust (not started)

	When a ascending/descending target is selected, a route should be planned.
	Each time update is called, the controller target should be set to the sub-target based on update increment.
	When all sub-routes are consumed, a new route should be planned.

	TODO:
	kalman filter from ../..kalman
	linear regression(to graph drift) - https://www.w3schools.com/ai/ai_regressions.asp

	https://github.com/markert/fili.js/
*/

import { PID } from '../control.js';
import Kalman from './kalman.js';

import { wip } from './kalman.js';

const noiseFn = ({ center=0.5, amp = 1 }={}) => {
	return (Math.random()-(0.5 - center))*amp;
};

function update(){
	const { MAX, NEG_MAX, DIFF } = this;
	const pos = this.getPos();

	if(this.ascending && (pos >= MAX )){
		this.ascending = false;
		this.route = [];
	}
	if(!this.ascending && (pos <= NEG_MAX)){
		this.ascending = true;
		this.route = [];
	}

	if(this.route && this.route.length){
		const target = this.route.shift(1);
		this.controller.setTarget(pos+target);
		this.controller.compute(pos);
	}
	if(this.route && this.route.length) return;

	if(this.ascending && (pos < MAX )){
		const steps = Math.ceil((MAX - pos)/DIFF);
		this.route = new Array(steps)
			.fill()
			.map((_,i) => DIFF);
	}
	if(!this.ascending && (pos > NEG_MAX)){
		const steps = Math.ceil(-1*(NEG_MAX - pos)/DIFF);
		this.route = new Array(steps)
			.fill()
			.map((_,i) => -1*DIFF);
	}
}

function setupPID(){
	const settings = {
		p: this.DIFF,
		i: this.DIFF,
		d: this.DIFF,
		i_max: 0.4,
	};
	const controller = new PID({
		...settings,
		rate: this.DIFF,
		onChange: this.move,
	});
	controller.settings = settings;
	return controller;
}

function doMove(){
	// simulates wheel slip
	const noisy = (x) => {
		return x * noiseFn();
	};
	const onChange = (x) => {
		//console.table(x);
		const { correction } = x;
		this.posAlpha += correction;
		this.pos += noisy(correction);
	};
	return onChange;
}

function getPos(){

	// get position based on "wheel encoder"
	// get position based on "GPS"
	// get position based on "accelerometer"

	return () => {
		//console.log(noisy(this.posAlpha))
		//return noisy(this.posAlpha);
		//return this.posAlpha;
		return getSensors(this);
	}
}

function getSensors({ pos, posAlpha }){
	// get position based on "wheel encoder"
	const wheels = posAlpha;

	// get position based on "GPS"
	const sensor1 = pos + noiseFn({ center: 0, amp: 2 });

	// get position based on "accelerometer"
	const sensor2 = pos + noiseFn({ center: 0, amp: 2 });

	//const average = [wheels, sensor1, sensor2].reduce((a,o) => a+o, 0)/3;
	const average = [sensor1, sensor2].reduce((a,o) => a+o, 0)/2;
	return average;

	const fused = Kalman(average);
	return fused;
}


class Mover {
	posAlpha = 0;
	pos = 0;
	ascending = true;
	DIFF = 0.5;
	MAX = 9;
	NEG_MAX = this.MAX * -1;
	prevTime = 0;

	constructor({ graphic }){
		this.graphic = graphic;
		this.update = update.bind(this);

		this.render = async (timer) => {
			await this.graphic.ready;
			const timeDelta = timer - this.prevTime;
			if(!this.prevTime || timeDelta > 100){
				this.realPosGraph = this.realPosGraph || this.graphic.graph('real position', -19, 19);
				this.realPosGraph.update(this.pos);

				this.sensorGraph = this.sensorGraph || this.graphic.graph('sensors', -19, 19);
				this.sensorGraph.update(getSensors(this));

				this.posGraph = this.posGraph || this.graphic.graph('wheels');
				this.posGraph.update(this.posAlpha);

				this.graphic.setDisplay('up.middle', this.posAlpha);
				this.prevTime = timer;
			}
			this.graphic.setPos(this.pos);
		};
		this.move = doMove.bind(this)();
		this.getPos = getPos.bind(this)();
		this.controller = setupPID.bind(this)();
	}
}

class WIPMover {
	constructor({ graphic }){
		wip({ graphic });
		this.update = () => {};
		this.render = () => {};
	}
}

export default WIPMover;
