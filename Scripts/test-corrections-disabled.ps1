$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$pgBin = 'C:\Program Files\PostgreSQL\17\bin'
$env:DATABASE_URL = 'postgresql://appraisal_test@127.0.0.1:55439/appraisal_legacy_test?schema=public'
$env:DIRECT_URL = $env:DATABASE_URL
$env:NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED = 'false'
Remove-Item Env:APPRAISAL_EMPLOYEE_SESSION_SECRET -ErrorAction SilentlyContinue
$exists = & "$pgBin\psql.exe" -h 127.0.0.1 -p 55439 -U appraisal_test -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'appraisal_legacy_test'"
if ($LASTEXITCODE -ne 0) { throw 'Test PostgreSQL is not running.' }
if (!$exists) {
  & "$pgBin\createdb.exe" -h 127.0.0.1 -p 55439 -U appraisal_test appraisal_legacy_test
  if ($LASTEXITCODE -ne 0) { throw 'Cannot create legacy test database.' }
}
node -e "require('fs').writeFileSync('.local-correction-test/baseline.prisma',require('fs').readFileSync('tests/fixtures/pre-corrections.prisma'))"
node node_modules/prisma/build/index.js db push --schema .local-correction-test/baseline.prisma --skip-generate
if ($LASTEXITCODE -ne 0) { throw 'Legacy test schema setup failed.' }
node node_modules/tsx/dist/cli.mjs tests/corrections-disabled.integration.ts
if ($LASTEXITCODE -ne 0) { throw 'Legacy compatibility test failed.' }
