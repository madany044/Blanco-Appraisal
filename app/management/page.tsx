import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagementDashboardClient } from "@/components/management/ManagementDashboardClient";

export default async function ManagementDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "management") redirect("/login");

  const [submissions, managers] = await Promise.all([
    prisma.appraisalSubmission.findMany({
      where: { stage: { gte: 2 } },
      include: { manager: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.manager.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardLayout role="management" userEmail={user.email} title="Management Dashboard">
      <ManagementDashboardClient
        managers={managers}
        initialSubmissions={submissions}
      />
    </DashboardLayout>
  );
}
