"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowBar } from "@/components/shared/WorkflowBar";
import { ChainSection } from "@/components/shared/ChainSection";
import { SubmissionDetailView } from "@/components/forms/SubmissionDetailView";
import { HRFeedbackForm } from "@/components/forms/HRFeedbackForm";
import { ManagerRemarksForm } from "@/components/forms/ManagerRemarksForm";
import type { ManagerFormValues } from "@/lib/validations/manager-form.schema";
import type { AppraisalSubmission, Manager } from "@prisma/client";
import type { SerializedIncrementSlab } from "@/lib/utils";
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";
import { SELF_RATING_ITEMS } from "@/lib/form-questions";
import { SuccessToast } from "@/components/shared/SuccessToast";

interface ManagerDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager };
  managerName: string;
  currentSalary?: number;
  slabs?: SerializedIncrementSlab[];
}

export function ManagerDetailClient({
  submission: s,
  managerName,
  currentSalary = 0,
  slabs = [],
}: ManagerDetailClientProps) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  async function submit(data: ManagerFormValues, draft = false) {
    // First time reaching this stage uses manager-submit (advances the workflow).
    // Any time after that uses manager-edit (updates in place, stage untouched).
    const endpoint = s.stage === 1 ? "manager-submit" : "manager-edit";
    const res = await fetch(`/api/submissions/${s.id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, draft }),
    });
    if (res.ok) {
      if (!draft && s.stage === 1) {
        router.push("/manager/success");
        return;
      }
      setToast(s.stage === 1 ? "✅ Manager remarks saved as draft." : "✅ Changes saved.");
      router.refresh();
    } else alert("Failed");
  }

  async function returnToHR(data: ManagerFormValues) {
    const res = await fetch(`/api/submissions/${s.id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) router.push("/manager");
    else alert("Failed");
  }

  return (
    <div className="space-y-6">
      <SuccessToast
        message={toast ?? ""}
        show={toast != null}
        onDismiss={() => setToast(null)}
      />
      <FormBrandHeader subtitle={`${s.employeeName} · ${s.employeeCode}`} compact />
      <div>
        <h2 className="text-xl font-semibold">{s.employeeName}</h2>
        <p className="text-muted-foreground">{s.employeeCode}</p>
      </div>
      <WorkflowBar currentStage={s.stage} />

      <ChainSection title="Section 1: Employee Form" accent="blue">
        <SubmissionDetailView submission={s} sections={["employee"]} />
      </ChainSection>

      <ChainSection title="Section 2: HR Form" accent="green">
        <HRFeedbackForm readOnly submission={s} />
      </ChainSection>

      <ChainSection title="Section 3: Manager Remarks Form" accent="amber">
        <ManagerRemarksForm
          managerName={managerName}
          employeeName={s.employeeName}
          employeeCode={s.employeeCode}
          currentSalary={currentSalary}
          slabs={slabs}
          defaultValues={{
            mgrRecommendation: s.mgrRecommendation as ManagerFormValues["mgrRecommendation"],
            mgrStrongReasons: s.mgrStrongReasons,
            mgrConditionalReasons: s.mgrConditionalReasons,
            mgrNotRecommendedReasons: s.mgrNotRecommendedReasons,
            mgrFeedback: s.mgrFeedback ?? undefined,
            mgrSuggestedIncrementPercentage: s.mgrSuggestedIncrementPercentage
              ? Number(s.mgrSuggestedIncrementPercentage)
              : undefined,
            mgrFinalApprovedIncrementPercentage: s.mgrFinalApprovedIncrementPercentage
              ? Number(s.mgrFinalApprovedIncrementPercentage)
              : undefined,
            // The rupee-amount boxes aren't stored in the database — only the resulting
            // percentage is. Reconstruct an equivalent amount from the saved percentage
            // so the boxes aren't blank when reopening an already-filled form.
            suggestedIncrementAmount: s.mgrSuggestedIncrementPercentage
              ? Math.round((Number(s.mgrSuggestedIncrementPercentage) / 100) * currentSalary)
              : undefined,
            incrementAmount: s.mgrFinalApprovedIncrementPercentage
              ? Math.round((Number(s.mgrFinalApprovedIncrementPercentage) / 100) * currentSalary)
              : undefined,
            mgrRemarks: s.mgrRemarks ?? undefined,
            mgrSignatureName: s.mgrSignatureName ?? undefined,
            ...Object.fromEntries(
              SELF_RATING_ITEMS.map((item) => [
                item.mgrKey,
                (s[item.mgrKey as keyof typeof s] as number | null) ?? undefined,
              ])
            ),
          }}
          readOnly={s.stage < 1}
          submission={s}
          onSaveDraft={s.stage >= 1 ? (d) => submit(d, true) : undefined}
          onSubmit={s.stage >= 1 ? (d) => submit(d, false) : undefined}
          onReturn={s.stage === 1 ? returnToHR : undefined}
        />
      </ChainSection>
    </div>
  );
}