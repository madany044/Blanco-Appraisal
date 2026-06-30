import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagerCTCClient } from "@/components/manager/ManagerCTCClient";

export default async function ManagerCTCPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") redirect("/login");

  const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
  if (!manager) redirect("/login");

  const submissions = await prisma.appraisalSubmission.findMany({
    where: { managerId: manager.id },
    include: { manager: true },
    orderBy: { employeeName: "asc" },
  });

  return (
    <DashboardLayout role="manager" userEmail={user.email} title="Manager CTC Review">
      <ManagerCTCClient submissions={submissions} managerId={manager.id} />
    </DashboardLayout>
  );
}
