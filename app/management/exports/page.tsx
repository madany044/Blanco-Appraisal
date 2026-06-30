import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExportsClient } from "@/components/hr/ExportsClient";

export default async function ManagementExportsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "management") redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { stage: { gte: 3 } },
    include: { manager: true },
    orderBy: { employeeName: "asc" },
  });

  return (
    <DashboardLayout role="management" userEmail={user.email} title="Management Export Center">
      <ExportsClient submissions={submissions} />
    </DashboardLayout>
  );
}
