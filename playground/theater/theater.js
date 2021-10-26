// this will not work in a worker

import state from './state.json' assert { type: "json" };

import Theatre from 'https://cdn.skypack.dev/@theatre/core/dist';
//import Theatre from 'https://cdn.skypack.dev/theatre';
//import studio from 'https://cdn.skypack.dev/@theatre/studio/dist';

window.process = { env: {} };

const project = Theatre.getProject('my project', { state });
//const timeline = project.getTimeline('A timeline');

console.log(Object.keys(Theatre));
console.log(Object.keys(project));
