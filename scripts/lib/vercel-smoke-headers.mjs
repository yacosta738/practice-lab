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
