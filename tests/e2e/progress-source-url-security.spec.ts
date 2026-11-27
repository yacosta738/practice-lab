import { expect, type Page, test } from "@playwright/test";

const CERTIFICATION = "/practice-lab/certifications/ccdv-f/";

type RendererFallback = "missing-sanitizer" | "setHTML-failure" | "setHTML-success";

declare global {
	interface Window {
		__sanitizerDataAttributes?: boolean;
		__sanitizerSetHTMLCalls?: number;
	}
}

async function openSessionWithUnsafeSource(page: Page, fallback: RendererFallback): Promise<void> {
	await page.addInitScript((mode: RendererFallback) => {
		if (mode === "missing-sanitizer") {
			Object.defineProperty(window, "Sanitizer", {
				configurable: true,
				value: undefined,
			});
			Object.defineProperty(HTMLElement.prototype, "setHTML", {
				configurable: true,
				value: undefined,
			});
			return;
		}
		if (mode === "setHTML-success") {
			Object.defineProperty(window, "Sanitizer", {
				configurable: true,
				value: class SanitizerMock {
					constructor(options: { dataAttributes: boolean }) {
						window.__sanitizerDataAttributes = options.dataAttributes;
					}
				},
			});
			Object.defineProperty(HTMLElement.prototype, "setHTML", {
				configurable: true,
				value: function (this: HTMLElement, html: string) {
					window.__sanitizerSetHTMLCalls = (window.__sanitizerSetHTMLCalls ?? 0) + 1;
					this.innerHTML = html;
				},
			});
			return;
		}
		Object.defineProperty(window, "Sanitizer", {
			configurable: true,
			value: class SanitizerMock {},
		});
		Object.defineProperty(HTMLElement.prototype, "setHTML", {
			configurable: true,
			value: () => {
				throw new Error("Forced Sanitizer API failure.");
			},
		});
	}, fallback);

	await page.goto(`${CERTIFICATION}?mode=practice#session`);
	await page.selectOption("#amount", "10");
	await page.getByRole("button", { name: "Practice mode" }).click();
	await expect(page.getByRole("button", { name: "Pause & go home" })).toBeVisible();

	await page.evaluate(async () => {
		const service = window.practiceLabProgressService;
		if (!service) throw new Error("The browser progress service is unavailable.");
		const state = await service.readState();
		const session = state.currentSession;
		if (!session) throw new Error("The active quiz session is unavailable.");
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction("sessions", "readwrite");
		const completed = new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => resolve();
			transaction.onabort = () => reject(transaction.error);
			transaction.onerror = () => reject(transaction.error);
		});
		const store = transaction.objectStore("sessions");
		const request = store.get(session.id);
		request.onsuccess = () => {
			const stored = request.result as
				| {
						content: {
							questions: { sourceUrl: string; snapshot?: { source: { url: string } } }[];
						};
				  }
				| undefined;
			if (!stored?.content.questions[0]) {
				throw new Error("The active session has no frozen question content.");
			}
			stored.content.questions[0].sourceUrl = "javascript:alert(1)";
			if (stored.content.questions[0].snapshot) {
				stored.content.questions[0].snapshot.source.url = "javascript:alert(1)";
			}
			store.put(stored);
		};
		request.onerror = () => transaction.abort();
		await completed;
		database.close();
	});

	await page.reload();
	await expect(page.getByRole("button", { name: "Check answer" })).toBeVisible();
	const selectionCount = Number(
		await page.locator(".hint[data-select-count]").getAttribute("data-select-count"),
	);
	for (let index = 0; index < selectionCount; index += 1) {
		await page.locator("button.option").nth(index).click();
	}
	await page.getByRole("button", { name: "Check answer" }).click();
	await expect(page.locator(".feedbackLinks")).toContainText("Study source:");
	await expect(page.locator(".feedbackLinks a[data-source-link][href]")).toHaveCount(0);
	if (fallback === "setHTML-success") {
		expect(await page.evaluate(() => window.__sanitizerSetHTMLCalls)).toBeGreaterThan(0);
		expect(await page.evaluate(() => window.__sanitizerDataAttributes)).toBe(true);
	}
}

test("keeps unsafe sources inactive without Sanitizer API", async ({ page }) => {
	await openSessionWithUnsafeSource(page, "missing-sanitizer");
});

test("keeps unsafe sources inactive when setHTML fails", async ({ page }) => {
	await openSessionWithUnsafeSource(page, "setHTML-failure");
});

test("enforces source URL schemes after successful setHTML insertion", async ({ page }) => {
	await openSessionWithUnsafeSource(page, "setHTML-success");
});
