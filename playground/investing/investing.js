//show-preview
import { Grid } from 'https://cdn.skypack.dev/gridjs';

document.head.innerHTML += `
<link
	rel="stylesheet"
	href="https://cdn.skypack.dev/gridjs/dist/theme/mermaid.min.css"
>
`;
const element = (html, id, className) => {
	const div = document.createElement('div');
	div.innerHTML = html;
	id && (div.id = id);
	className && (div.className = className);
	document.body.append(div);
	return div;
};

const Table = (data=[]) => {
	const id = 'tb-' + (Math.random() * 1e17);
	const el = element('', id);
	const config = { data, search: false };
	return new Grid(config).render(el);
}

function Money(n=0) {
	return "" + n.toLocaleString().split(".")[0] + "."
		+ n.toFixed(2).split(".")[1];
}

const compute = ([valley, peak, quantity, description]) => {
	const valleyValue = valley*quantity;
	const peakValue = peak*quantity;
	const net = Money(peakValue - valleyValue);
	return {
		rate: Money(valley),
		quantity: quantity,
		cost: Money(valleyValue),
		return: Money(peakValue),
		net, description
	};
};

(async () => {
	let loading;
	const getBTC = async () => {
		const btcValUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json';
		const key = 'current-btc-value';
		const minutes = 5;
		const stored = JSON.parse(
			sessionStorage.getItem(key) || '{}'
		);
		loading = '<br>(refresh at: ' +
			new Date(stored.expires).toLocaleTimeString() + 
		')';
		if(Date.parse(stored.expires||'0') < Date.now()){
			loading = '<br>(loading new in background...)'
			fetch(btcValUrl)
				.then(r=>r.json())
				.then(payload => {
					const expires = new Date(Date.now()+minutes*60000);
					sessionStorage.setItem(
						key, JSON.stringify({ payload, expires })
					);
					document.location.reload();
				});
		}
		return stored.payload?.bpi?.USD?.rate_float;
	};
	const currentValue = await getBTC();

	const situations1 = [
		// buy, sell, quantity, desc
		[49550, currentValue, 0.0156004, 'may 15'],
		[48144, currentValue, 0.0062305, 'may 15'],
		[45363, currentValue, 0.0066079, 'may 16'],
		[35043, 37973.59, 0.0085592, 'may 19 - june-2'],
		[35500, 37973.59, 0.0084507, 'may 24 - june 2'],
		[33905.26, 36000, 0.00883824, 'may 29 - may 30'],
	];

	const situations2 = [
		// buy, sell, quantity, desc
		[43398.98, 51000, 0.04544876, 'long term buy/sell'],
		[32752, 38536, 0.04544876, 'May 23-24'],
		[39600, 40606, 0.04544876, 'May 25-26'],
		[43398.98, 38240, 0.04544876, 'may 22 hit'],
		[10483.38, currentValue, 0.0095389, 'first BTC buy']
	];
			
	const addTotals = (arr) => {
		const sitReduce = (fn,fn2=(x=>x)) => fn2(arr.reduce(fn,0));
		const toNumber = (str) => Number(str.replace(',',''))
		const totalQty = sitReduce((a,o)=>a+o.quantity);
		const totalCost = sitReduce((a,o)=>a+toNumber(o.cost));
		const totalReturn = sitReduce((a,o)=>a+toNumber(o.return));
		const totalNet = sitReduce((a,o)=>a+Number(o.net));
		arr.push({
			rate: Money(totalCost/totalQty),
			quantity: totalQty.toFixed(8),
			cost: Money(totalCost),
			return: Money(totalReturn),
			net: Money(totalNet),
			description: 'totals'
		});
		return arr;
	}

	element(`
		Current BTC Value: ${Money(currentValue)} ${loading||''}
		 <button onclick=document.location.reload()>refresh</button>
	`)
	Table(addTotals(situations1.map(compute)));
	Table(situations2.map(compute));
})();

element(`
	<style>
		body, th.gridjs-th, td.gridjs-td,
		div.gridjs-search input,
		::-webkit-input-placeholder {
			color: #ccc;
			font: 2vw monospace;
		}
		::-webkit-search-cancel-button {
			-webkit-appearance: none;
		}
		::-webkit-input-placeholder {
			opacity: 0.6;
		}
		::-webkit-scrollbar { width: 5px; height: 15px; }
		::-webkit-scrollbar-corner,
		::-webkit-scrollbar-track { background: transparent; }
		::-webkit-scrollbar-thumb { background: #555; }
		::-webkit-scrollbar-thumb:hover { background: #888; }
		body {
			margin: 4em 2em;
		}
		input.gridjs-input:focus {
			box-shadow: unset;
		}
		table.gridjs-table,
		div.gridjs-search input {
			background: #444;
		}
		div.gridjs-search input,
		div.gridjs-wrapper {
			border-radius: 0 !important;
		}
		tbody.gridjs-tbody,
		th.gridjs-th, td.gridjs-td {
			background: transparent;
		}
		div.gridjs-search input,
		th.gridjs-th, td.gridjs-td {
			padding: 0.7em;
			border: 1px solid #222;
		}
		td.gridjs-td:not(:last-child),
		th.gridjs-th:not(:last-child){
			text-align: right;
		}
		th.gridjs-th {
			background: #0004;
		}
	</style>
`);


