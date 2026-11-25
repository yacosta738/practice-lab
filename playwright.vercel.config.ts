import { defineConfig, devices } from "@playwright/test";

const rawDeploymentUrl = process.env.VERCEL_SMOKE_BASE_URL;
if (!rawDeploymentUrl) {
	throw new Error("VERCEL_SMOKE_BASE_URL is required for Vercel smoke tests");
}

const deploymentUrl = new URL(
	/^https?:\/\//i.test(rawDeploymentUrl) ? rawDeploymentUrl : `https://${rawDeploymentUrl}`,
);
if (deploymentUrl.protocol !== "https:") {
	throw new Error("Vercel smoke tests require an HTTPS deployment URL");
}

const deploymentHost = deploymentUrl.hostname.toLowerCase();
const isProjectDeployment =
	deploymentHost === "certificate-nine-phi.vercel.app" ||
	deploymentHost === "project-lab.vercel.app" ||
	(deploymentHost.startsWith("project-lab-") && deploymentHost.endsWith(".vercel.app"));
if (!isProjectDeployment) {
	throw new Error(`Unexpected Vercel deployment host: ${deploymentUrl.hostname}`);
}

export default defineConfig({
	testDir: "./tests/vercel-smoke",
	timeout: 30_000,
	expect: { timeout: 10_000 },
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	reporter: [["list"]],
	use: {
		baseURL: deploymentUrl.origin,
		trace: "off",
		screenshot: "off",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
