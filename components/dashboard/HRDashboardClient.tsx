"use client";

import { useEffect, useRef, useState } from "react";
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
  const isInitialMount = useRef(true);
  const [filters, setFilters] = useState<FilterState>({
    managerId: "all",
    category: "all",
    stage: "all",
    financialYear: "2026-27",
    search: "",
  });

  const setStageFilter = (stageValue: string | null) => {
    setFilters((current) => {
      const nextStage = stageValue ?? "all";
      return {
        ...current,
        stage: current.stage === nextStage ? "all" : nextStage,
      };
    });
  };

  useEffect(() => {
    // Skip the database fetch on first render since Next.js already provided initialSubmissions
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Total Form Submissions"
          value={stats.total}
          accent="primary"
          onClick={() => setStageFilter(null)}
          active={filters.stage === "all"}
        />
        <StatCard
          title="Pending HR Review"
          value={stats.pendingHR}
          accent="danger"
          onClick={() => setStageFilter("0")}
          active={filters.stage === "0"}
        />
        <StatCard
          title="Pending TL Review"
          value={stats.withManager}
          accent="warning"
          onClick={() => setStageFilter("1")}
          active={filters.stage === "1"}
        />
        <StatCard
          title="With Management"
          value={stats.withManagement}
          accent="purple"
          onClick={() => setStageFilter("2")}
          active={filters.stage === "2"}
        />
        <StatCard
          title="Returned to HR For Export"
          value={stats.returnedHR}
          accent="success"
          onClick={() => setStageFilter("3")}
          active={filters.stage === "3"}
        />
        <StatCard
          title="Export Completed"
          value={stats.completed}
          accent="success"
          onClick={() => setStageFilter("4")}
          active={filters.stage === "4"}
        />
      </div>

      <FilterBar filters={filters} onChange={setFilters} managers={managers} />
      <SubmissionsTable submissions={submissions} detailPath="/hr/submissions" />
    </div>
  );
}