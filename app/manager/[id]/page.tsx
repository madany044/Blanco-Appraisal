import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagerDetailClient } from "@/components/manager/ManagerDetailClient";

export default async function ManagerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") redirect("/login");

  const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
  if (!manager) redirect("/login");

  const submission = await prisma.appraisalSubmission.findUnique({
    where: { id: params.id },
    include: { manager: true },
  });

  if (!submission || submission.managerId !== manager.id) redirect("/manager");

  return (
    <DashboardLayout role="manager" userEmail={user.email} title="Employee Detail">
      <ManagerDetailClient submission={submission} />
    </DashboardLayout>
  );
}
