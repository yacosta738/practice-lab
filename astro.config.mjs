// @ts-check

import { satteri } from "@astrojs/markdown-satteri";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";
import { createExternalLinksPlugin } from "./src/hast/external-links.mjs";

// https://astro.build/config

// `base` depends on the deployment platform:
// - Vercel: root path ("/")
// - GitHub Pages: subpath ("/practice-lab")
// Note: `import.meta.env` is not available in astro.config.mjs. Use `process.env` instead.
const isVercel = process.env.VERCEL === "1";
const site = isVercel ? "https://certificate-nine-phi.vercel.app" : "https://yacosta738.github.io";

// On Vercel, use server output with the Vercel adapter for SSR.
// Locally (and for GitHub Pages), use static output so that `astro preview` works
// and Playwright a11y tests can start the preview server.
let adapter;
if (isVercel) {
	const { default: vercel } = await import("@astrojs/vercel");
	adapter = vercel();
}

export default defineConfig({
	site,
	base: isVercel ? "/" : "/practice-lab",
	output: isVercel ? "server" : "static",
	adapter,
	markdown: {
		processor: satteri({
			hastPlugins: [createExternalLinksPlugin(site)],
		}),
	},
	env: {
		schema: {
			AHREFS_KEY: envField.string({
				context: "client",
				access: "public",
				optional: true,
			}),
			PUBLIC_FEEDBACK_TALLY_URL: envField.string({
				context: "client",
				access: "public",
				optional: true,
				default: "https://tally.so/r/GeleeQ",
			}),
			PUBLIC_FEEDBACK_GITHUB_REPO: envField.string({
				context: "client",
				access: "public",
				optional: true,
				default: "yacosta738/practice-lab",
			}),
		},
	},
	integrations: [partytown(), sitemap()],
	vite: {
		// LightningCSS cannot parse @container anchored() yet (lightningcss#1176).
		// Use esbuild for CSS minification to support anchored container queries.
		build: {
			cssMinify: "esbuild",
		},
	},
});
