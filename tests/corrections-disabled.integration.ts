import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55439"); assert.equal(url.pathname, "/appraisal_legacy_test");
  const { correctionsEnabled } = await import("../lib/correction-config");
  assert.equal(correctionsEnabled, false);
  const { prisma } = await import("../lib/prisma");
  const { attachCorrections, correctionDetails } = await import("../lib/corrections");
  const { transitionStage } = await import("../lib/workflow");
  const { POST: create } = await import("../app/api/submissions/route");
  const { GET: employeeGet } = await import("../app/api/employee-appraisal/route");
  try {
    const tables = await prisma.$queryRaw<{ name: string | null }[]>`SELECT to_regclass('appraisal_corrections')::text AS name`;
    assert.equal(tables[0].name, null, "Compatibility test requires the original schema without the new tables");
    const code = `LEGACY-${randomUUID().slice(0,8)}`;
    const manager = await prisma.manager.create({ data: { name: "Legacy test", email: `${code}@example.invalid` } });
    await prisma.eligibleEmployee.create({ data: { employeeCode: code, employeeName: "Legacy test employee" } });
    const res = await create(new NextRequest("http://localhost/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeCode: code, employeeName: "Legacy test employee", managerId: manager.id, category: "GROUP_A", stage: 0 }) }));
    assert.equal(res.status, 201);
    const row = await res.json();
    assert.deepEqual(await attachCorrections([{ id: row.id }]), [{ id: row.id }]);
    assert.deepEqual(await correctionDetails(row.id), { correction: null, events: [] });
    assert.equal((await employeeGet(new NextRequest("http://localhost/api/employee-appraisal"))).status, 404);
    for (let stage = 0; stage < 4; stage++) await transitionStage(row.id, stage, stage + 1);
    assert.equal((await prisma.appraisalSubmission.findUniqueOrThrow({ where: { id: row.id } })).stage, 4);
    console.log("PASS feature disabled: initial submission and all original workflow transitions work without correction tables or employee-session secret");
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
