import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * @typedef {object} MarkdownPracticeQuestion
 * @property {string} file
 * @property {number} line
 * @property {string | undefined} questionId
 * @property {"inline" | "answer-key"} answerSource
 * @property {string[]} answers
 * @property {string[]} options
 */

const optionLinePattern = /^\s*-\s+(?:\*\*)?([A-E])\.(?:\*\*)?\s+(.+?)\s*$/;
const questionHeadingPattern = /^####\s+(D[1-8]\.\d{2})\b/;
const answerKeyPattern = /^\s*-\s+\*\*(D[1-8]\.\d{2})\s+[—–-]\s+([A-E](?:\s*,\s*[A-E])*)\.\*\*/;
const inlineAnswerPattern = /^\s*\*\*Best answer:\s*([A-E](?:\s*,\s*[A-E])*)\.\*\*/;

/** @typedef {"A" | "B" | "C" | "D" | "E"} AnswerLetter */
/** @typedef {"inline" | "answer-key"} AnswerSource */
/** @typedef {{ letter: AnswerLetter, text: string }} PracticeOption */
/** @typedef {{ startLine: number, endLine: number, options: PracticeOption[] }} OptionBlock */
/** @typedef {{ id: string, line: number }} QuestionHeading */
/** @typedef {{ answers: AnswerLetter[], line: number }} AnswerKeyEntry */

/**
 * @param {string} answer
 * @returns {answer is AnswerLetter}
 */
function isAnswerLetter(answer) {
	return /^[A-E]$/.test(answer);
}

/** @param {string[]} lines
 * @returns {OptionBlock[]}
 */
function collectOptionBlocks(lines) {
	/** @type {OptionBlock[]} */
	const blocks = [];
	/** @type {OptionBlock | undefined} */
	let current;
	let pendingBlankLine = false;

	function finishCurrentBlock() {
		if (current) {
			blocks.push(current);
			current = undefined;
		}
		pendingBlankLine = false;
	}

	for (const [lineIndex, line] of lines.entries()) {
		const match = line.match(optionLinePattern);
		if (match) {
			if (!isAnswerLetter(match[1])) {
				continue;
			}
			current ??= { startLine: lineIndex, endLine: lineIndex, options: [] };
			current.endLine = lineIndex;
			current.options.push({ letter: match[1], text: match[2] });
			pendingBlankLine = false;
			continue;
		}

		if (!current) {
			continue;
		}

		if (!line.trim() && !pendingBlankLine) {
			pendingBlankLine = true;
			continue;
		}

		finishCurrentBlock();
	}

	finishCurrentBlock();
	return blocks;
}

/**
 * @param {string} rawAnswers
 * @param {string} location
 * @returns {AnswerLetter[]}
 */
function parseAnswerLetters(rawAnswers, location) {
	const answers = rawAnswers.split(",").map((answer) => answer.trim());
	if (!answers.every(isAnswerLetter)) {
		throw new Error(`${location}: invalid correct-answer letter`);
	}
	if (new Set(answers).size !== answers.length) {
		throw new Error(`${location}: duplicate correct-answer letters`);
	}
	return answers;
}

/**
 * @param {OptionBlock} block
 * @param {string} file
 * @returns {PracticeOption[]}
 */
function validateOptions(block, file) {
	const location = `${file}:${block.startLine + 1}`;
	const options = [...block.options].sort((first, second) =>
		first.letter.localeCompare(second.letter),
	);
	const letters = options.map((option) => option.letter);
	const expectedLetters = letters.length === 5 ? ["A", "B", "C", "D", "E"] : ["A", "B", "C", "D"];

	if (
		(letters.length !== 4 && letters.length !== 5) ||
		new Set(letters).size !== letters.length ||
		letters.some((letter, index) => letter !== expectedLetters[index])
	) {
		throw new Error(`${location}: expected options A, B, C, and D (optionally E)`);
	}

	return options;
}

/**
 * @param {OptionBlock} block
 * @param {QuestionHeading[]} questionHeadings
 * @returns {string | undefined}
 */
function findQuestionIdForBlock(block, questionHeadings) {
	return questionHeadings.filter((heading) => heading.line < block.startLine).at(-1)?.id;
}

/**
 * @param {OptionBlock} block
 * @param {PracticeOption[]} options
 * @param {AnswerLetter[]} answers
 * @param {string} file
 * @param {AnswerSource} answerSource
 * @param {string | undefined} questionId
 * @returns {MarkdownPracticeQuestion}
 */
function questionFromBlock(block, options, answers, file, answerSource, questionId) {
	const location = `${file}:${block.startLine + 1}`;
	const optionLetters = options.map((option) => option.letter);
	if (answers.some((answer) => !optionLetters.includes(answer))) {
		throw new Error(`${location}: answer references an option that does not exist`);
	}

	return {
		file,
		line: block.startLine + 1,
		questionId,
		answerSource,
		answers,
		options: options.map((option) => option.text),
	};
}

/**
 * @param {string} markdown
 * @param {string} [file]
 * @returns {MarkdownPracticeQuestion[]}
 */
export function parseMarkdownPracticeQuestions(markdown, file = "<markdown>") {
	const lines = markdown.split(/\r?\n/);
	const blocks = collectOptionBlocks(lines);
	/** @type {Map<string, AnswerKeyEntry>} */
	const answerKeyEntries = new Map();
	/** @type {QuestionHeading[]} */
	const questionHeadings = [];
	/** @type {AnswerKeyEntry[]} */
	const inlineAnswerLines = [];
	let hasAnswerKeyHeading = false;

	for (const [lineIndex, line] of lines.entries()) {
		const questionHeading = line.match(questionHeadingPattern);
		if (questionHeading) {
			questionHeadings.push({ id: questionHeading[1], line: lineIndex });
		}

		const answerKeyEntry = line.match(answerKeyPattern);
		if (answerKeyEntry) {
			if (answerKeyEntries.has(answerKeyEntry[1])) {
				throw new Error(
					`${file}:${lineIndex + 1}: duplicate answer-key entry ${answerKeyEntry[1]}`,
				);
			}
			answerKeyEntries.set(answerKeyEntry[1], {
				answers: parseAnswerLetters(answerKeyEntry[2], `${file}:${lineIndex + 1}`),
				line: lineIndex,
			});
		}

		const inlineAnswer = line.match(inlineAnswerPattern);
		if (inlineAnswer) {
			inlineAnswerLines.push({
				answers: parseAnswerLetters(inlineAnswer[1], `${file}:${lineIndex + 1}`),
				line: lineIndex,
			});
		}

		if (!hasAnswerKeyHeading && /^##\s+Answer key\b/i.test(line)) {
			hasAnswerKeyHeading = true;
		}
	}

	if (blocks.length === 0) {
		if (hasAnswerKeyHeading || answerKeyEntries.size > 0 || inlineAnswerLines.length > 0) {
			throw new Error(`${file}: answer markers found without a complete option block`);
		}
		return [];
	}

	const optionsByBlock = blocks.map((block) => validateOptions(block, file));
	/** @type {MarkdownPracticeQuestion[]} */
	const questions = [];

	if (hasAnswerKeyHeading || answerKeyEntries.size > 0) {
		const questionIds = blocks.map((block) => findQuestionIdForBlock(block, questionHeadings));
		if (
			questionHeadings.length !== blocks.length ||
			questionIds.some((id) => !id) ||
			new Set(questionIds).size !== questionIds.length
		) {
			throw new Error(
				`${file}: every answer-key question must have one unique question heading and option block`,
			);
		}

		for (const [index, block] of blocks.entries()) {
			const questionId = questionIds[index];
			if (!questionId) {
				throw new Error(`${file}:${block.startLine + 1}: missing question heading`);
			}
			const answerKeyEntry = answerKeyEntries.get(questionId);
			if (!answerKeyEntry) {
				throw new Error(`${file}:${block.startLine + 1}: missing answer for ${questionId}`);
			}

			questions.push(
				questionFromBlock(
					block,
					optionsByBlock[index],
					answerKeyEntry.answers,
					file,
					"answer-key",
					questionId,
				),
			);
		}

		const questionIdSet = new Set(questionIds);
		for (const [questionId, entry] of answerKeyEntries) {
			if (!questionIdSet.has(questionId)) {
				throw new Error(
					`${file}:${entry.line + 1}: answer key has no matching question ${questionId}`,
				);
			}
		}

		if (inlineAnswerLines.length > 0) {
			throw new Error(`${file}: inline answers cannot be mixed with a separate answer key`);
		}

		return questions;
	}

	const consumedInlineAnswers = new Set();
	for (const [index, block] of blocks.entries()) {
		const nextBlockLine = blocks[index + 1]?.startLine ?? lines.length;
		const inlineAnswer = inlineAnswerLines.find(
			(answer) => answer.line > block.endLine && answer.line < nextBlockLine,
		);
		if (!inlineAnswer) {
			throw new Error(`${file}:${block.startLine + 1}: missing answer for practice question`);
		}
		consumedInlineAnswers.add(inlineAnswer.line);
		questions.push(
			questionFromBlock(
				block,
				optionsByBlock[index],
				inlineAnswer.answers,
				file,
				"inline",
				findQuestionIdForBlock(block, questionHeadings),
			),
		);
	}

	if (consumedInlineAnswers.size !== inlineAnswerLines.length) {
		throw new Error(`${file}: one or more inline answers have no matching option block`);
	}

	return questions;
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function findMarkdownFiles(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...findMarkdownFiles(entryPath));
		} else if (entry.isFile() && entry.name.endsWith(".md")) {
			files.push(entryPath);
		}
	}
	return files;
}

/**
 * @param {string} directory
 * @returns {MarkdownPracticeQuestion[]}
 */
export function discoverMarkdownPracticeQuestions(directory) {
	return findMarkdownFiles(directory)
		.sort((first, second) => first.localeCompare(second))
		.flatMap((file) => parseMarkdownPracticeQuestions(readFileSync(file, "utf8"), file));
}
