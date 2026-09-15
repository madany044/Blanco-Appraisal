import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HRDashboardClient } from "@/components/dashboard/HRDashboardClient";

export default async function HRDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  const [managers, allSubmissions] = await Promise.all([
    prisma.manager.findMany({ orderBy: { name: "asc" } }),

    // Fetch everything (including completed) so stats stay accurate.
    // The completed ones are filtered out below, only for the table.
    prisma.appraisalSubmission.findMany({
      where: {
        hrDraftSavedAt: null,
      },
      include: { manager: true },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const stats = {
    total: allSubmissions.filter((s) => s.stage >= 0).length,
    pendingHR: allSubmissions.filter((s) => s.stage === 0).length,
    withManager: allSubmissions.filter((s) => s.stage === 1).length,
    withManagement: allSubmissions.filter((s) => s.stage === 2).length,
    returnedHR: allSubmissions.filter((s) => s.stage === 3).length,
    completed: allSubmissions.filter((s) => s.stage === 4).length,
  };

  // Landing page table should only show in-progress submissions —
  // completed ones live on the dedicated /hr/completed page instead.
  const activeSubmissions = allSubmissions.filter((s) => s.stage < 4);

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="HR Dashboard">
      <HRDashboardClient
        managers={managers}
        initialSubmissions={activeSubmissions}
        stats={stats}
      />
    </DashboardLayout>
  );
}