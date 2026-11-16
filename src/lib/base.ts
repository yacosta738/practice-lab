/**
 * Deployment base path, always with a trailing slash.
 *
 * `import.meta.env.BASE_URL` mirrors the `base` value in astro.config.mjs
 * verbatim ("/practice-lab"), so concatenating a relative path onto it would
 * produce "/practice-labcertifications/ccdv-f" instead of
 * "/practice-lab/certifications/ccdv-f".
 */
export const base = import.meta.env.BASE_URL.endsWith("/")
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`;
