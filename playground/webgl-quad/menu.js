import * as dat from 'https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js';

const setupDom = ({ player }) => {
	const menu = document.createElement('div');
	menu.id = "menu";
	document.body.append(menu);
	
	const gui = new dat.GUI({ autoPlace: false });

	const actualFolder = gui.addFolder('Actual Position');
	const xValue = actualFolder.add({ x: 0 }, 'x', -10, 10).step(0.001);
	const zValue = actualFolder.add({ z: 0 }, 'z', -10, 10).step(0.001);
	const yValue = actualFolder.add({ y: 0 }, 'y', -1, 7).step(0.001);
	xValue.__li.style = "pointer-events: none;";
	yValue.__li.style = "pointer-events: none;";
	zValue.__li.style = "pointer-events: none;";
	actualFolder.open();

	const controlsFolder = gui.addFolder('Misc Controls');
	controlsFolder.add({ reset: () => player.resetQuad() }, 'reset');
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
