const mainCss = `
	#menu {
		color: #c6ffec;
		background: rgb(67 154 179);
		font-family: 'Orbitron', sans-serif;
		font-size: 3em;
	}
	#menu li:hover {
		color: white;
		background: rgb(26 16 2 /30%);
	}
	#menu-cover {
		width: 100vw;
		height: 100vh;
		position: absolute;
		left: 0;
		top: 0;
		opacity: 0;
		visibility: hidden;
		background: #000;
		transition: opacity .2s;
	}
	#menu-cover.open {
		opacity: 0.4;
		visibility: visible;
	}
`;

const menuCss = `
	#navigation-menu {
		width: 300px;
		height: 100vh;
		background: inherit;
		position: absolute;
		top: 0;
		z-index: 0;
		left: -300px;
		transition: left 0.3s ease-in;
		box-shadow: 0px 0px 5px black;
	}
	#navigation-menu.open {
		left: 0;
		transition: left .2s ease-in;
	}
	#navigation-menu ul {
		list-style: none;
		padding-left: 0;
		margin-top: 60px;
	}
	#navigation-menu li {
		padding: 0.2em;
		padding-left: 20px;
	}
	#navigation-menu li {
		cursor: pointer;
	}
`;

const cssNew = `
	#hamburger-wrapper {
		display: flex;
		align-items: center;
		width: 50px;
		height: 50px;
		margin: 0;
		padding: 0;
		position: absolute;
		left: 7px;
		top: 3px;
		z-index: 1;
	}
	.ham {
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: transform 400ms;
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.line {
		fill:none;
		transition:
			stroke-dasharray 300ms,
			stroke-dashoffset 300ms;
		stroke: currentColor;
		stroke-width: 6;
		stroke-linecap:square;
	}
	.ham2 .top,
	.ham2 .bottom {
		stroke-dasharray: 40 121;
	}
	.ham2.active .top,
	.ham2.active .bottom {
		stroke-dashoffset: -102px;
	}
`;

const createMain = () => {
	let onToggle;
	const main = document.createElement('div');
	main.id = 'menu';
	main.innerHTML = `
	<style>${mainCss}</style>
	<div id="menu-cover"></div>
	`;
	const cover = main.querySelector('#menu-cover');
	main.toggle = () => {
		cover.classList.toggle('open');
	};
	cover.addEventListener("click", () => {
		onToggle && onToggle();
	});
	main.attachToggle = (fn) => {
		onToggle = fn;
	};
	document.body.append(main);
	return main;
};

const createIcon = (main) => {
	//https://uxdesign.cc/the-menu-210bec7ad80c
	let onToggle;
	const wrapper = document.createElement('div');
	wrapper.id = 'hamburger-wrapper';
	wrapper.innerHTML = `
		<style>${cssNew}</style>
		<svg class="ham ham2" viewBox="0 0 100 100" width="100%" onclick="this.classList.toggle('active')">
			<path class="line top" d="m 70,33 h -40 c -6.5909,0 -7.763966,-4.501509 -7.763966,-7.511428 0,-4.721448 3.376452,-9.583771 13.876919,-9.583771 14.786182,0 11.409257,14.896182 9.596449,21.970818 -1.812808,7.074636 -15.709402,12.124381 -15.709402,12.124381"></path>
			<path class="line middle" d="m 30,50 h 40"></path>
			<path class="line bottom" d="m 70,67 h -40 c -6.5909,0 -7.763966,4.501509 -7.763966,7.511428 0,4.721448 3.376452,9.583771 13.876919,9.583771 14.786182,0 11.409257,-14.896182 9.596449,-21.970818 -1.812808,-7.074636 -15.709402,-12.124381 -15.709402,-12.124381"></path>
		</svg>
	`;
	const svg = wrapper.querySelector('svg');
	wrapper.toggle = () => {
		svg.classList.toggle('active');
	};
	wrapper.addEventListener("click", () => {
		wrapper.classList.toggle("open");
		onToggle && onToggle();
	});
	main.append(wrapper);

	wrapper.attachToggle = (fn) => {
		onToggle = fn;
	};

	return wrapper;
};

const createMenu = (main, items, icon) => {
	const menu = document.createElement('div');
	menu.id = 'navigation-menu';
	//menu.classList.add('open')
	menu.innerHTML = `
		<style>${menuCss}</style>
		<ul>
		${items.map((i) => {
			return `
				<li>${i.name}</li>
			`
		}).join('\n')}
		</ul>
	`;
	menu.toggle = () => {
		main.toggle();
		menu.classList.toggle("open")
	};
	Array.from(menu.querySelectorAll('a')).forEach((link, i) => {
		link.onclick = (e) => false;
	});
	Array.from(menu.querySelectorAll('li')).forEach((link, i) => {
		link.onclick = (e) => {
			icon.toggle && icon.toggle();
			menu.toggle();
			items[i].click && items[i].click(e);
			return false;
		};
	});

	main.append(menu);
	return menu;
};

const setup = (() => {
	let main, icon, menu;

	return (items=[]) => {
		main = main || createMain();
		icon = icon || createIcon(main);
		menu = menu || createMenu(main, items, icon);
		icon.attachToggle(() => {
			menu.toggle();
		});
		main.attachToggle(() => {
			menu.toggle();
			icon.toggle();
		});
	};
})();

export default { setup };
