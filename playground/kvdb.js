/*
alternative to kvdb.io:
	https://docs.thisdb.com/#introduction
	https://github.com/orbitdb/orbit-db
*/
import localforage from 'https://cdn.skypack.dev/localforage';
import KVdb from 'https://cdn.skypack.dev/kvdb.io';

import { importCSS, consoleHelper } from '../.tools/misc.mjs'
import '../shared.styl';
consoleHelper();

const store_bucket_id = 'Kvtwv91ETDbX8W8gSNNH1W';

const getStore = async (bucketId) => {
	KVdb.installLocalForageDriver(localforage)
	const store = localforage.createInstance();
	store.config({ bucket: KVdb.bucket(bucketId)})
	await store.setDriver([KVdb.LOCALFORAGE_DRIVER])
	return store;
};

const myapp = async (bucketId) => {
	const store = await getStore(bucketId);

	await store.setItem('foo', { testing: 'object' });
	const val = await store.getItem('foo');

	console.log(JSON.stringify(val,null,2));
};

myapp(store_bucket_id)