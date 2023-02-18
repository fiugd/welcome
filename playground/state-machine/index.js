const unique = (items) => [...new Set(items)];

const flatStateDom = (tableEl, data, config, state) => {
	const columns = Object.keys(data[0]);
	const options = columns.map(col => {
		const depends = config.depends[col] || [];
		const allPossible = data
			.filter(x => {
				for(const dep of depends){
					if(state[dep] !== x[dep]) return;
				}
				return true;
			})
			.map(x => x[col] || '');
		return unique(allPossible);
	});
	const tableSrc = `
		<table>
			<tr>
				${ columns.map(col => `<th>${col}</th>`).join('\n') }
			</tr>
			${ data.map(row => {
				let className = '';
				const notPossible = options.find((opt, i) => ![...opt, true, undefined].includes(row[columns[i]]));
				if(!notPossible){
					className = (className + ' possible').trim();
				}
				return `<tr class="${className}">${
					columns.map(col => `<td>${row[col] || '--'}</td>`).join('\n')
				}</tr>`
			}).join('\n')}
			<tr>
				${ options.map((opt, i) => {
					const col = columns[i];
					if(col.startsWith("input") && opt.length <= 1){
						if(opt[0])
							return `<td><input /></td>`;
						return `<td></td>`;
					}
					if(opt.length <= 1) return `<td>${opt[0] || ''}</td>`

					return `<td>
						<select col="${col}">
							${opt.map(sel => {
								const selected = state?.[col] === sel ? 'selected' : '';
								return `<option value="${sel}" ${selected}>${sel}</option>`
							}).join('\n')}
						</select>
					</td>`
				}).join('\n') }
			</tr>
		</table>
	`;
	tableEl.innerHTML = tableSrc;

	for(const selector of Array.from(tableEl.querySelectorAll('select'))){
		const col = selector.getAttribute('col');
		selector.onchange = (e) => {
			const { value } = e.target;
			flatStateDom(tableEl, data, config, { ...state, [col]: value });
		}
	}
};

const flatState = () => {
	const flatEl = document.getElementById('flattened-state');
	const state = {};
	const flatData = [
		{ opt1: undefined, opt2: undefined, input1: undefined, input2: undefined },
		{ opt1: 'one',     opt2: undefined, input1: undefined, input2: undefined },
		{ opt1: 'two',     opt2: undefined, input1: undefined, input2: undefined },

		{ opt1: 'one',     opt2: 'red',     input1: true,      input2: undefined },
		{ opt1: 'one',     opt2: 'green',   input1: undefined, input2: true      },
		{ opt1: 'one',     opt2: 'blue',    input1: true,      input2: true      },
		{ opt1: 'one',     opt2: 'white',   input1: undefined, input2: undefined },

		{ opt1: 'two',     opt2: 'apple',   input1: true,      input2: undefined },
		{ opt1: 'two',     opt2: 'orange',  input1: undefined, input2: true      },
		{ opt1: 'two',     opt2: 'peach',   input1: true,      input2: true      },
		{ opt1: 'two',     opt2: 'pear',    input1: undefined, input2: undefined },
	];
	const config = {
		depends: {
			opt2: ['opt1'],
			input1: ['opt2'],
			input2: ['opt2'],
		}
	};
	flatEl.innerHTML = `
	<p>
		The idea here is that state machines can be represented as state lookup tables.
		While the concept may be obvious, the implementation may not be.
		This is an exploration of of these points.
	</p>
	<p>
		The last row shows the currently selected state.
		Highlighted rows show what possible states fall within the reach of current selection.
		NOTE: these rows are NOT currently highlighted correctly.
	</>
	`.replace(/$\t/g, '');
	const tableEl = document.createElement('table');
	flatEl.append(tableEl);
	flatStateDom(tableEl, flatData, config, {});
};
flatState();
