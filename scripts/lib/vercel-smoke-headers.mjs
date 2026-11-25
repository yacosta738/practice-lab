/**
 * @param {string} requestUrl
 * @param {Record<string, string>} requestHeaders
 * @param {string} deploymentOrigin
 * @param {string | undefined} bypassSecret
 * @returns {Record<string, string>}
 */
export function vercelSmokeRequestHeaders(
	requestUrl,
	requestHeaders,
	deploymentOrigin,
	bypassSecret,
) {
	const headers = { ...requestHeaders };
	for (const name of Object.keys(headers)) {
		if (name.toLowerCase() === "x-vercel-protection-bypass") {
			delete headers[name];
		}
	}

	if (bypassSecret && new URL(requestUrl).origin === deploymentOrigin) {
		headers["x-vercel-protection-bypass"] = bypassSecret;
	}

	return headers;
}

/**
 * @param {import("@playwright/test").Route} route
 * @param {string} deploymentOrigin
 * @param {string | undefined} bypassSecret
 */
export async function handleVercelSmokeRoute(route, deploymentOrigin, bypassSecret) {
	const requestHeaders = await route.request().allHeaders();
	let requestUrl = route.request().url();
	for (let redirectCount = 0; ; redirectCount++) {
		const response = await route.fetch({
			url: requestUrl,
			headers: vercelSmokeRequestHeaders(
				requestUrl,
				requestHeaders,
				deploymentOrigin,
				bypassSecret,
			),
			maxRedirects: 0,
		});
		const location = response.headers().location;
		if (![300, 301, 302, 303, 307, 308].includes(response.status()) || !location) {
			await route.fulfill({ response });
			return;
		}
		if (redirectCount >= 20) {
			throw new Error(`Vercel smoke request exceeded 20 redirects from ${route.request().url()}`);
		}

		requestUrl = new URL(location, requestUrl).href;
	}
}
