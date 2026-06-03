-- Step 2: Supabase RLS policies for appraisal_submissions
-- Run this in Supabase SQL Editor after tables are created

ALTER TABLE appraisal_submissions ENABLE ROW LEVEL SECURITY;

-- Allow stage -1 for drafts (update check constraint if needed)
ALTER TABLE appraisal_submissions DROP CONSTRAINT IF EXISTS appraisal_submissions_stage_check;
ALTER TABLE appraisal_submissions ADD CONSTRAINT appraisal_submissions_stage_check
  CHECK (stage BETWEEN -1 AND 4);

-- Public insert for anonymous employees
CREATE POLICY public_insert ON appraisal_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- HR full access
CREATE POLICY hr_full_access ON appraisal_submissions
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'user_role') = 'hr')
  WITH CHECK ((auth.jwt() ->> 'user_role') = 'hr');

-- Manager sees only their employees
CREATE POLICY manager_own_employees ON appraisal_submissions
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') = 'manager'
    AND manager_id = (
      SELECT id FROM managers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'manager'
    AND manager_id = (
      SELECT id FROM managers WHERE user_id = auth.uid()
    )
  );

-- Management sees stage >= 2
CREATE POLICY management_stage_2_plus ON appraisal_submissions
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') = 'management'
    AND stage >= 2
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'management'
    AND stage >= 2
  );

-- Managers table: public read for dropdown
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY managers_public_read ON managers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Increment slabs: authenticated read
ALTER TABLE increment_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY slabs_authenticated_read ON increment_slabs
  FOR SELECT
  TO authenticated
  USING (true);
