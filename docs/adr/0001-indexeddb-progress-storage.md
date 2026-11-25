# ADR 0001: Versioned IndexedDB for learning progress

- Status: Accepted
- Date: 2026-11-25
- Scope: Issue #76; persistence foundation only

## Context

Practice Lab currently persists live quiz state as one `localStorage` JSON value per certification. The progress foundation must not change those reads or writes: the migration and live cutover are a later issue. Learning data remains on the current browser origin; it is not sent to a server and is not shared between GitHub Pages, Vercel, or another origin.

## Decision

Use the pinned `idb` 8.0.4 promise/type wrapper over native IndexedDB. Its upstream v8.0.4 README targets modern Chrome, Firefox, Safari, and Edge (not IE) and documents `openDB` upgrade, blocked, blocking, and termination callbacks. The npm registry reports ISC licensing. This matches the site's modern browser/PWA target and adds no server dependency. Reference: <https://github.com/jakearchibald/idb/tree/v8.0.4> (reviewed 2026-11-25); registry metadata: <https://registry.npmjs.org/idb/8.0.4> (version and license checked 2026-11-25).

The origin-scoped database name is `practice-lab`. Schema version 1 has these stores:

| Store              | Primary key                     | Indexes                                                | Contract                                                                                                                                |
| ------------------ | ------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `sessions`         | `id` (UUID)                     | `certificationId`, `status`, `startedAt`, `finishedAt` | Revisioned session checkpoint, status/timestamps, frozen scoring and question revision/content-hash provenance.                         |
| `questionAttempts` | `[sessionId, questionId]`       | `certificationId`, `domainId`, `evaluatedAt`           | One finalized evaluation per session/question, with stable selected-option IDs, outcome, score, evaluation time, and question revision. |
| `questionProgress` | `[certificationId, questionId]` | `certificationId`                                      | Rebuildable attempt projection plus an independent nullable legacy aggregate baseline.                                                  |
| `studyProgress`    | `[certificationId, noteId]`     | `certificationId`                                      | Certification-scoped note completion/bookmark state.                                                                                    |
| `learningGoals`    | `certificationId`               | —                                                      | One certification-scoped daily target and optional target date.                                                                         |
| `metadata`         | `key`                           | —                                                      | Schema version, migration marker, and data-generation token.                                                                            |

Primary keys use stable IDs or compound stable IDs, never titles or display positions. Question option IDs and content hashes belong to the frozen content provenance; selection order is not an identity.

### Authority and projections

`sessions` and `questionAttempts` are the authoritative history. A question attempt is immutable and unique by `[sessionId, questionId]`. `questionProgress` is derived from those attempts; its `legacyBaseline` is kept separately so rebuilding a projection never fabricates historical attempt rows or overwrites pre-migration aggregates. Study state and goals are independent user data.

### Transactions and idempotency

- Session creation reads and adds within one `sessions` read-write transaction. It rejects another `in_progress` session for that certification, including concurrent callers; retrying the same UUID and frozen identity returns the existing record.
- A new checkpoint checks `expectedRevision`, writes revision + 1 in the same transaction, and only changes checkpoint fields. An identical immediate retry returns the committed record; a different stale write raises a conflict without overwriting it.
- Evaluation recording checks the session/question snapshot, inserts the unique attempt, and updates its question projection in one read-write transaction. Repeating the same finalized evaluation is a no-op; a different evaluation for the same key conflicts.
- Finalization checks the expected revision and transitions exactly once from `in_progress` to `completed`, `expired`, or `abandoned`. Terminal states cannot transition again; an identical retry is a no-op.
- History reads are certification-scoped. Projection rebuild reads attempts and existing baselines, then replaces that certification's projections atomically.
- Legacy baselines are write-once/idempotent. A different baseline at the same compound key conflicts rather than replacing existing progress.

### Session state and revisions

New sessions begin at revision 1 and status `in_progress`. Successful checkpoints and terminal finalization each increment revision once. Allowed state transitions are `in_progress → completed`, `in_progress → expired`, and `in_progress → abandoned`; terminal states are immutable. Revisions are optimistic concurrency tokens, not timestamps. `startedAt`, optional `finishedAt`, and `updatedAt` are numeric epoch milliseconds and are indexed as declared above.

### Upgrade and failure behavior

Version 1 creates all stores and indexes in the IndexedDB version-change transaction and records `schema-version`, `migration:0-1`, and a `data-generation-token` in `metadata`. Future schema changes must increment the database version, make changes only in the upgrade transaction, and add an explicit migration marker; no data is silently cleared. The live quiz's legacy `localStorage` migration is not part of this schema upgrade and remains for the follow-up issue.

Opening is lazy: importing the module or building/serving Astro pages does not touch browser globals or open a database. Storage calls are made only when a repository operation runs. The adapter closes an old connection on `versionchange`, reports blocked upgrades instead of waiting indefinitely, and maps unavailable/denied storage, quota exhaustion, aborted transactions, and other database failures to typed errors. It never falls back to `localStorage` or clears existing data. Since browser storage is quota-managed and origin-scoped, this is local persistence, not a guarantee of permanent backup.

## Consequences

- No production quiz code is switched or dual-written in this issue; the IndexedDB infrastructure is safe to import during SSR and static builds.
- Consumers must handle typed storage and revision-conflict errors. A failed transaction leaves its prior committed records intact.
- The next migration issue must define validated legacy import and provide complete frozen snapshots when it begins writing production quiz sessions.
