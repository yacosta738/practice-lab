export interface SearchItem {
	title: string;
	href: string;
	category: string;
	badge?: string;
	text?: string;
}

export interface RankedSearchItem extends SearchItem {
	excerpt: string;
	score: number;
}

function isAnswerSectionHeading(title: string): boolean {
	const normalizedTitle = title.replace(/[`*_~]/g, "").trim();
	return /^(?:answer\s+keys?(?:\s*(?:[,;:–—-].*|and\b.*))?|answers?\s+(?:and|&)\s+(?:rationales?|explanations?)(?:\s*[,;:–—-].*)?|rationales?\s+(?:and|&)\s+answers?(?:\s*[,;:–—-].*)?)$/i.test(
		normalizedTitle,
	);
}

function isMultipleChoiceOptions(block: string): boolean {
	const optionLabels = new Set<string>();
	for (const line of block.split(/\r?\n/)) {
		const option = line.match(/^\s*(?:[-*+]\s+)?(?:\*\*)?([A-D])[.)](?:\*\*)?(?:\s|$)/i);
		if (option) {
			optionLabels.add(option[1].toUpperCase());
		} else if (!/^\s{2,}\S/.test(line)) {
			return false;
		}
	}
	return optionLabels.size >= 2;
}

function isAnswerRationale(block: string): boolean {
	const firstLine = block.trimStart().split(/\r?\n/, 1)[0];
	return /^(?:>\s*)?(?:[-*+]\s+)?(?:\*\*)?(?:best\s+answer|correct\s+answer|answer|rationale|explanation)\s*:/i.test(
		firstLine,
	);
}

function isQuestionPrompt(block: string): boolean {
	const firstLine = block
		.trimStart()
		.split(/\r?\n/, 1)[0]
		.replace(/[`*_~]/g, "");
	return /^(?:question(?:\s+\d+)?|scenario|check your understanding)(?:\s*[:.)]|\s|$)/i.test(
		firstLine,
	);
}

function excludeAssessmentAnswers(markdown: string): string {
	const output: string[] = [];
	let answerSectionLevel: number | undefined;
	let previousBlockHasOptions = false;
	let skippingRationaleContinuation = false;
	let block: string[] = [];
	let fence: { marker: string; length: number } | undefined;

	const flushBlock = () => {
		if (!block.length) return;
		const currentBlock = block.join("\n");
		block = [];
		if (previousBlockHasOptions && isAnswerRationale(currentBlock)) {
			skippingRationaleContinuation = true;
			previousBlockHasOptions = false;
			return;
		}
		if (
			skippingRationaleContinuation &&
			!isMultipleChoiceOptions(currentBlock) &&
			!isQuestionPrompt(currentBlock)
		) {
			previousBlockHasOptions = false;
			return;
		}
		skippingRationaleContinuation = false;
		output.push(currentBlock);
		previousBlockHasOptions = isMultipleChoiceOptions(currentBlock);
	};

	for (const line of markdown.split(/\r?\n/)) {
		const fenceMarker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
		if (fence) {
			if (answerSectionLevel === undefined) block.push(line);
			const closingFenceMarker = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
			if (
				closingFenceMarker?.[1][0] === fence.marker &&
				closingFenceMarker[1].length >= fence.length
			)
				fence = undefined;
			continue;
		}
		if (fenceMarker) {
			if (answerSectionLevel === undefined) block.push(line);
			fence = { marker: fenceMarker[1][0], length: fenceMarker[1].length };
			continue;
		}

		const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
		if (heading) {
			if (answerSectionLevel === undefined) {
				flushBlock();
				skippingRationaleContinuation = false;
			}
			const headingLevel = heading[1].length;
			if (answerSectionLevel !== undefined) {
				if (headingLevel > answerSectionLevel) continue;
				answerSectionLevel = undefined;
			}
			if (isAnswerSectionHeading(heading[2])) {
				answerSectionLevel = headingLevel;
				previousBlockHasOptions = false;
				continue;
			}
		}
		if (answerSectionLevel !== undefined) continue;

		if (!line.trim()) {
			flushBlock();
			output.push(line);
		} else {
			block.push(line);
		}
	}
	flushBlock();
	return output.join("\n");
}

/** Convert study Markdown into readable text, excluding structurally identified assessment answers. */
export function normalizeSearchText(markdown: string): string {
	return excludeAssessmentAnswers(markdown)
		.replace(/```[^\n]*\n?/g, " ")
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s*>\s?/gm, "")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/[*_~]/g, "")
		.replace(/<[^>]*>/g, " ")
		.replace(/\|/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, " ")
		.trim();
}

function makeExcerpt(text: string, query: string): string {
	const normalizedText = text.trim();
	if (normalizedText.length <= 160) return normalizedText;

	const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const lowerText = normalizedText.toLowerCase();
	const matchAt = queryTerms
		.map((term) => lowerText.indexOf(term))
		.filter((index) => index >= 0)
		.sort((a, b) => a - b)[0];
	const start = Math.max(0, (matchAt ?? 0) - 48);
	const end = Math.min(normalizedText.length, start + 160);

	return `${start > 0 ? "…" : ""}${normalizedText.slice(start, end).trim()}${end < normalizedText.length ? "…" : ""}`;
}

/** Rank title and context matches above study-body matches and return a readable excerpt. */
export function rankSearchItems(query: string, items: readonly SearchItem[]): RankedSearchItem[] {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return [];

	const terms = normalizedQuery.split(/\s+/).filter(Boolean);
	return items
		.map((item) => {
			const title = item.title.toLowerCase();
			const context = `${item.category} ${item.badge ?? ""}`.toLowerCase();
			const body = item.text?.toLowerCase() ?? "";
			const searchableText = `${title} ${context} ${body}`;
			if (!terms.every((term) => searchableText.includes(term))) return null;

			const titleMatch = terms.every((term) => title.includes(term));
			const contextMatch = terms.every((term) => context.includes(term));
			const bodyMatch = terms.every((term) => body.includes(term));
			const score = titleMatch
				? title === normalizedQuery
					? 1000
					: title.startsWith(normalizedQuery)
						? 800
						: 600
				: contextMatch
					? 300
					: bodyMatch
						? 100
						: 50;

			return {
				...item,
				excerpt: item.text ? makeExcerpt(item.text, normalizedQuery) : "",
				score,
			};
		})
		.filter((item): item is RankedSearchItem => item !== null)
		.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
