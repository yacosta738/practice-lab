export const CPQ_CORRECTIONS_VERSION = 1;

// Source-verified corrections to imported CPQ records. Keep these separate from
// generated question banks so regeneration preserves attribution and CPQ IDs.
const corrections = {
	"ccar-f:2.3": {
		options: [
			"State “never run Bash” prominently in the SKILL.md instructions",
			"Add a pre-execution validation hook that scans the skill’s rendered instructions for shell commands before every run",
			"Run the skill only in plan mode, where commands are proposed but not executed",
			"Set allowed-tools to the required file-write tools and configure an effective permission rule that explicitly denies Bash",
		],
		explanation:
			"Omitting Bash from allowed-tools alone does not guarantee that the skill cannot run shell commands. Preserve the required file-write tools, and configure an effective permission rule that explicitly denies Bash. Instructions alone do not create this boundary.",
	},
	"ccar-f:4.6": {
		question:
			"[Scenario 4: Developer Productivity with Claude] Developers keep invoking your /generate-fixture skill bare, without the entity type and record count it needs, then get confused by the results. Which frontmatter option communicates the expected parameters most directly, even though it will not prompt for missing values?",
		options: [
			"context: fork, isolating the confusion in a subagent",
			"allowed-tools, restricting what the skill can touch",
			"A more detailed description block documenting the required parameters and their defaults",
			"argument-hint, providing autocomplete guidance for the expected parameters",
		],
		explanation:
			"argument-hint provides autocomplete guidance about expected arguments. It does not automatically prompt for missing values on a bare invocation. No listed option guarantees that behavior; provide usage guidance and handle missing arguments in the skill workflow.",
		whyNot:
			"A isolates execution context, not missing arguments; B concerns tool permissions; C documents expected parameters but does not prompt; D provides autocomplete guidance, not an automatic missing-argument prompt.",
	},
	"ccar-f:6.1": {
		options: [
			"Strengthen the prompt: “respond ONLY with valid JSON, no exceptions”",
			"Post-process the text with regexes that strip fences and repair syntax",
			"Define the extraction as a tool whose input schema is your JSON schema, set strict: true, and read the data from the tool_use block",
			"Switch the output format to YAML, whose forgiving syntax avoids JSON’s brittle commas and quoting rules",
		],
		explanation:
			"With strict tool use enabled, the API enforces the input schema's structural constraints on tool_use input, making extraction more reliable than free-form prose. Schema conformance does not establish that extracted values are factually correct or semantically consistent; validate those separately.",
	},
	"ccar-f:6.4": {
		options: [
			"Schema compliance was falsely advertised; file a bug",
			"Schemas can constrain structure when strict tool use is enabled, not semantics — add validation: extract calculated_total vs stated_total and flag mismatches with a conflict_detected flag",
			"Relax every numeric field to an unconstrained string type so schema validation can never reject an extraction",
			"Re-run each affected extraction with the numeric discrepancy described in the retry prompt so the model can correct it",
		],
		explanation:
			"A schema can constrain output structure when strict tool use is enabled, but tool use alone does not ensure structural compliance, truth, or semantic consistency. Reconcile calculated values with stated values and validate field relationships in application code; a schema cannot establish that invoice values are correct.",
	},
	"ccdv-f:5.9": {
		correctAnswers: [2],
		selectCount: 1,
	},
};

export function applyCpqCorrections(bank, certSlug) {
	const prefix = `${certSlug}:`;
	return {
		...bank,
		questions: bank.questions.map((question) => {
			const correction = corrections[`${prefix}${question.id.replace(/^CPQ-[^-]+-/, "")}`];
			return correction ? { ...question, ...correction } : question;
		}),
	};
}
