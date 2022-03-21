const anonyak = 'https://n02d8geryb.execute-api.us-east-1.amazonaws.com/dev';

const write = async (message) => {
	try {
		const config = {
			method: 'POST',
			body: JSON.stringify({ message })
		};
		const res = await fetch(anonyak + '/client', config)
			.then(x => x.json());
		return res;
	} catch(e){
		console.log(e);
		return { error: 'failed to create'}
	}
};

const read = async () => {
	try {
		const { items } = await fetch(anonyak + '/host')
			.then(x => x.json());
		return items
			.sort((a, b) => a.ttl - b.ttl)
			.map(x => {
				try { return JSON.parse(x.message); }
				catch(e){ return; }
			})
			.filter(x => !!x);
	} catch(e){
		console.log(e);
		return { error: 'failed to read'}
	}
};

export default { write, read };