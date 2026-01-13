import config from './zydeco.config.js';
import { wireTestKeyButton, rewritePoemWithOpenAI } from './llm.js';

const range = (from, to) => {
	if (!to) return new Array(from).fill().map((x, i) => i);
	return new Array(1 + to - from).fill().map((x, i) => i + from);
};

// Lazily resolve the HTML template in the document (index.html)
let poemCardTemplate = null;
function getPoemCardTemplate() {
	if (poemCardTemplate) return poemCardTemplate;
	poemCardTemplate = document.getElementById('poemCardTemplate');
	return poemCardTemplate;
}

function randItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}

// About modal functionality
function setupAboutModal() {
	const aboutBtn = document.querySelector('.about-btn');
	const cfg = config.zydeco_bones_v1;
	const template = document.getElementById('aboutModalTemplate');

	aboutBtn.addEventListener('click', () => {
		const clone = template.content.cloneNode(true);
		clone.querySelector('.about-notes').textContent = cfg.notes;

		// OpenAI API key input: populate from localStorage and persist on change
		const apiKeyInput = clone.querySelector('#openaiKeyInput');
		if (apiKeyInput) {
			const saved = localStorage.getItem('OPENAI_API_KEY') || '';
			apiKeyInput.value = saved;
			apiKeyInput.addEventListener('input', (e) => {
				const v = e.target.value || '';
				if (v.trim()) localStorage.setItem('OPENAI_API_KEY', v.trim());
				else localStorage.removeItem('OPENAI_API_KEY');
			});
			const testBtn = clone.querySelector('#testOpenAIKeyBtn');
			if (testBtn) wireTestKeyButton(testBtn, apiKeyInput);
		}

		const sourcesList = clone.querySelector('.sources-list');
		cfg.sources.forEach((source) => {
			const li = document.createElement('li');
			li.textContent = source;
			sourcesList.appendChild(li);
		});

		const overlay = clone.querySelector('.about-modal-overlay');
		const modal = clone.querySelector('.about-modal');
		const closeBtn = modal.querySelector('.about-modal-close');

		document.body.appendChild(clone);
		setTimeout(() => {
			overlay.classList.add('show');
			modal.classList.add('show');
		}, 10);

		const closeModal = () => {
			overlay.classList.remove('show');
			modal.classList.remove('show');
			setTimeout(() => {
				overlay.remove();
				modal.remove();
			}, 300);
		};

		closeBtn.addEventListener('click', closeModal);
		overlay.addEventListener('click', closeModal);
	});
}

function getPoem(config) {
	let thepoem = '';
	let { templates } = config['zydeco_bones_v1'];
	const template = randItem(templates);
	template.split(' ').forEach((part) => {
		if (part === 'comma') {
			thepoem = thepoem.trim();
			thepoem += ',\n';
			return;
		}
		if (part === 'period') {
			thepoem = thepoem.trim();
			thepoem += '.  ';
			return;
		}
		thepoem += randItem(config[part]) + ' ';
	});
	return thepoem.trim();
}

// Infinite scroll implementation
let isLoading = false;
let poemCount = 0;
let poemFeed;
let loadingIndicator;
const colors = config.zydeco_bones_v1.bg_colors;

function createPoemElement(poem) {
	// Clone the card template and populate content (assume template present)
	const tpl = getPoemCardTemplate();
	if (!tpl || !tpl.content)
		throw new Error('poemCardTemplate not found in document');
	const clone = tpl.content.cloneNode(true);
	const article = clone.querySelector('article') || clone.firstElementChild;

	// Hide previous arrow on first poem
	if (poemCount === 0) {
		article.classList.add('first-poem');
	}

	// Add alternating background class
	if (poemCount % 2 === 1) {
		article.classList.add('tinted-bg');
	}

	// Get color based on poem count
	const colorIndex = poemCount % colors.length;
	const accentColor = colors[colorIndex];

	article.style.setProperty('--accent-color', accentColor);

	// Split poem into lines and create paragraph for each
	const poemLines = poem.split('\n').filter((line) => line.trim());
	const paragraphs = poemLines.map((line) => `<p>${line}</p>`).join('');

	const poemContent = article.querySelector('.poem-content');
	poemContent.innerHTML = paragraphs;

	// Heart button listener
	const heartBtn = article.querySelector('.heart-btn');
	heartBtn.addEventListener('click', () => {
		// Create and show modal
		const modal = document.createElement('div');
		modal.className = 'copy-modal';
		modal.textContent = '❤️ Liking poems is coming soon!';
		document.body.appendChild(modal);

		// Trigger animation
		setTimeout(() => {
			modal.classList.add('show');
		}, 10);

		// Remove modal after 2 seconds
		setTimeout(() => {
			modal.classList.remove('show');
			setTimeout(() => {
				modal.remove();
			}, 300);
		}, 2000);
	});

	// Share button listener
	const shareBtn = article.querySelector('.share-btn');
	shareBtn.addEventListener('click', async () => {
		// Copy the currently visible poem text (support original/rewrite toggle)
		let poemText = '';
		if (
			article.dataset.showing === 'rewritten' &&
			article.dataset.rewritten
		) {
			poemText = article.dataset.rewritten;
		} else if (
			article.dataset.showing === 'original' &&
			article.dataset.original
		) {
			poemText = article.dataset.original;
		} else {
			const paragraphs = Array.from(
				article.querySelectorAll('.poem-content p')
			);
			poemText = paragraphs.map((p) => p.textContent.trim()).join('\n');
		}

		// Try navigator.clipboard first; fall back to textarea+execCommand if unavailable
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

		// Create and show modal
		const modal = document.createElement('div');
		modal.className = 'copy-modal';
		modal.textContent = copied
			? '📋 Copied to clipboard'
			: '⚠️ Could not copy';
		document.body.appendChild(modal);

		// Trigger animation
		setTimeout(() => {
			modal.classList.add('show');
		}, 10);

		// Remove modal after 2 seconds
		setTimeout(() => {
			modal.classList.remove('show');
			setTimeout(() => {
				modal.remove();
			}, 300);
		}, 2000);
	});

	// AI rewrite button: use the button present in the template and toggle visibility
	const savedKey = localStorage.getItem('OPENAI_API_KEY');
	const aiBtn = article.querySelector('.ai-btn');
	if (aiBtn) {
		// hide when no API key
		if (!savedKey) aiBtn.classList.add('ai-hidden');
		else aiBtn.classList.remove('ai-hidden');

		aiBtn.addEventListener('click', async () => {
			// If there is no rewritten text stored, call the API once and store it.
			// Otherwise just toggle between original and rewritten.
			const hasRewritten = !!article.dataset.rewritten;
			// Determine base original text (either stored or initial poemLines)
			const originalText =
				article.dataset.original || poemLines.join('\n');

			if (!hasRewritten) {
				poemContent.classList.add('pulsing');
				aiBtn.classList.add('ai-loading');
				// mark the article as loading so CSS can target the poem for pulsing
				article.classList.add('ai-loading');
				aiBtn.disabled = true;
				aiBtn.setAttribute('aria-busy', 'true');
				try {
					const result = await rewritePoemWithOpenAI(
						savedKey,
						originalText
					);
					if (result.ok && result.text) {
						const newText = result.text.trim();
						const newLines = newText
							.split(/\r?\n/)
							.filter((l) => l.trim());
						const newParagraphs = newLines
							.map((line) => `<p>${line}</p>`)
							.join('');
						article.querySelector('.poem-content').innerHTML =
							newParagraphs;

						// Store original (if not already) and rewritten texts on the article
						if (!article.dataset.original)
							article.dataset.original = originalText;
						article.dataset.rewritten = newText;
						article.dataset.showing = 'rewritten';

						// show toggled (filled) state
						aiBtn.title = 'Show original';
						aiBtn.classList.add('toggled');
					} else {
						const status = document.createElement('div');
						status.className = 'copy-modal';
						status.textContent = `AI error: ${
							result.message || result.status || 'unknown'
						}`;
						document.body.appendChild(status);
						setTimeout(() => status.classList.add('show'), 10);
						setTimeout(() => {
							status.classList.remove('show');
							setTimeout(() => status.remove(), 300);
						}, 2500);
					}
				} catch (err) {
					const status = document.createElement('div');
					status.className = 'copy-modal';
					status.textContent = `AI error: ${err.message}`;
					document.body.appendChild(status);
					setTimeout(() => status.classList.add('show'), 10);
					setTimeout(() => {
						status.classList.remove('show');
						setTimeout(() => status.remove(), 300);
					}, 2500);
				} finally {
					poemContent.classList.remove('pulsing');
					aiBtn.classList.remove('ai-loading');
					article.classList.remove('ai-loading');
					aiBtn.disabled = false;
					aiBtn.removeAttribute('aria-busy');
				}
			} else {
				// Toggle between original and rewritten
				const showing = article.dataset.showing;
				if (showing === 'rewritten') {
					const origLines = (article.dataset.original || '')
						.split(/\r?\n/)
						.filter((l) => l.trim());
					const origParagraphs = origLines
						.map((line) => `<p>${line}</p>`)
						.join('');
					article.querySelector('.poem-content').innerHTML =
						origParagraphs;
					article.dataset.showing = 'original';
					// set to outlined (click will enhance)
					aiBtn.title = 'Show enhanced';
					aiBtn.classList.remove('toggled');
				} else {
					const newText = article.dataset.rewritten || '';
					const newLines = newText
						.split(/\r?\n/)
						.filter((l) => l.trim());
					const newParagraphs = newLines
						.map((line) => `<p>${line}</p>`)
						.join('');
					article.querySelector('.poem-content').innerHTML =
						newParagraphs;
					article.dataset.showing = 'rewritten';
					// set to filled (click will show original)
					aiBtn.title = 'Show original';
					aiBtn.classList.add('toggled');
				}
			}
		});

		// no-op: button exists in template; we already wired it
	}

	poemCount++;
	return article;
}

function addPoems(count = 3) {
	if (isLoading) return;
	isLoading = true;
	loadingIndicator.classList.add('active');

	setTimeout(() => {
		for (let i = 0; i < count; i++) {
			const poem = getPoem(config);
			const poemElement = createPoemElement(poem);
			poemFeed.appendChild(poemElement);
		}
		isLoading = false;
		loadingIndicator.classList.remove('active');
	}, 500);
}
// DOM-dependent initialization: ensure DOM is ready before querying templates/elements
document.addEventListener('DOMContentLoaded', () => {
	// Load initial poems
	poemFeed = document.getElementById('poemFeed');
	loadingIndicator = document.getElementById('loadingIndicator');

	// Intersection Observer to show arrows after 5 seconds in view
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Wait 5 seconds then show arrows
					setTimeout(() => {
						entry.target.classList.add('show-arrows');
					}, 5000);
					// Mark as fully in view
					entry.target.classList.add('in-view');
					entry.target.classList.remove('leaving-view');
				} else {
					// Hide arrows when card leaves view
					entry.target.classList.remove('show-arrows');
					// Mark as leaving view for fade effect
					entry.target.classList.add('leaving-view');
					entry.target.classList.remove('in-view');
				}
			});
		},
		{ threshold: 0.5 }
	);

	// Observe all poem cards
	const observeNewCards = () => {
		document.querySelectorAll('.poem-card').forEach((card) => {
			if (!card.dataset.observed) {
				observer.observe(card);
				card.dataset.observed = 'true';
			}
		});
	};

	observeNewCards();

	// Reobserve when new poems are added
	const originalAppendChild = poemFeed.appendChild;
	poemFeed.appendChild = function (child) {
		const result = originalAppendChild.call(this, child);
		observeNewCards();
		return result;
	};

	// Infinite scroll listener
	let scrollTimeout;
	let isScrollListenerActive = false;

	// Delay scroll listener activation to prevent initial page load flashing
	setTimeout(() => {
		isScrollListenerActive = true;
		// Show all buttons once listener is ready
		document.querySelectorAll('.poem-actions').forEach((actions) => {
			actions.classList.add('visible');
		});
	}, 100);

	window.addEventListener('scroll', () => {
		if (!isScrollListenerActive) return;

		// Hide all action buttons
		document.querySelectorAll('.poem-actions').forEach((actions) => {
			actions.classList.remove('visible');
		});

		// Clear previous timeout
		clearTimeout(scrollTimeout);

		// Show buttons after scrolling stops (300ms of no scroll)
		scrollTimeout = setTimeout(() => {
			document.querySelectorAll('.poem-actions').forEach((actions) => {
				actions.classList.add('visible');
			});
		}, 300);

		const scrollPosition = window.innerHeight + window.scrollY;
		const threshold = document.documentElement.scrollHeight - 500;

		if (scrollPosition >= threshold && !isLoading) {
			addPoems(3);
		}
	});

	// Initialize about modal
	setupAboutModal();

	// finally load initial poems
	addPoems(10);
});
