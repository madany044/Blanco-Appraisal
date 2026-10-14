$ErrorActionPreference = 'Stop'
$env:APPRAISAL_ISOLATED_OUTPUT = 'dev'
Set-Location (Split-Path $PSScriptRoot -Parent)
# This launcher deliberately overrides both database URLs. It never loads them from .env.
$env:DATABASE_URL = 'postgresql://appraisal_test@127.0.0.1:55439/appraisal_correction_test?schema=public'
$env:DIRECT_URL = $env:DATABASE_URL
$env:NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED = 'true'
$env:NEXT_PUBLIC_APPRAISAL_LOCAL_TEST = 'true'
$env:APPRAISAL_EMPLOYEE_SESSION_SECRET = 'local-demo-only-session-secret-do-not-use-in-production-2026'
node node_modules/tsx/dist/cli.mjs Scripts/seed-correction-demo.ts
if ($LASTEXITCODE -ne 0) { throw 'Local test setup failed. The app was not started.' }
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3001
