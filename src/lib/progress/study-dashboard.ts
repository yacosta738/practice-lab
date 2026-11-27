import type { ProgressBank } from "./analytics";
import { createProgressRepository } from "./indexeddb-repository";
import type { LearningGoalRecord, StudyProgressRecord } from "./model";
import { type DashboardStudyNote, renderStudyOverview } from "./study-dashboard-renderer";
import { StudyProgressService } from "./study-service";

interface StudyDashboardData {
	banks: ProgressBank[];
	studyNotes: DashboardStudyNote[];
}

export function initializeStudyDashboard(): void {
	const data = JSON.parse(
		document.getElementById("progress-client-data")?.textContent ?? "{}",
	) as StudyDashboardData;
	let repository = createProgressRepository();
	let service = new StudyProgressService(repository);
	const certificationSelect = document.getElementById("study-certification") as HTMLSelectElement;
	const status = document.getElementById("study-progress-status") as HTMLParagraphElement;
	const error = document.getElementById("study-progress-error") as HTMLParagraphElement;
	const overview = document.getElementById("study-progress-overview") as HTMLDivElement;
	const goalForm = document.getElementById("study-goals-form") as HTMLFormElement;
	const targetDate = document.getElementById("study-target-date") as HTMLInputElement;
	const targetQuestions = document.getElementById("study-target-questions") as HTMLInputElement;
	const targetNotes = document.getElementById("study-target-notes") as HTMLInputElement;
	const legacyDateNotice = document.getElementById(
		"study-legacy-date-notice",
	) as HTMLParagraphElement;
	const goalStatus = document.getElementById("study-goals-status") as HTMLParagraphElement;
	let records: StudyProgressRecord[] = [];
	let goal: LearningGoalRecord | undefined;
	let loadSequence = 0;
	let studyRefreshTimer: number | undefined;

	function renderOverview(
		certificationId: string,
		notes: DashboardStudyNote[],
		practiceCount: number,
	): void {
		overview.innerHTML = renderStudyOverview({
			certificationId,
			notes,
			records,
			goal,
			practiceCount,
		});
	}

	function scheduleStudyRefresh(): void {
		if (studyRefreshTimer !== undefined) window.clearTimeout(studyRefreshTimer);
		studyRefreshTimer = window.setTimeout(() => {
			studyRefreshTimer = undefined;
			void loadStudyProgress();
		}, 300);
	}

	async function loadStudyProgress(): Promise<void> {
		const sequence = ++loadSequence;
		const certificationId = certificationSelect.value;
		const notes = data.studyNotes.filter((note) => note.certificationId === certificationId);
		status.textContent = "Loading study progress…";
		error.hidden = true;
		try {
			await service.initialize(certificationId);
			const [loadedRecords, loadedGoal] = await Promise.all([
				service.getProgress(certificationId),
				service.getGoal(certificationId),
			]);
			if (sequence !== loadSequence) return;
			records = loadedRecords;
			goal = loadedGoal;
			let practiceCount = 0;
			if (goal?.targetQuestionCount !== null && goal?.targetQuestionCount !== undefined) {
				const progressData = await repository.getProgressSummaryData([certificationId]);
				if (sequence !== loadSequence) return;
				const bankQuestions = new Set(
					(
						data.banks.find((bank) => bank.certificationId === certificationId)?.questions ?? []
					).map((question) => question.questionId),
				);
				practiceCount = progressData.questionProgress.filter(
					(progress) => bankQuestions.has(progress.questionId) && progress.attemptCount > 0,
				).length;
			}
			targetDate.value = goal?.targetDate ?? "";
			targetQuestions.value = goal?.targetQuestionCount?.toString() ?? "";
			targetNotes.value = goal?.targetNoteCount?.toString() ?? "";
			legacyDateNotice.hidden = goal?.legacyTargetDate === undefined;
			legacyDateNotice.textContent =
				goal?.legacyTargetDate === undefined
					? ""
					: "An older timestamped target is retained in backups but cannot safely be converted to a local calendar date. Choose a new date to replace it.";
			renderOverview(certificationId, notes, practiceCount);
			status.textContent = "Study progress is up to date.";
		} catch (cause) {
			if (sequence !== loadSequence) return;
			status.textContent = "Study progress could not be loaded.";
			error.hidden = false;
			error.textContent =
				cause instanceof Error ? cause.message : "Browser storage is unavailable.";
		}
	}

	goalForm.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!goalForm.reportValidity()) return;
		const certificationId = certificationSelect.value;
		const input = {
			targetDate: targetDate.value || null,
			targetQuestionCount: targetQuestions.value === "" ? null : Number(targetQuestions.value),
			targetNoteCount: targetNotes.value === "" ? null : Number(targetNotes.value),
		};
		goalStatus.textContent = "Saving goals…";
		void service
			.saveGoals(certificationId, input)
			.then(() => {
				goalStatus.textContent = "Goals saved in this browser.";
				return loadStudyProgress();
			})
			.catch((cause: unknown) => {
				goalStatus.textContent = "Goals could not be saved.";
				error.hidden = false;
				error.textContent =
					cause instanceof Error ? cause.message : "Browser storage is unavailable.";
			});
	});

	certificationSelect.addEventListener("change", () => {
		goalStatus.textContent = "";
		void loadStudyProgress();
	});
	function subscribeToChanges(): void {
		service.onChange((kind) => {
			if (kind === "practice" && goal?.targetQuestionCount == null) return;
			scheduleStudyRefresh();
		});
	}
	subscribeToChanges();
	window.addEventListener("pagehide", () => {
		loadSequence++;
		if (studyRefreshTimer !== undefined) window.clearTimeout(studyRefreshTimer);
		studyRefreshTimer = undefined;
		service.close();
		void repository.close();
	});
	window.addEventListener("pageshow", (event) => {
		if (!event.persisted) return;
		repository = createProgressRepository();
		service = new StudyProgressService(repository);
		subscribeToChanges();
		void loadStudyProgress();
	});
	void loadStudyProgress();
}
