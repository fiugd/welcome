//show-preview
import { importCSS, prism, htmlToElement } from './.tools/misc.mjs';
import './shared.styl';

/*
see https://github.com/eligrey/FileSaver.js

TODO:
	onclick, save image as  "yt-thum-${ytTag}.jpg"
	get mp4 of video / watch video
	get suggestions for video
	add video to "watch later"
*/

function showThumbs(url){
	const ytTag = url.split('v=')[1];
	const maxResUrl = `https://i.ytimg.com/vi/${ytTag}/maxresdefault.jpg`;
	const imagesHTML = htmlToElement(`
		<img src="https://i.ytimg.com/vi/${ytTag}/maxresdefault.jpg">
	`);
	document.body.append(imagesHTML);
}

const ytVideoUrl = "https://www.youtube.com/watch?v=o791hgNvGIg";
showThumbs(ytVideoUrl);
