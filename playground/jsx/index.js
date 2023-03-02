
// see https://github.com/deleteman/jsx-parser/blob/main/index.js

// here and below written by ChatGPT and slightly modified

function jsxToHtml2(jsx) {
	// Define the list of common HTML tags
	const commonTags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];

	// Replace JSX tags with HTML elements and JavaScript expressions
	const html = jsx.replace(/<(\w+)\s*([^>]*)\/?>/g, (match, tag, attrs) => {
		// If the tag is not a common HTML tag, return the original match
		if (!commonTags.includes(tag)) {
			return match;
		}

		// Build the HTML tag with attributes
		let htmlTag = `<${tag}`;
		if (attrs) {
			htmlTag += ` ${attrs}`;
		}

		// If the tag is a self-closing tag, return the HTML tag
		if (match.endsWith('/>')) {
			return `${htmlTag}/>`;
		}

		// Otherwise, parse the JSX code inside the tag
		const jsxCode = match.slice(tag.length + 2, -1);
		const jsCode = jsxCode.replace(/\{(.*?)\}/g, (_, code) => {
			return `(${code})`;
		});

		// Build the HTML tag with the parsed JSX code
		return `${htmlTag}>${eval(jsCode)}</${tag}>`;
	});

	return html;
}

function jsxToHtml(jsx) {
	// Define the list of common HTML tags
	const commonTags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'];


	// Replace JSX tags with HTML elements and JavaScript expressions
	const html = jsx.replace(/<(\w+)([^>]*)>((.|\n)*?)<\/\1>/gm, (match, tag, props, content) => {
		console.log({ match, tag, props, content })
		// If the tag is not a common HTML tag, return the original match
		if (!commonTags.includes(tag)) {
			return match;
		}

		// Replace props with HTML attributes
		const attributes = props.replace(/\s*(\w+)\s*=\s*\{([^}]+)\}/g, (match, name, expression) => {
			console.log("attributes", expression)
			return `${name}="${eval('(' + expression + ")()")}"`;
		});

		// Replace JavaScript expressions and code with their values
		const replacedContent = content.replace(/\{([^}]+)\}/g, (match, expression) => {
			console.log("replacedContent", expression)
			return eval('(' + expression + ")()");
		});

		// Replace any JavaScript code within JSX tags with a marker
		const jsMarker = '_JSXJS_';
		const jsxWithJs = replacedContent.replace(/(<[^\s>]+\s[^>]*>[^<]*?)\{([\s\S]*?)\}([^>]*<\/[^\s>]+>)/gm, (match, startTag, jsCode, endTag) => {
			return `${startTag}${jsMarker}${jsCode}${jsMarker}${endTag}`;
		});

		// Execute the JavaScript code within the JSX tags
		const replacedJsxWithJs = jsxWithJs.replace(new RegExp(jsMarker + '([\\s\\S]*?)' + jsMarker, 'g'), (match, expression) => {
			console.log('replacedJsxWithJs', expression)
			return eval('(' + expression+")()");
		});

		if (tag) {
			return `<${tag}${attributes}>${replacedJsxWithJs}</${tag}>`;
		} else {
			return match;
		}
	});

	return html;
}


const jsx = `
	<div class="{() => name}>
		{() => "hello" }
	</div>
`;
const name = 'John';
const jsx2 = "<h1>Hello, {() => 'John'}!</h1>";
console.log(jsx.replace(/\s*(\w+)\s*=\s*\{([^}]+)\}/g, "HEY"))

const html = jsxToHtml(jsx)
console.log(html);