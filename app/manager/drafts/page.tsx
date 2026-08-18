import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";

export default async function ManagerDraftsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") redirect("/login");

  const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
  if (!manager) redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { managerId: manager.id, stage: 1, managerDraftSavedAt: { not: null } },
    include: { manager: true },
    orderBy: { managerDraftSavedAt: "desc" },
  });

  return (
    <DashboardLayout role="manager" userEmail={user.email} title="Saved Drafts">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Remarks you saved as a draft and haven&apos;t submitted yet. Pick up right where you left off.
        </p>
        <SubmissionsTable submissions={submissions} detailPath="/manager" />
      </div>
    </DashboardLayout>
  );
}
