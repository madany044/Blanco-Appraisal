import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

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
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Enrolled By</TableHead>
                  <TableHead>Enrolled On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
  {profiles.map((p) => (
    <TableRow key={p.id}>
      <TableCell className="font-medium">{p.employeeName}</TableCell>
      <TableCell>{p.employeeCode}</TableCell>
      <TableCell>{p.enrolledBy || "—"}</TableCell>
      <TableCell>{formatDate(p.createdAt)}</TableCell>
    </TableRow>
  ))}
</TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}