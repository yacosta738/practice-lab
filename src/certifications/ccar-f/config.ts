// CCAR-F certification configuration — generated from Cert Pro Quest
// Source: Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)

import type { CertificationConfig } from "../../lib/quiz-types";

export const config: CertificationConfig = {
	slug: "ccar-f",
	title: "Claude Certified Architect — Foundations",
	subtitle: "CCAR-F",
	description:
		"Practice questions covering agentic architecture, tool design and MCP integration, Claude Code workflows, prompt engineering, and context reliability.",
	theme: {
		brand: "#20b2aa",
		brand2: "#1a9e97",
		brandSoft: "rgba(32, 178, 170, 0.08)",
	},
	domains: {
		D1: { id: "D1", name: "Agentic Architecture & Orchestration", weight: 26.7 },
		D2: { id: "D2", name: "Tool Design & MCP Integration", weight: 18.3 },
		D3: { id: "D3", name: "Claude Code Configuration & Workflows", weight: 20 },
		D4: { id: "D4", name: "Prompt Engineering & Structured Output", weight: 20 },
		D5: { id: "D5", name: "Context Management & Reliability", weight: 15 },
	},
	examBlueprint: {
		D1: 13,
		D2: 9,
		D5: 8,
		D3: 10,
		D4: 10,
	},
	totalQuestions: 50,
	examMinutes: 100,
	blueprintSource: "derived",
};
