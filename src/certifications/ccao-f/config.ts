// CCAO-F certification configuration

import type { CertificationConfig } from "../../lib/quiz-types";

export const config: CertificationConfig = {
	slug: "ccao-f",
	title: "Claude Certified Associate — Foundations",
	subtitle: "CCAO-F",
	description:
		"Practice questions covering business-user fundamentals: prompting, output evaluation, product selection, governance, and troubleshooting.",
	theme: {
		brand: "#4a90d9",
		brand2: "#3a7bc8",
		brandSoft: "rgba(74, 144, 217, 0.08)",
	},
	domains: {
		D1: { id: "D1", name: "Prompting and Task Execution", weight: 14 },
		D2: { id: "D2", name: "Output Evaluation and Validation", weight: 21 },
		D3: { id: "D3", name: "Product and Model Selection", weight: 12 },
		D4: { id: "D4", name: "Workflow Integration and Solution Design", weight: 16 },
		D5: { id: "D5", name: "Configuration and Knowledge Management", weight: 12 },
		D6: { id: "D6", name: "Governance, Risk, and Responsible Use", weight: 15 },
		D7: { id: "D7", name: "Troubleshooting and Optimization", weight: 10 },
	},
	examBlueprint: {
		D1: 7,
		D2: 11,
		D3: 6,
		D4: 8,
		D5: 6,
		D6: 7,
		D7: 5,
	},
	totalQuestions: 50,
	examMinutes: 100,
	passingScore: 720,
	blueprintSource: "derived",
	examGuideNote:
		"The official exam has 60 items in 120 minutes and a passing scaled score of 720/1000. This Practice Lab mock has 50 questions in 100 minutes; its domain counts are derived, and its raw percentage does not predict the official scaled result.",
};
