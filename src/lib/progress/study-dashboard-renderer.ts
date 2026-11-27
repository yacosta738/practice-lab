import type { LearningGoalRecord, StudyProgressRecord } from "./model";
import {
	getStudyStatus,
	resolveStudyRecord,
	type StudyNoteReference,
	summarizeStudyProgress,
} from "./study-domain";

export interface DashboardStudyNote extends StudyNoteReference {
	title: string;
	href: string;
}

export interface StudyOverviewInput {
	certificationId: string;
	notes: readonly DashboardStudyNote[];
	records: readonly StudyProgressRecord[];
	goal?: LearningGoalRecord;
	practiceCount: number;
}

function escapeHtml(value: string): string {
	return value.replace(
		/[&<>"']/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[character] ?? character,
	);
}

function linkFor(note: DashboardStudyNote, record: StudyProgressRecord | undefined): string {
	const anchor =
		record?.contentRevision === note.revision ? record.readingPositionAnchor : undefined;
	return `${note.href}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
}

function renderNoteLinks(
	recordsForNotes: readonly { note: DashboardStudyNote; record: StudyProgressRecord }[],
): string {
	if (recordsForNotes.length === 0) return '<p class="small muted">None yet.</p>';
	return `<ul class="progressStudyNoteList">${recordsForNotes
		.map(({ note, record }) => {
			const state = getStudyStatus(record, note.revision);
			const label =
				state === "completed"
					? "Completed"
					: state === "in_progress"
						? "In progress"
						: "Not started";
			return `<li><a href="${escapeHtml(linkFor(note, record))}">${escapeHtml(note.title)}</a><span>${label}</span></li>`;
		})
		.join("")}</ul>`;
}

export function renderStudyOverview({
	certificationId,
	notes,
	records,
	goal,
	practiceCount,
}: StudyOverviewInput): string {
	const counts = summarizeStudyProgress(notes, records);
	const noteRecords = notes.flatMap((note) => {
		const record = resolveStudyRecord(note, records);
		return record ? [{ note, record }] : [];
	});
	const recent = noteRecords
		.filter(({ record }) => record.lastOpenedAt !== undefined)
		.toSorted((a, b) => (b.record.lastOpenedAt ?? 0) - (a.record.lastOpenedAt ?? 0))
		.slice(0, 8);
	const bookmarks = noteRecords.filter(({ record }) => record.bookmarked);
	const targetDateText = goal?.targetDate
		? `<p>Exam target date: <strong>${escapeHtml(goal.targetDate)}</strong> (floating local calendar date).</p>`
		: "";
	const questionGoal =
		goal?.targetQuestionCount === null || goal?.targetQuestionCount === undefined
			? "No question target set."
			: `${Math.min(practiceCount, goal.targetQuestionCount)} of ${goal.targetQuestionCount} distinct current-bank questions practiced.`;
	const noteGoal =
		goal?.targetNoteCount === null || goal?.targetNoteCount === undefined
			? "No note target set."
			: `${Math.min(counts.completed, goal.targetNoteCount)} of ${goal.targetNoteCount} notes completed.`;
	const archived = counts.archived.length
		? `<details class="progressStudyArchive"><summary>Archived note history (${counts.archived.length})</summary><ul>${counts.archived.map((record) => `<li><span>${escapeHtml(record.noteId)}</span><span>${record.status.replaceAll("_", " ")}${record.bookmarked ? " · bookmarked" : ""}</span></li>`).join("")}</ul></details>`
		: '<p class="small muted">No archived note records.</p>';

	return `
			<section class="progressStudyCompletion" aria-label="Study-note completion">
				<strong>${counts.completed} of ${counts.eligible} notes completed</strong>
				<progress max="${Math.max(1, counts.eligible)}" value="${counts.completed}" aria-label="${counts.completed} of ${counts.eligible} eligible study notes completed"></progress>
				<p>${counts.inProgress} in progress · ${counts.bookmarked} bookmarks</p>
			</section>
			<section class="progressStudyGoalsSummary" aria-label="Goal progress">
				<h3>Goal progress</h3>
				<p>${questionGoal}</p><p>${noteGoal}</p>${targetDateText}
			</section>
			<section><h3>Recently opened notes</h3>${renderNoteLinks(recent)}</section>
			<section><h3>Bookmarks</h3>${renderNoteLinks(bookmarks)}</section>
			${archived}
			${notes.length === 0 ? `<p class="small muted">No eligible study notes are currently published for ${escapeHtml(certificationId)}; saved records remain in archived history.</p>` : ""}
		`;
}
