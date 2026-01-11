// Minimal JS chess engine adapted from micro-chess idea (small negamax engine)
// Uses a simple 0..63 board and basic move generation for playable demo.
const PIECE = { P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6 };
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export class MicroChess {
	constructor() {
		this.reset();
		this.nodes = 0;
	}

	reset() {
		this.board = new Array(64).fill(0);
		this.side = 1; // 1 white, -1 black
		this.castling = { K: true, Q: true, k: true, q: true };
		this.ep = -1;
		this.halfmove = 0;
		this.fullmove = 1;
		this.fromFEN(START_FEN);
	}

	fromFEN(fen) {
		const [pos, turn] = fen.split(' ');
		let i = 0;
		for (const ch of pos) {
			if (ch === '/') continue;
			if (ch >= '1' && ch <= '8') {
				i += parseInt(ch, 10);
				continue;
			}
			const color = ch === ch.toUpperCase() ? 1 : -1;
			const p = ch.toLowerCase();
			let code = 0;
			if (p === 'p') code = PIECE.P;
			if (p === 'n') code = PIECE.N;
			if (p === 'b') code = PIECE.B;
			if (p === 'r') code = PIECE.R;
			if (p === 'q') code = PIECE.Q;
			if (p === 'k') code = PIECE.K;
			this.board[i++] = color * code;
		}
		this.side = turn === 'w' ? 1 : -1;
	}

	clone() {
		const c = new MicroChess();
		c.board = this.board.slice();
		c.side = this.side;
		c.castling = { ...this.castling };
		c.ep = this.ep;
		c.halfmove = this.halfmove;
		c.fullmove = this.fullmove;
		return c;
	}

	squareToRC(sq) {
		return [sq % 8, Math.floor(sq / 8)];
	}
	rcToSquare(r, c) {
		return r + c * 8;
	}

	generateMoves() {
		const moves = [];
		const dir = this.side;
		for (let i = 0; i < 64; i++) {
			const p = this.board[i];
			if (p * dir <= 0) continue;
			const abs = Math.abs(p);
			if (abs === PIECE.P) {
				const step = -8 * dir; // white pawns move -8 (upwards on board array)
				const to = i + step;
				if (to >= 0 && to < 64 && this.board[to] === 0) {
					moves.push({ from: i, to });
					// double
					const startRank = dir === 1 ? 6 : 1;
					const rank = Math.floor(i / 8);
					if (rank === startRank) {
						const to2 = i + step * 2;
						if (to2 >= 0 && to2 < 64 && this.board[to2] === 0)
							moves.push({ from: i, to: to2 });
					}
				}
				// captures
				for (const d of [-1, 1]) {
					const f = i + step + d; // diagonal file offset (same for both colors)
					if (
						f >= 0 &&
						f < 64 &&
						(i % 8) + d >= 0 &&
						(i % 8) + d < 8
					) {
						if (this.board[f] && Math.sign(this.board[f]) === -dir)
							moves.push({ from: i, to: f });
					}
				}
			} else if (abs === PIECE.N) {
				const offs = [-17, -15, -10, -6, 6, 10, 15, 17];
				for (const o of offs) {
					const t = i + o;
					if (
						t >= 0 &&
						t < 64 &&
						Math.abs((i % 8) - (t % 8)) < 3 &&
						this.board[t] * dir <= 0
					)
						moves.push({ from: i, to: t });
				}
			} else if (abs === PIECE.B || abs === PIECE.R || abs === PIECE.Q) {
				const offs =
					abs === PIECE.B
						? [-9, -7, 7, 9]
						: abs === PIECE.R
						? [-8, -1, 1, 8]
						: [-9, -8, -7, -1, 1, 7, 8, 9];
				for (const o of offs) {
					let t = i + o;
					while (t >= 0 && t < 64) {
						// avoid wrapping around board edges: ensure the step didn't jump files
						const prev = t - o;
						if (Math.abs((t % 8) - (prev % 8)) > 1) break;
						if (this.board[t] * dir > 0) break;
						moves.push({ from: i, to: t });
						if (this.board[t] !== 0) break;
						t += o;
					}
				}
			} else if (abs === PIECE.K) {
				for (const o of [-9, -8, -7, -1, 1, 7, 8, 9]) {
					const t = i + o;
					if (
						t >= 0 &&
						t < 64 &&
						Math.abs((i % 8) - (t % 8)) < 2 &&
						this.board[t] * dir <= 0
					)
						moves.push({ from: i, to: t });
				}
			}
		}
		return moves;
	}

	makeMove(m) {
		const captured = this.board[m.to];
		this.board[m.to] = this.board[m.from];
		this.board[m.from] = 0;
		this.side = -this.side;
		return captured;
	}
	unmakeMove(m, captured) {
		this.side = -this.side;
		this.board[m.from] = this.board[m.to];
		this.board[m.to] = captured;
	}

	evaluate() {
		let s = 0;
		const vals = [0, 100, 320, 330, 500, 900, 20000];
		for (let i = 0; i < 64; i++) {
			const p = this.board[i];
			if (!p) continue;
			s += Math.sign(p) * vals[Math.abs(p)];
		}
		return s * this.side; // perspective of side-to-move
	}

	negamax(depth, alpha, beta) {
		this.nodes++;
		if (depth === 0) return this.evaluate();
		const moves = this.generateMoves();
		if (moves.length === 0) return -99999; // mate or stalemate
		let best = -Infinity;
		for (const m of moves) {
			const cap = this.makeMove(m);
			const score = -this.negamax(depth - 1, -beta, -alpha);
			this.unmakeMove(m, cap);
			if (score > best) best = score;
			if (score > alpha) alpha = score;
			if (alpha >= beta) break;
		}
		return best;
	}

	findBestMove(depth = 3) {
		this.nodes = 0;
		const moves = this.generateMoves();
		let best = null,
			bestScore = -Infinity;
		for (const m of moves) {
			const cap = this.makeMove(m);
			const score = -this.negamax(depth - 1, -Infinity, Infinity);
			this.unmakeMove(m, cap);
			if (score > bestScore) {
				bestScore = score;
				best = m;
			}
		}
		return best;
	}

	uciSquare(sq) {
		const files = 'abcdefgh';
		return files[sq % 8] + (8 - Math.floor(sq / 8));
	}
}

export function pieceToUnicode(v) {
	if (!v) return '';
	const p = Math.abs(v);
	// Use the filled (black) Unicode chess glyphs for all pieces and color via CSS
	const map = { 1: '♟', 2: '♞', 3: '♝', 4: '♜', 5: '♛', 6: '♚' };
	return map[p] || '';
}
