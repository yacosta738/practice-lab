// @ts-check

import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

// https://astro.build/config

// `base` depends on the deployment platform:
// - Vercel: root path ("/")
// - GitHub Pages: subpath ("/practice-lab")
// Note: `import.meta.env` is not available in astro.config.mjs. Use `process.env` instead.
const isVercel = process.env.VERCEL === "1";

export default defineConfig({
	site: isVercel ? "https://certificate-nine-phi.vercel.app" : "https://yacosta738.github.io",
	base: isVercel ? "/" : "/practice-lab",
	output: "server",
	adapter: vercel(),
	integrations: [sitemap()],
});
