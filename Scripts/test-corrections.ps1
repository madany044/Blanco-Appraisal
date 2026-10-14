$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$pgBin = 'C:\Program Files\PostgreSQL\17\bin'
$testUrl = 'postgresql://appraisal_test@127.0.0.1:55439/appraisal_correction_test?schema=public'
$env:DATABASE_URL = $testUrl
$env:DIRECT_URL = $testUrl
$env:NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED = 'true'
$env:APPRAISAL_EMPLOYEE_SESSION_SECRET = 'local-integration-test-secret-not-for-production-2026'
$exists = & "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'appraisal_correction_test'"
if ($LASTEXITCODE -ne 0) { throw 'Isolated PostgreSQL test cluster is not running.' }
if (!$exists -or $exists -notmatch '1') {
  & "$pgBin\createdb.exe" -h 127.0.0.1 -p 55439 -U appraisal_test appraisal_correction_test
  if ($LASTEXITCODE -ne 0) { throw 'Failed to create test database.' }
}
$hasSchema = & "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d appraisal_correction_test -tAc "SELECT to_regclass('public.appraisal_submissions')"
if (!$hasSchema) {
  # Build the pre-feature schema to check the additive upgrade, not a reset.
  node -e "require('fs').writeFileSync('.local-correction-test/baseline.prisma',require('fs').readFileSync('tests/fixtures/pre-corrections.prisma'))"
  node node_modules/prisma/build/index.js db push --schema .local-correction-test/baseline.prisma --skip-generate
  if ($LASTEXITCODE -ne 0) { throw 'Failed to initialize baseline test schema.' }
}
& "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d appraisal_correction_test -v ON_ERROR_STOP=1 -f tests/correction-migration-fixtures.sql
if ($LASTEXITCODE -ne 0) { throw 'Migration fixtures failed.' }
$hashQuery = "SELECT md5(string_agg(to_jsonb(s)::text, '|' ORDER BY id)) FROM appraisal_submissions s WHERE employee_code LIKE 'MIGRATION-FIXTURE-%'"
$before = & "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d appraisal_correction_test -tAc $hashQuery
& "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d appraisal_correction_test -v ON_ERROR_STOP=1 -f supabase/corrections-additive.sql
if ($LASTEXITCODE -ne 0) { throw 'Additive migration failed.' }
$after = & "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d appraisal_correction_test -tAc $hashQuery
if (!$before -or $before -ne $after) { throw 'Existing appraisal data changed during migration.' }
Write-Host 'PASS additive migration preserves existing appraisals at all five stages'

node node_modules/tsx/dist/cli.mjs tests/corrections.integration.ts
if ($LASTEXITCODE -ne 0) { throw 'Correction integration tests failed.' }

exit 0
