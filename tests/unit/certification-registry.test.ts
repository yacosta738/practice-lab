import { describe, expect, it } from "vitest";
import { getCertificationList, loadCertification } from "../../src/certifications";

describe("certification registry", () => {
	it("makes CCDV-P available with its configured practice bank", async () => {
		const certifications = await getCertificationList();
		const config = certifications.find((certification) => certification.slug === "ccdv-p");

		if (!config) throw new Error("Expected CCDV-P to be registered.");
		expect(config.totalQuestions).toBe(70);

		const entry = await loadCertification("ccdv-p");
		if (!entry) throw new Error("Expected CCDV-P questions to load.");
		expect(entry.questions).toHaveLength(config.totalQuestions);
	});
});
