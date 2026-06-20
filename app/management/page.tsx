import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";
import { StatCard } from "@/components/dashboard/StatCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function ManagementDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "management") redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { stage: { gte: 2 } },
    include: { manager: true },
    orderBy: { submittedAt: "desc" },
  });

  const stats = {
    pending: submissions.filter((s) => s.stage === 2).length,
    decided: submissions.filter((s) => s.stage >= 3).length,
    total: submissions.length,
    completed: submissions.filter((s) => s.stage === 4).length,
  };

  return (
    <DashboardLayout role="management" userEmail={user.email} title="Management Dashboard">
      <div className="space-y-6">
        

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Pending Decision" value={stats.pending} accent="warning" />
          <StatCard title="Decisions Made" value={stats.decided} accent="success" />
          <StatCard title="Total Files" value={stats.total} accent="primary" />
          <StatCard title="Completed" value={stats.completed} accent="purple" />
        </div>

        <SubmissionsTable submissions={submissions} detailPath="/management" />
      </div>
    </DashboardLayout>
  );
}
