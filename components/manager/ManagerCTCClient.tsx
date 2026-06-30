"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/lib/submission-display";
import { decimalToNumber } from "@/lib/utils";
import type { AppraisalSubmission } from "@prisma/client";
import { StageBadge } from "@/components/shared/StageBadge";

interface ManagerCTCClientProps {
  submissions: AppraisalSubmission[];
}

export function ManagerCTCClient({ submissions }: ManagerCTCClientProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return submissions.filter((s) =>
      !query ||
      s.employeeName.toLowerCase().includes(query) ||
      s.employeeCode.toLowerCase().includes(query)
    );
  }, [search, submissions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manager CTC Review</h1>
          <p className="text-sm text-muted-foreground">
            Review current CTC, previous increment, and new salary projections for your team.
          </p>
        </div>
        <Input
          placeholder="Search employee name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Current CTC</TableHead>
              <TableHead>Previous Increment</TableHead>
              <TableHead>Manager Increment</TableHead>
              <TableHead>Projected CTC</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No matching employees found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const current = s.currentSalary ?? 0;
                const hrPrevPct = decimalToNumber(s.previousIncrementPercentage) ?? 0;
                const mgrPct = decimalToNumber(s.mgmtIncrementPercentage);
                const projected = Math.round(current * (1 + mgrPct / 100));
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.employeeName}</TableCell>
                    <TableCell>{formatSalary(current)}</TableCell>
                    <TableCell>{hrPrevPct ? `${hrPrevPct}%` : "—"}</TableCell>
                    <TableCell>{mgrPct ? `${mgrPct}%` : "—"}</TableCell>
                    <TableCell>{projected ? formatSalary(projected) : "—"}</TableCell>
                    <TableCell><StageBadge stage={s.stage} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/manager/${s.id}`}>View</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}