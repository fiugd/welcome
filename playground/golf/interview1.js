/*
	Implement a function that takes the following array,
	sorts it into descending order by the 'order' property,
	and then executes each 'action'.

	Every action must complete before the next action can be run.
*/

const action = function(obj) {
	const delay = Math.floor(Math.random() * 1000) + 1;

	console.log("Started at: " + new Date());
	const act = () => {
		console.log("Finished at: " + new Date());
		obj.done();
	};

	setTimeout(act, delay);
};

const array = [
	{ order: 5, action },
	{ order: 4, action },
	{ order: 1, action },
	{ order: 2, action },
	{ order: 2, action },
	{ order: 0, action },
	{ order: 3, action },
	{ order: 5, action },
];

// A SOLUTION --------------------------------------------------


const WrapMe = (_op) => new Promise((resolve, reject) => {
	_op.done = resolve;
});

async function orchestrate(arr){
	const sorted = arr.sort((a, b) => b.order - a.order);

	for(let i=0, len=arr.length; i<len; i++){
		const thing = arr[i];
		const op = {};
		const prom = WrapMe(op);
		thing.action(op);
		await prom;
	}
}

await orchestrate(array);

