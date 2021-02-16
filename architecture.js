//show-preview
import { prism, importCSS, consoleHelper, htmlToElement } from './.tools/misc.mjs'
import { createGraph } from './.tools/graph.mjs'
import './shared.styl';
consoleHelper();

const archGraph = {
	nodes:[
		{id: "page",     name: "page",  radius:60, color: "olivedrab", fx: 145, fy: 280},
		{id: "mbus",     name: "msg",   radius:30, color: "olive",     fx: 190, fy: 202},
		{id: "request",  name: "fetch", radius:30, color: "olive",     fx: 190, fy: 358},

		{id: "sw",       name: "SW",       radius:60, color: "orchid",       fx: 480, fy: 280 },
		{id: "handlers", name: "handlers", radius:40, color: "mediumpurple", fx: 380, fy: 450},
		{id: "workers",  name: "workers",  radius:40, color: "mediumpurple", fx: 480, fy: 450},
		{id: "persist",  name: "persist",  radius:40, color: "mediumpurple", fx: 580, fy: 450},

		{id: "net",   name: "network", radius:60, color: "orange",    fx:700,  fy: 280},
		{id: "ghcdn", name: "CDN",     radius:30, color: "goldenrod", fx: 850, fy: 130},
		{id: "ghgit", name: "git",     radius:30, color: "goldenrod", fx: 850, fy: 205},
		{id: "files", name: "files",   radius:30, color: "goldenrod", fx: 850, fy: 280},
		{id: "mrepo", name: "mods",    radius:30, color: "goldenrod", fx: 850, fy: 355},
		{id: "proxy", name: "proxied", radius:30, color: "goldenrod", fx: 850, fy: 430},
	],
	"links":[
		{source: "page",target:"mbus", weight:2.0, left: true, right: true },
		{source: "page",target:"request", weight:2.0, right: true },

		{source: "sw",target:"mbus",     weight:2.0, right: true, left: true },
		{source: "sw",target:"request",  weight:2.0, left: true },
		{source: "sw",target:"net",      weight:2.0, right: true },
		{source: "sw",target:"handlers", weight:2.0, right: true },
		{source: "sw",target:"workers",  weight:2.0, right: true, left: true },
		{source: "sw",target:"persist",  weight:2.0, right: true },

		{source: "net",target:"ghcdn", weight:2.0, right: true },
		{source: "net",target:"ghgit", weight:2.0, right: true },
		{source: "net",target:"files", weight:2.0, right: true },
		{source: "net",target:"mrepo", weight:2.0, right: true },
		{source: "net",target:"proxy", weight:2.0, right: true },
	]
};

(async () => {

	archGraph.nodes.forEach(x => x.fy -= 20)
	const graph = await createGraph(archGraph, '.');

	const NOTES = `
this graph and these notes are supposed to:
- visually depict architecture of fiug system 
- aid understanding and explaining it
- record ideas about future

## page
- request (fetch):
	- page should get the majority of it's substance from network requests to service worker
	- page should post changes from user to service worker

- message bus (msg):
	- page requests code be "ran" in which case messages would pass to/from SW through message bus
	- workers
		- sw needs to treat workers as something it owns
		- afaik workers only exist in page context
		- workers should be spawned in page through SW messaging the page to do so
		- this may be related to first exception.

## service worker
- for the most part, SW should consider anything it reads/writes to a file system
- core of service worker should be as small as possible
- boot process should attach/register functionality to SW
- user should be able to define what is attached on boot and instantiate attached items on the fly
- in order to accomplish the above, SW may need to heavily rely on workers spawned in page
- handlers
	- when a service is added an expresslike service is stood up to serve it
	- in practice, there really is only one of these services and it handles SW API as well
- workers
	- when a file is ran, a worker is stood up to run it
	- should handler(s) be treated this way?
- persistance
	- cache, session storage, indexDB
	- ideally SW context would be the only one in which persistence layer is accessed
	- as with network, this should be treated as a file system in some regard

## network
- offers the initial boot to SW and page (contains code for all this)
- after initial, network traffic should be considered file system calls from SW perspective (providers)
- cdn
	- github serves up all the files
- git
	- github fills the role of git
	- current abstraction using github API vs git abstraction
- files
	- this is a server on local (maybe not) that reads/writes to file system
- modules
	- this is a repo like skypack, unpkg, or jsdelivr
	- this could be wrapped at some point into a fuller blow package management system
- proxied
	- requests made to external data sources sitting behind a CORS proxy

## side notes
- what does an arrow mean? (source calls to target)
- there's no concept of containers with current graphing system
- may be easier to define this all with a textual representation of UML
	- [text-uml-tools-complete-list](https://modeling-languages.com/text-uml-tools-complete-list/)
	- [txt-uml-stackoverflow](https://stackoverflow.com/questions/4144066/textual-representation-for-uml-class-diagrams-dsl-for-uml)
- render markdown from JS
- highlight markdown in JS files


`;

	prism('md', NOTES);

})();