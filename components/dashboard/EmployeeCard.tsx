import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/shared/StageBadge";
import { categoryLabel, formatDate } from "@/lib/utils";
import type { SubmissionWithManager } from "@/lib/types";

interface EmployeeCardProps {
  submission: SubmissionWithManager;
  href: string;
}

export function EmployeeCard({ submission: s, href }: EmployeeCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{s.employeeName}</CardTitle>
          <StageBadge stage={s.stage} />
        </div>
        <p className="text-sm text-muted-foreground">{s.employeeCode} · {categoryLabel(s.category)}</p>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{formatDate(s.submittedAt)}</p>
        <Link href={href}>
          <Button size="sm">
            {s.stage === 1 ? "Add Remarks" : "View"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
