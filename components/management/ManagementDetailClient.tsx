"use client";

import { useRouter } from "next/navigation";
import { WorkflowBar } from "@/components/shared/WorkflowBar";
import { ChainSection } from "@/components/shared/ChainSection";
import { EmployeeFormReadOnly } from "@/components/forms/EmployeeFormReadOnly";
import { HRFeedbackForm } from "@/components/forms/HRFeedbackForm";
import { ManagerRemarksForm } from "@/components/forms/ManagerRemarksForm";
import { ManagementDecisionForm } from "@/components/forms/ManagementDecisionForm";
import type { ManagementFormValues } from "@/lib/validations/management-form.schema";
import type { AppraisalSubmission, Manager, IncrementSlab } from "@prisma/client";
import { decimalToNumber } from "@/lib/utils";

interface ManagementDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager };
  slabs: IncrementSlab[];
}

export function ManagementDetailClient({ submission: s, slabs }: ManagementDetailClientProps) {
  const router = useRouter();

  async function submit(data: ManagementFormValues, draft = false) {
    const res = await fetch(`/api/submissions/${s.id}/management-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, draft }),
    });
    if (res.ok) router.refresh();
    else {
      const err = await res.json();
      alert(err.error ?? "Failed");
    }
  }

  const mgmtDefaults: Partial<ManagementFormValues> = {
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
    salaryCityAllowanceProposed: decimalToNumber(s.salaryCityAllowanceProposed) || decimalToNumber(s.salaryCityAllowancePresent),
    salarySpecialProposed: decimalToNumber(s.salarySpecialProposed) || decimalToNumber(s.salarySpecialPresent),
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
        <HRFeedbackForm readOnly defaultValues={{
          hrCodeOfConduct: s.hrCodeOfConduct ?? undefined,
          hrDressCode: s.hrDressCode ?? undefined,
          hrProfessionalism: s.hrProfessionalism ?? undefined,
          hrLeaveManagement: s.hrLeaveManagement ?? undefined,
          hrTimingManagement: s.hrTimingManagement ?? undefined,
          hrBacklogNotes: s.hrBacklogNotes ?? undefined,
          hrAdminSignatureName: s.hrAdminSignatureName ?? undefined,
        }} />
      </ChainSection>

      <ChainSection title="Section 3: Manager Form" accent="amber">
        <ManagerRemarksForm readOnly defaultValues={{
          mgrRecommendation: s.mgrRecommendation ?? undefined,
          mgrStrongReasons: s.mgrStrongReasons,
          mgrConditionalReasons: s.mgrConditionalReasons,
          mgrNotRecommendedReasons: s.mgrNotRecommendedReasons,
          mgrRemarks: s.mgrRemarks ?? undefined,
          mgrSignatureName: s.mgrSignatureName ?? undefined,
        }} />
      </ChainSection>

      <ChainSection title="Section 4: Management Decision Form" accent="purple">
        <ManagementDecisionForm
          slabs={slabs}
          defaultValues={mgmtDefaults}
          readOnly={s.stage !== 2}
          onSaveDraft={s.stage === 2 ? (d) => submit(d, true) : undefined}
          onSubmit={s.stage === 2 ? (d) => submit(d, false) : undefined}
        />
      </ChainSection>
    </div>
  );
}
