import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExportsClient } from "@/components/hr/ExportsClient";

export default async function HRExportsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { stage: { gte: 3 } },
    orderBy: { employeeName: "asc" },
  });

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="Export & Download Center">
      <ExportsClient submissions={submissions} />
    </DashboardLayout>
  );
}
