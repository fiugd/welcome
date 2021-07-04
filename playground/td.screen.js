const screenInfo = document.createElement('div');
screenInfo.classList.add('screen-info');
screenInfo.innerHTML = `${screen.width} x ${screen.height}`;
document.body.append(screenInfo);