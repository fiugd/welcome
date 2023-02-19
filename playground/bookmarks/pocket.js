document.title = "Pocket Bookmarks";

const ListItem = ({ link, title, desc='', preview }) => {
	const element = document.createElement('div');
	element.classList.add('card');
	element.innerHTML= `
			<a href="${link}">
				<div class="preview" style="background-image:url('${preview}')"></div>
				<div class="info">
					<div class="title">${title}</div>
					<div class="description">${desc}</div>
				</div>
			</a>
	`.trim();
	return element;
};

const renderItems = (items) => {
	items.forEach(x => {
		document.body.append(ListItem(x));
	});
};

const getItems = (result) => {
	const { list } = result || {};
	if(!list) return [];

	return Object.entries(list)
		.sort((a,b) => Number(b[1].time_added) - Number(a[1].time_added))
		.map(([k,v]) => {
			//if(!v.resolved_title) console.log(v)
			return {
				title: v.resolved_title || v.given_title,
				link: v.given_url,
				desc: v.excerpt,
				preview: v.top_image_url || '',
			};
		});
};

const POST = (body) => ({
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(body)
});

const getAccessToken = async () => {
	const isReturning = window.location.search.includes('login=true');
	const REDIRECT_URI = document.location.href + "?login=true";

	if(!isReturning){
		const { result } = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:usa_ghAv:v1/PocketRequestToken', POST({
			"redirect_uri": REDIRECT_URI
		})).then(x => x.json());
		const REQUEST_TOKEN = result.split('=').pop();
		sessionStorage.setItem('POCKET_REQUEST_TOKEN', REQUEST_TOKEN);
		document.location = `https://getpocket.com/auth/authorize?request_token=${REQUEST_TOKEN}&redirect_uri=${REDIRECT_URI}`;
		return;
	}
	const REQUEST_TOKEN = sessionStorage.getItem('POCKET_REQUEST_TOKEN');
	const { result } = await fetch("https://x8ki-letl-twmt.n7.xano.io/api:usa_ghAv:v1/PocketAccessToken", POST({
		code: REQUEST_TOKEN
	})).then(x => x.json());
	const { access_token, username } = result.split('&')
		.reduce((a,o) => ({
			...a,
			[o.split('=').shift()]: o.split('=').pop()
		}), {});
	localStorage.setItem('POCKET_ACCESS_TOKEN', access_token);
	sessionStorage.removeItem('POCKET_REQUEST_TOKEN');
	window.history.pushState({}, document.title, "./pocket.html");
	return access_token;
};

(async () => {
	const access_token = localStorage.getItem('POCKET_ACCESS_TOKEN') || await getAccessToken();
	if(!access_token) return;

	const { result } = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:usa_ghAv:v1/PocketAPI', POST({
		args: {
			path: "v3/get",
			access_token,
			count: "20",
			detailType: "complete",
		},
	})).then(x => x.json());

	const items = getItems(result);
	renderItems(items);
})();