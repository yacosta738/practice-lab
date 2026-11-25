import { once } from "node:events";
import { createServer, type Server } from "node:http";

import { expect, test } from "@playwright/test";
import { handleVercelSmokeRoute } from "../../scripts/lib/vercel-smoke-headers.mjs";

const routes = [
	{ path: "/", heading: "Practice with confidence." },
	{ path: "/study/", heading: "Study notes, organised by certification." },
	{ path: "/study/ccdv-f/", heading: "Claude Developer Foundations" },
	{
		path: "/study/ccdv-f/model-selection-and-optimization-workshop/",
		heading: "Model Selection and Optimization Workshop",
	},
];

async function listen(server: Server) {
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Expected a TCP server address");
	}
	return `http://127.0.0.1:${address.port}`;
}

function closeServer(server: Server) {
	return new Promise<void>((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
}

test.beforeEach(async ({ page }, testInfo) => {
	const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
	if (!bypassSecret) {
		return;
	}

	const baseUrl = testInfo.project.use.baseURL;
	if (typeof baseUrl !== "string") {
		throw new Error("Vercel smoke tests require a configured deployment base URL");
	}
	const deploymentOrigin = new URL(baseUrl).origin;

	await page.route("**/*", async (route) => {
		await handleVercelSmokeRoute(route, deploymentOrigin, bypassSecret);
	});
});

for (const route of routes) {
	test(`Vercel renders ${route.path}`, async ({ page }) => {
		const response = await page.goto(route.path);

		expect(response?.status(), `${route.path} should return HTTP 200`).toBe(200);
		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
		await expect(page.getByRole("navigation", { name: "Workspace" })).toBeVisible();
	});
}

test("the homepage study action reaches the study library navigation", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Study the notes" }).click();

	await expect(page).toHaveURL(/\/study\/$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Study notes, organised by certification." }),
	).toBeVisible();
	await expect(
		page
			.getByRole("navigation", { name: "Workspace" })
			.getByRole("link", { name: "Learn · Study library" }),
	).toHaveAttribute("aria-current", "page");
});

test("keeps the bypass secret on same-origin redirects but strips it cross-origin", async ({
	page,
}) => {
	const destinationRequests: Array<string | undefined> = [];
	const sourceRequests: Array<{ path: string; bypassHeader: string | undefined }> = [];
	const destinationServer = createServer((request, response) => {
		const bypassHeader = request.headers["x-vercel-protection-bypass"];
		destinationRequests.push(typeof bypassHeader === "string" ? bypassHeader : undefined);
		response.writeHead(200, { "content-type": "text/html" });
		response.end("<main>Redirect target</main>");
	});
	const destinationOrigin = await listen(destinationServer);
	let sourceOrigin = "";
	const sourceServer = createServer((request, response) => {
		const bypassHeader = request.headers["x-vercel-protection-bypass"];
		sourceRequests.push({
			path: request.url ?? "",
			bypassHeader: typeof bypassHeader === "string" ? bypassHeader : undefined,
		});
		if (request.url === "/redirect") {
			response.writeHead(302, { location: `${sourceOrigin}/same-origin` });
			response.end();
			return;
		}
		if (request.url === "/same-origin") {
			response.writeHead(302, { location: `${destinationOrigin}/target` });
			response.end();
			return;
		}
		response.writeHead(404);
		response.end();
	});

	try {
		sourceOrigin = await listen(sourceServer);
		await page.unrouteAll();
		await page.route("**/*", (route) =>
			handleVercelSmokeRoute(route, sourceOrigin, "deployment-secret"),
		);

		const response = await page.goto(`${sourceOrigin}/redirect`);
		expect(response?.status()).toBe(200);
		expect(sourceRequests).toEqual([
			{ path: "/redirect", bypassHeader: "deployment-secret" },
			{ path: "/same-origin", bypassHeader: "deployment-secret" },
		]);
		expect(destinationRequests).toEqual([undefined]);
	} finally {
		await page.unrouteAll();
		await Promise.all([closeServer(sourceServer), closeServer(destinationServer)]);
	}
});
