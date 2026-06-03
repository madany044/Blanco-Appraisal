"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportSubmissionsExcel } from "@/components/export/ExcelExport";
import { downloadPDF } from "@/components/export/PDFDownload";
import type { AppraisalSubmission } from "@prisma/client";
import { StageBadge } from "@/components/shared/StageBadge";

interface ExportsClientProps {
  submissions: AppraisalSubmission[];
}

export function ExportsClient({ submissions }: ExportsClientProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Export</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => exportSubmissionsExcel(submissions)}>
            Export All Ready Submissions to Excel
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {submissions.length} submission(s) at stage 3 or completed
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {submissions.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{s.employeeName}</p>
                <p className="text-sm text-muted-foreground">{s.employeeCode}</p>
              </div>
              <div className="flex items-center gap-3">
                <StageBadge stage={s.stage} />
                <Button size="sm" variant="outline" onClick={() => downloadPDF(s)}>PDF</Button>
                <Button size="sm" variant="outline" onClick={() => exportSubmissionsExcel([s])}>Excel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
