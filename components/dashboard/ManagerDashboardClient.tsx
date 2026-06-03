"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmployeeCard } from "@/components/dashboard/EmployeeCard";
import type { SubmissionWithManager } from "@/lib/types";

interface ManagerDashboardClientProps {
  submissions: SubmissionWithManager[];
  stats: { pending: number; reviewed: number; total: number };
}

export function ManagerDashboardClient({ submissions, stats }: ManagerDashboardClientProps) {
  const pending = submissions.filter((s) => s.stage === 1);
  const reviewed = submissions.filter((s) => s.stage >= 2);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pending Remarks" value={stats.pending} accent="warning" />
        <StatCard title="Reviewed" value={stats.reviewed} accent="success" />
        <StatCard title="Total" value={stats.total} accent="primary" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({reviewed.length})</TabsTrigger>
          <TabsTrigger value="all">All Records ({submissions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {pending.map((s) => (
            <EmployeeCard key={s.id} submission={s} href={`/manager/${s.id}`} />
          ))}
          {pending.length === 0 && <p className="text-muted-foreground col-span-full">No pending items</p>}
        </TabsContent>
        <TabsContent value="reviewed" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {reviewed.map((s) => (
            <EmployeeCard key={s.id} submission={s} href={`/manager/${s.id}`} />
          ))}
        </TabsContent>
        <TabsContent value="all" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {submissions.map((s) => (
            <EmployeeCard key={s.id} submission={s} href={`/manager/${s.id}`} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
