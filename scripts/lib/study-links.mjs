const htmlTagPattern = /<([a-z][a-z0-9:-]*)\b[^>]*>/gi;
const anchorAttributePattern = /(?:^|\s)(id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;

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
	for (const [tag, tagName] of htmlWithoutComments.matchAll(htmlTagPattern)) {
		for (const attribute of tag.matchAll(anchorAttributePattern)) {
			const attributeName = attribute[1].toLowerCase();
			if (attributeName === "name" && tagName.toLowerCase() !== "a") {
				continue;
			}

			const value = attribute[2] ?? attribute[3] ?? attribute[4];
			if (value === target) {
				return true;
			}
		}
	}

	return false;
}
