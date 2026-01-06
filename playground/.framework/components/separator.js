// Helper for html tagged template
const html = (s) => s.join('');

class XSeparator extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
		shadow.innerHTML = html`
			<div
				style="width:100%;display:flex;justify-content:center;margin:2em 0;opacity:0.6;"
			>
				<svg viewBox="0 0 1074 116" style="width: 40%">
					<path
						fill="currentColor"
						d="M0 57 L412 55 L412 61 L0 59 Z"
					/>
					<path
						fill="currentColor"
						d="M662 55 L1074 57 L1074 59 L662 61 Z"
					/>
					<g fill="currentColor" fill-rule="evenodd">
						<path
							d="M456.00 58.00 A14.00 14.00 0 1 0 428.00 58.00 A14.00 14.00 0 1 0 456.00 58.00 M450.00 58.00 A8.00 8.00 0 1 1 434.00 58.00 A8.00 8.00 0 1 1 450.00 58.00"
						/>
						<path
							d="M502.00 58.00 A20.00 20.00 0 1 0 462.00 58.00 A20.00 20.00 0 1 0 502.00 58.00 M494.00 58.00 A12.00 12.00 0 1 1 470.00 58.00 A12.00 12.00 0 1 1 494.00 58.00"
						/>
						<path
							d="M612.00 58.00 A20.00 20.00 0 1 0 572.00 58.00 A20.00 20.00 0 1 0 612.00 58.00 M604.00 58.00 A12.00 12.00 0 1 1 580.00 58.00 A12.00 12.00 0 1 1 604.00 58.00"
						/>
						<path
							d="M646.00 58.00 A14.00 14.00 0 1 0 618.00 58.00 A14.00 14.00 0 1 0 646.00 58.00 M640.00 58.00 A8.00 8.00 0 1 1 624.00 58.00 A8.00 8.00 0 1 1 640.00 58.00"
						/>
						<path
							d="M566.44 75.00 537.00 92.00 507.56 75.00 507.56 41.00 537.00 24.00 566.44 41.00 Z M557.78 70.00 537.00 82.00 516.22 70.00 516.22 46.00 537.00 34.00 557.78 46.00 Z"
						/>
						<path
							d="M552.59 67.00 537.00 76.00 521.41 67.00 521.41 49.00 537.00 40.00 552.59 49.00 Z M545.66 63.00 537.00 68.00 528.34 63.00 528.34 53.00 537.00 48.00 545.66 53.00 Z"
						/>
					</g>
				</svg>
			</div>
		`;
	}
}

customElements.define('x-separator', XSeparator);
