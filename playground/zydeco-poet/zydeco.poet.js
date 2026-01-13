import config from './zydeco.config.js';

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
		// Clone template
		const clone = template.content.cloneNode(true);

		// Populate data
		clone.querySelector('.about-notes').textContent = cfg.notes;
		const sourcesList = clone.querySelector('.sources-list');
		cfg.sources.forEach((source) => {
			const li = document.createElement('li');
			li.textContent = source;
			sourcesList.appendChild(li);
		});

		// Get elements from clone before appending
		const overlay = clone.querySelector('.about-modal-overlay');
		const modal = clone.querySelector('.about-modal');
		const closeBtn = modal.querySelector('.about-modal-close');

		// Append to body
		document.body.appendChild(clone);

		// Trigger animation
		setTimeout(() => {
			overlay.classList.add('show');
			modal.classList.add('show');
		}, 10);

		// Close handlers
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

	article.querySelector('.poem-content').innerHTML = paragraphs;

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
	shareBtn.addEventListener('click', () => {
		const poemText = poemLines.join('\n');
		navigator.clipboard.writeText(poemText);

		// Create and show modal
		const modal = document.createElement('div');
		modal.className = 'copy-modal';
		modal.textContent = '📋 Copied to clipboard';
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
