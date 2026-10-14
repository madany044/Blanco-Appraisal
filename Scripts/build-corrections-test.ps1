$ErrorActionPreference = 'Stop'
$env:APPRAISAL_ISOLATED_OUTPUT = 'build'
Set-Location (Split-Path $PSScriptRoot -Parent)
$env:DATABASE_URL = 'postgresql://appraisal_test@127.0.0.1:55439/appraisal_correction_test?schema=public'
$env:DIRECT_URL = $env:DATABASE_URL
$env:NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED = 'true'
$env:APPRAISAL_EMPLOYEE_SESSION_SECRET = 'local-build-test-secret-not-for-production-2026'
node node_modules/next/dist/bin/next build
if ($LASTEXITCODE -ne 0) { throw 'Build validation failed.' }
