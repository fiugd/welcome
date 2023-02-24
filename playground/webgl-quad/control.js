class PID {
	constructor({ p=0, i=0, d=0 }={}){
		this.p = p; this.i = i; this.d = d;
		this.sumError = 0;
		this.lastError = 0;
		this.maxCorrect = 0.09;
		this.i_max = 3;
	}

	setTarget(value){ this.target = value; }

	compute(current){
		this.target = this.target || 0;
		let error = this.target - current;
		this.sumError = this.sumError + error;
		if (this.i_max > 0 && Math.abs(this.sumError) > this.i_max) {
			let sumSign = (this.sumError > 0) ? 1 : -1;
			this.sumError = sumSign * this.i_max;
		}
		let dError = (error - this.lastError);
		this.lastError = error;
		const correction = (this.p*error) + (this.i * this.sumError) + (this.d * dError);

		return Math.abs(correction) > this.maxCorrect
			? (correction > 0 ? 1 : -1) * this.maxCorrect
			: correction;
	}
}

class RotationControl {
	constructor(){
		this.xPid = new PID({ p: 1, i: 0.125, d: 0 });
		this.yPid = new PID({ p: 1, i: 0.125, d: 0 });
		this.zPid = new PID({ p: 1, i: 0.125, d: 0 });
	}
	target({ x=0, y=0, z=0 }){
		const d2r = d => d / -57.2958;
		this.xPid.setTarget(d2r(x));
		this.yPid.setTarget(d2r(y));
		this.zPid.setTarget(d2r(z));
	}
	compute(rotation){
		const { x, y, z } = rotation;
		return {
			xC: this.xPid.compute(x),
			yC: this.yPid.compute(y),
			zC: this.zPid.compute(z)
		}
	}
}

const getController = () => {
	const rotControl = new RotationControl();
	const setRot = rotControl.target.bind(rotControl);

	const aPid = new PID({ p: 1.4, i: 0.09, d: 0.15 });
	const setA = aPid.setTarget.bind(aPid);

	const controller = ({ rotation, position }) => {
		const rotC = rotControl.compute(rotation);
		const aC = aPid.compute(position.y)
		return { ...rotC, aC }
	};

	// test flying
	let hts = [1, 2, 3, 10, 3, 2, 1, 0];
	let rot = [8, -8];

	const interval = setInterval(() => {
		const h = hts.pop() || 0;
		if(!h) hts = [1, 2, 3, 10, 3, 2, 1];
		setA(h)

		const r = rot.pop() || 0;
		if(!r) rot = [8, -8];
		setTimeout(()=>{
			setRot({ z: r, x: -1*r, y: 0 })
		},1000)
	}, 2000);
	
	controller.stop = () => {
		clearInterval(interval);
	};

	return controller;
};
export default getController;
