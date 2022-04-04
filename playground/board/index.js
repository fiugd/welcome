import JSON5 from 'https://cdn.skypack.dev/json5';

const boardDom = document.querySelector('.game-board');

const requireJSON = async (url) => {
	return await fetch(url).then(async (x) => JSON5.parse(await x.text()));
};

const placePiece = (el, piece) => {
	el.innerHTML = `
	<svg viewBox="-8.9 0 18 18">
		<text x="0" y="15" text-anchor="middle">${piece}</text>
	</svg>
	`
};

/*
http://js1k.com/2010-first/demo/750
♟♛♚♝♞♜
♙♕♔♗♘♖
*/

const boxClickHandler = (e) => {
	const {target} = e;
	if(!target.classList.contains('box')) return;
	const content = target.textContent.trim();
	if(content === 'O') return target.innerHTML = '';
	placePiece(target, content === 'X' ? 'O' : 'X');
	//target.textContent = 'X';
	//playerTurn(target);
};

document.body.onpointerdown = (e) => {
	boxClickHandler(e);
};

(async() => {
	const def = await requireJSON('./game.json');
	const { boardDim: dim } = def;
	boardDom.innerHTML = new Array(dim.x*dim.y).fill('<div class="box"></div>').join('\n')
	// boardDom.style.gridTemplateRows = new Array(dim.x).fill(90/dim.x + 'vw').join(' ');
	// boardDom.style.gridTemplateColumns = new Array(dim.y).fill(90/dim.y + 'vw').join(' ');

	boardDom.style.gridTemplateRows = `repeat(${dim.x}, 1fr)`;
	boardDom.style.gridTemplateColumns = `repeat(${dim.y}, 1fr)`;

	const pieces = Array.from(boardDom.querySelectorAll('div'));
	// placePiece(pieces[1],'X');
	//placePiece(pieces[12],'O');

})();