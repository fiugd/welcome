import SimplePeer from 'https://cdn.skypack.dev/simple-peer/simplepeer.min.js';
import Store from './store.js';

const form = document.querySelector('form');
const incoming = document.querySelector('#incoming');
const outgoing = document.querySelector('#outgoing');
const logEl = document.querySelector('#log');
const role = document.querySelector('#role');
const roleLabel = document.querySelector('.role-label');
const outCopy = document.querySelector('#outgoing-copy');
const outPaste = document.querySelector('#outgoing-paste');
const chatSend = document.querySelector('#chat-send');

let answer;
let offer;
const refreshStore = async () => {
	const stored = await Store.read();
	offer = stored.filter(({type}) => type === 'offer').pop();
	answer = stored.filter(({type}) => type === 'answer').pop()
};

let ready = false;
let isClient = !(localStorage.getItem('webrtc-host') || false);
if(!isClient){
	roleLabel.textContent = 'host';
	role.checked = true;
}

const log = (...args) => logEl.textContent += args + '\n';
const sleep = ms => new Promise(r => setTimeout(r, ms));

role.addEventListener("change", (e) => {
	if(isClient){
		localStorage.setItem('webrtc-host', true);
	} else {
		localStorage.removeItem('webrtc-host');
	}
	window.location.href = '';
});

const p = new SimplePeer({
	initiator: !isClient,
	trickle: false
})

p.on('error', err => log('error', err))

p.on('signal', data => {
	outgoing.textContent = JSON.stringify(data)
});

p.on('connect', () => {
	logEl.textContent = '';
	log('CONNECTED\n');
	ready = true;
	incoming.style.display = ''
	chatSend.style.display = '';
});

p.on('data', data => {
	log('THEM: ' + data)
});

form.addEventListener('submit', ev => {
	ev.preventDefault();
	if(!incoming.value.trim()) return;
	try {
		const i = JSON.parse(incoming.value);
		p.signal(i)
	} catch(e){
		if(!ready) return log('not connected');
		p.send(incoming.value.trim());
		log(' YOU: ' + incoming.value.trim());
		incoming.value = '';
	}
});

let clipPermissions;
const checkClip = () => {
	if(typeof clipPermissions !== "undefined")
		return clipPermissions;
	navigator.permissions.query({name: "clipboard-write"})
		.then(result => {
			clipPermissions = result.state == "granted" || result.state == "prompt";
		});
};
checkClip();

outCopy.addEventListener('click', (e) => {
	e.preventDefault();
	if(!checkClip()) return;
	const newClip = outgoing.textContent;
	navigator.clipboard.writeText(newClip);
	if(!isClient){
		outCopy.style.display = 'none';
		outPaste.style.display = '';
		logEl.textContent = '';
		log('now give token to client and paste their answer')
		Store.write(newClip);
	}
});
outPaste.addEventListener('click', async (e) => {
	e.preventDefault();
	try {
		await refreshStore();
		const clientHasOffer = isClient && offer;
		const hostHasAnswer = !isClient && answer;
		if(clientHasOffer){
			p.signal(offer);
			console.log(offer);
		}
		if(hostHasAnswer){
			p.signal(answer);
			console.log(answer);
		}
		if(!hostHasAnswer && !clientHasOffer){
			const clipText = await navigator.clipboard.readText();
			const i = JSON.parse(clipText);
			p.signal(i);
		}
		if(isClient){
			outPaste.style.display = 'none';
			await sleep(500);
			const answer = outgoing.textContent;
			if(clientHasOffer){
				Store.write(answer);
			} else {
				navigator.clipboard.writeText(answer);
			}
			logEl.textContent = '';
			log('your token/answer copied to clipboard - share with host');
		}
		if(!isClient){
			outPaste.style.display = 'none';
		}
	} catch(e){
		log(e.message)
	}
});

if(isClient){
	log('clip "paste" to add a token from a host');
	outCopy.style.display = 'none';
}
if(!isClient && answer){
	log('click "copy" to extend an offer');
	log('click "paste" to accept client answer');
	//outCopy.style.display = 'none';
}


console.log(await Store.read())