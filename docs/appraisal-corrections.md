# Appraisal corrections: local testing and rollout

The normal stage numbers and existing submission columns are unchanged. The feature is OFF unless `NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED=true` is present when Next.js starts/builds. New tables are queried only while enabled. Nothing here applies a production migration automatically.

## Local test environment

An isolated PostgreSQL cluster lives in `.local-correction-test/pgdata` (Git ignored), listening only on `127.0.0.1:55439`. Its database is `appraisal_correction_test`. Test scripts explicitly set both DATABASE_URL and DIRECT_URL to that database; they never use the database connection from `.env`.

Start the cluster, if necessary, in PowerShell:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe' -D "$PWD\.local-correction-test\pgdata" -l "$PWD\.local-correction-test\postgres.log" -o '-h 127.0.0.1 -p 55439' -w start
```

Run automated database tests:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File Scripts/test-corrections.ps1
```

Start the app for hands-on testing:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File Scripts/dev-corrections.ps1
```

Open http://127.0.0.1:3001. A yellow **Local correction test** banner must appear. Use this launcher, not plain `npm run dev`, for testing these changes. The original `.env` is unchanged.

The launcher reads the existing Supabase authentication directory to link local manager records. It never creates, updates, or deletes remote accounts. Staff use their existing sign-in credentials; authentication itself still uses the configured Supabase provider. The production seed script is NOT used. Test appraisals, eligibility, enrollments, and photos remain in the local database; test photos are stored as data URLs only in this development mode. This photo shortcut is disabled in production builds. Supabase service-role access is needed only for the read-only manager linking step. Stop if setup reports an error.

The automated tests create synthetic records. Use a fresh code such as `TEST-MANUAL-001` for a real camera test. Do not use a real employee's production code. Local changes are not visible on the production app.

## Hands-on test, one step at a time

1. Log in as HR on the local app. Add `TEST-MANUAL-001` to eligibility, and enroll the tester's face using the existing enrollment page. Enter a test employee name.
2. Open the employee category page. Use that test code and normal face verification. Choose a team whose manager account you can test. Fill the form, complete final face verification, and submit. Record the submission ID from HR's detail URL.
3. Log in as HR. Fill the HR section and submit. Confirm the manager now sees it in Pending.
4. As the assigned manager, leave recommendations blank and click **Return to HR for correction**. Enter a reason and confirm. It must work without completing the manager approval form. Unsaved manager edits are not implicitly saved; save a draft first if needed.
5. As HR, open the same ID. Check the manager's reason and **Returned to HR — correction required** status. HR cannot submit the review yet. Enter employee-facing instructions and click **Request employee correction**. Notify the employee as usual; the app does not send a message automatically.
6. As the employee, log in again through face verification. The saved category and answers should load automatically, with HR's instructions. Employee name/code, team/manager, category, and financial year remain unchanged. Reviewer ratings and internal comments must not appear.
7. Change an answer and resubmit after final verification. Confirm there is still only one appraisal and the same ID. Reopening employee login now shows that it is already submitted, without editing access.
8. As HR, refresh. Confirm the revised answer is visible and prior HR entries are retained. Edit HR fields if needed and submit again. The manager must not receive it before this step.
9. Repeat the return cycle once. Check that the history includes both returns and prior answers. Then finish manager review, management approval, and HR export/completion.
10. Confirm the final PDF/Excel contains revised employee answers and the final review data. Returned/awaiting-employee appraisals must not appear on the approved export pages.

Also check:

- A new appraisal that is never returned still follows the original complete workflow.
- Repeat the employee-prefill check for Group A, Group B, Group C, and QC.
- Leave a second browser tab open before returning/resubmitting. Submitting its old version must fail with a refresh message and leave the latest data intact.
- Double-click return or submit: only one action should succeed.
- Another manager cannot return the record; another employee cannot load or modify it.
- Remove local eligibility during correction: employee resubmission must be refused until HR restores eligibility.
- Returning does not erase HR entries, but its completion/signature date is invalidated. Fresh HR submission is mandatory.
- For appraisals that have undergone correction, manager/management editing is locked after their renewed review is submitted. Never-returned appraisals retain the existing late-edit behavior.

## Database change and deployment, after approval

New tables only:

- `appraisal_corrections`: current correction state, revision, concurrency version, reason, and instructions.
- `appraisal_correction_events`: dated actions and previous-answer snapshots; full return snapshots stay server-side.

Apply `supabase/corrections-additive.sql` first to a staging copy. It creates the two tables, constraints, index, and enables RLS on these new tables. It does not update, delete, renumber, or add columns to existing appraisal records. Prisma relations are metadata and do not change the old table. The trusted server database connection needs access to the new tables; browsers have no direct policies for them.

Do NOT run `prisma db push`, `prisma migrate reset`, or the existing seed script against production for this feature. This repository does not have a migration history; the SQL file is an explicit additive migration, not an instruction to baseline/reset production.

Before enabling:

1. Back up the production database and verify the SQL on staging with existing records, including completed records and any duplicate employee/year submissions.
2. Apply the reviewed additive SQL. With the feature disabled, the old application continues without querying the new tables.
3. Set a new random server-only `APPRAISAL_EMPLOYEE_SESSION_SECRET` of at least 32 characters. Do not use the local-test secret.
4. Set `NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED=true` and rebuild/deploy. Do not set `NEXT_PUBLIC_APPRAISAL_LOCAL_TEST` in production.
5. Use a controlled test appraisal to verify login, return, correction, review, and export before general use.

The new employee session is based on server comparison of the existing 128-value face descriptor with the same 0.5 threshold. It authorizes access to one employee/year and expires after two hours; final face verification refreshes it. This does not add liveness detection or replace the biometric system. Enrolled descriptors are no longer returned by the employee profile API while enabled. Confirm existing Supabase table/storage policies also prevent anonymous retrieval or modification of enrollment descriptors; repository code alone cannot establish the deployed RLS configuration.

Existing duplicate appraisals are preserved. If an employee has multiple records in the year, the employee page asks them to contact HR rather than guessing which one to edit. Initial creation is serialized to prevent new duplicates while enabled.

Do not turn the feature off or roll back to older code while a correction is pending: old code cannot interpret the correction state and may let HR advance stage 0. Complete pending correction cycles first, or put writes into maintenance mode and plan the rollback. Keep the new tables/history; do not drop them as a rollback step.

Stop the local cluster when finished:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe' -D "$PWD\.local-correction-test\pgdata" -m fast -w stop
```

## Validation performed

- Eleven database-backed integration groups cover employee-session integrity, initial stage enforcement, duplicate/concurrent submissions, return/reopen/resubmit, ownership and field protection, stale requests, repeated cycles, eligibility revocation, all four categories, history, and final completion.
- The additive SQL was reapplied to local fixtures at stages 0–4; complete-row hashes were unchanged.
- Feature-off compatibility passed against a separate database with the frozen original schema (`tests/fixtures/pre-corrections.prisma`) and no correction tables/session secret.
- Production build, TypeScript, and lint checks passed. Existing image-optimization and Supabase Edge Runtime warnings remain.
- Real camera verification and the full authenticated browser/export walkthrough still require the manual test above.
