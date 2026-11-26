import { config as ccaoFConfig } from "../certifications/ccao-f/config";
import { config as ccdvFConfig } from "../certifications/ccdv-f/config";
import { config as ccdvPConfig } from "../certifications/ccdv-p/config";
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
	{
		slug: "ccdv-p",
		title: ccdvPConfig.title,
		subtitle: ccdvPConfig.subtitle,
		description:
			"Original study notes for the Claude Certified Developer Professional exam, organized by official domain.",
		certification: ccdvPConfig,
		quizPath: "certifications/ccdv-p",
		learningResources: {
			label: "Source register",
			path: "study/ccdv-p/source-register",
		},
	},
	{
		slug: "ccao-f",
		title: ccaoFConfig.title,
		subtitle: ccaoFConfig.subtitle,
		description:
			"Original study notes for the Claude Certified Associate Foundations exam, organized by official domain.",
		certification: ccaoFConfig,
		quizPath: "certifications/ccao-f",
		learningResources: {
			label: "Source register",
			path: "study/ccao-f/source-register",
		},
	},
];

export function getStudyCert(slug: string): StudyCert | undefined {
	return studyCerts.find((cert) => cert.slug === slug);
}
