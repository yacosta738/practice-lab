// @ts-check

import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config

// `base` depends on the deployment platform:
// - Vercel: root path ("/")
// - GitHub Pages: subpath ("/practice-lab")
// Note: `import.meta.env` is not available in astro.config.mjs. Use `process.env` instead.
const isVercel = process.env.VERCEL === "1";

// On Vercel, use server output with the Vercel adapter for SSR.
// Locally (and for GitHub Pages), use static output so that `astro preview` works
// and Playwright a11y tests can start the preview server.
let adapter;
if (isVercel) {
	const { default: vercel } = await import("@astrojs/vercel");
	adapter = vercel();
}

export default defineConfig({
	site: isVercel ? "https://certificate-nine-phi.vercel.app" : "https://yacosta738.github.io",
	base: isVercel ? "/" : "/practice-lab",
	output: isVercel ? "server" : "static",
	adapter,
	integrations: [sitemap()],
	vite: {
		// LightningCSS cannot parse @container anchored() yet (lightningcss#1176).
		// Use esbuild for CSS minification to support anchored container queries.
		build: {
			cssMinify: "esbuild",
		},
	},
});
