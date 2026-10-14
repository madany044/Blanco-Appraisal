-- MANUAL opt-in migration. Do not use db push against production.
-- Apply first to an isolated test database. No existing rows/columns are changed.
BEGIN;
CREATE TABLE IF NOT EXISTS appraisal_corrections (
  submission_id uuid PRIMARY KEY REFERENCES appraisal_submissions(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'NONE' CHECK (status IN ('NONE', 'RETURNED_TO_HR', 'AWAITING_EMPLOYEE')),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  version integer NOT NULL DEFAULT 0 CHECK (version >= 0),
  reason text,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS appraisal_correction_events (
  id uuid PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES appraisal_submissions(id) ON DELETE RESTRICT,
  revision integer NOT NULL,
  action text NOT NULL,
  actor text NOT NULL,
  note text,
  snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appraisal_correction_events_submission_id_created_at_idx
  ON appraisal_correction_events(submission_id, created_at);
-- These tables contain private review history. Access only through authorized
-- server endpoints using the existing trusted Prisma database connection.
ALTER TABLE appraisal_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisal_correction_events ENABLE ROW LEVEL SECURITY;
COMMIT;
