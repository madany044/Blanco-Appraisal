-- Apply before deploying code that reads these new fields. Existing rows stay NULL.
BEGIN;
ALTER TABLE public.employee_profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS enrollment_status text;
COMMIT;
