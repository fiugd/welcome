//show-preview

import { prism, importCSS, consoleHelper, htmlToElement } from './.tools/misc.mjs'
import { createGraph } from './.tools/graph.mjs'
import './shared.styl';
consoleHelper();

const checklistItems = () => { return `
	- [X] RENAME a FILE from outside by path
	- MOVE a FILE from outside by path
	- ADD a FILE from outside by path
	- [X] DELETE a FILE from outside by path

	- RENAME a FOLDER from outside by path
	- MOVE a FOLDER from outside by path
	- [X] DELETE a FOLDER from outside by path
	- ADD a FOLDER from outside by path

	- inside versions of CRUD ops

	- scroll into view when an out-of-view file is selected
	- NOTIFY outer about CRUD ops and expand/collapse (when needed)

	- drag and drop files and folders to move them
	- cut a file and paste it later (but don't delete yet?)
	- add icons to files depending on type
	- insert files and folders in the right place (new file, new folder)
	- recall tree state on project reload
	- do all of this cheaply and efficiently

	- [X] collapse a parent without closing child branches (+programmatically)
	- [X] SELECT a FILE from outside by path, eg. via tab selection
	- [X] open containing folders when a nested child file is selected from outside
	- [X] provide context to file clicks and especially right clicks, ie. path info
	- [X] open and close all branches
	- [X] translate between UI trees and saved trees (and decide the diff)
	- [X] does not confuse files with same names in different dirs
	- [X] properly sort files and folders
	- [X] I don't really like the way that js-treeview dumps items into the dom
		- [X] maybe would prefer the way that es6tree uses shadow dom?
		- [X] but I could live with it since toJSON proxy let me clean that up
	- [X] I don't really like that css has to be included - mimic es6tree?
	- [X] should be very responsive
`.trim().replace(/\t/gm, '');
};



// SERVICE TREE MODULE
import TreeView from '/shared/vendor/js-treeview.1.1.5.js';
const tryFn = (fn, _default) => {
	try {
		return fn();
	} catch (e) {
		return _default;
	}
};

class TreeMapper {
	constructor(service){
		this.service = service;
		this.get = this.get.bind(this);
		return new Proxy(service.tree[service.name], this);
	}

	mapEntry = (target) => ([k,v]) => {
		const child = {
			name: k,
			id: target.path ? `${target.path}/${k}` : k,
			//TODO: maybe should figure out better way to determine folder vs file
			type: Object.keys(v).length === 0 ? 'file' : 'folder',
			//children: []
		};
		if(child.type === 'folder'){
			const dummyArray = [];
			dummyArray.path = target.path
				? `${target.path}/${k}`
				: k;
			child.children = new Proxy(dummyArray, this);
		}
		return child;
	}

	sort = (a, b) => {
		if(a.type > b.type) return -1;
		if(a.type < b.type) return 1;
		return a.name.toLowerCase() > b.name.toLowerCase()
			? 1
			: -1;
	}

	get(target, prop, receiver) {
		//console.log(prop)
		const realTarget = (target.path||"")
			.split('/')
			.reduce((all, one) => {
				return all[one] || all;
			}, this.service.tree[this.service.name]);
		
		const isNumericProp = !isNaN(prop) && 'number'

		const propertyMapper = {
			length: children => children.length,
			forEach: children => fn => children.forEach(fn),
			children: children => children,
			number: children => children[prop],
			toJSON: children => fn => undefined
		}[isNumericProp || prop];
		
		if(!propertyMapper) {
			debugger;
			//console.error(`Mapper proxy unable to handle prop: ${prop}`);
			return undefined;
		}

		try { 
			const children = Object.entries(realTarget)
				.map(this.mapEntry(target))
				.sort(this.sort);
			return propertyMapper(children);
		} catch (error){
			console.error(error);
		}
	}

}

class ServiceTree {
	jstreeview;
	rootNode;

	constructor(service, domRoot){
		const mappedTree = new TreeMapper(service);
		this.jstreeview = new TreeView(mappedTree, domRoot);

		const exposedAPI = ['on', 'off', 'collapse', 'collapseAll', 'expand', 'expandAll'];
		for(var i=0, len=exposedAPI.length; i<len; i++){
			const key = exposedAPI[i];
			this[key] = this.jstreeview[key].bind(this.jstreeview);
		}
		this.select = this.select.bind(this);
		this.delete = this.delete.bind(this);
		this.rootNode = document.getElementById(domRoot);
		
		this.on('select', ({ target, data }) => {
			this.currentFile = data.id;
			this.currentFolder = data.id.split('/').slice(0,-1).join('/');

			Array.from(this.rootNode.querySelectorAll('.selected'))
					.forEach(s => s.classList.remove('selected'));
			const { target: node } = target;
			const leafContent = node.closest('.tree-leaf-content');
			leafContent.classList.add('selected');
		});
		
		// on expand, currentFolder is expanded folder
		// on collapse, currentFolder is currentFile's parent
	}

	/*
		this is for programmatically selecting a file/folder
	*/
	select(path, skipDomUpdate){
		const splitPath = path.split('/');
		let success = false;
		let currentNode = this.rootNode;
		//TODO: dom traversal sucks, would be better to traverse an internal model?
		for(var i=0, len=splitPath.length; i<len; i++){
			const nodeName = splitPath[i];
			const immediateChildren = currentNode.querySelectorAll(':scope > .tree-leaf');
			const found = Array.from(immediateChildren)
				.find(child => {
					const { item: itemSource } = tryFn(() =>
						child.querySelector(':scope > .tree-leaf-content').dataset
					, {});
					const { name } = tryFn(() => JSON.parse(itemSource), {});
					return name === nodeName;
				});
			if(!found) break;

			const node = found.querySelector(':scope > .tree-leaf-content');
			const leaves = found.querySelector(':scope > .tree-child-leaves');
			if(!skipDomUpdate){
				if(leaves){
					this.expand(node, leaves, 'skipEmit')
				} else {
					Array.from(this.rootNode.querySelectorAll('.selected'))
						.forEach(s => s.classList.remove('selected'));
					node.classList.add('selected');
				}
			}
			currentNode = leaves || found;
		}
		const isFolder = [...currentNode.classList].includes('tree-child-leaves');
		if(isFolder) currentNode = currentNode.closest('.tree-leaf');

		return currentNode;
	}


	create(){} //same as add?

	add(type, path){
		// trigger a box to come up (in the right place) that allows adding a folder or file
		// when box is entered or dismissed, trigger the add or dismiss
		// tell the outside world that this happened
	}

	move(path, target){
		// change the dom
		// tell the outside world this happened
	}

	rename(path, newName){
		// trigger a box to come up that allows a rename
		// when box is entered or dismissed, trigger the rename or dismiss

		const domNode = this.select(path, 'skipDomUpdate');
		const treeLeafContent = domNode.querySelector('.tree-leaf-content');
		const treeLeafText = domNode.querySelector('.tree-leaf-text');
		const children = domNode.querySelector('.tree-child-leaves');

		const itemData = tryFn(() => JSON.parse(treeLeafContent.dataset.item));
		itemData.name = newName;
		itemData.id = [...itemData.id.split('/').slice(0,-1), newName].join('/');
		treeLeafContent.dataset.item = JSON.stringify(itemData);
		treeLeafText.textContent = newName;

		if(children){
			console.error('TREE RENAME: descendants must have their id updated to reflect path name change');
		}

		// TODO: tell the outside world that this happened
	}

	delete(path){
		const domNode = this.select(path, 'skipDomUpdate');
		domNode.remove();
		// TODO: tell the outer world that this was deleted
	}

	/*
		rewrite the interface for on select (instead rewrite on?)
			- current returns a target mouse event and data
			- would prefer to return path (and no more/less?)
		select and expand should be the same thing?
	*/
	onSelect(){}
}


// USAGE OF MODULE
(async () => {
	const treeStyle = () => {
		return `
			<style>
				body { margin-bottom: 0; }
				div#test-container {
					width: 100%;
					display: flex;
				}
				div#tests {
					flex: 1;
					background: hsl(177deg 11% 13%);
					padding: 1em;
				}
				div#tests > * { box-sizing: border-box; }
				#tests h4 { margin-top: 4em; }
				#tests > div { margin-bottom: 1em; display: flex; }
				#tests > div:before {
					font-variant: all-petite-caps;
					opacity: .5;
					min-width: 8.5em;
					display: inline-block;
				}
				#tests > div input[type="text"] {
					background: #6663; border: 0; color: white;
					flex: 1;
				}
				#tests > div input[type="checkbox"] {
					filter: invert(1) saturate(0);
					mix-blend-mode: screen;
					width: 1.1em;
					height: 1.1em;
					text-align: center;
				}
				#tests > div [disabled] { opacity: 0.6; }
				#tests > div button {
					min-width: 9em; margin-bottom: 0; height: 100%;
					margin-right: 1em; padding: 3px 10px; border: 0px;
					background: #7771
				}
				#tests > div button:hover { background: #9995 }
				#tests .current-file:before { content: 'Current File: '; }
				#tests .current-folder:before { content: 'Current Folder: '; }
				#tests .checklist { flex-direction: column; }


				.tree-leaf{position:relative}.tree-leaf .tree-child-leaves{display:block;margin-left:15px}.tree-leaf .hidden{display:none;visibility:hidden}.tree-leaf .tree-expando{background:#333;border-radius:3px;cursor:pointer;float:left;height:10px;line-height:10px;position:relative;text-align:center;top:5px;width:10px}.tree-leaf .tree-expando:hover{background:#aaa}.tree-leaf .tree-leaf-text{cursor:pointer;float:left;margin-left:5px}.tree-leaf .tree-leaf-content:after,.tree-leaf .tree-leaf-content:before{content:" ";display:table}.tree-leaf .tree-leaf-content:after{clear:both}

				.tree-leaf-content.selected {
					background: #88888842;
				}
				.tree-leaf {
					position: relative;
					min-width: 200px;
				}
				.tree-leaf-content:hover {
					background-color: #88888813;
				}
				#tree-container {
					height: calc(100vh - 3em);
					display: flex;
					flex-direction: column;
					background: #172030;
				}
				#tree-controls { background: #202717; margin-bottom: 1em; }
				#tree-controls button { margin-bottom: 0; min-width: unset; }
				#tree-root {
					background: #171717;
					flex: 1;
					overflow-y: auto;
					padding-bottom: 5em;
				}
			</style>
		`.replace(/^\t\t\t/gm, '');
	};

	const treeRootDom = htmlToElement(`
		<div id="test-container">
			<div id="tree-container">
				${treeStyle()}
				<div id="tree-controls">
					<button class="control collapse-all">Collapse All</button>
					<button class="control expand-all">Expand All</button>
					<button class="control add-file">Add File</button>
					<button class="control add-folder">Add Folder</button>
				</div>
				<div id="tree-root"></div>
			</div>
			<div id="tests">
				<div class="console"></div>

				<div class="current-file"></div>
				<div class="rename-file"><button>rename</button><input type="text" autocomplete="nope"/></div>
				<div class="move-file"><button>move</button><input type="text" autocomplete="nope"/></div>
				<div class="delete-file"><button>delete</button></div>

				<div class="current-folder"></div>
				<div class="rename-folder"><button>rename</button><input type="text" autocomplete="nope"/></div>
				<div class="move-folder"><button>move</button><input type="text" autocomplete="nope"/></div>
				<div class="delete-folder"><button>delete</button></div>
				<div class="add-file-in-folder"><button>add file</button><input type="text" autocomplete="nope"/></div>
				<div class="add-folder-in-folder"><button>add folder</button><input type="text" autocomplete="nope"/></div>

				<div class="checklist">
					<h4>Requirements:</h4>
				</div>

			</div>
		</div>
	`);
	const treeContainer = treeRootDom.querySelector("#tree-container");
	const treeControls = treeRootDom.querySelector("#tree-controls");
	const treeRoot = treeRootDom.querySelector("#tree-root");
	const tests = treeRootDom.querySelector("#tests");
	const updateTest = (which, text) => tests.querySelector('.'+which).textContent = text;

	document.body.append(treeRootDom);

	const { result: allServices } = await(await fetch('/service/read')).json();
	const thisServiceId = allServices.find(x => x.name === 'fiug-welcome').id;

	const { result: [service] } = await(await fetch(`/service/read/${thisServiceId}`)).json();
	const tree = new ServiceTree(service, 'tree-root');
	
	treeControls.querySelector('.expand-all').addEventListener('click', () => tree.expandAll());
	treeControls.querySelector('.collapse-all').addEventListener('click', () => tree.collapseAll());
	treeControls.querySelector('.add-folder').addEventListener('click', () => tree.add('folder'));
	treeControls.querySelector('.add-file').addEventListener('click', () => tree.add('file'));

	// file tests
	tests.querySelector('.rename-file button').addEventListener('click', (event) => {
		const newName = event.target.closest('div').querySelector('input').value;
		tree.rename(tree.currentFile, newName);
	});
	tests.querySelector('.move-file button').addEventListener('click', (event) => {
		const targetDir = event.target.closest('div').querySelector('input').value;
		tree.move(tree.currentFile, targetDir);
	});
	tests.querySelector('.delete-file button').addEventListener('click', () => {
		tree.delete(tree.currentFile);
	});

	// folder tests
	tests.querySelector('.add-file-in-folder button').addEventListener('click', (event) => {
		const newName = event.target.closest('div').querySelector('input').value;
		tree.rename(tree.currentFolder, newName);
	});
	tests.querySelector('.add-folder-in-folder button').addEventListener('click', (event) => {
		const newName = event.target.closest('div').querySelector('input').value;
		tree.rename(tree.currentFolder, newName);
	});
	tests.querySelector('.rename-folder button').addEventListener('click', (event) => {
		const newName = event.target.closest('div').querySelector('input').value;
		tree.rename(tree.currentFolder, newName);
	});
	tests.querySelector('.move-folder button').addEventListener('click', (event) => {
		const targetDir = event.target.closest('div').querySelector('input').value;
		tree.move(tree.currentFolder, targetDir);
	});
	tests.querySelector('.delete-folder button').addEventListener('click', () => {
		tree.delete(tree.currentFolder); //TODO: currently not working correctly
	});

	tree.on('select', ({ target }) => {
		updateTest('current-file', tree.currentFile);
		updateTest('current-folder', tree.currentFolder);
	});
	tree.on('expand', ({ target }) => updateTest('current-folder', tree.currentFolder));
	tree.on('collapse', ({ target }) => updateTest('current-folder', tree.currentFolder));

	tree.select('examples/binary/audio.mp3');

	tests.querySelector('.checklist').innerHTML += checklistItems()
		.split('\n')
		.filter(x=>!!(x.trim()))
		.map(x => {
			if(x.toLowerCase().includes('[x]')){
				x = x.split(/\[X\]/i)[1];
				return { checked: true, value: x }
			}
			return { value: x.split(/-\s/i)[1] };
		})
		.sort((a,b) => (a.checked && b.checked) || (!a.checked && !b.checked)
			? 0
			: a.checked && !b.checked ? 1 : -1
		)
		.map((x, i) => `
			<div ${x.checked ? 'disabled' : ''}>
				<input type="checkbox" name="checkbox-${i}" ${x.checked ? 'checked' : ''} />
				<label for="checkbox-${i}">${x.value}</label>
			</div>
		`)
		.join('\n')
	
	window.tree = tree;
})();




