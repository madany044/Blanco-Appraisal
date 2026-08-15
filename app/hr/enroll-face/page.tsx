import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnrollFaceClient } from "../../../components/hr/EnrollFaceClient";

export default async function EnrollFacePage() {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") redirect("/login");

  return (
    <DashboardLayout role="hr" userEmail={user.email} title="Enroll Employee Face">
      <EnrollFaceClient />
    </DashboardLayout>
  );
}