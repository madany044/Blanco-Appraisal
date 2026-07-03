import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExportsClient } from "@/components/hr/ExportsClient";

export default async function ManagerExportsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") redirect("/login");

  const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
  if (!manager) redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { managerId: manager.id, stage: { gte: 3 } },
    include: { manager: true },
    orderBy: { employeeName: "asc" },
  });

  return (
    <DashboardLayout role="manager" userEmail={user.email} title="Export Center">
      <ExportsClient submissions={submissions} />
    </DashboardLayout>
  );
}