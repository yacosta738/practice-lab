// @ts-check

import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	// GitHub Pages project site: https://yacosta738.github.io/practice-lab/
	// `base` prefixes every generated asset URL and `import.meta.env.BASE_URL`.
	// Internal links must use BASE_URL so they resolve under the subpath.
	site: "https://yacosta738.github.io",
	base: "/practice-lab",
	output: "static",
	integrations: [sitemap()],
});
