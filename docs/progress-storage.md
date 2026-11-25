# Browser progress, migration, and recovery

Practice Lab stores quiz sessions, evaluated attempts, and question statistics in the `practice-lab` IndexedDB database. The data remains local to the current browser profile and site origin. It is not uploaded or synchronized between the GitHub Pages and Vercel origins. The `practice-lab-theme` `localStorage` entry remains a presentation preference; quiz progress no longer reads or writes the legacy `<certification>-practice-lab-v2` key after its one-time import.

## Importing legacy progress

1. Open a certification page. If a legacy progress key exists, the page validates it and shows the fields it could not safely import.
2. Select **Download data backup**. The versioned JSON contains the raw legacy records for known certifications, prior migration backups, session history, and question-progress projections. Import stays disabled until the backup file is generated and its legacy archive is saved.
3. Select **Import saved progress**. A single IndexedDB transaction stores the per-certification raw backup, valid legacy aggregates, any safely recoverable active session, and an idempotency marker. Reloads and concurrent tabs do not count the same baseline or evaluation twice.

Unknown question IDs in aggregate statistics are kept as historical baselines. Invalid counters are reported and skipped, while the unmodified raw record remains in the backup. A legacy session is resumed only if its IDs, answer indices, flags, timestamps, deadline, and option permutation can be validated against the current bank. If it cannot, no answer is guessed: the session is retained in the raw backup with a recovery warning.

Legacy submitted sessions are archived with provenance limitations and are not recorded as new attempts. The old format did not capture question wording or scoring revisions, so imported session snapshots identify fields that had to come from the current bank. Overdue active exams use the saved absolute deadline; only previously unevaluated answers are recorded when the session expires.

## Rollback and stale tabs

The original legacy browser key is never deleted or rewritten during import. It contains only the snapshot made by the old application; new progress is stored in IndexedDB and is not visible to an older app version. Therefore, rolling back the deployed app does **not** roll back or synchronize new quiz progress.

If an old tab or cached app writes the legacy key after import, the current page pauses quiz writes and offers a fresh backup. Choose **Keep IndexedDB and archive legacy copy** only after downloading that backup. The changed legacy value is archived and noted, but its counts are deliberately not merged into IndexedDB, which would risk double-counting. Refreshing alone does not silently resolve the conflict.

The service worker cache is versioned so an activated update removes the previous app-shell cache. Already-open tabs can continue running old code; storage events, `BroadcastChannel`, and visibility-time revision checks detect conflicts where supported.

## Reset and recovery limits

**Reset progress** requires confirmation and removes only quiz sessions, evaluated attempts, and question-stat projections for the current certification. It keeps study completion/bookmarks, learning goals, legacy backups, and downloaded JSON files.

## Restoring a JSON backup

On a certification page, choose **Restore from JSON** and select a version 1 **Download data backup** or complete **Download recovery backup** file. The importer validates the file format, session content, attempts, and question-progress projections before asking for confirmation. It replaces only the quiz progress for the certification currently open; other certifications and study progress remain unchanged. The replacement is atomic, and the page reloads to resume restored sessions.

Files with unsupported versions, incomplete recovery exports, mismatched certification data, invalid records, or progress from another certification are rejected without changing IndexedDB. Restore is disabled while legacy migration is pending; import or preserve that legacy progress first. An active session in another tab will be invalidated when its certification is restored.

Browser storage can be denied, quota-limited, or evicted by the browser. The app does not fall back to `localStorage` for new quiz progress. On storage failure, use **Download recovery backup** to save readable legacy keys, retry after restoring browser storage access, and retain the downloaded JSON separately.
