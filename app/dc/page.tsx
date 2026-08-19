import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnrollFaceClient } from "@/components/hr/EnrollFaceClient";
import { USERS } from "@/prisma/users";

export default async function DCPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "dc") redirect("/login");

  const account = USERS.find((u) => u.email.toLowerCase() === user.email.toLowerCase());

  return (
    <DashboardLayout role="dc" userEmail={user.email} title="Face Enrollment">
      <EnrollFaceClient lockedEnrolledBy={account?.name ?? user.email} />
    </DashboardLayout>
  );
}