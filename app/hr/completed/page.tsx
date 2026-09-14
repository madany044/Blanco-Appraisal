import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";

export default async function HRCompletedPage() {
    const user = await getAuthUser();
    if (!user || user.role !== "hr") redirect("/login");

    const submissions = await prisma.appraisalSubmission.findMany({
        where: { stage: 4 },
        include: { manager: true },
        orderBy: { completedAt: "desc" },
    });

    return (
        <DashboardLayout role="hr" userEmail={user.email} title="Completed Appraisals">
            <SubmissionsTable submissions={submissions} detailPath="/hr/submissions" />
        </DashboardLayout>
    );
}