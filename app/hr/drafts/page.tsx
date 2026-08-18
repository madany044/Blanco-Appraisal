import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";

export default async function HRDraftsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { stage: 0, hrDraftSavedAt: { not: null } },
    include: { manager: true },
    orderBy: { hrDraftSavedAt: "desc" },
  });

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="Saved Drafts">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Employee forms you saved as a draft and haven&apos;t submitted yet. Pick up right where you left off.
        </p>
        <SubmissionsTable submissions={submissions} detailPath="/hr/submissions" />
      </div>
    </DashboardLayout>
  );
}
