import * as dat from 'https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js';

const setupDom = ({ player }) => {
	const menu = document.createElement('div');
	menu.id = "menu";
	document.body.append(menu);

	const settings = {
		actual: {
			x: 0, y: 0, z: 0
		},
		reset: () => { player.resetQuad(); player.animate({ update: false }); },
		stop: () => player.stop(),
		play: () => player.play(),
	};

	const gui = new dat.GUI({ autoPlace: false });

	const actualFolder = gui.addFolder('Actual Position');
	const xValue = actualFolder.add(settings.actual, 'x', -10, 10).step(0.001);
	const zValue = actualFolder.add(settings.actual, 'z', -10, 10).step(0.001);
	const yValue = actualFolder.add(settings.actual, 'y', -1, 7).step(0.001);
	xValue.__li.style = "pointer-events: none;";
	yValue.__li.style = "pointer-events: none;";
	zValue.__li.style = "pointer-events: none;";
	actualFolder.open();

	const controlsFolder = gui.addFolder('Misc Controls');
	controlsFolder.add(settings, 'reset');
	controlsFolder.add(settings, 'stop');
	controlsFolder.add(settings, 'play');
	controlsFolder.open();

	const setPos = ({ x, y, z }) => {
		xValue.setValue(x);
		yValue.setValue(y);
		zValue.setValue(z);
	};

	menu.append(gui.domElement);
	return { setPos };
};

class Menu {
	constructor({ player }){
		console.log('TODO: menu');
		const Menu = setupDom({ player });
		this.setPos = Menu.setPos;
	}
	updatePos(pos){
		this.setPos(pos);
	}
}
export default Menu;
