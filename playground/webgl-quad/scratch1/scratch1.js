import getGraphic from './graphics.js';
import loop from './gameloop.js';

const graphic = await getGraphic();

class Mover {
	pos = 0;
	ascending = true;
	DIFF = 0.1;
	MAX = 9;
	NEG_MAX = this.MAX * -1;

	constructor({ graphic }){
		this.graphic = graphic;
		this.update = this.update.bind(this);
		this.render = () => this.graphic.setPos(this.pos);
	}
	update(){
		const { DIFF, MAX, NEG_MAX } = this;

		if(this.ascending && (this.pos+DIFF > MAX ))
			this.ascending = false;
		if(!this.ascending && (this.pos-DIFF < NEG_MAX))
			this.ascending = true;
		this.pos = this.ascending
			? this.pos + DIFF
			: this.pos - DIFF;
	}
}

const game = loop(new Mover({ graphic }), 30);

setTimeout(game.start, 1);
