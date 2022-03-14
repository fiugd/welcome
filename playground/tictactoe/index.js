const gameStatus = document.querySelector('.status');
const gameBoardEl = document.querySelector('.game-board');
const gameBoxes = Array.from(gameBoardEl.children);

const game = {
	status: '',
	win: '',
	player: 'X',
	history: [],
	board: [
		[],
		[],
		[],
	]
};

const isWin = () => {
	const { board } = game;
	const winSpots = [
		// horizontal
		[[0,0],[0,1],[0,2]],
		[[1,0],[1,1],[1,2]],
		[[2,0],[2,1],[2,2]],
		// vertical
		[[0,0],[1,0],[2,0]],
		[[0,1],[1,1],[2,1]],
		[[0,2],[1,2],[2,2]],
		// diagonal
		[[0,0],[1,1],[2,2]],
		[[0,2],[1,1],[2,0]],
	];
	const allSame = (spots) => {
		const [p1,p2,p3] = spots;
		const b1 = board[ p1[0] ][ p1[1] ];
		const b2 = board[ p2[0] ][ p2[1] ];
		const b3 = board[ p3[0] ][ p3[1] ];
		return b1 && b1 === b2 && b2 === b3;
	};
	return winSpots.find(allSame);
};

const render = () => {
	if(game.status){
		gameStatus.textContent = game.status;
	} else {
		gameStatus.textContent = `${game.player}'s Turn`;
	}
	for(var y=0; y<3; y++){
		for(var x=0; x<3; x++){
			if(!game.board[x][y]) continue;
			if(game.win && game.win.find(w => w[0] === x && w[1] === y)){
				gameBoxes[3*y+x].classList.add('win');
			}
			gameBoxes[3*y+x].textContent = game.board[x][y];
		}
	}
};

const playerTurn = (el) => {
	if(game.status){ return render(); }
	const index = Array.from(el.parentNode.children).indexOf(el);
	const x = index % 3;
	const y = Math.floor(index / 3);
	game.board[x][y] = game.player + '';
	game.history.push({ player: game.player, x, y });
	game.player = game.player === 'X' ? 'O' : 'X';
	const winSpot = isWin();
	if(winSpot) {
		game.win = winSpot;
		const winner = game.board[winSpot[0][0]][winSpot[0][1]];
		game.status = `${winner} wins!`;
	}
	if(game.history.length >= 9 && !game.status) game.status = 'TIE';
	render();
};

render();

const boxClickHandler = (e) => {
	const {target} = e;
	if(!target.classList.contains('box')) return;
	//target.textContent = 'X';
	playerTurn(target);
};

document.body.onpointerdown = (e) => {
	boxClickHandler(e);
};