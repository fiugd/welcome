export const setupUI = ({ onFillStart, onFillStop } = {}) => {
	const container = document.createElement('div');
	container.className = 'imageContainer';
	document.body.appendChild(container);

	container.innerHTML = `
        <svg viewBox="0 0 450 1100">
            <defs></defs>
            <path
                style="fill: rgb(174, 238, 242, 0.5); transform-box: fill-box; transform-origin: 50% 50%;"
                d="M 304.597 337.542 C 304.597 337.542 297.857 203.037 314.754 140.129 C 325.47 100.232 365.737 76.287 365.737 76.287 L 356.3 11.784 C 356.3 11.784 277.484 76.913 262.883 126.57 C 243.355 192.984 252.847 337.542 252.847 337.542 L 304.597 337.542 Z"
                transform="matrix(-1, 0, 0, -1, 12.336014, -11.784)"
            ></path>
            <path
                style="fill: rgb(255, 187, 187, 0.5)"
                d="M 125.382 0 C 125.382 0 118.642 134.505 135.539 197.413 C 146.255 237.31 203.326 270.781 203.326 270.781 L 166.114 310.848 C 166.114 310.848 98.269 260.629 83.668 210.972 C 64.14 144.559 73.632 0 73.632 0 L 125.382 0 Z"
            ></path>
            <path
                d="M 158.84 293.68 C 158.84 293.68 147.113 236.344 225.729 236.344 C 301.409 236.344 288.345 293.486 288.345 293.486 L 274.392 444.76 L 171.008 444.272 L 158.84 293.68 Z"
                style="fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0)"
            ></path>
            <ellipse
                id="targetTempButton"
                cx="223.713"
                cy="155"
                rx="57.599"
                ry="57.599"
            ></ellipse>
            <path
                d="M 98.679 18.884 L 145.992 96.388 L 51.365 96.388 L 98.679 18.884 Z"
                style="stroke: rgb(0, 0, 0); fill: rgb(245, 245, 245)"
                bx:shape="triangle 51.365 18.884 94.627 77.504 0.5 0 1@64b09747"
            ></path>
            <path
                d="M 351.323 18.884 L 398.636 96.388 L 304.009 96.388 L 351.323 18.884 Z"
                style="stroke: rgb(0, 0, 0); fill: rgb(245, 245, 245)"
                bx:shape="triangle 304.009 18.884 94.627 77.504 0.5 0 1@486285b0"
            ></path>
            <path
                d="M 225.001 325.758 L 272.314 403.262 L 177.687 403.262 L 225.001 325.758 Z"
                style="stroke: rgb(0, 0, 0); fill: rgb(245, 245, 245)"
                bx:shape="triangle 177.687 325.758 94.627 77.504 0.5 0 1@9caa3007"
            ></path>
            <rect
                x="51.365"
                y="166.813"
                width="94.627"
                height="53.601"
                style="stroke: rgb(0, 0, 0); fill: rgb(236, 236, 236)"
            ></rect>
            <rect
                x="304.009"
                y="166.813"
                width="94.627"
                height="53.601"
                style="stroke: rgb(0, 0, 0); fill: rgb(236, 236, 236)"
            ></rect>
            <text
                id="hotTemp"
                x="127.672"
                y="80.225"
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="24"
                fill="black"
                style="white-space: pre; font-size: 24px"
                transform="matrix(0.94589, 0, 0, 1, -22.087753, -11.695406)"
            ></text>
            <text
                id="coldTemp"
                x="127.672"
                y="80.225"
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="24"
                fill="black"
                style="white-space: pre; font-size: 24px"
                transform="matrix(0.94589, 0, 0, 1, 230.556229, -11.695406)"
            ></text>
            <text
                id="hotFlow"
                x="127.672"
                y="80.225"
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="24"
                fill="black"
                style="white-space: pre; font-size: 24px"
                transform="matrix(0.94589, 0, 0, 1, -22.083576, 115.299103)"
            ></text>
            <text
                id="coldFlow"
                x="127.672"
                y="80.225"
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="24"
                fill="black"
                style="white-space: pre; font-size: 24px"
                transform="matrix(0.94589, 0, 0, 1, 230.56041, 115.299103)"
            ></text>
            <text
                id="mixTemp"
                x="252.707"
                y="309.451"
                text-anchor="middle"
                alignment-baseline="middle"
                font-size="24"
                fill="black"
                style="white-space: pre; font-size: 24px"
                transform="matrix(0.94589, 0, 0, 1, -14.033053, 65.720459)"
            ></text>
            <text
                id="targetTemp"
                style="fill: white; font-size: 65px; white-space: pre;"
                text-anchor="middle"
                alignment-baseline="middle"
                x="220"
                y="60"
            ></text>

            <rect id="water" x="116.541" y="508.188" width="218.19" height="433.901" style="fill: rgba(216, 216, 216, 0.5); stroke: rgb(0, 0, 0);"></rect>
            <path d="M 108.579 501.187 L 118.244 501.187 L 118.244 933.721 L 330.611 933.721 L 330.611 501.187 L 341.422 501.187 L 341.422 953.682 L 108.579 953.682 L 108.579 501.187 Z" style="fill: rgb(216, 216, 216); stroke: rgb(0, 0, 0);"></path>
        </svg>
    `;
	const elements = {
		water: document.getElementById('water'),
		mixTemp: document.getElementById('mixTemp'),
		hotTemp: document.getElementById('hotTemp'),
		coldTemp: document.getElementById('coldTemp'),
		coldFlow: document.getElementById('coldFlow'),
		hotFlow: document.getElementById('hotFlow'),
		targetTemp: document.getElementById('targetTemp'),
		targetTempButton: document.getElementById('targetTempButton')
	};
	elements.targetTempButton.addEventListener('pointerdown', () => {
		elements.targetTempButton.classList.add('pressed');
		onFillStart && onFillStart();
	});
	elements.targetTempButton.addEventListener('pointerup', () => {
		elements.targetTempButton.classList.remove('pressed');
		onFillStop && onFillStop();
	});
	const setWaterLevel = (level) => {
		const levelY = 433.901 * (level / 100);
		elements.water.setAttribute('height', levelY);
		elements.water.setAttribute('y', 500 + 433.901 - levelY);
	};
	setWaterLevel(0);
	return { container, elements, setWaterLevel };
};
