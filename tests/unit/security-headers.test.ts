import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requiredHeaders = [
	["X-Content-Type-Options", "nosniff"],
	["X-Frame-Options", "DENY"],
	["Referrer-Policy", "strict-origin-when-cross-origin"],
	["Content-Security-Policy", "frame-ancestors 'none'; object-src 'none'; base-uri 'self'"],
] as const;

const vercelConfig = JSON.parse(
	readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as { headers?: { source: string; headers: { key: string; value: string }[] }[] };
const staticHeaders = readFileSync(new URL("../../public/_headers", import.meta.url), "utf8");

describe("deployment security headers", () => {
	it("applies the required headers to Vercel routes", () => {
		const routeHeaders = vercelConfig.headers?.find(({ source }) => source === "/(.*)")?.headers;

		for (const [key, value] of requiredHeaders) {
			expect(routeHeaders?.find((header) => header.key === key)?.value).toBe(value);
		}
	});

	it("applies the same required headers to static hosting routes", () => {
		for (const [key, value] of requiredHeaders) {
			expect(staticHeaders).toContain(`${key}: ${value}`);
		}
	});
});
