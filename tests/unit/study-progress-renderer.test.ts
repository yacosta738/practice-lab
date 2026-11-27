import { describe, expect, it } from "vitest";
import type { LearningGoalRecord, StudyProgressRecord } from "../../src/lib/progress/model";
import {
	type DashboardStudyNote,
	renderStudyOverview,
} from "../../src/lib/progress/study-dashboard-renderer";

const note: DashboardStudyNote = {
	certificationId: "ccdv-f",
	noteId: "ccdv-f/D1/notes",
	aliases: [],
	revision: "current-revision",
	title: `Notes <strong>"&'`,
	href: `/study/ccdv-f/notes/?source=<script>&quote="yes"&single='`,
};

const completedRecord: StudyProgressRecord = {
	certificationId: "ccdv-f",
	noteId: note.noteId,
	status: "completed",
	completedAt: 200,
	completedRevision: note.revision,
	bookmarked: true,
	lastOpenedAt: 300,
	readingPositionAnchor: 'section "one"',
	contentRevision: note.revision,
	updatedAt: 300,
};

const goal: LearningGoalRecord = {
	certificationId: "ccdv-f",
	dailyQuestionTarget: null,
	targetQuestionCount: 3,
	targetNoteCount: 1,
	targetDate: "2026-12-15",
	targetDateTimezone: "floating-local",
	updatedAt: 300,
};

describe("renderStudyOverview", () => {
	it("renders summary, goals, notes, and safely escaped note content", () => {
		const html = renderStudyOverview({
			certificationId: "ccdv-f",
			notes: [note],
			records: [
				completedRecord,
				{
					certificationId: "ccdv-f",
					noteId: "<old-note>",
					status: "in_progress",
					bookmarked: false,
					updatedAt: 100,
				},
			],
			goal,
			practiceCount: 2,
		});

		expect(html).toContain("1 of 1 notes completed");
		expect(html).toContain('aria-label="1 of 1 eligible study notes completed"');
		expect(html).toContain("0 in progress · 1 bookmarks");
		expect(html).toContain("2 of 3 distinct current-bank questions practiced.");
		expect(html).toContain("1 of 1 notes completed.");
		expect(html).toContain(
			"Exam target date: <strong>2026-12-15</strong> (floating local calendar date).",
		);
		expect(html).toContain(
			`href="/study/ccdv-f/notes/?source=&lt;script&gt;&amp;quote=&quot;yes&quot;&amp;single=&#39;#section%20%22one%22"`,
		);
		expect(html).toContain("Notes &lt;strong&gt;&quot;&amp;&#39;");
		expect(html).toContain("Archived note history (1)");
		expect(html).toContain("&lt;old-note&gt;");
		expect(html).not.toContain("<script>");
	});

	it("preserves empty summary, goal, and note fallbacks", () => {
		const html = renderStudyOverview({
			certificationId: "ccdv-p",
			notes: [],
			records: [],
			practiceCount: 0,
		});

		expect(html).toContain("0 of 0 notes completed");
		expect(html).toContain("No question target set.");
		expect(html).toContain("No note target set.");
		expect(html).toContain("None yet.");
		expect(html).toContain("No archived note records.");
		expect(html).toContain("No eligible study notes are currently published for ccdv-p");
	});
});
