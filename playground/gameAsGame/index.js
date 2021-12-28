import { animate, load } from './piskel.js';

/*

the idea here is that certain "players" in game are those which help create the game

here are some ideas for roles within this game which might illustrate the point

Meta Moderator:
- is reponsible for the meta of the game
- no character gets introduced that wrecks the meta unless intended and agreed on
- should be in touch with what folks want in the game
- receives some financial compensation?

Character Creator:
- draw and animates characters
- comes up with stats for characters
- submits these characters to moderators to be added to game
- receives some financial compensation?

Player:
- purchases characters with some in-game currency
- levels and equips characters
- plays other characters for dominance in a leaderboard

Other roles may be:
- Environment Creator,
- Events Manager,
- Gear Creator


MVP for this idea:
- tic-tac-toe(TTT) board
	- but X's and O's are characters that fight each other
	- characters attack over time based on attack profile
		- attack pattern (as with chess)
		- bonus (as with TTT)
	- characters defend over time based on defend profile
*/


const controls = document.querySelector('.controls');
const board = document.querySelector('.board');

const state = {
	selected: document.querySelector('.board .selected')
};

const characters = [{
	image: "♚",
	name: "white king"
}, {
	image: "♛",
	name: "white queen"
}, {
	image: "♜",
	name: "white rook"
}, {
	image: "♝",
	name: "white bishop"
}, {
	image: "♞",
	name: "white knight"
}, {
	image: "♟︎",
	name: "white pawn"
}, {
	image: "♚",
	name: "black king"
}, {
	image: "♛",
	name: "black queen"
}, {
	image: "♜",
	name: "black rook"
}, {
	image: "♝",
	name: "black bishop"
}, {
	image: "♞",
	name: "black knight"
}, {
	image: "♟︎",
	name: "black pawn"
}];

const positions = [
	'black king', 'black rook', 'black queen', 'black bishop',
	'black pawn', 'black pawn', 'black pawn', '',
	'white pawn', '', '', 'black pawn',
	'', 'white pawn', 'white pawn', 'white pawn',
	'', '', 'white queen', 'white king',
];

const boardOpts = {
	width: 4,
	height: 5,
	characters,
	positions
};

const renderBoard = (opts, b, c) => {
	b.style.gridTemplateColumns = (new Array(opts.width))
		.fill()
		.map(x => '1fr')
		.join(' ');
	b.innerHTML =  (new Array(opts.width * opts.height))
		.fill()
		.map((x, i) => {
		const id = `piece-${i}`;
		if(!positions[i]) return `<div id="${id}" class="piece-container"></div>`;
		const character = opts.characters.find(c => c.name === positions[i])
		const color = character.name.includes('white') ? 'white' : 'black';
		return `<div id="${id}" class="piece-container">
			<div class="piece ${color}">${character.image}</div>
		</div>`
		})
		.join('\n');
	c.innerHTML = opts.characters
		. map(x => `<pre
			data-piece="${x.image}"
			class="${x.name.includes('white') ? 'white' : 'black'}"
			>${x.image}</pre>`)
		.join('\n')
}
renderBoard(boardOpts, board, controls);

controls.onclick = (e) => {
	if(e.target.tagName !== 'PRE') return;
	const piece = e.target.dataset.piece;
	if(!state.selected) return;
	const color = e.target.classList.contains('white') ? 'white' : 'black';
	state.selected.innerHTML = `
		<div class="piece ${color}">${piece}</div>
	`;
};

board.onclick = (e) => {
	if(e.target.tagName !== 'DIV') return;
	if(e.target.classList.contains('piece')) return;
	if(e.target.classList.contains('selected')) return;
	
	const oldSelected = document.querySelector('.board .selected');
	oldSelected && oldSelected.classList.remove('selected');

	e.target.classList = 'selected';
	state.selected = e.target;
};

(async () => {
	const pisk = await load('./assets/castle.piskel');

	animate(pisk, document.getElementById('piece-17'));
	animate(pisk, document.getElementById('piece-16'));
})();