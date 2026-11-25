import { defineConfig, devices } from "@playwright/test";

// Keep in sync with `base` in astro.config.mjs.
// The site is served under the GitHub Pages project subpath, so the suite
// exercises the same URLs that production serves.
const BASE_PATH = "/practice-lab";
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 60_000,
	expect: { timeout: 10_000 },
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI
		? [
				["list"],
				["html", { open: "never", outputFolder: "playwright-report" }],
				["json", { outputFile: "playwright-report/results.json" }],
			]
		: [["list"]],
	use: {
		baseURL: ORIGIN,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		// ASTRO_PREVIEW_BACKGROUND=0 keeps `astro preview` in the foreground.
		// Astro 7.2+ daemonizes it when it detects an AI agent, which makes
		// Playwright see the process exit before the suite starts.
		command: `pnpm build && ASTRO_PREVIEW_BACKGROUND=0 pnpm preview --host 127.0.0.1 --port ${PORT}`,
		url: `${ORIGIN}${BASE_PATH}/`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
