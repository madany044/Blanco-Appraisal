"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterBar, type FilterState } from "@/components/dashboard/FilterBar";
import { SubmissionsTable } from "@/components/dashboard/SubmissionsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Manager } from "@prisma/client";
import type { SubmissionWithManager } from "@/lib/types";

interface ManagementDashboardClientProps {
  managers: Manager[];
  initialSubmissions: SubmissionWithManager[];
  completedView?: boolean;
  initialFilters?: Partial<FilterState>;
}

export function ManagementDashboardClient({ managers, initialSubmissions, completedView = false, initialFilters }: ManagementDashboardClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    managerId: "all",
    category: "all",
    stage: "all",
    financialYear: completedView ? "all" : "2026-27",
    search: "",
    ...initialFilters,
  });

  const setStageFilter = (stageValue: string | null) => {
    setFilters((current) => {
      const nextStage = stageValue ?? "all";
      return {
        ...current,
        stage: nextStage,
      };
    });
  };

  const matching = initialSubmissions.filter((s) =>
    (filters.managerId === "all" || s.managerId === filters.managerId) &&
    (filters.category === "all" || s.category === filters.category) &&
    (filters.financialYear === "all" || s.financialYear === filters.financialYear) &&
    (!filters.search.trim() || `${s.employeeName} ${s.employeeCode}`.toLowerCase().includes(filters.search.trim().toLowerCase()))
  );
  const stats = {
    pending: matching.filter((s) => s.stage === 2).length,
    decided: matching.filter((s) => s.stage === 3).length,
    total: matching.filter((s) => s.stage === 2 || s.stage === 3).length,
    completed: matching.filter((s) => s.stage === 4).length,
  };
  const submissions = matching.filter((s) => completedView ? s.stage === 4 :
    (s.stage === 2 || s.stage === 3) && (filters.stage === "all" || String(s.stage) === filters.stage));

  return (
    <div className="space-y-6">
      <Alert variant="default">
        <AlertTitle>{completedView ? "Completed Appraisals" : "Management Review Dashboard"}</AlertTitle>
        <AlertDescription>{completedView ? "Appraisals finalized by HR after export." : "Pending decisions and appraisals awaiting HR export. Completed appraisals are available in Completed."}</AlertDescription>
      </Alert>
      {!completedView && <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending Decision"
          value={stats.pending}
          accent="warning"
          onClick={() => setStageFilter("2")}
          active={filters.stage === "2"}
        />
        <StatCard
          title="Decisions Made"
          value={stats.decided}
          accent="success"
          onClick={() => setStageFilter("3")}
          active={filters.stage === "3"}
        />
        <StatCard
          title="Active Files"
          value={stats.total}
          accent="primary"
          onClick={() => setStageFilter(null)}
          active={filters.stage === "all"}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          accent="purple"
          onClick={() => router.push(`/management/completed?${new URLSearchParams({ managerId: filters.managerId, category: filters.category, financialYear: filters.financialYear, search: filters.search })}`)}
          active={false}
        />
      </div>}

      <FilterBar filters={filters} onChange={setFilters} managers={managers} stages={completedView ? [] : ["2", "3"]} />
      <SubmissionsTable submissions={submissions} detailPath="/management" />
    </div>
  );
}
