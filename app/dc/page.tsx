import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnrollFaceClient } from "@/components/hr/EnrollFaceClient";

export default async function DCPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "dc") redirect("/login");

  return (
    <DashboardLayout role="dc" userEmail={user.email} title="Face Enrollment">
      <EnrollFaceClient />
    </DashboardLayout>
  );
}