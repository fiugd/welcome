import State from './state/state.js';
import * as ExpressionEngine from './engine/expressionEngine.js';
import Config from './state/config.js';
const { boxes, wires } = Config;

import Wires from './user-interface/wires.js';
import SVG from './user-interface/svg.js';

document.title = "Boxes and Wires";
document.body.innerHTML = `
	WIP: migrating from <a href="./svg_old/index.html">/svg_old</a>
`;

(async () => {
	const Environ = Wires({ State, ExpressionEngine });
	Environ(SVG(), boxes, wires);

	// engine
	// state
	// config
	// wires (ui)
})();