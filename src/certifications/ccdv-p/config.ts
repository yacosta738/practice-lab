import type { CertificationConfig } from "../../lib/quiz-types";

export const config: CertificationConfig = {
	slug: "ccdv-p",
	title: "Claude Certified Developer — Professional",
	subtitle: "CCDV-P",
	description:
		"Practice all 8 Claude Certified Developer Professional domains with source-linked questions, detailed explanations, and timed mock exams.",
	theme: {
		brand: "#286f83",
		brand2: "#205b6b",
		brandSoft: "rgba(40, 111, 131, 0.08)",
	},
	domains: {
		D1: { id: "D1", name: "Advanced Agent Architecture and Orchestration", weight: 17 },
		D2: {
			id: "D2",
			name: "Production Integration, Reliability, and Knowledge Grounding",
			weight: 20,
		},
		D3: { id: "D3", name: "Observability and Production Monitoring", weight: 12 },
		D4: { id: "D4", name: "Advanced Debugging and Incident Response", weight: 10 },
		D5: { id: "D5", name: "Evaluation Engineering and Quality Assurance", weight: 12 },
		D6: { id: "D6", name: "Cost and Latency Optimization at Scale", weight: 8 },
		D7: { id: "D7", name: "Runtime Guardrails and Production Security", weight: 11 },
		D8: { id: "D8", name: "Agent Fleet Operations for Software Delivery", weight: 10 },
	},
	examBlueprint: {
		D1: 12,
		D2: 14,
		D3: 8,
		D4: 7,
		D5: 8,
		D6: 6,
		D7: 8,
		D8: 7,
	},
	passingScore: 720,
	totalQuestions: 70,
	examMinutes: 120,
	examGuideNote:
		"The live exam has 70 items (60 scored and 10 unscored) in 120 minutes, with a scaled passing score of 720 on a 100–1,000 scale. This 70-item Practice Lab mock scores every question.",
	blueprintSource: "derived",
};
