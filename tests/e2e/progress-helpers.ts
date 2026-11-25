import type { Page } from "@playwright/test";

export async function readCertificationProgress(page: Page, certificationId: string) {
	return page.evaluate(async (id) => {
		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open("practice-lab");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const transaction = database.transaction(
			["sessions", "questionAttempts", "questionProgress"],
			"readonly",
		);
		const readStore = (storeName: string) =>
			new Promise<Record<string, unknown>[]>((resolve, reject) => {
				const request = transaction.objectStore(storeName).index("by-certification").getAll(id);
				request.onsuccess = () => resolve(request.result as Record<string, unknown>[]);
				request.onerror = () => reject(request.error);
			});
		const [sessions, attempts, questionProgress] = await Promise.all([
			readStore("sessions"),
			readStore("questionAttempts"),
			readStore("questionProgress"),
		]);
		database.close();
		return { sessions, attempts, questionProgress };
	}, certificationId);
}
