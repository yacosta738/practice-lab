type SanitizerConstructor = new (options: { allowDataAttributes: boolean }) => unknown;

type SetHTMLCapableElement = HTMLElement & {
	setHTML?: (html: string, options: { sanitizer: unknown }) => void;
};

export interface QuizRenderOptions {
	focusTarget?: string;
	onNavigatorToggle?: (expanded: boolean) => void;
}

export function renderQuizContent(
	app: HTMLElement,
	content: string,
	{ focusTarget, onNavigatorToggle }: QuizRenderOptions = {},
): void {
	const element = app as SetHTMLCapableElement;
	const sanitizerConstructor = (
		globalThis as typeof globalThis & { Sanitizer?: SanitizerConstructor }
	).Sanitizer;

	if (typeof element.setHTML === "function" && sanitizerConstructor) {
		try {
			element.setHTML(content, {
				sanitizer: new sanitizerConstructor({ allowDataAttributes: true }),
			});
		} catch {
			app.innerHTML = content;
		}
	} else {
		app.innerHTML = content;
	}

	if (focusTarget) {
		const target = app.querySelector<HTMLElement>(`[data-focus-target="${focusTarget}"]`);
		target?.focus();
	}

	const navigator = app.querySelector<HTMLDetailsElement>("details.examNavigator");
	if (navigator && onNavigatorToggle) {
		navigator.addEventListener("toggle", () => onNavigatorToggle(navigator.open));
	}
}

export function setQuizFocusMode(documentRef: Document, active: boolean): void {
	const shell = documentRef.querySelector<HTMLElement>(".pl-shell");
	shell?.setAttribute("data-exam-focus", active ? "true" : "false");
}

export function delegateQuizActions(
	app: HTMLElement,
	handler: (event: MouseEvent, element: HTMLElement) => unknown,
): () => void {
	const onClick = (event: MouseEvent) => {
		if (!(event.target instanceof Element)) return;
		const element = event.target.closest<HTMLElement>("[data-action]");
		if (!element || !app.contains(element)) return;
		void handler(event, element);
	};

	app.addEventListener("click", onClick);
	return () => app.removeEventListener("click", onClick);
}
