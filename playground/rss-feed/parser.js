function buildRSS1(parser, xmlObj) {
	xmlObj = xmlObj['rdf:RDF'];
	let channel = xmlObj?.channel?.[0] || xmlObj?.rss?.[0]?.channel?.[0];
	let items = xmlObj.item;
	return parser.buildRSS(channel, items);
}

function buildRSS2(parser, xmlObj) {
	let channel = xmlObj?.channel?.[0] || xmlObj?.rss?.[0]?.[0]?.channel;
	let items = channel.item || channel.value;
	let feed = parser.buildRSS(channel, items);
	if (xmlObj.rss.$ && xmlObj.rss.$['xmlns:itunes']) {
		parser.decorateItunes(feed, channel);
	}
	return feed;
}

const parseJSON = (parser, jsonRSS) => {
	const source = typeof jsonRSS === "string"
		? jsonRSS
		: JSON.stringify(jsonRSS);
	const r = JSON.parse(
		source.replace(/"@attributes"/g, '"$"')
			.replace(/"value"/g, '"0"')
	);

	console.log(r)
	if (!r)
		return new Error('Unable to parse JSON RSS.');

	if (r.feed)
		return parser.buildAtomFeed(r);

	if (r?.rss?.$?.version.match(/^2/))
		return buildRSS2(parser, r);

	if (r['rdf:RDF'])
		return buildRSS1(parser, r);

	if (r?.rss?.$?.version?.match(/0\.9/))
		return parser.buildRSS0_9(r);

	if (r.rss && parser.options.defaultRSS) {
		let feed;
		switch(parser.options.defaultRSS) {
			case 0.9:
				feed = parser.buildRSS0_9(r);
				break;
			case 1:
				feed = parser.buildRSS1(r);
				break;
			case 2:
				feed = parser.buildRSS2(r);
				break;
			default:
				return new Error("default RSS version not recognized.");
		}
		return feed;
	}

	return new Error("Feed not recognized as RSS 1 or 2.");
};

const parser = new RSSParser();
parser.parseJSON = (jsonRSS) => parseJSON(parser, jsonRSS);

export default parser;
