import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagementDetailClient } from "@/components/management/ManagementDetailClient";

export default async function ManagementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "management") redirect("/login");

  const [submission, slabs] = await Promise.all([
    prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
      include: { manager: true },
    }),
    prisma.incrementSlab.findMany({ orderBy: { ctcMin: "asc" } }),
  ]);

  if (!submission || submission.stage < 2) redirect("/management");

  return (
    <DashboardLayout role="management" userEmail={user.email} title="Management Review">
      <ManagementDetailClient submission={submission} slabs={slabs} />
    </DashboardLayout>
  );
}
