import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hasHtmlFragment, htmlAttributes } from "./lib/study-links.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const studyRoot = path.join(distRoot, "study");
const siteOrigin = "https://practice-lab.invalid";
const configuredSiteOrigin =
	process.env.VERCEL === "1"
		? "https://certificate-nine-phi.vercel.app"
		: "https://yacosta738.github.io";
const basePath = process.env.VERCEL === "1" ? "/" : "/practice-lab/";
// Certification fragment targets are inserted by the client app after static HTML is parsed.
const clientRenderedCertificationPrefix = new URL(`${basePath}certifications/`, siteOrigin)
	.pathname;
const errors = [];
const htmlCache = new Map();
let checkedExternalMarkdownLinks = 0;

async function findHtmlFiles(directory) {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await findHtmlFiles(entryPath)));
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			files.push(entryPath);
		}
	}
	return files;
}

async function isFile(filePath) {
	try {
		return (await stat(filePath)).isFile();
	} catch {
		return false;
	}
}

async function htmlForFile(filePath) {
	if (!htmlCache.has(filePath)) {
		htmlCache.set(filePath, await readFile(filePath, "utf8"));
	}
	return htmlCache.get(filePath);
}

function routeForHtmlFile(filePath) {
	const relativePath = path.relative(distRoot, filePath).split(path.sep);
	const routeSegments = relativePath.slice(0, -1);
	return `/${routeSegments.join("/")}${routeSegments.length === 0 ? "" : "/"}`;
}

function filePathForUrl(url) {
	const baseWithoutTrailingSlash = basePath === "/" ? "/" : basePath.slice(0, -1);
	if (url.pathname !== baseWithoutTrailingSlash && !url.pathname.startsWith(basePath)) {
		throw new Error(`internal URL is outside the configured base path ${basePath}`);
	}

	const relativeUrlPath =
		basePath === "/" ? url.pathname.slice(1) : url.pathname.slice(basePath.length);
	let decodedPath;
	try {
		decodedPath = decodeURIComponent(relativeUrlPath);
	} catch {
		throw new Error(`URL contains an invalid encoded path: ${url.pathname}`);
	}

	const requestedPath = path.resolve(distRoot, decodedPath);
	if (requestedPath !== distRoot && !requestedPath.startsWith(`${distRoot}${path.sep}`)) {
		throw new Error(`internal URL escapes the build output: ${url.pathname}`);
	}

	const candidates = [requestedPath];
	if (url.pathname.endsWith("/") || path.extname(requestedPath) === "") {
		candidates.push(path.join(requestedPath, "index.html"));
	}
	if (path.extname(requestedPath) === "") {
		candidates.push(`${requestedPath}.html`);
	}
	return candidates;
}

async function main() {
	const pages = await findHtmlFiles(studyRoot);
	if (pages.length === 0) {
		throw new Error("No generated study pages found; run `pnpm build` first.");
	}

	const generatedRoutes = new Set();
	for (const pagePath of pages) {
		const route = routeForHtmlFile(pagePath);
		if (generatedRoutes.has(route)) {
			errors.push(`${route}: duplicate generated study route`);
		}
		generatedRoutes.add(route);
	}

	for (const pagePath of pages) {
		const route = routeForHtmlFile(pagePath);
		const html = await htmlForFile(pagePath);
		const pageUrl = new URL(`${basePath}${route.slice(1)}`, siteOrigin);
		const anchors = html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gis);

		for (const [, , rawHref] of anchors) {
			const href = rawHref.replaceAll("&amp;", "&").trim();
			if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) {
				continue;
			}

			let url;
			try {
				url = new URL(href, pageUrl);
			} catch {
				errors.push(`${route}: invalid link href ${JSON.stringify(href)}`);
				continue;
			}
			if (url.origin !== siteOrigin) {
				continue;
			}

			let candidates;
			try {
				candidates = filePathForUrl(url);
			} catch (error) {
				errors.push(`${route}: ${JSON.stringify(href)} — ${error.message}`);
				continue;
			}

			let targetExists = false;
			let targetHtmlPath;
			for (const candidate of candidates) {
				if (await isFile(candidate)) {
					targetExists = true;
					if (path.extname(candidate).toLowerCase() === ".html") {
						targetHtmlPath = candidate;
					}
					break;
				}
			}
			if (!targetExists) {
				errors.push(
					`${route}: ${JSON.stringify(href)} does not resolve to a generated page or asset`,
				);
			} else if (
				url.hash &&
				targetHtmlPath &&
				!url.pathname.startsWith(clientRenderedCertificationPrefix)
			) {
				const targetHtml = await htmlForFile(targetHtmlPath);
				if (!hasHtmlFragment(targetHtml, url.hash)) {
					errors.push(
						`${route}: ${JSON.stringify(href)} points to a missing HTML fragment ${JSON.stringify(url.hash.slice(1))}`,
					);
				}
			}
		}

		const article = html.match(
			/<article\b[^>]*\bclass="[^"]*\bstudyProse\b[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
		);
		if (!article) {
			if (route.split("/").filter(Boolean).length >= 3) {
				errors.push(`${route}: generated study article was not found`);
			}
			continue;
		}

		for (const [tag] of article[1].matchAll(/<a(?=[\t\n\f\r />])(?:"[^"]*"|'[^']*'|[^'">])*>/gi)) {
			const attributes = htmlAttributes(tag);
			const href = attributes.find(([name]) => name === "href")?.[1].trim();
			if (!href) {
				continue;
			}
			let url;
			try {
				url = new URL(href, configuredSiteOrigin);
			} catch {
				continue;
			}
			if (
				(url.protocol !== "http:" && url.protocol !== "https:") ||
				url.origin === configuredSiteOrigin
			) {
				continue;
			}
			checkedExternalMarkdownLinks++;

			const target = attributes.find(([name]) => name === "target")?.[1];
			const rel = attributes
				.find(([name]) => name === "rel")?.[1]
				?.toLowerCase()
				.split(/\s+/);
			if (target !== "_blank") {
				errors.push(
					`${route}: external Markdown link ${JSON.stringify(href)} must use target="_blank"`,
				);
			}
			if (!rel?.includes("noopener") || !rel.includes("noreferrer")) {
				errors.push(
					`${route}: external Markdown link ${JSON.stringify(href)} must use rel="noopener noreferrer"`,
				);
			}
		}
	}

	if (errors.length > 0) {
		console.error(`Study link check failed with ${errors.length} error(s):`);
		for (const error of errors) {
			console.error(`- ${error}`);
		}
		process.exitCode = 1;
		return;
	}

	console.log(
		`Checked ${pages.length} generated study pages and ${checkedExternalMarkdownLinks} external Markdown links under base path ${basePath}; internal links resolve and external links use safe new-tab attributes.`,
	);
}

await main();
