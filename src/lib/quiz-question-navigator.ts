export interface QuizQuestionNavigatorItem {
	isCurrent: boolean;
	isAnswered: boolean;
	isFlagged: boolean;
}

export interface QuizQuestionNavigatorInput {
	isExam: boolean;
	expanded: boolean;
	answeredCount: number;
	flaggedCount: number;
	questions: readonly QuizQuestionNavigatorItem[];
}

export function renderQuizQuestionNavigator({
	isExam,
	expanded,
	answeredCount,
	flaggedCount,
	questions,
}: QuizQuestionNavigatorInput): string {
	const grid = questions
		.map(({ isCurrent, isAnswered, isFlagged }, index) => {
			const stateLabel = `${isAnswered ? "answered" : "unanswered"}, ${isFlagged ? "flagged for review" : "not flagged for review"}${isCurrent ? ", current question" : ""}`;
			const stateMarks = `${isAnswered ? "✓" : "—"}${isFlagged ? " ⚑" : ""}${isCurrent ? " ●" : ""}`;
			return `<button class="qchip${isCurrent ? " current" : ""}${isAnswered ? " answered" : ""}${isFlagged ? " flagged" : ""}" data-action="jump" data-value="${index}" aria-label="Question ${index + 1}, ${stateLabel}"${isCurrent ? ' aria-current="step"' : ""}><span class="qchipNumber">${index + 1}</span><span class="qchipMarks" aria-hidden="true">${stateMarks}</span></button>`;
		})
		.join("");

	const legend = `<ul class="qchipLegend">
		<li><span aria-hidden="true">✓</span> Answered</li>
		<li><span aria-hidden="true">—</span> Unanswered</li>
		<li><span aria-hidden="true">⚑</span> Flagged for review</li>
		<li><span aria-hidden="true">●</span> Current question</li>
	</ul>`;
	const navigatorContent = `<p class="small muted">Jump to any question.</p>
		${legend}
		<div class="small muted">${answeredCount}/${questions.length} answered · ${flaggedCount} flagged</div>
		<div class="qgrid" role="region" aria-label="Question list" tabindex="0">${grid}</div>
		<button class="ghost" data-action="finish">Submit mock exam</button>`;

	return isExam
		? `<details class="panel side examNavigator" ${expanded ? "open" : ""}>
			<summary><span>Question navigator</span><span class="small muted">${answeredCount}/${questions.length} answered</span></summary>
			${navigatorContent}
		</details>`
		: `<aside class="panel side">
			<h3>Study session</h3>
			<p class="small muted">Immediate rationale and primary-source references after each answer.</p>
			${legend}
			<div class="small muted">${answeredCount}/${questions.length} answered</div>
			<div class="qgrid" role="region" aria-label="Question list" tabindex="0">${grid}</div>
			<button class="ghost" data-action="home">Pause & go home</button>
		</aside>`;
}
