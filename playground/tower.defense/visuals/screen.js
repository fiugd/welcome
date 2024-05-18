function appendCSSRule() {
	const css = `
      .screen-info {
        color: #777;
        font-family: monospace;
        position: absolute;
        top: 10px;
        background: black;
        padding: 0.2em 1em;
        user-select: none;
      }
    `;

	const style = document.createElement('style');
	style.appendChild(document.createTextNode(css));
	document.head.appendChild(style);
}

appendCSSRule();

const screenInfo = document.createElement('div');
document.body.append(screenInfo);
const updateScreenInfo = () => {
	screenInfo.classList.add('screen-info');
	screenInfo.innerHTML = `${screen.width} x ${screen.height}`;
};
updateScreenInfo();
window.addEventListener('resize', updateScreenInfo);
