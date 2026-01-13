const rewritePoemPrompt = ({ poemText }) => {
	return `
You are a poem-rewriter. Rewrite the INPUT POEM into a new poem that is clear, grammatical, and readable while preserving its vivid, unusual vocabulary and emotional movement.

INTENT
- Reduce syntactic opacity caused by overly dense or contorted poetic form.
- Preserve striking, strange, and colorful word choices whenever possible.
- When necessary for clarity, you may adjust a word’s case, tense, number, or part of speech—but do not replace it unless clarity truly requires it.

GOAL
- Produce a poem that “says the same thing” as the input with similar length and intensity.
- Favor coherence first, color second, form third.
- The poem should feel more open and breathable, not explained or flattened.

RULES
- Output ONLY the poem text. No title. No commentary. No analysis.
- 8–24 lines total.
- Do NOT introduce new themes, symbols, or ideas.
- Prefer straightforward sentence construction over compressed or elliptical phrasing.
- Keep imaginative nouns, verbs, and adjectives even if they are unusual or surreal.
- You may:
  - normalize capitalization when it appears arbitrary
  - re-order phrases to improve readability
  - split or merge lines to follow punctuation and sentence sense
- You may NOT:
  - paraphrase into prose
  - explain meaning
  - remove strangeness solely to sound “safe” or generic
- Avoid meta language (e.g., “this poem,” “it suggests,” “the speaker”).

FORMAT
- Plain text poem only.
- Line breaks should follow sentence structure and punctuation; avoid decorative or purely rhythmic breaks.
- Output length should roughly match input length.

LINE BREAK GUIDANCE
- Do NOT split sentences across lines solely for visual or poetic effect.
- Line breaks must be justified by punctuation, clause boundaries, or a clear change in thought.
- Prefer complete sentences or complete clauses per line.
- Avoid dangling infinitives, stranded prepositions, or single-line fragments unless they carry independent meaning.


INPUT POEM:
<<<
${poemText}
>>>
`;
};

export async function testOpenAIKey(key) {
	if (!key) return { ok: false, message: 'No key provided' };
	try {
		const res = await fetch('https://api.openai.com/v1/models', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${key}`,
				'Content-Type': 'application/json'
			}
		});

		if (res.status === 401)
			return {
				ok: false,
				status: 401,
				message: 'Unauthorized — invalid API key'
			};
		if (!res.ok) {
			const txt = await res.text();
			return {
				ok: false,
				status: res.status,
				message: txt.slice(0, 500)
			};
		}
		const json = await res.json();
		return { ok: true, status: res.status, data: json };
	} catch (err) {
		return { ok: false, message: err.message };
	}
}

export function wireTestKeyButton(button, input) {
	if (!button) return;
	// Find a nearby status element (should be next to the button in the template)
	const getStatusEl = () => {
		if (button.parentElement) {
			const byId = button.parentElement.querySelector('#testKeyStatus');
			if (byId) return byId;
		}
		return button.nextElementSibling || null;
	};

	button.addEventListener('click', async () => {
		const statusEl = getStatusEl();
		const key = input && input.value ? input.value.trim() : '';

		if (statusEl) {
			statusEl.textContent = 'Testing...';
			statusEl.classList.remove('success', 'error');
			statusEl.classList.add('testing');
		}

		if (!key) {
			if (statusEl) {
				statusEl.textContent = 'Enter API key';
				statusEl.classList.remove('testing');
				statusEl.classList.add('error');
			}
			return;
		}

		try {
			const result = await testOpenAIKey(key);
			if (result.ok) {
				if (statusEl) {
					statusEl.textContent = 'Key valid';
					statusEl.classList.remove('testing');
					statusEl.classList.add('success');
				}
			} else {
				if (statusEl) {
					statusEl.textContent = result.message || 'Invalid key';
					statusEl.classList.remove('testing');
					statusEl.classList.add('error');
				}
			}
		} catch (err) {
			if (statusEl) {
				statusEl.textContent = err.message || 'Error';
				statusEl.classList.remove('testing');
				statusEl.classList.add('error');
			}
		}

		// Clear status after a short delay
		setTimeout(() => {
			const s = getStatusEl();
			if (s) {
				s.classList.remove('testing', 'success', 'error');
				s.textContent = '';
			}
		}, 3000);
	});
}

export async function rewritePoemWithOpenAI(key, poemText) {
	if (!key) return { ok: false, message: 'No API key' };
	try {
		const PROMPT = rewritePoemPrompt({ poemText });

		const res = await fetch('https://api.openai.com/v1/responses', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${key}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'gpt-4.1',
				input: PROMPT,
				temperature: 0.65,
				max_output_tokens: 300
			})
		});

		if (!res.ok) {
			const txt = await res.text();
			return {
				ok: false,
				status: res.status,
				message: txt.slice(0, 1000)
			};
		}

		const data = await res.json();
		// Responses API may return `output_text` convenience field or structured `output`.
		let text = '';
		if (data.output_text) text = data.output_text;
		else if (Array.isArray(data.output) && data.output.length) {
			// attempt to find textual content in output[0].content
			const out = data.output[0];
			if (typeof out === 'string') text = out;
			else if (out && Array.isArray(out.content)) {
				for (const c of out.content) {
					if (typeof c === 'string') text += c;
					else if (c && typeof c.text === 'string') text += c.text;
				}
			}
		}
		text = (text || '').trim();
		return { ok: true, text };
	} catch (err) {
		return { ok: false, message: err.message };
	}
}
