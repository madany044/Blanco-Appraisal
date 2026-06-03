"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterBar, type FilterState } from "@/components/dashboard/FilterBar";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Manager } from "@prisma/client";
import type { SubmissionWithManager } from "@/lib/types";

interface HRDashboardClientProps {
  managers: Manager[];
  initialSubmissions: SubmissionWithManager[];
  stats: {
    total: number;
    pendingHR: number;
    withManager: number;
    withManagement: number;
    returnedHR: number;
    completed: number;
  };
}

export function HRDashboardClient({
  managers,
  initialSubmissions,
  stats,
}: HRDashboardClientProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filters, setFilters] = useState<FilterState>({
    managerId: "all",
    category: "all",
    stage: "all",
    financialYear: "2026-27",
    search: "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.managerId !== "all") params.set("managerId", filters.managerId);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.stage !== "all") params.set("stage", filters.stage);
    if (filters.financialYear !== "all") params.set("financialYear", filters.financialYear);
    if (filters.search) params.set("search", filters.search);

    fetch(`/api/submissions?${params}`)
      .then((r) => r.json())
      .then(setSubmissions)
      .catch(console.error);
  }, [filters]);

  return (
    <div className="space-y-6">
      {stats.returnedHR > 0 && (
        <Alert variant="warning">
          <AlertTitle>Files Ready for Finalization</AlertTitle>
          <AlertDescription>
            {stats.returnedHR} file{stats.returnedHR > 1 ? "s" : ""} returned by Management with all 4
            forms attached — ready for download and archiving
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total Submissions" value={stats.total} accent="primary" />
        <StatCard title="Pending HR Review" value={stats.pendingHR} accent="danger" />
        <StatCard title="With Manager" value={stats.withManager} accent="warning" />
        <StatCard title="With Management" value={stats.withManagement} accent="purple" />
        <StatCard title="Returned to HR" value={stats.returnedHR} accent="success" />
        <StatCard title="Completed" value={stats.completed} accent="success" />
      </div>

      <FilterBar filters={filters} onChange={setFilters} managers={managers} />
      <SubmissionsTable submissions={submissions} detailPath="/hr/submissions" />
    </div>
  );
}
