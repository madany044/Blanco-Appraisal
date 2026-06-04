"use client";

import { useRouter } from "next/navigation";
import { WorkflowBar } from "@/components/shared/WorkflowBar";
import { ChainSection } from "@/components/shared/ChainSection";
import { SubmissionDetailView } from "@/components/forms/SubmissionDetailView";
import { HRFeedbackForm } from "@/components/forms/HRFeedbackForm";
import { ManagerRemarksForm } from "@/components/forms/ManagerRemarksForm";
import { ManagementDecisionForm } from "@/components/forms/ManagementDecisionForm";
import { Button } from "@/components/ui/button";
import type { HRFormValues } from "@/lib/validations/hr-form.schema";
import type { ManagerFormValues } from "@/lib/validations/manager-form.schema";
import type { AppraisalSubmission, Manager } from "@prisma/client";
import { decimalToNumber, type SerializedIncrementSlab } from "@/lib/utils";
import { downloadPDF } from "@/components/export/PDFDownload";
import { exportSubmissionExcel } from "@/components/export/ExcelExport";

interface SubmissionDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager };
  slabs: SerializedIncrementSlab[];
}

export function SubmissionDetailClient({ submission: s, slabs }: SubmissionDetailClientProps) {
  const router = useRouter();

  async function hrSubmit(data: HRFormValues, draft = false) {
    const res = await fetch(`/api/submissions/${s.id}/hr-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, draft }),
    });
    if (res.ok) router.refresh();
    else alert("Failed to submit");
  }

  async function handleComplete() {
    const res = await fetch(`/api/submissions/${s.id}/complete`, { method: "POST" });
    if (res.ok) router.refresh();
    else alert("Failed to archive");
  }

  const hrDefaults: Partial<HRFormValues> = {
    hrCodeOfConduct: s.hrCodeOfConduct ?? undefined,
    hrDressCode: s.hrDressCode ?? undefined,
    hrProfessionalism: s.hrProfessionalism ?? undefined,
    hrLeaveManagement: s.hrLeaveManagement ?? undefined,
    hrTimingManagement: s.hrTimingManagement ?? undefined,
    hrBacklogNotes: s.hrBacklogNotes ?? undefined,
    hrAdminSignatureName: s.hrAdminSignatureName ?? undefined,
  };

  const mgmtDefaults = {
    mgmtIncrementPercentage: decimalToNumber(s.mgmtIncrementPercentage),
    mgmtEffectiveDate: s.mgmtEffectiveDate?.toISOString().split("T")[0] ?? "",
    mgmtApproverName: s.mgmtApproverName ?? "",
    mgmtFinalRemarks: s.mgmtFinalRemarks ?? "",
    mgmtFeedbackToEmployee: s.mgmtFeedbackToEmployee ?? "",
    mgmtInternalNotes: s.mgmtInternalNotes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{s.employeeName}</h2>
        <p className="text-muted-foreground">{s.employeeCode} · {s.manager.name}</p>
      </div>
      <WorkflowBar currentStage={s.stage} />

      <ChainSection title="Section 1: Employee Form" accent="blue">
        <SubmissionDetailView submission={s} sections={["employee"]} />
      </ChainSection>

      <ChainSection title="Section 2: HR Form" accent="green">
        <HRFeedbackForm
          defaultValues={hrDefaults}
          readOnly={s.stage > 0}
          submission={s.stage > 0 ? s : undefined}
          onSaveDraft={s.stage === 0 ? (d) => hrSubmit(d, true) : undefined}
          onSubmit={s.stage === 0 ? (d) => hrSubmit(d, false) : undefined}
        />
      </ChainSection>

      <ChainSection title="Section 3: Manager Remarks" accent="amber">
        <ManagerRemarksForm submission={s} readOnly defaultValues={{
          mgrRecommendation: s.mgrRecommendation as ManagerFormValues["mgrRecommendation"],
          mgrStrongReasons: s.mgrStrongReasons,
          mgrConditionalReasons: s.mgrConditionalReasons,
          mgrNotRecommendedReasons: s.mgrNotRecommendedReasons,
          mgrRemarks: s.mgrRemarks ?? undefined,
          mgrSignatureName: s.mgrSignatureName ?? undefined,
        }} />
      </ChainSection>

      <ChainSection title="Section 4: Management Decision" accent="purple">
        <ManagementDecisionForm
          slabs={slabs}
          employeeName={s.employeeName}
          currentSalary={s.currentSalary ?? 0}
          defaultValues={mgmtDefaults}
          readOnly
        />
      </ChainSection>

      {s.stage === 3 && (
        <div className="flex flex-wrap gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <Button onClick={() => downloadPDF(s)}>Download Full 4-Form PDF Report</Button>
          <Button variant="outline" onClick={() => exportSubmissionExcel(s)}>
            Export Excel
          </Button>
          <Button variant="success" onClick={handleComplete}>
            Archive and Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );
}
