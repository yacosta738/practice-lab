// CCAR-P certification configuration — generated from Cert Pro Quest
// Source: Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)

import type { CertificationConfig } from "../../lib/quiz-types";

export const config: CertificationConfig = {
	slug: "ccar-p",
	title: "Claude Certified Architect — Professional",
	subtitle: "CCAR-P",
	description:
		"Practice questions covering solution design, integration, evaluation, governance, stakeholder communication, and operational enablement.",
	theme: {
		brand: "#7b68ee",
		brand2: "#6a5acd",
		brandSoft: "rgba(123, 104, 238, 0.08)",
	},
	domains: {
		D1: { id: "D1", name: "Solution Design & Architecture", weight: 17.2 },
		D2: { id: "D2", name: "Claude Models, Prompting & Context Engineering", weight: 13.8 },
		D3: { id: "D3", name: "Integration", weight: 19 },
		D4: { id: "D4", name: "Evaluation, Testing & Optimization", weight: 15.5 },
		D5: { id: "D5", name: "Governance, Safety & Risk Management", weight: 13.8 },
		D6: { id: "D6", name: "Stakeholder Communication & Lifecycle Management", weight: 13.8 },
		D7: { id: "D7", name: "Developer Productivity & Operational Enablement", weight: 6.9 },
	},
	examBlueprint: {
		D1: 9,
		D2: 7,
		D3: 9,
		D4: 8,
		D5: 7,
		D6: 7,
		D7: 3,
	},
	totalQuestions: 50,
	examMinutes: 100,
	blueprintSource: "derived",
};
