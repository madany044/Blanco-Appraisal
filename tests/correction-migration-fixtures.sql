INSERT INTO managers (id, name, email)
VALUES ('00000000-0000-4000-8000-000000000001', 'Migration fixture manager', 'migration-fixture@example.invalid')
ON CONFLICT (id) DO NOTHING;
INSERT INTO appraisal_submissions (id, financial_year, category, stage, employee_name, employee_code, manager_id, basis_of_appraisal)
SELECT md5('correction-migration-' || n)::uuid, '2026-27', 'GROUP_A', n, 'Existing fixture ' || n, 'MIGRATION-FIXTURE-' || n,
  '00000000-0000-4000-8000-000000000001'::uuid, 'Preserve this original answer'
FROM generate_series(0,4) n
ON CONFLICT (id) DO NOTHING;
