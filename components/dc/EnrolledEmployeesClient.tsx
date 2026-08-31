"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface EnrolledProfile {
  id: string;
  employeeCode: string;
  employeeName: string;
  enrolledBy: string | null;
  createdAt: Date;
}

interface EnrolledEmployeesClientProps {
  profiles: EnrolledProfile[];
  enrolledByOptions: string[];
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function EnrolledEmployeesClient({
  profiles,
  enrolledByOptions,
}: EnrolledEmployeesClientProps) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [enrolledBy, setEnrolledBy] = useState("all");
  const [employeeName, setEmployeeName] = useState("");

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesEmployeeCode =
        !employeeCode || normalize(profile.employeeCode).includes(normalize(employeeCode));

      const matchesEnrolledBy =
        enrolledBy === "all" || normalize(profile.enrolledBy || "—") === normalize(enrolledBy);

      const matchesEmployeeName =
        !employeeName || normalize(profile.employeeName).includes(normalize(employeeName));

      return matchesEmployeeCode && matchesEnrolledBy && matchesEmployeeName;
    });
  }, [profiles, employeeCode, enrolledBy, employeeName]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Employee ID</label>
            <Input
              value={employeeCode}
              onChange={(event) => setEmployeeCode(event.target.value)}
              placeholder="Search employee ID"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Enrolled By</label>
            <Select value={enrolledBy} onValueChange={setEnrolledBy}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {enrolledByOptions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Employee Name</label>
            <Input
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              placeholder="Search employee name"
            />
          </div>
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-center text-sm text-muted-foreground">
          No employees match the current filters.
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
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.employeeName}</TableCell>
                  <TableCell>{profile.employeeCode}</TableCell>
                  <TableCell>{profile.enrolledBy || "—"}</TableCell>
                  <TableCell>{formatDate(profile.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
