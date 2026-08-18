import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnrollFaceClient } from "@/components/hr/EnrollFaceClient";

export default async function ManagerEnrollFacePage() {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") redirect("/login");

  return (
    <DashboardLayout role="manager" userEmail={user.email} title="Enroll Employee Face">
      <EnrollFaceClient />
    </DashboardLayout>
  );
}