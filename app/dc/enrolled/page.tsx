import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnrolledEmployeesClient } from "@/components/dc/EnrolledEmployeesClient";

export default async function DCEnrolledPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "dc") redirect("/login");

  const profiles = await prisma.employeeProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      employeeCode: true,
      employeeName: true,
      referencePhotoUrl: true,
      enrolledBy: true,
      createdAt: true,
    },
  });

  const enrolledByOptions = Array.from(
    new Set(
      profiles
        .map((profile) => profile.enrolledBy)
        .filter((value): value is string => Boolean(value && value.trim()))
        .sort((a, b) => a.localeCompare(b))
    )
  );

  return (
    <DashboardLayout role="dc" userEmail={user.email} title="Enrolled Employees">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Every employee enrolled for face verification, and who enrolled them.
        </p>

        {profiles.length === 0 ? (
          <p className="rounded-lg border bg-white p-6 text-center text-sm text-muted-foreground">
            No employees enrolled yet.
          </p>
        ) : (
          <EnrolledEmployeesClient profiles={profiles} enrolledByOptions={enrolledByOptions} />
        )}
      </div>
    </DashboardLayout>
  );
}