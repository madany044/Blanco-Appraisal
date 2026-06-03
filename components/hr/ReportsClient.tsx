"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";

interface ReportsClientProps {
  total: number;
  byCategory: Record<string, number>;
  byStage: { stage: number; count: number }[];
  byManager: { name: string; count: number }[];
}

const STAGE_NAMES = ["Pending HR", "With Manager", "With Management", "Returned HR", "Completed"];

export function ReportsClient({ total, byCategory, byStage, byManager }: ReportsClientProps) {
  return (
    <div className="space-y-8">
      <StatCard title="Total Active Submissions" value={total} accent="primary" />

      <Card>
        <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(byCategory).map(([cat, count]) => (
              <div key={cat} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-blanco-primary">{count}</p>
                <p className="text-sm text-muted-foreground">{cat.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>By Workflow Stage</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {byStage.map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-4">
              <span className="w-40 text-sm">{STAGE_NAMES[stage]}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blanco-primary rounded-full"
                  style={{ width: total ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-8 text-sm font-medium">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>By Manager</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {byManager.map((m) => (
            <div key={m.name} className="flex justify-between items-center py-2 border-b">
              <span>{m.name}</span>
              <span className="font-semibold text-blanco-primary">{m.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
