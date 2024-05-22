/*
also see: https://www.kaggle.com/vishalsubbiah/pokemon-images-and-types?select=pokemon.csv
- https://www.kaggle.com/vishalsubbiah/pokemon-images-and-types/download/4ocbGRjoCrLyviBwrIMR%2Fversions%2FubVz4l5HZPsv3u2s65yv%2Ffiles%2Fpokemon.csv?datasetVersionNumber=3

also see: https://pokeapi.co/

*/

export { random } from 'https://cdn.skypack.dev/lodash';;

const POKE_SEARCH_STRING = 'curs';

import Papa from 'https://cdn.skypack.dev/papaparse';
import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes@5';

// const pokedexUrl = 'https://raw.githubusercontent.com/crosshj/data/main/pokedex.csv';
// const pokeSpeciesUrl = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon_species.csv';
const pokedexUrl = 'https://datamosh.vercel.app/api?path=pokedex.csv';
const pokeSpeciesUrl = 'https://datamosh.vercel.app/api?path=pokemon_species.csv';


const getFromCsvUrl = async (url) => {
	const csvText = await fetch(url).then(x => x.text());
	const parsed = Papa.parse(csvText, {
		header: true
	});
	return parsed;
};

const imageLink = (name) => `https://ddg.gg/?q=${name}&ia=images`;

const dex = await getFromCsvUrl(pokedexUrl);
const species = await getFromCsvUrl(pokeSpeciesUrl);

const dexByNumber = {};
for(var i=0, len=species.data.length; i<len; i++){
	const poke = species.data[i];
	dexByNumber[poke.id] = poke;
}

for(var i=0, len=Object.keys(dexByNumber).length; i<len; i++){
	const poke = dexByNumber[Object.keys(dexByNumber)[i]];
	if(!poke.evolves_from_species_id) continue;

	if(!dexByNumber[poke.evolves_from_species_id]){
		console.log(poke.evolves_from_species_id);
		continue;
	}
	dexByNumber[poke.evolves_from_species_id].evolves_to_species_id = poke.id;
}

const getEvoTree = (found) => {
	if(found.evolves_to_species_id && !found.evolves_from_species_id){
		found = dexByNumber[found.evolves_to_species_id]
	}
	if(found.evolves_from_species_id && !found.evolves_to_species_id){
		found = dexByNumber[found.evolves_from_species_id]
	}

	const it = {
		from: (dexByNumber[found.evolves_from_species_id] || {}).identifier,
		name: found.identifier,
		to: (dexByNumber[found.evolves_to_species_id] || {}).identifier,
		raw: {
			from: dexByNumber[found.evolves_from_species_id] || {},
			base: found || {},
			to: dexByNumber[found.evolves_to_species_id] || {},
		}
	};

	return it;
};

const findPokemonByNumber = (number) => {
	const found = dexByNumber[number] || {};
	return found;
};

const findPokemonByName = (name) => {
	let found = Object.keys(dexByNumber)
		.find(x => dexByNumber[x]?.identifier?.includes(name));
	found = dexByNumber[found]
	return found;
};

const findPokemon = (query) => {
	const isNumber = (Number(query)+'').trim() === (query+'').trim();
	const found = isNumber
		? findPokemonByNumber(query)
		: findPokemonByName(query);
	if(!found) return { error: `did not find: ${name}` };
	return getEvoTree(found);
}

if(typeof window === "undefined"){
	const {clearScreen, cursorHide} = ansiEscapes;
	console.log(clearScreen+cursorHide);
	const it = findPokemon(POKE_SEARCH_STRING);

	if(it.from) it.from = imageLink(it.from);
	if(it.to) it.to = imageLink(it.to);
	it.name = imageLink(it.name)
	delete it.raw;

	console.log(JSON.stringify(it, null, 2));
}

export { findPokemon };