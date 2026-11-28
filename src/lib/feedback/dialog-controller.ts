import { validateFeedbackDescription, validateFeedbackReferenceUrl } from "./domain/feedback";
import {
	createFeedbackUseCases,
	createGitHubIssueAdapter,
	createLocalDraftStorage,
	createTallyFeedbackAdapter,
	DEFAULT_CONTENT_VERSION,
	type FeedbackCategory,
	type FeedbackChannel,
	type FeedbackTarget,
	type FeedbackTargetType,
	FeedbackValidationError,
	formatTargetReference,
	getCategoriesForTarget,
	getFeedbackCategoryMeta,
	isFeedbackCategory,
	isFeedbackTargetType,
} from "./index";

export interface OpenFeedbackDetail {
	target: FeedbackTarget;
	defaultCategory?: FeedbackCategory;
}

export interface FeedbackDialogController {
	open: (detail: OpenFeedbackDetail) => void;
	openFromTrigger: (trigger: HTMLElement) => void;
}

export function createFeedbackDialogController(
	dialog: HTMLDialogElement,
): FeedbackDialogController {
	const titleEl = document.getElementById("pl-feedback-title");
	const contextEl = document.getElementById("pl-feedback-context");
	const formEl = document.getElementById("pl-feedback-form") as HTMLFormElement | null;
	const categoryEl = document.getElementById("pl-feedback-category") as HTMLSelectElement | null;
	const categoryHintEl = document.getElementById("pl-feedback-category-hint");
	const descriptionEl = document.getElementById(
		"pl-feedback-description",
	) as HTMLTextAreaElement | null;
	const correctionEl = document.getElementById(
		"pl-feedback-correction",
	) as HTMLTextAreaElement | null;
	const referenceEl = document.getElementById("pl-feedback-reference") as HTMLInputElement | null;
	const errorEl = document.getElementById("pl-feedback-error");
	const clearDraftBtn = document.getElementById(
		"pl-feedback-clear-draft",
	) as HTMLButtonElement | null;

	const handoffEl = document.getElementById("pl-feedback-handoff");
	const handoffHeadingEl = document.getElementById("pl-feedback-handoff-heading");
	const handoffCopyEl = document.getElementById("pl-feedback-handoff-copy");
	const handoffIdEl = document.getElementById("pl-feedback-handoff-id");
	const handoffLinkEl = document.getElementById(
		"pl-feedback-handoff-link",
	) as HTMLAnchorElement | null;
	const editAgainBtn = document.getElementById("pl-feedback-edit-again");
	const doneBtn = document.getElementById("pl-feedback-done");

	const appVersion = dialog.dataset.appVersion || "0.0.0";
	const tallyUrl = dialog.dataset.tallyUrl || "";
	const githubRepo = dialog.dataset.githubRepo || "yacosta738/practice-lab";

	const useCases = createFeedbackUseCases({
		adapters: [
			createTallyFeedbackAdapter({ formUrl: tallyUrl }),
			createGitHubIssueAdapter({ repository: githubRepo }),
		],
		draftStorage: createLocalDraftStorage(),
	});

	let currentTarget: FeedbackTarget = {
		type: "application",
		url: window.location.href,
	};

	function showError(message: string) {
		if (!errorEl) return;
		errorEl.textContent = message;
		errorEl.hidden = false;
	}

	function associateError(field: HTMLElement | null, associate: boolean) {
		if (!field) return;
		const describedBy = new Set(
			(field.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean),
		);
		if (associate) {
			describedBy.add("pl-feedback-error");
		} else {
			describedBy.delete("pl-feedback-error");
		}
		if (describedBy.size > 0) {
			field.setAttribute("aria-describedby", [...describedBy].join(" "));
		} else {
			field.removeAttribute("aria-describedby");
		}
	}

	function clearFieldError(field: HTMLElement | null) {
		field?.removeAttribute("aria-invalid");
		associateError(field, false);
	}

	function clearFieldErrorWhenValid(
		field: HTMLInputElement | HTMLTextAreaElement,
		validate: (value: string) => string | undefined,
	) {
		if (field.getAttribute("aria-invalid") !== "true") return;
		try {
			validate(field.value);
		} catch (error) {
			if (error instanceof FeedbackValidationError) return;
			throw error;
		}
		clearFieldError(field);
	}

	function markFieldInvalid(field: HTMLElement | null) {
		field?.setAttribute("aria-invalid", "true");
		associateError(field, true);
	}

	function clearError() {
		if (errorEl) {
			errorEl.textContent = "";
			errorEl.hidden = true;
		}
		clearFieldError(categoryEl);
		clearFieldError(descriptionEl);
		clearFieldError(referenceEl);
	}

	function updateCategoryHint() {
		if (!categoryEl || !categoryHintEl) return;
		const val = categoryEl.value;
		if (isFeedbackCategory(val)) {
			categoryHintEl.textContent = getFeedbackCategoryMeta(val).description;
		} else {
			categoryHintEl.textContent = "";
		}
	}

	function populateCategories(targetType: FeedbackTargetType, selected?: FeedbackCategory) {
		if (!categoryEl) return;
		const categories = getCategoriesForTarget(targetType);
		categoryEl.replaceChildren();
		for (const meta of categories) {
			const option = document.createElement("option");
			option.value = meta.id;
			option.textContent = meta.label;
			categoryEl.append(option);
		}
		if (selected && categories.some((c) => c.id === selected)) {
			categoryEl.value = selected;
		} else if (categories.length > 0) {
			categoryEl.value = categories[0].id;
		}
		updateCategoryHint();
	}

	function persistDraft() {
		if (!categoryEl || !descriptionEl) return;
		const category = categoryEl.value;
		if (!isFeedbackCategory(category)) return;
		const description = descriptionEl.value;
		const suggestedCorrection = correctionEl?.value ?? "";
		const referenceUrl = referenceEl?.value ?? "";
		const hasContent =
			description.trim().length > 0 ||
			suggestedCorrection.trim().length > 0 ||
			referenceUrl.trim().length > 0;

		if (!hasContent) {
			useCases.clearDraft(currentTarget);
			if (clearDraftBtn) clearDraftBtn.hidden = true;
			return;
		}

		useCases.saveDraft(currentTarget, {
			category,
			description,
			...(suggestedCorrection ? { suggestedCorrection } : {}),
			...(referenceUrl ? { referenceUrl } : {}),
			updatedAt: new Date().toISOString(),
		});
		if (clearDraftBtn) clearDraftBtn.hidden = false;
	}

	function showFormView() {
		if (formEl) formEl.hidden = false;
		if (handoffEl) handoffEl.hidden = true;
	}

	function open(detail: OpenFeedbackDetail) {
		if (typeof dialog.showModal !== "function") return;
		currentTarget = detail.target;
		clearError();
		showFormView();

		if (titleEl) {
			titleEl.textContent =
				currentTarget.type === "application" ? "Send feedback" : "Report an issue";
		}
		if (contextEl) {
			contextEl.textContent = formatTargetReference(currentTarget);
		}

		const draft = useCases.loadDraft(currentTarget);
		const initialCategory = draft?.category ?? detail.defaultCategory;
		populateCategories(currentTarget.type, initialCategory);

		if (descriptionEl) descriptionEl.value = draft?.description ?? "";
		if (correctionEl) correctionEl.value = draft?.suggestedCorrection ?? "";
		if (referenceEl) referenceEl.value = draft?.referenceUrl ?? "";
		if (clearDraftBtn) clearDraftBtn.hidden = !draft;

		if (!dialog.open) {
			dialog.showModal();
		}
		descriptionEl?.focus();
	}

	async function handleSubmit(channel?: FeedbackChannel) {
		if (!categoryEl || !descriptionEl) return;
		clearError();
		try {
			const { outcome } = await useCases.submit({
				target: currentTarget,
				category: categoryEl.value,
				description: descriptionEl.value,
				suggestedCorrection: correctionEl?.value,
				referenceUrl: referenceEl?.value,
				locale: document.documentElement.lang || navigator.language || "en",
				appVersion,
				preferredChannel: channel,
			});

			if (outcome.status === "opened-external") {
				const channelName = outcome.channel === "tally" ? "Tally" : "GitHub Issues";
				if (handoffHeadingEl) {
					handoffHeadingEl.textContent = outcome.popupBlocked
						? `Ready to submit in ${channelName}`
						: `Opened in ${channelName}`;
				}
				if (handoffCopyEl) {
					handoffCopyEl.textContent = outcome.popupBlocked
						? `Your browser blocked the new tab. Use the link below to open ${channelName} and submit your report.`
						: `Your report is pre-filled in a new tab. It will not be recorded until you submit it in ${channelName}.`;
				}
				if (handoffIdEl) handoffIdEl.textContent = outcome.feedbackId;
				if (handoffLinkEl) {
					handoffLinkEl.href = outcome.url;
					handoffLinkEl.textContent = `Open pre-filled ${channelName} form ↗`;
				}
				if (formEl) formEl.hidden = true;
				if (handoffEl) handoffEl.hidden = false;
				doneBtn?.focus();
			}
		} catch (error) {
			if (error instanceof FeedbackValidationError) {
				showError(error.message);
				if (error.field === "description") {
					markFieldInvalid(descriptionEl);
					descriptionEl?.focus();
				} else if (error.field === "referenceUrl") {
					markFieldInvalid(referenceEl);
					referenceEl?.focus();
				} else if (error.field === "category") {
					markFieldInvalid(categoryEl);
					categoryEl?.focus();
				}
			} else {
				showError("Unable to prepare your feedback right now. Please try again.");
			}
		}
	}

	function parseTriggerTarget(trigger: HTMLElement): OpenFeedbackDetail {
		const rawType = trigger.dataset.feedbackType ?? "application";
		const type: FeedbackTargetType = isFeedbackTargetType(rawType) ? rawType : "application";
		const target: FeedbackTarget = {
			type,
			...(trigger.dataset.feedbackCert ? { certificationId: trigger.dataset.feedbackCert } : {}),
			...(trigger.dataset.feedbackDomain ? { domainId: trigger.dataset.feedbackDomain } : {}),
			...(trigger.dataset.feedbackQuestion ? { questionId: trigger.dataset.feedbackQuestion } : {}),
			...(trigger.dataset.feedbackLesson ? { lessonSlug: trigger.dataset.feedbackLesson } : {}),
			...(type === "question"
				? { contentVersion: trigger.dataset.feedbackVersion || DEFAULT_CONTENT_VERSION }
				: {}),
			url: window.location.href,
		};
		const rawCategory = trigger.dataset.feedbackCategory;
		const defaultCategory =
			rawCategory && isFeedbackCategory(rawCategory) ? rawCategory : undefined;
		return { target, defaultCategory };
	}

	categoryEl?.addEventListener("change", () => {
		clearFieldError(categoryEl);
		updateCategoryHint();
		persistDraft();
	});
	descriptionEl?.addEventListener("input", () => {
		clearFieldErrorWhenValid(descriptionEl, validateFeedbackDescription);
		persistDraft();
	});
	correctionEl?.addEventListener("input", persistDraft);
	referenceEl?.addEventListener("input", () => {
		clearFieldErrorWhenValid(referenceEl, validateFeedbackReferenceUrl);
		persistDraft();
	});

	clearDraftBtn?.addEventListener("click", () => {
		useCases.clearDraft(currentTarget);
		if (descriptionEl) descriptionEl.value = "";
		if (correctionEl) correctionEl.value = "";
		if (referenceEl) referenceEl.value = "";
		clearError();
		if (clearDraftBtn) clearDraftBtn.hidden = true;
		descriptionEl?.focus();
	});

	formEl?.addEventListener("submit", (event) => {
		event.preventDefault();
		const submitter = (event as SubmitEvent).submitter as HTMLElement | null;
		const channel = submitter?.dataset.feedbackChannel as FeedbackChannel | undefined;
		void handleSubmit(channel);
	});

	formEl?.addEventListener("click", (event) => {
		const target = event.target instanceof Element ? event.target : null;
		const btn = target?.closest<HTMLButtonElement>('button[type="button"][data-feedback-channel]');
		if (!btn) return;
		const channel = btn.dataset.feedbackChannel as FeedbackChannel | undefined;
		void handleSubmit(channel);
	});

	editAgainBtn?.addEventListener("click", () => {
		showFormView();
		descriptionEl?.focus();
	});

	doneBtn?.addEventListener("click", () => {
		useCases.clearDraft(currentTarget);
		dialog.close();
	});

	// Fallback light-dismiss for browsers without native <dialog closedby="any"> (Safari)
	if (!("closedBy" in HTMLDialogElement.prototype)) {
		const outside = (e: PointerEvent) => {
			const r = dialog.getBoundingClientRect();
			return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
		};
		let pressedOutside = false;
		dialog.addEventListener("pointerdown", (e) => {
			pressedOutside = outside(e);
		});
		dialog.addEventListener("pointerup", (e) => {
			if (pressedOutside && outside(e)) dialog.close();
		});
	}

	return {
		open,
		openFromTrigger(trigger: HTMLElement) {
			open(parseTriggerTarget(trigger));
		},
	};
}
