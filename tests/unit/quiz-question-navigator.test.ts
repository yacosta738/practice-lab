import { describe, expect, it } from "vitest";
import { renderQuizQuestionNavigator } from "../../src/lib/quiz-question-navigator";

describe("renderQuizQuestionNavigator", () => {
	it("renders accessible exam question states and submit controls", () => {
		const html = renderQuizQuestionNavigator({
			isExam: true,
			expanded: true,
			answeredCount: 1,
			flaggedCount: 1,
			questions: [
				{ isCurrent: true, isAnswered: true, isFlagged: true },
				{ isCurrent: false, isAnswered: false, isFlagged: false },
			],
		});

		expect(html).toContain('<details class="panel side examNavigator" open>');
		expect(html).toContain(
			'aria-label="Question 1, answered, flagged for review, current question"',
		);
		expect(html).toContain('data-action="jump" data-value="1"');
		expect(html).toContain('aria-current="step"');
		expect(html).toContain("1/2 answered · 1 flagged");
		expect(html).toContain('data-action="finish">Submit mock exam</button>');
	});

	it("renders the practice navigator and pause action without exam controls", () => {
		const html = renderQuizQuestionNavigator({
			isExam: false,
			expanded: false,
			answeredCount: 0,
			flaggedCount: 0,
			questions: [{ isCurrent: true, isAnswered: false, isFlagged: false }],
		});

		expect(html).toContain('<aside class="panel side">');
		expect(html).toContain("Immediate rationale and primary-source references after each answer.");
		expect(html).toContain('data-action="home">Pause & go home</button>');
		expect(html).not.toContain("examNavigator");
		expect(html).not.toContain('data-action="finish"');
	});
});
