const createControls = () => {
	const bottom = document.createElement('div');
	bottom.classList.add('controls-bottom');
	bottom.innerHTML = `
        <div class="missle">missle</div>
        <div class="team">team 1</div>
        <div class="team">team 2</div>
        <div class="team">team 3</div>
        <div class="team">team 4</div>
        <div class="team">team 5</div>
        <div class="mineral">mineral</div>
    `;
	document.body.insertAdjacentElement('beforeend', bottom);
	return { bottom };
};

export default class Controls {
	constructor() {
		this.controls = createControls();
	}
}
