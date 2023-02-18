import StateTest from './state/state.test.js';
import customFunctions from './engine/customFunctions.test.js';
import EngineTest from './engine/expressionEngine.test.js';

/*
TODO:
use testing framework from crosshj/vermiculate
*/

document.title = "Boxes and Wires (TEST)";

document.body.innerHTML = `
	<style>
		body { display: flex; }
		#testContainer {
			max-width: 600px;
			margin: auto;
			background: #222;
			padding: 1em;
		}
	</style>

	<div id="testContainer">
		<pre style="tab-size: 0">
			WIP: migrating from ../svg

			I'm not sure what happened to the progress of this
			trying to pick it back up
		</pre>
	</div>
`;


(async () => {
	await StateTest();
	await customFunctions();
	await EngineTest();
})();
