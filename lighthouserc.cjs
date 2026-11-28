const sharedAssertions = {
	"categories:accessibility": ["error", { minScore: 1 }],
	"categories:best-practices": ["error", { minScore: 1 }],
	"categories:seo": ["error", { minScore: 1 }],
	"speed-index": ["error", { maxNumericValue: 1800 }],
	"total-blocking-time": ["error", { maxNumericValue: 50 }],
	"cumulative-layout-shift": ["error", { maxNumericValue: 0.01 }],
};

module.exports = {
	ci: {
		collect: {
			startServerCommand:
				"ASTRO_PREVIEW_BACKGROUND=0 pnpm run preview --host 127.0.0.1 --port 4321",
			startServerReadyPattern: "Local",
			startServerReadyTimeout: 30000,
			url: [
				"http://127.0.0.1:4321/practice-lab/",
				"http://127.0.0.1:4321/practice-lab/study/",
				"http://127.0.0.1:4321/practice-lab/certifications/ccdv-f/",
			],
			numberOfRuns: 5,
			settings: {
				formFactor: "mobile",
			},
		},
		assert: {
			assertMatrix: [
				{
					matchingUrlPattern: "http://127\\.0\\.0\\.1:4321/practice-lab/(study/)?$",
					assertions: {
						...sharedAssertions,
						"categories:performance": ["error", { minScore: 0.99 }],
						"first-contentful-paint": ["error", { maxNumericValue: 1200 }],
						"largest-contentful-paint": ["error", { maxNumericValue: 1800 }],
					},
				},
				{
					matchingUrlPattern: "http://127\\.0\\.0\\.1:4321/practice-lab/certifications/",
					assertions: {
						...sharedAssertions,
						"categories:performance": ["error", { minScore: 0.97 }],
						"first-contentful-paint": ["error", { maxNumericValue: 1800 }],
						"largest-contentful-paint": ["error", { maxNumericValue: 2300 }],
					},
				},
			],
		},
		upload: {
			target: "temporary-public-storage",
		},
	},
};
