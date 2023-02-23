import "https://unpkg.com/three@0.122.0/build/three.min.js";
import { OrbitControls } from "https://unpkg.com/three@0.122.0/examples/jsm/controls/OrbitControls.js"

import './control.js';
import { APP } from "./webgl-quad.js";
import Menu from "./menu.js";

var loader = new THREE.FileLoader(); 
loader.load('webgl-quad-scene.json', function ( text ) {
	var player = new APP.Player({ OrbitControls, Menu }); 
	player.load( JSON.parse( text ) );
	player.setSize( window.innerWidth, window.innerHeight );
	player.play({ controller });
	document.body.appendChild( player.dom );
});

/*
old camera settings
	"uuid": "D87A73E8-3A30-48BB-8DAC-341560705E9E",
	"type": "PerspectiveCamera",
	"name": "Camera 1",
	"layers": 1,
	"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,13,45,1],
	"fov": 20,
	"zoom": 1,
	"near": 20,
	"far": 150,
	"focus": 10,
	"aspect": 1
*/