import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubmissionDetailClient } from "@/components/hr/SubmissionDetailClient";

export default async function HRSubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  const [submission, slabs] = await Promise.all([
    prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
      include: { manager: true },
    }),
    prisma.incrementSlab.findMany({ orderBy: { ctcMin: "asc" } }),
  ]);

  if (!submission) redirect("/hr");

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="Submission Detail">
      <SubmissionDetailClient submission={submission} slabs={slabs} />
    </DashboardLayout>
  );
}
