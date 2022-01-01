const css = `
#hamburger-wrapper {
	/* background-color: white; */
	display: flex;
	align-items: center;
	width: 50px;
	height: 50px;
	margin: 0;
	padding: 0;
	position: absolute;
	left: 10px;
	z-index: 1 ;
}

.burger {
	position: relative;
	margin-left: auto;
	margin-right: auto;
}

.burger,
.burger:before,
.burger:after {
	padding: 0;
	background-color: #a2d9c7;
	width: 80%;
	height: 8px;
	transition: margin .1s .1s, transform .1s;
}

.burger:before,
.burger:after {
	margin: 0;
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}

.burger:before {
	margin-top: -12px;
}

.burger:after {
	margin-top: 12px;
}

.open .burger {
	transform: rotate(45deg);
}

.open .burger,
.open .burger:before,
.open .burger:after {
	transition: margin .1s, transform .1s .1s;
}

.open .burger:before,
.open .burger:after {
	margin-top: 0;
}

.open .burger:after {
	transform: rotate(-90deg)
}
`;

const menuCss = `
	#navigation-menu{
		width: 300px;
		height: 100vh;
		position: absolute;
		background: rgb(67 154 179);
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
		padding-left: 0.7em;
		font-size: 3em;
		margin-top: 80px;
		font-family: 'Orbitron', sans-serif;
	}
	#navigation-menu ul a {
		color: #c6ffec;
		text-decoration: none;
	}
`;

const createWrapper = () => {
	let onToggle;
	const wrapper = document.createElement('div');
	wrapper.id = 'hamburger-wrapper';
	wrapper.innerHTML = `
		<style>${css}</style>
		<p class="burger"></p>
	`;
	wrapper.addEventListener("click", () => {
		wrapper.classList.toggle("open");
		onToggle && onToggle();
	});
	document.body.append(wrapper);

	wrapper.addToggle = (fn) => {
		onToggle = fn;
	};

	return wrapper;
};

const createMenu = (items, icon) => {
	const menu = document.createElement('div');
	menu.id = 'navigation-menu';
	//menu.classList.add('open')
	menu.innerHTML = `
		<style>${menuCss}</style>
		<ul>
		${items.map((i) => {
			return `
				<li><a href="">${i.name}</a></li>
			`
		}).join('\n')}
		</ul>
	`;
	menu.toggle = () => {
		menu.classList.toggle("open")
	};
	Array.from(menu.querySelectorAll('a')).forEach((link, i) => {
		link.onclick = (e) => {
			icon.classList.toggle("open");
			menu.toggle();
			return items[i].click && items[i].click(e);
		};
	});

	document.body.append(menu);
	return menu;
};

const setup = (() => {
	let wrapper, menu;

	return (items=[]) => {
		wrapper = wrapper || createWrapper();
		menu = menu || createMenu(items, wrapper);
		wrapper.addToggle(menu.toggle);
	};
})();

export default { setup };
