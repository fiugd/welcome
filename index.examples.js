/*
	thumbnails: https://github.com/fiugd/welcome/issues/3
*/
const experiments = [
	['playground/state-machine/index', 'State Machine', 'Explore state machine concepts', 'https://user-images.githubusercontent.com/1816471/219848753-09183123-bca1-4eb8-80a7-74f5d4272464.png'],
	['playground/bookmarks/bookmarks', 'bookmarks', '', 'https://user-images.githubusercontent.com/1816471/219848051-dc4cc529-0737-471b-a481-3c53cddb158e.png'],
	['playground/rss-feed/index', 'News Feed', 'Hacker News ++', 'https://user-images.githubusercontent.com/1816471/219903457-e9edf131-3bc8-45cd-87c2-87400a38367b.png'],
	['playground/pokedex/pokedex', 'pokedex', 'My own basic dex tool','https://user-images.githubusercontent.com/1816471/219903392-2d0b5f02-ca50-4f47-ac06-3694b61233f2.png'],
	['playground/css-3d', 'css-3d', 'How 3D can you go with CSS? I attempt to answer this.', 'https://user-images.githubusercontent.com/1816471/219848103-0b88b67a-cb25-4917-8b72-9cf71055b5c4.png'],
	['playground/encrypt-web-worker', 'encrypt-web-worker', 'Explore encryption using browser web worker', 'https://user-images.githubusercontent.com/1816471/219848209-0d78f850-dc8a-41f3-b6f6-bf650a0a9c40.png'],
	['playground/iching/iching', 'iching', '', 'https://user-images.githubusercontent.com/1816471/219848265-e798f722-fa59-4094-af86-8cb9e610247c.png'],
	['playground/kalman/kalman', 'kalman', 'Experiment to recover data from noisy sensors', 'https://user-images.githubusercontent.com/1816471/219848300-196b886c-8164-43fb-bc37-dc7b7effa620.png'],
	['playground/mixed-canvas/mixed-canvas', 'mixed canvas', '2D + 3D in one canvas', 'https://user-images.githubusercontent.com/1816471/219848807-61944f32-d41f-483f-8a9d-31fba07a5b94.png'],
	['playground/boxes-and-wires/index', 'Boxes and Wires', 'Fooling with node-based UI', 'https://user-images.githubusercontent.com/1816471/219895775-c80d7056-6332-4c33-bc3f-49aa3271485b.png'],
	['playground/rangers-advent/rangers.advent', 'rangers-advent', 'A calculator for determining Advent Rangers drop rate in Line Rangers', 'https://user-images.githubusercontent.com/1816471/219901197-3fbd35de-6ee1-49d0-a412-4fd75b135978.png'],
	['playground/languages/shiki/shiki', 'shiki', 'Code highlighting', 'https://user-images.githubusercontent.com/1816471/219902569-cfba7d84-0755-41a7-b3ed-bdf160346734.png'],
	['playground/tower.defense/tower.defense', 'tower defense', 'My attempts at a Line Rangers type game; still WIP', 'https://user-images.githubusercontent.com/1816471/219902596-ec501e25-cbc8-462a-91c8-9714e4372441.png'],
	['playground/wave-function-collapse/wave-function', 'wave function collapse', 'An algorithm that can be used for map creation among other things', 'https://user-images.githubusercontent.com/1816471/219903637-1a9c2af5-df7a-4854-a192-268278b80072.png'],
	['playground/webgl-quad/webgl-quad', 'webgl-quad', 'Simulating a quadcopter with noisy rotors', 'https://user-images.githubusercontent.com/1816471/219902750-bfd85759-615f-409d-9f55-9d5190d188db.png'],
	['playground/gameAsGame/index', 'GAME game', 'Exploring an idea I had for a game that has heavy focus on game meta', 'https://user-images.githubusercontent.com/1816471/219902771-f865230b-f8e6-4665-b7e0-0115e8d54d60.png'],
	['playground/tictactoe/index', 'Tic Tac Toe', 'You guessed it!', 'https://user-images.githubusercontent.com/1816471/219901232-108e1a9e-9288-4dca-a02f-a02370474ab3.png'],
	['playground/board/index', 'Game Board', 'Gneralizing on the idea of making an n x n game board', 'https://user-images.githubusercontent.com/1816471/219902885-62e0c1e8-5d0a-4182-84f8-426375f8c318.png'],
	['playground/sky-gradient/index', 'Sky Sim', 'Simulate the sky at different times of the day', 'https://user-images.githubusercontent.com/1816471/219902928-c0b246d7-0af6-46fb-abf3-3150a334e370.png'],
	['playground/stack-css/index', 'Stack Game', '', 'https://user-images.githubusercontent.com/1816471/219849230-35442d68-dc83-4c3f-8038-301258570bc6.png'],
	['playground/uxn/rom', 'Web UXN', 'A VM of sorts by those 100 rabbits folks', 'https://user-images.githubusercontent.com/1816471/219901115-ece749d7-e3c5-478b-ad57-5547ab93ed40.png'],
	['playground/webrtc/index', 'Web RTC', 'Chat host and client with WebRTC', 'https://user-images.githubusercontent.com/1816471/219903559-703a82db-155f-4e86-b74f-a7c1db0e10cb.png'],
	['playground/cityBottle/index', 'City In a Bottle', 'Playing around with JS from @KilledByAPixel', 'https://user-images.githubusercontent.com/1816471/219900997-f281bcd1-61ea-4b15-ba00-7104db560b98.png'],
	['playground/css-doodle/index', 'css-doodle', 'Make doodles with (mostly) CSS', 'https://user-images.githubusercontent.com/1816471/219900510-0ff963f5-261d-49af-9489-d6f4a7f27aba.png'],
];

const others = [
	['https://crosshj.com', 'crosshj.com', 'Personal / portfolio site. More experiments here', 'https://user-images.githubusercontent.com/1816471/219903201-1e02e486-e40f-442f-9153-400930d36f0a.png'],
	['https://crosshj.com/grfx/', 'grfx', 'Yet another graphics manipulation app', 'https://user-images.githubusercontent.com/1816471/219903128-f93a1729-7fe2-4dce-93f0-68141c6dd73e.png'],
	['https://chimpjuice.com', 'chimpjuice.com', 'Random-ish tumblr blog', 'https://user-images.githubusercontent.com/1816471/219903174-450b51f4-7279-466f-83ad-c3811ed424b0.png'],
];

const visit = (title, link) => {
	fetch('https://x8ki-letl-twmt.n7.xano.io/api:xXViCsyl:v1/visits', {
		method: 'post',
		body: JSON.stringify({ title }),
		 headers: {
			'Content-Type': 'application/json'
		},
	});
	document.location = link;
};

const stored = {
	get: () => {
		const fromStore = localStorage.getItem('welcome-visits');
		const parsed = JSON.parse(fromStore || '{}');
		return parsed || {};
	},
	update: async (ttl = 100000) => {
		const time = Date.now();
		const prevTime = stored.get().time;
		const diffTime = time-prevTime;
		if(diffTime < ttl) return;

		const visits = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:xXViCsyl:v1/visits').then(x => x.json());
		localStorage.setItem('welcome-visits', JSON.stringify({
			visits,
			time
		}));
	},
};

const sortVisits = (defaults) => {
	const getVisits = (item) => defaults.visits
		.find(x => x.title === item[1]) || { number: 0 };
	const experiments = defaults.experiments
		.sort((a,b) => getVisits(b).number - getVisits(a).number);
	const others = defaults.others
		.sort((a,b) => getVisits(b).number - getVisits(a).number);
	return { experiments, others };
};

const getPages = async () => {
	stored.update();
	const { visits=[] } = stored.get();
	const sorted = sortVisits({ experiments, others, visits });
	return { ...sorted, visit };
};

export default getPages;
