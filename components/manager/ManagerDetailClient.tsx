"use client";

import { useRouter } from "next/navigation";
import { WorkflowBar } from "@/components/shared/WorkflowBar";
import { ChainSection } from "@/components/shared/ChainSection";
import { SubmissionDetailView } from "@/components/forms/SubmissionDetailView";
import { HRFeedbackForm } from "@/components/forms/HRFeedbackForm";
import { ManagerRemarksForm } from "@/components/forms/ManagerRemarksForm";
import type { ManagerFormValues } from "@/lib/validations/manager-form.schema";
import type { AppraisalSubmission, Manager } from "@prisma/client";
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";

interface ManagerDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager };
}

export function ManagerDetailClient({ submission: s }: ManagerDetailClientProps) {
  const router = useRouter();

  async function submit(data: ManagerFormValues, draft = false) {
    const res = await fetch(`/api/submissions/${s.id}/manager-submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, draft }),
    });
    if (res.ok) router.refresh();
    else alert("Failed");
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
          defaultValues={{
            mgrRecommendation: s.mgrRecommendation as ManagerFormValues["mgrRecommendation"],
            mgrStrongReasons: s.mgrStrongReasons,
            mgrConditionalReasons: s.mgrConditionalReasons,
            mgrNotRecommendedReasons: s.mgrNotRecommendedReasons,
            mgrRemarks: s.mgrRemarks ?? undefined,
            mgrSignatureName: s.mgrSignatureName ?? undefined,
          }}
          readOnly={s.stage !== 1}
          submission={s.stage !== 1 ? s : undefined}
          onSaveDraft={s.stage === 1 ? (d) => submit(d, true) : undefined}
          onSubmit={s.stage === 1 ? (d) => submit(d, false) : undefined}
          onReturn={s.stage === 1 ? returnToHR : undefined}
        />
      </ChainSection>
    </div>
  );
}
