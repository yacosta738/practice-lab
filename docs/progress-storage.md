# Browser progress, migration, and recovery

Practice Lab stores quiz sessions, evaluated attempts, question statistics, study-note progress,
bookmarks, and study goals in the `practice-lab` IndexedDB database. The data remains local to the
current browser profile and site origin. It is not uploaded or synchronized between the GitHub Pages
and Vercel origins. Study-note page paths and note-level behavior are excluded from analytics. The
`practice-lab-theme` `localStorage` entry remains a presentation preference; quiz progress no longer
reads or writes the legacy `<certification>-practice-lab-v2` key after its one-time import.

## Importing legacy progress

1. Open a certification page. If a legacy progress key exists, the page validates it and shows the
   fields it could not safely import.
2. Select **Download data backup**. The versioned JSON contains the raw legacy records for known
   certifications, prior migration backups, session history, and question-progress projections.
   Import stays disabled until the backup file is generated and its legacy archive is saved.
3. Select **Import saved progress**. A single IndexedDB transaction stores the per-certification raw
   backup, valid legacy aggregates, any safely recoverable active session, and an idempotency
   marker. Reloads and concurrent tabs do not count the same baseline or evaluation twice.

Unknown question IDs in aggregate statistics are kept as historical baselines. Invalid counters are
reported and skipped, while the unmodified raw record remains in the backup. A legacy session is
resumed only if its IDs, answer indices, flags, timestamps, deadline, and option permutation can be
validated against the current bank. If it cannot, no answer is guessed: the session is retained in
the raw backup with a recovery warning.

Legacy submitted sessions are archived with provenance limitations and are not recorded as new
attempts. The old format did not capture question wording or scoring revisions, so imported session
snapshots identify fields that had to come from the current bank. Overdue active exams use the saved
absolute deadline; only previously unevaluated answers are recorded when the session expires.

## Rollback and stale tabs

The original legacy browser key is never deleted or rewritten during import. It contains only the
snapshot made by the old application; new progress is stored in IndexedDB and is not visible to an
older app version. Therefore, rolling back the deployed app does **not** roll back or synchronize
new quiz progress.

If an old tab or cached app writes the legacy key after import, the current page pauses quiz writes
and offers a fresh backup. Choose **Keep IndexedDB and archive legacy copy** only after downloading
that backup. The changed legacy value is archived and noted, but its counts are deliberately not
merged into IndexedDB, which would risk double-counting. Refreshing alone does not silently resolve
the conflict.

The service worker cache is versioned so an activated update removes the previous app-shell cache.
Already-open tabs can continue running old code; storage events, `BroadcastChannel`, and
visibility-time revision checks detect conflicts where supported.

## Study-note progress and goals

Opening a note records it as **in progress**; visiting or scrolling never marks it complete. The
reader must choose **Mark as complete**, and **Mark unread** reverses that state. Reading anchors are
saved only when a heading changes after a short debounce and are offered as explicit resume links;
the app does not force scroll or focus. Bookmarks and note states are scoped by certification.

By default a note's stable ID is its content path. Before renaming a file, keep its existing `noteId`
or set an explicit stable `noteId`; add prior IDs to `aliases` when changing the canonical ID. The
route may change while progress follows the stable ID or an alias. Removed notes remain in archived
history and in backups, but are excluded from the current eligible-note denominator. When note body
or title content changes, a prior completion becomes in progress and its completion timestamp is
retained; a saved reading anchor from the old revision is cleared rather than resumed at an
unverified location.

Exam targets are optional `YYYY-MM-DD` floating local-calendar dates, not UTC timestamps or a time
zone-specific instant. Question and completed-note targets are also optional. Existing numeric target
timestamps are preserved as legacy values during migration and backup; they are not converted into
invented local dates. No notification permission or remote calendar integration is used.

The full backup uses schema version 2 and includes note IDs, states, reading anchors, bookmarks, and
goals; version 1 backups are normalized on restore. Stable IDs and aliases are part of the published
note metadata, not copies of note content in the backup. Full data management resets remove study
states and goals for the chosen scope. The separate quiz-only
**Reset progress** action intentionally keeps study-note progress and goals.

## Review scheduling (`review-v1`)

Practice Lab maintains a rebuildable, browser-local due-review projection (`reviewSchedule` on each
`questionProgress` record) derived deterministically from actual evaluated `questionAttempts`:

- **Policy version**: `review-v1`, stored on each scheduled projection, in IndexedDB metadata
  (`review-scheduler:policy-version`), and in exported backups (`schedulerPolicyVersion`).
- **Fixed-step interval ladder**: consecutive on-time or overdue correct evaluations across distinct
  sessions advance through `1 → 3 → 7 → 14 → 30` calendar days (maximum interval `30` days).
  Incorrect or partial evaluations reset the streak and schedule the next review in `1` calendar day.
- **Floating local calendar dates**: due dates are stored as `YYYY-MM-DD` floating local calendar
  dates (`dueDateTimezone: "floating-local"`), plus `scheduledInTimeZone` for deterministic rebuilds.
  Calendar arithmetic avoids 23-hour/25-hour daylight-saving drift and evaluates due/overdue status
  against the device's current local calendar date.
- **Overdue, early, and skipped questions**: overdue reviews advance from the actual evaluation
  date rather than staying overdue; early correct reviews before `dueDate` do not inflate intervals
  from same-day repetition; unanswered/skipped questions produce no attempt record and never alter
  review schedules.
- **Legacy baselines and material revisions**: undated `legacyBaseline` totals never fabricate
  review dates. When a question's content revision changes materially, it is queued for
  re-verification and resets to step 0 when next evaluated, while historical session scores stay
  intact.
- **Atomic pipeline & portability**: review sessions (`mode: "review"`) record attempts through the
  same atomic `recordEvaluation` / `finalizeSession` transactions as practice and mock exams, stay
  idempotent on retries and cross-tab conflicts, and never alter official-style mock exam scoring.
  Backups preserve review schedules and upgrade older scheduler policies automatically on restore.
  No push notifications, accounts, or backend sync are required.

## Reset and recovery limits

**Reset progress** requires confirmation and removes only quiz sessions, evaluated attempts, and
question-stat projections for the current certification. It keeps study completion/bookmarks,
learning goals, legacy backups, and downloaded JSON files.

## Full learning data backup and portability

Open **Data management** in the workspace to download or restore a complete learning-data backup, or
reset one certification or all learning data. The versioned JSON contains quiz sessions (including
active and historical snapshots), attempts and projections, study progress, learning goals,
allowlisted legacy recovery records, and legacy migration provenance. It does not include theme
preferences, arbitrary `localStorage` entries, accounts, or uploaded data. The SHA-256 digest
detects accidental file changes; it is not encryption or authentication, so store the downloaded
file somewhere private.

Restore is a full replacement for the current browser profile and origin. The page validates the
format, size, record limits, timestamps, IDs, certification relationships, frozen question content,
scoring and projections before showing a dry-run summary. Review the counts and confirm explicitly;
a current-data download is offered first. Cancelling or rejecting a file changes nothing. Importing
does not merge aggregate-only legacy counts, which could double-count history.

Browser profiles and origins have separate storage. GitHub Pages, Vercel, and a custom domain do not
share quiz or study progress, even when they serve the same site. To move data, download the JSON in
the original profile/origin and manually transfer and restore it in the destination. A PWA or
service-worker cache only helps load application assets; it does not guarantee that browser storage
or progress will be retained.

The storage panel reports estimates only when `StorageManager` supports them. **Request persistent
storage** is an explicit browser request and may be denied or unavailable; it is not permanent
storage. Keep a downloaded backup for recovery. A reset names its scope before confirmation,
includes active sessions, rotates generation tokens to invalidate stale tabs, and keeps legacy
recovery archives and unrelated appearance preferences.

## Restoring a JSON backup

On a certification page, choose **Restore from JSON** and select a version 1 **Download data
backup** or complete **Download recovery backup** file. The importer validates the file format,
session content, attempts, and question-progress projections before asking for confirmation. It
replaces only the quiz progress for the certification currently open; other certifications and study
progress remain unchanged. The replacement is atomic, and the page reloads to resume restored
sessions.

Files with unsupported versions, incomplete recovery exports, mismatched certification data, invalid
records, or progress from another certification are rejected without changing IndexedDB. Restore is
disabled while legacy migration is pending; import or preserve that legacy progress first. An active
session in another tab will be invalidated when its certification is restored.

Browser storage can be denied, quota-limited, or evicted by the browser. The app does not fall back
to `localStorage` for new quiz progress. On storage failure, use **Download recovery backup** to
save readable legacy keys, retry after restoring browser storage access, and retain the downloaded
JSON separately.
