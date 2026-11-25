export type ProgressStorageErrorCode =
	| "unavailable"
	| "blocked"
	| "access-denied"
	| "quota-exceeded"
	| "transaction-aborted"
	| "database-error";

export class ProgressError extends Error {
	constructor(
		message: string,
		readonly code: "conflict" | "invalid-input" | ProgressStorageErrorCode,
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class ProgressConflictError extends ProgressError {
	constructor(message: string) {
		super(message, "conflict");
	}
}

export class ProgressValidationError extends ProgressError {
	constructor(message: string) {
		super(message, "invalid-input");
	}
}

export class ProgressStorageError extends ProgressError {
	constructor(
		code: ProgressStorageErrorCode,
		message: string,
		readonly cause?: unknown,
	) {
		super(message, code);
	}
}

export function toProgressStorageError(error: unknown, operation: string): ProgressStorageError {
	if (error instanceof ProgressStorageError) return error;

	const name = error instanceof Error ? error.name : "";
	const code: ProgressStorageErrorCode =
		name === "QuotaExceededError"
			? "quota-exceeded"
			: name === "SecurityError" || name === "NotAllowedError"
				? "access-denied"
				: name === "AbortError"
					? "transaction-aborted"
					: "database-error";

	return new ProgressStorageError(code, `IndexedDB ${operation} failed (${code}).`, error);
}
