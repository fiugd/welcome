import './scroll-pos.js';
import Cache from './cache.js';
import Parser from './parser.js';

//import rssParser from 'https://cdn.skypack.dev/rss-parser';
//console.log(rssParser)
const CORS_PROXY = 'https://x8ki-letl-twmt.n7.xano.io/api:DctopIEQ/proxy?url='

const showError = (e) => {
	const errorsDiv = document.querySelector('.errors');
	console.log(e);
	const errorPre = document.createElement('pre');
	errorPre.innerHTML = e.stack;
	errorsDiv.querySelector('.items').append(errorPre);
	errorsDiv.classList.remove('hidden');
};

const cachedFetch = (url) => Cache({
	key: url,
	fn: async (url) => {
		const res = await fetch(url).then(x => x.text());
		let unescaped = '';
		try {
			if(res.includes("\\u003"))
				unescaped = JSON.parse(res.toString());
			unescaped = decodeURIComponent(unescaped || JSON.parse(res));
		} catch(e){
			showError(e);
		}
		return JSON.stringify(unescaped);
	}
});

const parseURL = async (url) => {
	const res = await cachedFetch(url);
	if(!res) return {};
	const parsed = Parser.parseString(JSON.parse(res));
	//const parsed = Parser.parseJSON(res);
	//console.log({parsed});
	return parsed;
};

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const Notes = () => `
<pre class="notes">
	THE POINT OF THIS:
	I'd like to read/track news my way

	That means:
	- stored where I want and how I want
	- bubble: there are some things I just don't want to think about
	- alerts: some things I don't want to miss
	- search: retrieve what I stored via search
	- discover: on searched and saved items

	TODO:
	- saving to pocket is a blinding flash of light
	- saving to pocket requires pocket login (elsewhere in browser)

</pre>
<a class="notes" href="https://hnrss.github.io/">HN RSS feeds</a>
`;




const FeedItem = (item, className='') => {
	if(!item) return;
	const { title, link, content, comments, categories=[] } = item;

	const contentMap = (line) => {
		line = line.replace(/<p>|<\/p>/g, '');
		if(line.includes('# Comments')){
			const numb = line.replace('# Comments: ','');
			//if(!Number(numb)) return '';
			line = `<a class="comments" href="${comments}">${numb} comments</a>`;
		}
		if(line.includes('Points')){
			const numb = line.replace('Points: ','');
			line = `${numb} points`;
		}
		return `<span>${line}</span>`;
	};
	let _content = content
		? content.split('\n')
			.filter(c => c.includes('oints') || c.includes('# Comments'))
			.map(contentMap)
			.filter(x=>!!x)
			.join('\n')
		: '';
	const isTitle = ['Hacker News: Front Page', 'Hacker News', 'Lobsters'].includes(title);
	if(!isTitle && !_content.includes('comments')){
		_content += `<span>- points</span><span><a class="comments" href="${comments}">- comments</a></span>`
	}
	document.body.innerHTML += `
		<div class="feed-item ${className}">
			<div class="flex-col feed-title">
				<a href="${link}">${title}</a>
				<div class="categories">
					${ categories.map(x => `<span>${x}</span>`).join('\n')}
				</div>
			</div>
			<div class="content">
			${_content && false ? (_content.split('</span>')[0]+'</span>') : ''}
			${ !isTitle
				? `<span>
						<a href="https://widgets.getpocket.com/v1/popup?url=${link}" target="popup">add to pocket</a>
					</span>`
				: ''
			}
			${_content ? (_content.split('</span>').slice(1).join('</span>')) : ''}
			</div>
		</div>`;
};

const HNFeedItem = (item, className='') => {
	//console.log(item)
	return FeedItem(item, className);
};

const LobsFeedItem = (item, className='') => {
	// console.log(item)
	return FeedItem(item, className);
};

const dedupe = (feeds) => {
	const dupeFilter = (index) => (item) => {
		let found = false;
		for(const i in feeds){
			if(i === index) continue;
			const { feed: target={} } = feeds[i];
			if(!(target.items||[]).find(x => x.title === item.title)) continue;
			found = true;
			break;
		}
		return !found;
	};
	for(const i in feeds){
		const { feed: f={} } = feeds[i];
		f.items = (f.items||[]).filter(dupeFilter(i));
	}
	return feeds;
};

const reOrder = (feeds) => {
	const [HN, HNRSS, Lobs] = feeds;
	return [HNRSS, HN, Lobs]
}

(async () => {
	const feeds = [{
		url: CORS_PROXY+"https://news.ycombinator.com/rss",
		parse: HNFeedItem,
	}, {
		url: CORS_PROXY+"https://hnrss.org/frontpage",
		parse: FeedItem,
	},{
		url: CORS_PROXY+"https://lobste.rs/rss",
		parse: LobsFeedItem
	}];

	for(const f of feeds){
		try {
			f.feed = await parseURL(f.url);
		} catch(e){
			showError(e);
		}
	}

	let processedFeeds = [];
	try {
		const process = pipe(dedupe, reOrder);
		processedFeeds = process(feeds);
	} catch(e){
		showError(e);
	}

	for(const {feed={}, parse} of processedFeeds){
		try {
			parse(feed, 'title');
			(feed.items||[]).forEach(FeedItem);
		} catch(e){
			showError(e);
		}
	}

	document.body.innerHTML += Notes();

	document.body.dispatchEvent(new CustomEvent("RSSdone", { bubbles: true }));
	
	const errorsDiv = document.querySelector('.errors');
	const resetButton = document.createElement('button');
	resetButton.innerHTML = `Reset`;
	resetButton.onclick = () => {
		for(const {url} of feeds){
			sessionStorage.removeItem(url);
		}
	};
	errorsDiv.querySelector('.items').append(resetButton);

})();
