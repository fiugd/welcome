export function getSavedPoems() {
	try {
		const raw = localStorage.getItem('ZYDECO_HEARTS') || '[]';
		return JSON.parse(raw);
	} catch (e) {
		return [];
	}
}

export function savePoems(list) {
	try {
		localStorage.setItem('ZYDECO_HEARTS', JSON.stringify(list));
	} catch (e) {
		console.error('Failed to save hearts', e);
	}
}

export function openHeartsModal(deps = {}) {
	const { rewritePoemWithOpenAI, showTempModal, updateFeedCardsForItem } =
		deps;
	const list = getSavedPoems();
	const items = (list || []).slice().reverse();
	const savedKey = localStorage.getItem('OPENAI_API_KEY');
	const template = document.getElementById('heartsModalTemplate');
	if (!template) return;

	const clone = template.content.cloneNode(true);
	const overlay = clone.querySelector('.about-modal-overlay');
	const modal = clone.querySelector('.about-modal');
	const heartsList = clone.querySelector('.hearts-list');
	const closeBtn = modal && modal.querySelector('.about-modal-close');

	if (!heartsList || !overlay || !modal || !closeBtn) return;

	if (items.length === 0) {
		const empty = document.createElement('p');
		empty.textContent = 'No saved poems yet.';
		heartsList.appendChild(empty);
	}

	items.forEach((item) => {
		const card = document.createElement('article');
		card.className = 'poem-card';
		card.dataset.original = item.original || '';

		const poemContent = document.createElement('div');
		poemContent.className = 'poem-content';
		const text = item.enhanced || item.original || '';
		poemContent.innerHTML = (text || '')
			.split(/\r?\n/)
			.map((l) => `<p>${l}</p>`)
			.join('');

		const actions = document.createElement('div');
		actions.className = 'poem-actions visible';

		// remove button
		const rem = document.createElement('button');
		rem.className = 'action-btn';
		rem.textContent = 'remove';
		rem.addEventListener('click', () => {
			const current = getSavedPoems();
			const idx = current.findIndex((s) => s.id === item.id);
			if (idx >= 0) {
				current.splice(idx, 1);
				savePoems(current);
				card.remove();
				const feedContainer = document.getElementById('poemFeed');
				if (feedContainer) {
					feedContainer
						.querySelectorAll('.poem-card')
						.forEach((c) => {
							if (c.dataset.original === item.original) {
								const hb = c.querySelector('.heart-btn');
								if (hb) {
									hb.classList.remove('liked');
									hb.textContent = '♡';
								}
							}
						});
				}
			}
		});

		// share button
		const share = document.createElement('button');
		share.className = 'action-btn';
		share.textContent = 'share';
		share.addEventListener('click', async () => {
			const poemText = (item.enhanced || item.original || '').trim();
			let copied = false;
			try {
				if (
					navigator.clipboard &&
					typeof navigator.clipboard.writeText === 'function'
				) {
					await navigator.clipboard.writeText(poemText);
					copied = true;
				}
			} catch (e) {
				copied = false;
			}

			if (!copied) {
				try {
					const ta = document.createElement('textarea');
					ta.value = poemText;
					ta.style.position = 'fixed';
					ta.style.top = '0';
					ta.style.left = '0';
					ta.style.width = '1px';
					ta.style.height = '1px';
					ta.style.opacity = '0';
					document.body.appendChild(ta);
					ta.select();
					ta.setSelectionRange(0, ta.value.length);
					copied = document.execCommand('copy');
					ta.remove();
				} catch (err) {
					copied = false;
				}
			}

			if (copied) {
				if (typeof showTempModal === 'function')
					showTempModal('📋 Copied to clipboard');
			} else if (typeof showTempModal === 'function') {
				showTempModal('⚠️ Could not copy');
			}
		});

		actions.appendChild(rem);
		actions.appendChild(share);

		if (item.enhanced || savedKey) {
			const toggle = document.createElement('button');
			toggle.className = 'action-btn';
			toggle.textContent = item.enhanced ? 'show original' : 'enhance';
			toggle.addEventListener('click', async () => {
				if (item.enhanced) {
					if (toggle.dataset.mode === 'enhanced') {
						poemContent.innerHTML = (item.original || '')
							.split(/\r?\n/)
							.map((l) => `<p>${l}</p>`)
							.join('');
						toggle.dataset.mode = 'original';
						toggle.textContent = 'show enhanced';
					} else {
						poemContent.innerHTML = (
							item.enhanced ||
							item.original ||
							''
						)
							.split(/\r?\n/)
							.map((l) => `<p>${l}</p>`)
							.join('');
						toggle.dataset.mode = 'enhanced';
						toggle.textContent = 'show original';
					}
				} else {
					const key = localStorage.getItem('OPENAI_API_KEY');
					if (!key) {
						if (typeof showTempModal === 'function')
							showTempModal('No OpenAI key configured');
						return;
					}
					if (typeof rewritePoemWithOpenAI !== 'function') {
						if (typeof showTempModal === 'function')
							showTempModal('AI not available');
						return;
					}
					toggle.disabled = true;
					toggle.textContent = 'enhancing...';
					try {
						const res = await rewritePoemWithOpenAI(
							key,
							item.original || ''
						);
						if (res && res.ok && res.text) {
							item.enhanced = res.text.trim();
							item.updatedAt = new Date().toISOString();
							const current = getSavedPoems();
							const idx = current.findIndex(
								(s) => s.id === item.id
							);
							if (idx >= 0) {
								current[idx] = item;
								savePoems(current);
							}
							poemContent.innerHTML = item.enhanced
								.split(/\r?\n/)
								.map((l) => `<p>${l}</p>`)
								.join('');
							toggle.textContent = 'show original';
							toggle.dataset.mode = 'enhanced';
							if (typeof updateFeedCardsForItem === 'function')
								updateFeedCardsForItem(item);
							if (typeof showTempModal === 'function')
								showTempModal('Enhanced and saved');
						} else {
							if (typeof showTempModal === 'function')
								showTempModal('AI error enhancing poem');
						}
					} catch (err) {
						if (typeof showTempModal === 'function')
							showTempModal('AI error: ' + (err.message || ''));
					} finally {
						toggle.disabled = false;
					}
				}
			});
			actions.appendChild(toggle);
		}

		card.appendChild(poemContent);
		card.appendChild(actions);
		heartsList.appendChild(card);
	});

	// insert the cloned modal into the document so it becomes visible
	document.body.appendChild(clone);

	setTimeout(() => {
		const appendedOverlay =
			document.querySelector('.about-modal-overlay.show') ||
			document.querySelector('.about-modal-overlay');
		const appendedModal =
			document.querySelector('.about-modal.hearts-modal.show') ||
			document.querySelector('.about-modal.hearts-modal');
		if (appendedOverlay) appendedOverlay.classList.add('show');
		if (appendedModal) appendedModal.classList.add('show');
		// prevent background scrolling while modal is open
		document.documentElement.classList.add('modal-open');
		document.body.classList.add('modal-open');
	}, 10);

	const close = () => {
		const appendedOverlay = document.querySelector('.about-modal-overlay');
		const appendedModal = document.querySelector(
			'.about-modal.hearts-modal'
		);
		if (appendedOverlay) appendedOverlay.classList.remove('show');
		if (appendedModal) appendedModal.classList.remove('show');
		// restore page scrolling
		document.documentElement.classList.remove('modal-open');
		document.body.classList.remove('modal-open');
		setTimeout(() => {
			if (appendedOverlay) appendedOverlay.remove();
			if (appendedModal) appendedModal.remove();
		}, 300);
	};

	closeBtn.addEventListener('click', close);
	// overlay was part of the cloned fragment; when appended it's in the DOM
	// query for the appended overlay element to attach click listener
	setTimeout(() => {
		const appendedOverlay = document.querySelector('.about-modal-overlay');
		if (appendedOverlay) appendedOverlay.addEventListener('click', close);
	}, 20);
}
