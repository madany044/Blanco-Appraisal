import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportsClient } from "@/components/hr/ReportsClient";

export default async function HRReportsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { stage: { gte: 0 } },
    include: { manager: true },
  });

  const byCategory = {
    GROUP_A: submissions.filter((s) => s.category === "GROUP_A").length,
    GROUP_B: submissions.filter((s) => s.category === "GROUP_B").length,
    GROUP_C: submissions.filter((s) => s.category === "GROUP_C").length,
    QC: submissions.filter((s) => s.category === "QC").length,
  };

  const byStage = [0, 1, 2, 3, 4].map((stage) => ({
    stage,
    count: submissions.filter((s) => s.stage === stage).length,
  }));

  const byManager = await prisma.manager.findMany({
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="Analytics & Reports">
      <ReportsClient
        byCategory={byCategory}
        byStage={byStage}
        byManager={byManager.map((m) => ({ name: m.name, count: m._count.submissions }))}
        total={submissions.length}
      />
    </DashboardLayout>
  );
}
