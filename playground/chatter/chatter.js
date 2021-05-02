/*

https://stackoverflow.com/questions/42256877/how-to-create-chat-bubbles-like-facebook-messenger

https://stackoverflow.com/questions/12297600/how-to-remove-default-chrome-style-for-select-input

https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp

https://stackoverflow.com/questions/16670931/hide-scroll-bar-but-while-still-being-able-to-scroll

https://www.w3schools.com/jsref/met_win_cleartimeout.asp

https://stackoverflow.com/questions/7687597/using-last-child-with-class-selector

https://www.codegrepper.com/code-examples/javascript/javascript+scroll+to+bottom+of+div

https://goquotes.docs.apiary.io/#reference/list-all-datas/apiv1allquotes

https://dmitripavlutin.com/javascript-fetch-async-await/

*/

const chatHistory = document.querySelector(".chat-history");
function addToChatHistory(msg, sender){
	const lastChat = chatHistory.querySelector('li:last-child');
	if(sender === 'bot' && lastChat.classList.contains('me')){
		lastChat.classList.add('curved');
	}
	const newChat = document.createElement('li');
	newChat.className = sender;
	newChat.textContent = msg;
	chatHistory.append(newChat);
	chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function quote(){
	const quotesUrl = 'https://goquotes-api.herokuapp.com/api/v1/random?count=1';
	const { quotes } = await (await fetch(quotesUrl)).json();
	return `${quotes[0].text}\n\n-- ${quotes[0].author}`;
}

let timer;
async function askBot(question){
	const botMsg = `I don't know the answer...`;
	const motivational = question.toLowerCase().includes('quote') && await quote();
	if(timer) clearTimeout(timer);
	timer = setTimeout(() => {
		addToChatHistory(motivational || botMsg, 'bot');
	}, 2000);
}

const input = document.querySelector(".input-box");
input.addEventListener("keyup", function(event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		addToChatHistory(input.value, 'me');
		askBot(input.value);
		input.value = '';
	}
});
input.focus();
