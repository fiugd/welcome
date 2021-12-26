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


controls.onclick = (e) => {
	if(e.target.tagName !== 'PRE') return;
	const piece = e.target.dataset.piece;
	if(!state.selected) return;
	state.selected.innerHTML = `
		<div class="piece">${piece}</div>
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
