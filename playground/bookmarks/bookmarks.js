import { Grid } from 'https://cdn.skypack.dev/gridjs';
import { cachedFetch } from '../../.tools/misc.mjs';

const _fetch = cachedFetch({ seconds: 10*60 });
const fetchJSON = (url, opts={}) => _fetch(url, opts).then(x=>x.json());
const delMarksUrl = './del.icio.us.json';
const ghStarsUrl = (user) => `https://api.github.com/users/${user}/starred`;

const Link = ({title, tags, description, url, created}) => {
	return `
		<div class="link">
			<div><a href="${url}">${title}</a></div>
			<div class="desc">${description}</div>
			${ tags.join('').length > 0
				? `<div class="tags">${tags.join(' - ')}</div>`
				: ''
			}
			<div class="date">${created.toLocaleString()}
			</div>
		</div>
	`;
};
const ghStarsToLinks = (stars=[]) => stars.map(x => ({
	title: x.repo.full_name,
	url: x.repo.html_url,
	description: x.repo.description,
	tags: ['github_star'],
	created: new Date(x.starred_at)
}));
const delToLinks = (bookmarks) => bookmarks.map(x => {
	x.tags.push('DEL.ICIO.US');
	x.tags = x.tags.filter(x => !!x);
	x.created = new Date(x.created*1000)
	return x;
});

window.addEventListener('scroll', function() {
	const scroll = document.documentElement.scrollTop;
	sessionStorage.setItem("bookmarks-scroll", scroll);
});

(async () => {
	const ghStars = ghStarsToLinks(
		await fetchJSON(ghStarsUrl('crosshj'), {
			headers: {
				Accept: "application/vnd.github.v3.star+json"
			}
		})
	);
	const delMarks = delToLinks(
		await fetchJSON(delMarksUrl)
	);

	window.filt = [
		...ghStars,
		...delMarks,
	].filter(x => true);

	document.body.innerHTML += `
		<div class="container">
			${filt.map(Link).join('\n')}
		</div>
	`;
	const scroll = sessionStorage.getItem("bookmarks-scroll");
	document.documentElement.scrollTop = Number(scroll);
})();
