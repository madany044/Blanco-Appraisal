import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";

export default async function ManagementDraftsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "management") redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { stage: 2, mgmtDraftSavedAt: { not: null } },
    include: { manager: true },
    orderBy: { mgmtDraftSavedAt: "desc" },
  });

  return (
    <DashboardLayout role="management" userEmail={user.email} title="Saved Drafts">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Decisions you saved as a draft and haven&apos;t submitted yet. Pick up right where you left off.
        </p>
        <SubmissionsTable submissions={submissions} detailPath="/management" />
      </div>
    </DashboardLayout>
  );
}
