import { config as ccdvFConfig } from "../certifications/ccdv-f/config";
import type { CertificationConfig } from "../lib/quiz-types";

export interface StudyCert {
	slug: string;
	title: string;
	subtitle: string;
	description: string;
	certification: CertificationConfig;
	quizPath: string;
	examGuide?: { label: string; path: string };
	learningResources?: { label: string; path: string };
	examDecisionGuide?: { label: string; path: string };
}

export const studyCerts: StudyCert[] = [
	{
		slug: "ccdv-f",
		title: "Claude Developer Foundations",
		subtitle: "CCDV-F",
		description:
			"Personal study notes for the Anthropic Claude Certified Developer Foundations exam, organised by exam domain.",
		certification: ccdvFConfig,
		quizPath: "certifications/ccdv-f",
		examGuide: {
			label: "Exam guide (PDF)",
			path: "study/ccdv-f/ccdv-f-exam-guide.pdf",
		},
		learningResources: {
			label: "Learning resources",
			path: "study/ccdv-f/learning-resources",
		},
		examDecisionGuide: {
			label: "Exam decision guide",
			path: "study/ccdv-f/exam-decision-guide",
		},
	},
];

export function getStudyCert(slug: string): StudyCert | undefined {
	return studyCerts.find((cert) => cert.slug === slug);
}
