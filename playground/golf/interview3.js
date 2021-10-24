/*
TS version at https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAIgBYxmAzgLgPTYK4B2YA1gOYB0AxhCNgFboBewYAAgMzkCM5ArNgBNg6GPSYtyIYAXIMEAbgBQi6gRFxmYADIRKAQxjAIBOAF44AcnLY96ALTUhBUnYCmAD1dRKw13YA2EKTo5JoWSorSMF4AZnqUrnAAUgDKAFoscADeigCQBK4A7nAAFACUcJjJ6SxKuYF6AgCC6ACeBJRVAGKElIbGigC+igKulP56UIkAbpPVGWBVqQsRMK1giV3A-onmOfl6IK5VIlDSpHlTjd29-QRDimsbcDqkAKIEMFCtZtl5wAITl9znlXCA9NsgWdnHkjuh0HpSMc4KcQcMnolXr99gCoSD6kEsC8gh8vq0ANoAXQeGLgABU9P5-K06RAYIzsaDwZCUcCYXBcjA2YyqgQ8CAAEZeGnrRIMpk-PZ5QLBAD6uN50IugsZzKq8uZrPZ-ipMueAHFAhLGUbGehOXBHXByWCIf48c5KaLxVKoGbEpaINb-JzBVB4sQbh07nkhcaieUzAA+OCB4O2-zoB4qYzqcFgX4lGIEKp6AitCqmFO2dqUUqTKCl8tUysp-aqdS635UuoxaAlHbwYyJCAxOANsr7XK68hgPDoJAlPSFCHwYslYdlMp1Ya5KYwPBQEy6pSDCId+BgFi7UrkO-FollimU1vjtodUruJsV5N-equIc8Hgcx3F7ftBzgYdILHB9JzyXIICA35l1XSCCg3IDtzyXd90PExEJgU9z1zeAFmQ986wHXQDCMEtNXOMoqgABSgGhfAAHifFMqz-C84CRGAFgAYWMaJPkLQ93Xo5xXxiADKEXSSynIGAkFcAgSncX93HICUrXKLDcj41QxOA8cV2AeABOE0T1JgKj9DuQy+M0ZCLPgApimWFhynIBpmgokoTLswzcKPDRaiGYi1HgAARYApj6aBWi0YQzJrD8HJo4wPVIRi4BYtj0Fcdith2KluLbPIXMycwUMsuAFiypy6j4rtzB7PI+ygAcALgGJtnUw4RzHAB5CU6DGGByGIVxWnQEpNHIAadnQLcp2AGISgAQhWoajnIdSBHQAB1SzFysBhjAsLc4BM6Q8FcOppyZWd50XKcDiOKo9oIYaABp4L3Vxrk-XLXyWvbNOUjLKBKCxUWcG74MGQycIAvDxyZIjlD4rE6oo0o9u6Qb8sKqRivY15SW+Sq-zCkxUlGgA5WdJmKpd3P6wbyCuAQix5v6ji3HGcxi+ldUVUosjgAF-rgFV0FMKk4EGSpiTy-VJd-Ep9kV9VAVlgRAZ1BUqnGya+kOz4zlcBbFfg3nXAEPAEhKJcmSqGWXW5KTEdIL0JYVDNVflmXXW2VWqmpm2fx4z7dR9t1KWQpkk+2FOAB9M+yOAI-8eW4xFOAAAZVeel6TXzykVOFfwAGp64rhmsf8Z7BjD1G8mU-N3fJf7phfX9pjKIYsLF9Q02LqeQ3Md3X3bEi4CLzMqhnjN7T2M9Lgx8KpxXhN8vXuvN5TA+TbDCMqhKY09SD5l8oNRUqtyV-upKWYoFz-PC7r1XoOXpLFSks4Kv1fgfdO-gU7mAgdXOA2dS4V0FCfSBKd64wLrhXXcr8W631aO3bCp4yjlGiuoKY6A8D+BgJvcyqErwbBKHkeKiUhTfFSiIE2vdXhlE4XoMAJQn48NhHwkoM8VLhkoMQUexDNA6EcrRUeE8IA7D8kEEoTNWb+02q0URVpGS13jOUeWYomTywAExbkUEAA

*/

import "https://unpkg.com/jszip@3.1.5/dist/jszip.min.js";

const zipLocation = './as-coding-exercise-logs.zip'

const map = (fn) => async (arr) => {
	const all = [];
	for(let one of arr){
		all.push(await fn(one));
	}
	return all;
};

const pipe = (...fns) => async (x) => {
	let out = x;
	for(let one of fns){
		out = await one(out);
	}
	return out;
};

const Zip = async (location) => {
	const getZipContent = url => fetch(url).then(x => x.blob());
	const content = await getZipContent(location);
	const zip = await new JSZip().loadAsync(content);
	return zip;
};

const DirectoryList = async (location) => {
	const zip = await Zip(location);
	const all = [];
	for(let filename of Object.keys(zip.files)){
		if(!filename.endsWith('.json')) continue;
		all.push({
			name: filename,
			read: (x) => zip.file(x).async('string')
		});
	}
	return all;
};

const Log = async ({ name, read }) => {
	return JSON.parse(await read(name));
};

const Tally = ({ id, logs=[] }) => ({
	logs_id: id,
	tally: Object.entries(
		logs.reduce((all, one) => {
			const { id, email, message } = one;
			all[email] = all[email] || { email, total: 0 };
			all[email].total++;
			return all;
		}, {})
	).map(([k,v]) => v)
});

const Global = (() => {
	const totals = {};
	return {
		totals: () => totals,
		track: (tally) => {
			for(var { email, total } of tally.tally){
				totals[email] = totals[email] || 0;
				totals[email] += total;
			}
			return tally;
		}
	};
})();

const results = await pipe(
	DirectoryList,
	map(Log),
	map(Tally),
	map(Global.track)
)(zipLocation)

console.log(JSON.stringify(Global.totals(), null, 2))
