import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagerDashboardClient } from "@/components/dashboard/ManagerDashboardClient";

export default async function ManagerDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") redirect("/login");

  const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
  if (!manager) redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { managerId: manager.id },
    include: { manager: true },
    orderBy: { submittedAt: "desc" },
  });

  const stats = {
    pending: submissions.filter((s) => s.stage === 1).length,
    reviewed: submissions.filter((s) => s.stage >= 2).length,
    total: submissions.length,
  };

  return (
    <DashboardLayout role="manager" userEmail={user.email} title="Manager Dashboard">
      <ManagerDashboardClient submissions={submissions} stats={stats} />
    </DashboardLayout>
  );
}
