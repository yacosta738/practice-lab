import { defineHastPlugin } from "satteri";

export function externalLinkAttributes(properties, site) {
	if (!properties || typeof properties.href !== "string") {
		return null;
	}

	let siteUrl;
	let linkUrl;
	try {
		siteUrl = site instanceof URL ? site : new URL(site);
		linkUrl = new URL(properties.href, siteUrl);
	} catch {
		return null;
	}

	if (
		(linkUrl.protocol !== "http:" && linkUrl.protocol !== "https:") ||
		linkUrl.origin === siteUrl.origin
	) {
		return null;
	}

	const existingRel = Array.isArray(properties.rel)
		? properties.rel
		: typeof properties.rel === "string"
			? properties.rel.split(/\s+/)
			: [];
	return {
		target: "_blank",
		rel: [
			...new Set([
				...existingRel.filter((token) => typeof token === "string" && token.length > 0),
				"noopener",
				"noreferrer",
			]),
		],
	};
}

export function createExternalLinksPlugin(site) {
	const siteUrl = new URL(site);
	return defineHastPlugin({
		name: "markdown-external-links",
		element: {
			filter: ["a"],
			visit(node, context) {
				const attributes = externalLinkAttributes(node.properties, siteUrl);
				if (!attributes) {
					return;
				}
				context.setProperty(node, "target", attributes.target);
				context.setProperty(node, "rel", attributes.rel);
			},
		},
	});
}
