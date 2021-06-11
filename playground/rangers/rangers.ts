//show-preview

/*
	libraries for aggregating, reducing, manipulating data:

		http://nytimes.github.io/pourover/

		https://github.com/techfort/LokiJS

		https://github.com/crossfilter/universe
		https://github.com/crossfilter/crossfilter
		https://github.com/crossfilter/reductio
	
	visualization:
		https://dc-js.github.io/dc.js/

*/

import { consoleHelper } from '../../.tools/misc.mjs';
consoleHelper();

const deps = [
	'../../shared.styl',
	'https://www.unpkg.com/localforage@1.9.0/dist/localforage.min.js'
]; 

const proxy = 'https://api.allorigins.win/raw?url=';
const lericoAPIRoot = "https://rangers.lerico.net/api/";
const tometoUrl = 'https://vip.tometo.net/rank_list.php'

const sleep = ms => new Promise(r => setTimeout(r, ms));

const lericoResources = {
	pvps: "getPvps",
	guilds: "getGuilds",
	rangers: "getRangersBasics",
	skills: "getSkills",

	translate: "v2/translate?keys=" + [
			"en:ABILITY",
			"en:AREA",
			"en:COMMON",
			"en:CUSTOM",
			"en:CUSTOM_LAB",
			"en:CUSTOM_SHORTFORM",
			"en:CUSTOM_UPGRADE",
			"en:EQUIP",
			"en:ITEM",
			"en:PROPERTIES",
			"en:SKILL",
			"en:UNIT",

			"en:STAGE",
			"en:ADVENT_STAGE",
			"en:SPECIAL_STAGE",
		].join(','),
	materials: 'getMaterials',
	equipments: "v2/equipments",
	abilities: "v2/abilities",
	stagesAdvent: "v2/stages/advent",
	stagesNormal: "v2/stages/normal",
	stagesSpecial: "v2/stages/special"
};
window.lerico = lericoResources;

function getStorage(){
	const driverOrder = [
		localforage.INDEXEDDB,
		localforage.WEBSQL,
		localforage.LOCALSTORAGE,
	];
	const storage = localforage
		.createInstance({
				driver: driverOrder,
				name: 'rangers',
				version: 1.0,
				storeName: 'rankings', // Should be alphanumeric, with underscores.
				description: 'rankings info for line rangers'
		});
	return storage;
};

const groupRangerEvos = (rangers) => {
	return Object.entries(rangers.reduce((all, one) => {
		const { unitCode } = one;
		const match = unitCode.match(/(?<type>[a-z])(?<number>\d*)(?<evo>[a-z])/);
		if(!match){
			//console.log(one);
			return all;
		}
		const { type, number, evo } = match.groups;

		if(!(type && number)) return all;
		all[type+number] = all[type+number] || {};
		all[type+number][evo] = one;
		return all;
	}, {})).map(([unit, body]) => {
		const evoName = {
			h: ' [H]',
			u: ' [U]',
			e: ''
		};
		const generalProperty = body[Object.keys(body)[0]];
		const { unitElement, unitCategoryType, speedSkill, grade } = generalProperty;
		const ranger = {
			unitCode: unit,
			unitElement, unitCategoryType, speedSkill, grade,
			unitName: Object.keys(body).map(k=> `${body[k].unitName}${evoName[k]}`).join(', '),
			...body
		};
		if(Object.keys(body).some(k=> body[k].speedSkill)){
			ranger.skillName = Object.keys(body).map(k=> body[k].speedSkill && `${body[k].speedSkill.name} ${evoName[k]}`).join(', ')
		}
		return ranger;
	});
};

const hydrateRangers = (lerico) => {
	const { rangers, translate } = lerico;
	return rangers.map(r => {
		return {
			...r,
			unitName: lerico.translate['en:UNIT'][r.unitNameCode];
		}
	});
};

class Backup {
	constructor({ cache }={}){
		this.cache = cache;
		this.store = getStorage();
		this.controls = this.getControls();
		this.versionPopup = this.getVersionPopup();
		this.controls.addEventListener('click', this.clickHandler.bind(this));
	}
	getVersionPopup(){
		const popupDom = this.controls.querySelector('.version-popup');
		const popup = {
			hide: () => {
				popupDom.classList.remove('open');
				document.body.style.overflow = '';
			},
			show: () => {
				document.body.style.overflow = 'hidden';
				popupDom.classList.add('open');
			}
		};
		document.body.addEventListener('click', (event) => {
			if(this.controls.contains(event.target)) return;
			popup.hide();
		});
		return popup;
	}
	
	style = `<style>
		.storage-controls .version-popup {display:none;position:absolute;left:0;right:0;top:40px;}
		.storage-controls .version-popup.open {display:inline-block;}
		.storage-controls .version-popup button {margin-bottom:3px;background: #1d1d1d;}
		.storage-controls .version-popup button:hover,
		.storage-controls button:focus {background: #444;}
	</style>`
	
	getControls(){ return htmlToElement(`
		<div class="storage-controls">
			${this.style}
			<button data-id="refresh">Refresh</button>
			<div style="display: inline-block; position: relative;">
				<button data-id="restore" tabindex=0>Restore</button>
				<div class="version-popup">
					<button data-id="switch" tabindex=0>TODO: 2021-01-23</button>
					<button data-id="switch" tabindex=0>TODO: 2021-01-23</button>
					<button data-id="switch" tabindex=0>TODO: 2021-01-23</button>
					<button data-id="switch" tabindex=0>TODO: 2021-01-23</button>
				</div>
			</div>
		</div>
	`)}

	clickHandler(event){
		const handlers = {
			refresh: () => {
				console.log(`
				//make a backup
				//kill cache
				//refresh page
				`.replace(/				/g, ''));
			},
			restore: () => {
				this.versionPopup.show();
				console.log(`
				//read previous versions
				//show list 
				`.replace(/				/g, ''));
			},
			switch: () => {
				this.versionPopup.hide();
				console.log(`
				//switch cache
				//refresh page
				`.replace(/				/g, ''));
			}
		}
		const thisHandler = handlers[event.target.dataset.id]
		if(!thisHandler) return
		thisHandler(event);
	}
}

class CachedFetch {
	constructor(cacheName){
		return new Promise(async (resolve, reject) => {
			const cache = await caches.open(cacheName'rangersCache');
			resolve(this.fetch.bind({ cache }));
		});
	}

	async fetch(url){
		const cached = await this.cache.match(url);
		const headers = {};
		if(!cached) {
			let response;
			let tries = 0;
			const MAX_TRIES = 3;
			const DELAY_TRY = 1000;
			while(tries < MAX_TRIES && (!response || response.status !== 200)){
				await sleep(DELAY_TRY); tries++;
				response = await fetch(url, { headers });
			}
			if(response && response.status === 200){
				await this.cache.put(url, response);
			} else {
				return;
			}
		}
		const match = await caches.match(url);
		return match;
	}
}

class MostElements {
	analysis;
	constructor(rankings, rangers){
		this.analysis = this.parse(rankings, rangers);
		this.html = this.render.bind(this)();
	}
	parse(rankings, rangers){
		const rangersEvoGrouped = groupRangerEvos(rangers);
		/*
			the idea here
			rangers get 201 - teamRank points per usage
			sort by that rank descending
		*/
		const rankedUnits = {};
		for(var i=0, len=rankings.length; i<len; i++){
			const { rank, defense } = rankings[i];
			defense.forEach((unit, j) => {
				const match = unit.match(/(?<type>[a-z])(?<number>\d*)(?<evo>[a-z])/);
				if(!match) return;
				const { type, number, evo } = match.groups;
				rankedUnits[type+number] = rankedUnits[type+number] || 0;
				rankedUnits[type+number] += ((201 - rank)/17500)
			})
		}
		const rankedUnitsArray = Object.entries(rankedUnits)
			.map(([code, rank]) => ({ code, rank }))
			.sort((a,b) => b.rank - a.rank)
			.map(x => {
				const unit = rangersEvoGrouped.find(y => y.unitCode === x.code);
				return { ...unit, ...x}
			});
		/*
			each element gets points from rangers
			sort by those points descending
		*/
		const rankedElements = {};
		for(var i=0, len=rankedUnitsArray.length; i<len; i++){
			const { rank, unitElement } = rankedUnitsArray[i];
			if(rank<0.01) continue
			rankedElements[unitElement] = rankedElements[unitElement] || 0;
			rankedElements[unitElement] += rank;
		}
		const rankedElementsArray = Object.entries(rankedElements)
			.map(([element, points]) => ({ element, points }))
			.sort((a,b) => b.points - a.points)
			.map(x => {
				return x;
			});
		
		//console.log(JSON.stringify(rankedElementsArray, null, 2))
		//console.log(JSON.stringify(rankedUnitsArray[0], null, 2))
		//console.log(JSON.stringify(rangersEvoGrouped[221], null, 2))
		return {
			units: rankedUnitsArray,
			elements: rankedElementsArray
		}
	}
	render(){
		return htmlToElement(`<div>
			<h5>ELEMENTS</h5>
			<table>
			${this.analysis.elements.map(e => `
				<tr>
					<td>${e.element}</td>
					<td>${e.points.toFixed(2)}</td>
				</tr>
			`).join('')}
			</table>
			<h5>RANGERS</h5>
			<table>
			${this.analysis.units.filter(x=>x.rank>=0.01).map(e => `
				<tr>
					<td style="padding-right:0.5em;">${e.unitCode}</td>
					<td style="padding-right:2em;">${e.unitName.split(',')[0]}</td>
					<td style="min-width:5em;">${e.unitElement}</td>
					<td>${e.rank.toFixed(2)}</td>
				</tr>
			`).join('')}
			</table>
		</div>`.replace(/^		/g, ''));
	}
}

;(async () => {
	const cachedFetch = await (new CachedFetch('rangersCache'));

	async function scrapeHtml(url, query){
		const html = await (await cachedFetch(url)).text();
		var parser = new DOMParser();
		var doc = parser.parseFromString(html, 'text/html');
		return Array.from(doc.querySelectorAll(query));
	}

	const parseTometo = (rows) => {
		const parsedRows = rows.slice(3)
		.filter(x => !x.textContent.includes('Tometo.net Inc. All rights reserved.'))
		.map(x => {
			const nodes = Array.from(x.querySelectorAll('td'));
			const splitted = x.textContent.split(/\n/g).filter(y=>!!y.trim()).map(z=>z.trim())
			const [ rank, score, nameLevel, other ] = splitted;
			const [ name, level ] = (nameLevel||'').split('LV.');

			const more = nodes[nodes.length-1].innerHTML.trim().split('<br>').map(x => (x.split(':')[1]||"").trim())
			const [ specialFeathers, normalFeathers, coin, gem, friendship, maxStage, exp, gameId ] = more;

			const allPics = Array.from(x.querySelectorAll('img')).map(y => y.src)
			const [userPic, country, ...extra] = allPics;
			const defense = extra.map(y => y.split('/').pop().split('-thum.png')[0])
			return {
				rank, score, name, level, userPic, country, defense, maxStage
			};
		});

		return parsedRows;
	};

	const mostUsedRangers = (rankings) => {
		const used = {};

		const cheater = (x) => (
			x.maxStage!=='444' ||
			x.score === '1000'
		);
		const cheaters = rankings.filter(cheater);

		rankings
			.filter(x => !cheater(x))
			.forEach(user => {
			user.defense.forEach(y => {
				const { type, number, evo } = y.match(/(?<type>[a-z])(?<number>\d*)(?<evo>[a-z])/).groups;
				used[number] = used[number] || {};
				used[number][evo] = used[number][evo] || 0;
				used[number][evo]++;
				used[number].ranks = used[number].ranks || [];
				used[number].ranks.push(user.rank);
				used[number].teammates = used[number].teammates || {};
				user.defense.filter(t => t!==y).forEach(t => {
					used[number].teammates[t] = used[number].teammates[t] || 0;
					used[number].teammates[t]++;
				});
			});
		});
		
		console.error(`Rankings do not include ${cheaters.length} suspected cheaters!`)
		
		window.mostUsed = Object.entries(used)
			.map(([ranger, uses]) => ({ ranger, uses }))
			.map(x => {
				const add = (x, y) => (Number(x)||0) + (Number(y)||0);
				x.uses.total = [x.uses.h, x.uses.u, x.uses.e].reduce(add, 0);
				x.uses.teammates = Object.entries(x.uses.teammates)
					.map(([ranger, uses]) => ({ ranger, uses }))
					.sort((a,b) => b.uses - a.uses);
				return x;
			})
			.sort((a,b) => b.uses.total - a.uses.total);
		return mostUsed;
	};

	await appendUrls(deps);
	//await prism('javascript', '', 'prism-preload');
	
	//const backup = new Backup();
	//document.body.append(backup.controls);
	
	const query = 'body > table > tbody > tr';
	const tometo = await scrapeHtml(proxy + tometoUrl, query);
	const tometoParsed = parseTometo(tometo)


	const f = async (url) => (await cachedFetch(proxy + lericoAPIRoot + url)).json();
	const keys = Object.keys(lericoResources);
	for(var i=0, len=keys.length; i<len; i++){
		let data;
		try {
			data = await f(lericoResources[keys[i]])
		} catch(e){}
		lericoResources[keys[i]] = data;
	}

	const elements = new MostElements(tometoParsed, hydrateRangers(lericoResources));
	document.body.append(elements.html);
	//return;

	
	//guilds
	/*
	await prism("json", '//top guild\n'+ JSON.stringify(
		lericoResources.guilds.sort((a,b)=>b.exp-a.exp)[0]
	, null, 2));
	await prism("json", '//bottom-cutoff guild\n'+ JSON.stringify(
		lericoResources.guilds.sort((a,b)=>b.exp-a.exp)[999]
	, null, 2));
	*/
	

	//skills
	/*
	prism("json", '//one skill\n'+ JSON.stringify(
		lericoResources.skills[0]
	, null, 2));
	*/
	
	let trackProps = {
		skillType: new Set(),
		targetType: new Set(),
		buffFactorType: new Set(),
		factorType: new Set(),
		factorApplyType: new Set(),
		subFactorType: new Set(),
		subFactorApplyType: new Set(),
	};
	let allBuffTargets = new Set();
	lericoResources.skills.forEach(x => {
		Object.keys(trackProps).forEach(key => {
			trackProps[key].add(x[key]);
			x.subSkills.forEach(y => trackProps[key].add(y[key]));
		});
	});
	/*
	prism("json", '//shape of data\n'+ JSON.stringify(
		Object.keys(trackProps).reduce((all, key) => {
			all[key] = Array.from(trackProps[key])
			return all;
		}, {})
	, null, 2));
	*/
	
	
	const speedSkills = lericoResources.skills.filter(x => x.skillType === "BUFF" && x.buffFactorType === 'SPEED'
		|| x.subSkills.find(y => y.skillType === "BUFF" && y.buffFactorType === 'SPEED')
	);

	const rangersWithSpeedSkill = speedSkills.reduce((all, x) => {
		const found = lericoResources.rangers
			.filter(r => ([ r.skillCode, r.skillCode2, r.skillCode3 ].includes(x.skillCode));
		all = [...all, ...found.map(f => ({ ...f, speedSkill: x }))];
		return all;
	}, []);
	rangersWithSpeedSkill.forEach(r => {
		r.speedSkill.name = lerico.translate['en:SKILL'][r.speedSkill.nameCode];
		r.unitName = lerico.translate['en:UNIT'][r.unitNameCode];
	});

	const rangerStyle = htmlToElement(`
		<style>
			.ranger {
				background: #FFFFFF08;
				width: 100%;
				min-height: 2em;
				margin-bottom: .25em;
				padding: 0.1em 0.25em;
				position: relative;
				display: flex;
				font-size: 0.9em;
				font-family: system-ui;
			}
			.ranger > div {
				display: flex;
				flex-direction: column;
				justify-content: center;
			}
			.ranger .icon {
				min-width: 9.4em;
				flex-direction: row;
				justify-content: center;
			}
			.ranger .icon > div {
				min-width: 40px;
				text-align: center;
			}
			.ranger .icon div + div { margin-left: 5px; }
			.ranger img {
				width: auto;
				height: 2.8em;
				margin-bottom: unset;
			}
			.ranger .details {
				position: relative;
				flex: 1;
			}
			.ranger .unitCode { opacity: 0.4; }
			.ranger .unit-category {
				font-weight: bold;
				margin-left: 7px;
				font-size: 0.8em;
			}
			.ranger .element {
				width: 10px;
				height: 10px;
				margin-top: auto;
				margin-bottom: auto;
				border-radius: 50%;
				margin-left: 10px;
				margin-right: 15px;
				box-shadow: 0px 0px 0 1px #0d0d0d55, inset 0px 1px #ffffffa8;;
			}
			.ranger .element.fire { background: #9f1604; }
			.ranger .element.water { background: #0d48c5; }
			.ranger .element.tree { background: #1b6800; }
			.ranger .element.light { background: #8f8f66; }
			.ranger .element.dark { background: #240321; }

			.ranger-counts {
				display: inline-flex;
				background: #8883;
				height: auto;
				min-height: 7em;
				margin-top: .25em;
				flex-direction: column;
				justify-content: space-around;
				margin-right: 0.25em;
			}
			.ranger-counts .icon img {
				margin-bottom: 0;
				max-height: 4em;
				object-fit: contain;
			}
			.ranger-counts .icon {
				display: flex;
			}
			.ranger-counts .icon > div {
				min-width: 50%;
			}
			.common-pairings { width:100%; }
			.common-pairings .ranger-counts {
				height: 3em;
				min-height: 4.5em; width: 100%;justify-content: space-between;
			}
			.common-pairings .ranger-counts .icon {
				width: 10em
			}
			.common-pairings .ranger-counts img {
				margin: 0;
				height: 3em;
				object-fit: contain;
			}
			.common-pairings .ranger-counts .use-count {
				display: none;
			}
			.hidden { display: none; }
		</style>
	`);
	document.body.append(rangerStyle);
	//console.log(mostUsedRangers(tometoParsed));
	//console.log(lericoResources.rangers[0])
	window.mostUsed = mostUsedRangers(tometoParsed);
	const mostUsedDom = htmlToElement(` 
		<div style="margin-bottom:1em;">
			<div>Most Used Rangers</div>
			<div style="display: flex;flex-wrap: wrap;">
			${mostUsed.map(x => `
				<div class="ranger-counts" style="background: rgba(110,90,0,${(200-Math.min(...x.uses.ranks))/255});">
					<div class="icon most-used-icon" style="width:5em">
						${x.uses.e
							 ? (() => {
									const unitCodeSubStr = 'u'+x.ranger+'e';
									const unit = lericoResources.rangers.find(r => r.unitCode.includes(unitCodeSubStr));
									return `
				<div>
					<img src="${proxy}https://rangers.lerico.net/res/${unit.unitCode}/${unit.unitCode}-thum.png" alt="${unit.unitCode}">
					<div style="text-align: center;min-height:1.2em;" class="use-count">${(x.uses.h || x.uses.u) ? x.uses.e : ''}</div>
				</div>
							`})()
							: ''
						}
						${['h', 'u'].map(u => {
							const unitCodeSubStr = 'u'+x.ranger+u;
							const unit = lericoResources.rangers.find(r => r.unitCode.includes(unitCodeSubStr));
							if(!unit || !x.uses[u]) return `<pre class="hidden">${unitCodeSubStr}</pre>`;
							return `
				<div>
					<img src="${proxy}https://rangers.lerico.net/res/${unit.unitCode}/${unit.unitCode}-thum.png" alt="${unit.unitCode}">
					<div style="text-align: center;min-height:1.2em;" class="use-count">${([x.uses.h,x.uses.u,x.uses.e].filter(x=>x).length > 1) ? x.uses[u] : ''}</div>
				</div>
							`;
						}).join('\n')}
					</div>
					<div style="text-align: center;">${x.uses.total}</div>
				</div>
			`).join('')}
			<p></p>
</div>
		</div>
	`);
	document.body.append(mostUsedDom)

	window.mostUsedIcons = Array.from(document.querySelectorAll('.most-used-icon'))
	const mostCommonPairDom = htmlToElement(`<div class="common-pairings">
		<div>Most Common Pairings</div>
			${mostUsed.map((x, i) => `
				<div class="ranger-counts" style="flex-direction:row">
				<div style="display:flex;width:6em;margin-left:0;">
				${mostUsedIcons[i].innerHTML}
				</div>
				${x.uses.teammates.filter((x,i)=>i<8).map(y => `
					<div class="icon" style="display:flex; flex-direction: column;align-items:center">
					<img src="${proxy}https://rangers.lerico.net/res/${y.ranger}/${y.ranger}-thum.png"> ${(100*y.uses/x.uses.total).toFixed(2)}%
</div>
				`).join('\n')}</div>
			`).join('\n')}
		</div>
	`);
	document.body.append(mostCommonPairDom)

//await prism("json", '//one speed ranger\n'+ JSON.stringify(groupRangerEvos(rangersWithSpeedSkill)[0], null, 2));

const getSpeedSkill = (skill) => {
	if(skill.buffFactorType === 'SPEED') return skill;
	return skill.subSkills.find(x => x.buffFactorType === 'SPEED')
};

// a = unit, b = skill
function combineEffect(a, b) {
	//console.log(a);
	//console.log(b);
		var c = {};
		c.unitCode = a.unitCode,
		c.skillCode = b.skillCode,
		c.nameCode = b.nameCode,
		c.descriptionCode = b.descriptionCode,
		c.effectCode = (b.skillType + "-" + b.buffFactorType).replace("-NONE", ""),
		c.iconResourcePath = b.iconResourcePath,
		c.probability = b.probability,
		c.range = b.range,
		c.skillDelayTime = b.skillDelayTime,
		c.dynDuration = !1,
		c.dynFactor = !1,
		c.dispFactor = "",
		c.skillTargetConditionType = b.skillTargetConditionType;
		var d = {
				ADD: "+",
				SUB: "-",
				MUL: "*",
				DIV: "/"
		}
			, e = function(a, b, c) {
				switch (a) {
				case "ADD":
						return b + c;
				case "SUB":
						return b - c;
				case "MUL":
						return b * c;
				case "DIV":
						return b / c;
				case "NONE":
				case null:
						return b;
				default:
						return console.log("undefined operand", a),
						0
				}
		}
			, f = function(a, b, c) {
				return undefined;
				/*
				var d = angular.injector(["ng"]).get("$filter")("number");
				return -1 != ["BUFF-CHANGE_SPLASH", "CHANGE_ENEMY", "CHANGE_FIRE_WATER", "CHANGE_WATER_FIRE", "CHANGE_TREE_FIRE", "CHANGE_WATER_TREE", "KNOCKBACK", "MOVE_ENEMY1", "MOVE_ENEMY2", "POLYMORPH", "SCALE", "SILENCE", "STUN", "SUMMON", "SUMMON_ENEMY", "TEMPT", "UNBEAT"].indexOf(a) || 0 == a.indexOf("CLEAN") ? "-" : b ? "DYN" : -1 != ["BUFF-HP", "BUFF-VAMPIRE", "MIRROR_MAG", "MIRROR_PHY"].indexOf(a) ? d(100 * c, 0) + "%" : 0 == a.indexOf("BUFF-") ? -1 != ["BUFF-SKILLRANGE", "BUFF-SPEED"].indexOf(a) ? "+" + d(100 * (c - 1), 0) + "%" : -1 != ["BUFF-NORMAL_DEF", "BUFF-SPECIAL_DEF"].indexOf(a) ? "+" + d(c, 0) : "+" + d(100 * c, 0) + "%" : 0 == a.indexOf("DEBUFF-") ? -1 != ["DEBUFF-ATK", "DEBUFF-ATKSPD", "DEBUFF-SKILLRANGE", "DEBUFF-SPEED"].indexOf(a) ? "-" + d(100 * (1 - c), 0) + "%" : -1 != ["DEBUFF-NORMAL_DEF", "DEBUFF-SPECIAL_DEF"].indexOf(a) ? "-" + d(c, 0) : "-" + d(100 * c, 0) + "%" : -1 != ["DMG", "DOT", "DOTHEAL", "HEAL"].indexOf(a) ? d(100 * c, 0) + "%" : (console.log("unknown factor type for skillEffect", a),
				Math.round(1e3 * c) / 1e3)
				*/
		}
			, g = function(a, b, c) {
				return -1 != ["CHANGE_ENEMY", "DMG", "HEAL", "KNOCKBACK", "MOVE_ENEMY2"].indexOf(a) || 0 == a.indexOf("CLEAN_") ? "-" : b ? "DYN" : Math.round(1e3 * c) / 1e3
		};
	//debugger
		switch (b.factorType) {
		case "ATTACK":
		case "HP":
				c.factor = b.factor;
				break;
		case "GRADE":
				c.factor = e(b.factorApplyType, a.grade, b.factor);
				break;
		case "LEVEL":
				c.dynFactor = !0,
				c.dynFactorField = b.factorType,
				c.dynFactorEffector = d[b.factorApplyType] + (b.factor > 10 ? b.factor.toFixed(0) : 100 * parseFloat(b.factor.toPrecision(4)) + "%");
				break;
		case "NONE":
				c.factor = 0;
				break;
		default:
				console.log("undefined factorType", b.factorType),
				c.factor = 0
		}
		switch (c.dispFactor = f(c.effectCode, c.dynFactor, c.factor),
		b.subFactorType) {
		case "NONE":
				c.duration = e(b.subFactorApplyType, 0, b.subFactor);
				break;
		case "GRADE":
				c.duration = e(b.subFactorApplyType, a.grade, b.subFactor);
				break;
		case "LEVEL":
				c.dynDuration = !0,
				c.dynDurationField = b.subFactorType,
				c.dynDurationEffector = d[b.subFactorApplyType] + parseFloat(b.subFactor.toPrecision(3));
				break;
		default:
				console.log("undefined subFactorType", b.subFactorType),
				c.duration = 0
		}
		return c.dispDuration = g(c.effectCode, c.dynDuration, c.duration),
		c
}

const poboCombine = (factor, type, grade) => {
	if(type === 'ADD') return grade + factor;
	return grade - factor;
}

const foundUnit = groupRangerEvos(rangersWithSpeedSkill).find(x => x.unitName.includes('Ais'));
const effectCombined = combineEffect(foundUnit.u, getSpeedSkill(foundUnit.speedSkill));
//await prism("json", '//foundUnit\n'+ JSON.stringify(foundUnit, null, 2));
//await prism("json", '//combineEffect\n'+ JSON.stringify(effectCombined, null, 2));

//combineEffect(a, b)

	groupRangerEvos(rangersWithSpeedSkill)
		//.map(x => `${x.e ? x.e.unitName : x.unitName} - - - ${x.skillName}`)
		.filter(x => x.u || x.h)
		.sort((a,b) => Number(a.unitCode.slice(1)) < 2000 && Number(b.unitCode.slice(1)) < 2000
			? Number(b.unitCode.slice(1)) - Number(a.unitCode.slice(1))
			: Number(a.unitCode.slice(1)) - Number(b.unitCode.slice(1))
		)
		.forEach(x => {
			const speed = getSpeedSkill(x.speedSkill);
			const factor = poboCombine(speed.factor, speed.factorApplyType, x.grade);
			const dur = poboCombine(speed.subFactor, speed.subFactorApplyType, x.grade);
			const el = htmlToElement(`
				<div class="ranger">
					<div class="icon">
					${[x.e,x.h,x.u].filter(x=>!!x).map(u => `
						<div>
						<img src="${proxy}https://rangers.lerico.net/res/${u.unitCode}/${u.unitCode}-thum.png">
						</div>
					`).join('\n')}
					</div>
					<div class="unit-category">${x.unitCategoryType}</div>
					<div class="element ${x.unitElement}"></div>
					<div class="details">
						<div>NAME: ${x.e ? x.e.unitName : x.unitName}, SKILL: ${x.skillName}</div>
						<div>RANGE: ${speed.range}, FACTOR: ${((factor-1)*100).toFixed(0)}%, DUR: ${dur}s, PROB: ${(100 * speed.probability).toFixed(0)}%, CD: ${speed.skillDelayTime}s</div>
					</div>
					<div class="unitCode">${x.unitCode}</div>
				</div>
			`);
			document.body.append(el);
		})


	/*

	what are the things that make OP rangers OP?
		
		skills
		gears
		stats
			- HP
			- Cost
			- Attack
			- Defense
			- Move Speed
			- ... etc (see skills)

	*/

})();
