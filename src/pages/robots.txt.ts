import type { APIRoute } from "astro";

import { base } from "../lib/base";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
	if (!site) throw new Error("Astro site must be configured to generate robots.txt");

	const sitemapUrl = new URL(`${base}sitemap-index.xml`, site);
	const robots = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`;

	return new Response(robots, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
