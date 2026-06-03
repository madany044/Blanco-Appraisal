"use client";

import { useRouter } from "next/navigation";
import { WorkflowBar } from "@/components/shared/WorkflowBar";
import { ChainSection } from "@/components/shared/ChainSection";
import { EmployeeFormReadOnly } from "@/components/forms/EmployeeFormReadOnly";
import { HRFeedbackForm } from "@/components/forms/HRFeedbackForm";
import { ManagerRemarksForm } from "@/components/forms/ManagerRemarksForm";
import { ManagementDecisionForm } from "@/components/forms/ManagementDecisionForm";
import { Button } from "@/components/ui/button";
import type { HRFormValues } from "@/lib/validations/hr-form.schema";
import type { AppraisalSubmission, Manager, IncrementSlab } from "@prisma/client";
import { decimalToNumber } from "@/lib/utils";
import { downloadPDF } from "@/components/export/PDFDownload";
import { exportSubmissionExcel } from "@/components/export/ExcelExport";

interface SubmissionDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager };
  slabs: IncrementSlab[];
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
    salaryBasicPresent: decimalToNumber(s.salaryBasicPresent),
    salaryDaPresent: decimalToNumber(s.salaryDaPresent),
    salaryHraPresent: decimalToNumber(s.salaryHraPresent),
    salaryCityAllowancePresent: decimalToNumber(s.salaryCityAllowancePresent),
    salaryConveyancePresent: decimalToNumber(s.salaryConveyancePresent),
    salaryMedicalPresent: decimalToNumber(s.salaryMedicalPresent),
    salaryEducationPresent: decimalToNumber(s.salaryEducationPresent),
    salaryLtaPresent: decimalToNumber(s.salaryLtaPresent),
    salarySpecialPresent: decimalToNumber(s.salarySpecialPresent),
    salaryPfDeduction: decimalToNumber(s.salaryPfDeduction),
    salaryEsicDeduction: decimalToNumber(s.salaryEsicDeduction),
    salaryPtDeduction: decimalToNumber(s.salaryPtDeduction),
    salaryEmployerPfPresent: decimalToNumber(s.salaryEmployerPfPresent),
    salaryBonusPresent: decimalToNumber(s.salaryBonusPresent),
    salaryEmployerEsicPresent: decimalToNumber(s.salaryEmployerEsicPresent),
    salaryMedicalInsurancePresent: decimalToNumber(s.salaryMedicalInsurancePresent),
    salaryCityAllowanceProposed: decimalToNumber(s.salaryCityAllowanceProposed),
    salarySpecialProposed: decimalToNumber(s.salarySpecialProposed),
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
        <EmployeeFormReadOnly submission={s} />
      </ChainSection>

      <ChainSection title="Section 2: HR Form" accent="green">
        <HRFeedbackForm
          defaultValues={hrDefaults}
          readOnly={s.stage > 0}
          onSaveDraft={s.stage === 0 ? (d) => hrSubmit(d, true) : undefined}
          onSubmit={s.stage === 0 ? (d) => hrSubmit(d, false) : undefined}
        />
      </ChainSection>

      <ChainSection title="Section 3: Manager Remarks" accent="amber">
        <ManagerRemarksForm
          defaultValues={{
            mgrRecommendation: s.mgrRecommendation ?? undefined,
            mgrStrongReasons: s.mgrStrongReasons,
            mgrConditionalReasons: s.mgrConditionalReasons,
            mgrNotRecommendedReasons: s.mgrNotRecommendedReasons,
            mgrRemarks: s.mgrRemarks ?? undefined,
            mgrSignatureName: s.mgrSignatureName ?? undefined,
          }}
          readOnly
        />
      </ChainSection>

      <ChainSection title="Section 4: Management Decision" accent="purple">
        <ManagementDecisionForm slabs={slabs} defaultValues={mgmtDefaults} readOnly />
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
