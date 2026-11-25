import { decodeHTMLAttribute } from "entities";

const htmlTagPattern = /<([a-z][a-z0-9:-]*)\b(?:"[^"]*"|'[^']*'|[^'">])*?>/gi;
const htmlAttributePattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gy;

export function htmlAttributes(tag) {
	const tagName = tag.match(/^<[a-z][a-z0-9:-]*\b/i)?.[0] ?? "";
	const source = tag.slice(tagName.length, -1);
	const attributes = [];
	let position = 0;

	while (position < source.length) {
		while (position < source.length && /[\s/]/.test(source[position])) {
			position++;
		}
		htmlAttributePattern.lastIndex = position;
		const match = htmlAttributePattern.exec(source);
		if (!match) {
			position++;
			continue;
		}

		position = htmlAttributePattern.lastIndex;
		const value = match[2] ?? match[3] ?? match[4];
		if (value !== undefined) {
			attributes.push([match[1].toLowerCase(), decodeHTMLAttribute(value)]);
		}
	}

	return attributes;
}

export function hasHtmlFragment(html, fragment) {
	const rawFragment = fragment.startsWith("#") ? fragment.slice(1) : fragment;
	if (!rawFragment) {
		return true;
	}

	let target;
	try {
		target = decodeURIComponent(rawFragment);
	} catch {
		return false;
	}

	const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, "");
	const tagPattern = new RegExp(htmlTagPattern);
	let tagMatch = tagPattern.exec(htmlWithoutComments);
	while (tagMatch) {
		const [, tagName] = tagMatch;
		if (tagName.toLowerCase() === "script") {
			const scriptEndPattern = /<\/script\s*>/gi;
			scriptEndPattern.lastIndex = tagPattern.lastIndex;
			const scriptEnd = scriptEndPattern.exec(htmlWithoutComments);
			if (!scriptEnd) {
				break;
			}
			tagPattern.lastIndex = scriptEndPattern.lastIndex;
			tagMatch = tagPattern.exec(htmlWithoutComments);
			continue;
		}

		for (const [attributeName, value] of htmlAttributes(tagMatch[0])) {
			if (attributeName !== "id" && (attributeName !== "name" || tagName.toLowerCase() !== "a")) {
				continue;
			}

			if (value === target) {
				return true;
			}
		}
		tagMatch = tagPattern.exec(htmlWithoutComments);
	}

	return false;
}
