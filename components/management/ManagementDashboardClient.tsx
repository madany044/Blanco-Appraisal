"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterBar, type FilterState } from "@/components/dashboard/FilterBar";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Manager } from "@prisma/client";
import type { SubmissionWithManager } from "@/lib/types";

interface ManagementDashboardClientProps {
  managers: Manager[];
  initialSubmissions: SubmissionWithManager[];
  stats: {
    pending: number;
    decided: number;
    total: number;
    completed: number;
  };
}

export function ManagementDashboardClient({ managers, initialSubmissions, stats }: ManagementDashboardClientProps) {
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
      <Alert variant="default">
        <AlertTitle>Management Review Dashboard</AlertTitle>
        <AlertDescription>
         
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Pending Decision" value={stats.pending} accent="warning" />
        <StatCard title="Decisions Made" value={stats.decided} accent="success" />
        <StatCard title="Total Files" value={stats.total} accent="primary" />
        <StatCard title="Completed" value={stats.completed} accent="purple" />
      </div>

      <FilterBar filters={filters} onChange={setFilters} managers={managers} />
      <SubmissionsTable submissions={submissions} detailPath="/management" />
    </div>
  );
}
