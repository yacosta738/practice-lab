import { describe, expect, it } from "vitest";

import { vercelSmokeRequestHeaders } from "../../scripts/lib/vercel-smoke-headers.mjs";

describe("Vercel smoke request headers", () => {
	const deploymentOrigin = "https://certificate-nine-phi.vercel.app";

	it("sends the bypass secret only to the configured deployment origin", () => {
		const requestHeaders = {
			accept: "text/html",
			"x-vercel-protection-bypass": "inherited-secret",
		};

		expect(
			vercelSmokeRequestHeaders(
				`${deploymentOrigin}/study/`,
				requestHeaders,
				deploymentOrigin,
				"deployment-secret",
			),
		).toEqual({
			accept: "text/html",
			"x-vercel-protection-bypass": "deployment-secret",
		});
		expect(
			vercelSmokeRequestHeaders(
				"https://fonts.example.test/font.woff2",
				requestHeaders,
				deploymentOrigin,
				"deployment-secret",
			),
		).toEqual({ accept: "text/html" });
		expect(requestHeaders["x-vercel-protection-bypass"]).toBe("inherited-secret");
	});

	it("removes inherited bypass headers when no secret is configured", () => {
		expect(
			vercelSmokeRequestHeaders(
				`${deploymentOrigin}/study/`,
				{ "X-Vercel-Protection-Bypass": "inherited-secret" },
				deploymentOrigin,
				undefined,
			),
		).toEqual({});
	});
});
