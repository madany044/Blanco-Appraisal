import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManagementDashboardClient } from "@/components/management/ManagementDashboardClient";

export default async function ManagementCompletedPage({ searchParams }: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "management") redirect("/login");
  const [submissions, managers] = await Promise.all([
    prisma.appraisalSubmission.findMany({
      where: { stage: 4 }, include: { manager: true }, orderBy: { completedAt: "desc" },
    }),
    prisma.manager.findMany({ orderBy: { name: "asc" } }),
  ]);
  const initialFilters = Object.fromEntries(
    ["managerId", "category", "financialYear", "search"].flatMap((key) =>
      typeof searchParams[key] === "string" ? [[key, searchParams[key]]] : [])
  );
  return (
    <DashboardLayout role="management" userEmail={user.email} title="Completed Appraisals">
      <ManagementDashboardClient managers={managers} initialSubmissions={submissions} completedView initialFilters={initialFilters} />
    </DashboardLayout>
  );
}
