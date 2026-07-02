"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/shared/StageBadge";
import { FormChips } from "@/components/shared/FormChips";
import { categoryLabel, formatDate } from "@/lib/utils";
import type { SubmissionWithManager } from "@/lib/types";
import { VerificationPhotoButton } from "@/components/shared/VerificationPhotoButton";

interface SubmissionsTableProps {
  submissions: SubmissionWithManager[];
  detailPath: string;
}

export function SubmissionsTable({ submissions, detailPath }: SubmissionsTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Forms</TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No submissions found
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.employeeName}</TableCell>
                <TableCell>{s.employeeCode}</TableCell>
                <TableCell>{categoryLabel(s.category)}</TableCell>
                <TableCell>{s.manager.name}</TableCell>
                <TableCell>{formatDate(s.submittedAt)}</TableCell>
                <TableCell><StageBadge stage={s.stage} /></TableCell>
                <TableCell><FormChips submission={s} /></TableCell>
                <TableCell><VerificationPhotoButton photoUrl={s.verificationPhotoUrl} /></TableCell>
                <TableCell>
                  <Link href={`${detailPath}/${s.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
