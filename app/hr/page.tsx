import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HRDashboardClient } from "@/components/dashboard/HRDashboardClient";

export default async function HRDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  const [managers, submissions] = await Promise.all([
    prisma.manager.findMany({ orderBy: { name: "asc" } }),
    prisma.appraisalSubmission.findMany({
      include: { manager: true },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const stats = {
    total: submissions.filter((s) => s.stage >= 0).length,
    pendingHR: submissions.filter((s) => s.stage === 0).length,
    withManager: submissions.filter((s) => s.stage === 1).length,
    withManagement: submissions.filter((s) => s.stage === 2).length,
    returnedHR: submissions.filter((s) => s.stage === 3).length,
    completed: submissions.filter((s) => s.stage === 4).length,
  };

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="HR Dashboard">
      <HRDashboardClient
        managers={managers}
        initialSubmissions={submissions}
        stats={stats}
      />
    </DashboardLayout>
  );
}
