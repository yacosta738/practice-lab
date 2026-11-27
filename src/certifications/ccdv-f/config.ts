// CCDV-F certification configuration

import type { CertificationConfig } from "../../lib/quiz-types";

export const config: CertificationConfig = {
	slug: "ccdv-f",
	title: "Claude Developer Foundations",
	subtitle: "CCDV-F",
	description:
		"Practice all 8 Claude Developer Foundations exam domains with source-linked questions, detailed explanations, and timed mock exams.",
	theme: {
		brand: "#e76f51",
		brand2: "#d45a3d",
		brandSoft: "rgba(231, 111, 81, 0.08)",
	},
	domains: {
		D1: { id: "D1", name: "Agents & Workflows", weight: 14.7 },
		D2: { id: "D2", name: "Applications & Integration", weight: 33.1 },
		D3: { id: "D3", name: "Claude Code", weight: 3.1 },
		D4: { id: "D4", name: "Evals, Testing & Debugging", weight: 2.6 },
		D5: { id: "D5", name: "Model Selection & Optimization", weight: 16.8 },
		D6: { id: "D6", name: "Prompt & Context Engineering", weight: 11 },
		D7: { id: "D7", name: "Security & Safety", weight: 8.1 },
		D8: { id: "D8", name: "Tools & MCPs", weight: 10.6 },
	},
	examBlueprint: {
		D1: 8,
		D2: 18,
		D3: 2,
		D4: 1,
		D5: 9,
		D6: 6,
		D7: 4,
		D8: 5,
	},
	passingScore: 720,
	totalQuestions: 53,
	examMinutes: 120,
	examGuideNote: "The Practice Lab bank follows the published exam objectives.",
	blueprintSource: "official",
};
