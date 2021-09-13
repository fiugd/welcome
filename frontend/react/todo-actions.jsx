const DownloadButton = ({ useStore }) => {
	const { value } = useStore({ filter: 'all'});
	const { todos=[] } = value || {};

	const dateString = (new Date()).toISOString().slice(2,10).replace(/-/g, '')
		+ '_'
		+ (new Date()).toLocaleString("en-US", {
			minute: "2-digit",
				hour: "2-digit",
			hour12: false
		}).replace(":", "");
	const exportName = `TODO-${dateString}`;

	function downloadMarkDown(){
		const activeItems = todos
			.filter(x => x.status === 'active')
			.map(x => `  - [ ] ${x.value}`)
			.join('\n');
		const completedItems = todos
			.filter(x => x.status !== 'active')
			.map(x => `  - [x] ${x.value}`)
			.join('\n');
		const markdown =
			`TODO ${dateString}
			================
			${activeItems}
			${completedItems}
			`.replace(/      /g, '');
		var dataStr = "data:text/json;charset=utf-8,"
			+ encodeURIComponent(markdown);
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("target", "_blank");
		downloadAnchorNode.setAttribute("download", exportName + ".md");
		// required for firefox
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	function downloadObjectAsJson(){
		debugger;
		var dataStr = "data:text/json;charset=utf-8,"
			+ encodeURIComponent(JSON.stringify(todos, null, 2));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("target", "_blank");
		downloadAnchorNode.setAttribute("download", exportName + ".json");
		// required for firefox
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	const clickHandler = downloadMarkDown || downloadObjectAsJson;

	return (
		<div
			className="icon"
			title="Download all"
			onClick={clickHandler}
		>
			<svg version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				width="20"
				height="20"
			>
				<path d="
						M 3 0
						L 10 16
						L 17 0
					"
					stroke-width="5"
					stroke="currentColor"
					fill="transparent"
				></path>
			</svg>
		</div>
	);
};

const UploadButton = ({ replace }) => {
	const confirmMsg = 'This overwrite your current todo list.  Continue?';
	const upload = (e) => {
		e.preventDefault();
		const confirmed = confirm(confirmMsg);
		if(!confirmed){ return; }
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.setAttribute('accept', 'md');

		const parseResults = ({ error, result }) => {
			if(error){
				console.error(error);
				return;
			}
			const parsed = result
				.split('\n')
				.filter(x => (x||'').includes('- [x]') ||
					(x||'').includes('- [ ]')
				)
				.map((x, i) => {
					if(x.includes('[x]')){
						return {
							value: x.split('[x] ')[1],
							status: 'completed',
							order: i
						}
					}
					return {
						value: x.split('[ ] ')[1],
						status: 'active',
						order: i
					};
				});


			fileInput.value = '';
			fileInput.remove && fileInput.remove();
			replace(e, parsed);
		};


		fileInput.onchange = e => {
			const readerOne = new FileReader();
			readerOne.onerror = () => parseResults(readerOne);
			readerOne.onload = () => parseResults(readerOne);
			readerOne.readAsText(e.target.files[0]);
		};

		fileInput.click();
	};

	return (
		<div className="icon" title="Upload Todo's"
			onClick={upload}
		>
			<svg version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				width="20"
				height="20"
			>
				<path d="
						M 3 20
						L 10 4
						L 17 20
					"
					stroke-width="5"
					stroke="currentColor"
					fill="transparent"
				></path>
			</svg>
		</div>
	);
};

const Actions = ({ replaceAll, useStore }) => {
	const replace = (event, todos) => {
			replaceAll(todos);
			event.preventDefault();
	};

	return (
		<div id="actions-top">
			<UploadButton replace={replace} />
			<DownloadButton useStore={useStore} />
		</div>
	);
};

export { Actions };