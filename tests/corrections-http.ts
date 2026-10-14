import assert from "node:assert/strict";
const origin = "http://127.0.0.1:3001";
async function main() {
  for (const path of ["/", "/login", "/employee/group-a", "/employee/group-b", "/employee/group-c", "/employee/qc"]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes("Local correction test"), `${path} must show isolated-test banner`);
    console.log(`PASS page ${path}`);
  }
  for (const [path, method, status] of [
    ["/api/employee-appraisal", "GET", 401], ["/api/employee-appraisal", "PATCH", 401],
    ["/api/submissions", "POST", 401], ["/api/submissions", "GET", 401],
    ["/api/employee-profiles", "POST", 403],
    ["/api/submissions/00000000-0000-4000-8000-000000000001/correction", "POST", 403],
    ["/api/submissions/00000000-0000-4000-8000-000000000001/return", "POST", 401],
    ["/api/submissions/00000000-0000-4000-8000-000000000001/hr-submit", "POST", 403],
    ["/api/submissions/00000000-0000-4000-8000-000000000001/manager-submit", "POST", 403],
    ["/api/submissions/00000000-0000-4000-8000-000000000001/management-submit", "POST", 403],
  ] as const) {
    const response = await fetch(origin + path, { method, headers: { "Content-Type": "application/json" }, ...(method === "GET" ? {} : { body: "{}" }) });
    assert.equal(response.status, status, `${method} ${path}`);
    console.log(`PASS unauthenticated ${method} ${path} rejected`);
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
