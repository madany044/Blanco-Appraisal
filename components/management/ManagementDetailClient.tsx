"use client";

import { useRouter } from "next/navigation";
import { WorkflowBar } from "@/components/shared/WorkflowBar";
import { ChainSection } from "@/components/shared/ChainSection";
import { SubmissionDetailView } from "@/components/forms/SubmissionDetailView";
import { HRFeedbackForm } from "@/components/forms/HRFeedbackForm";
import { ManagerRemarksForm } from "@/components/forms/ManagerRemarksForm";
import { ManagementDecisionForm } from "@/components/forms/ManagementDecisionForm";
import type { ManagementFormValues } from "@/lib/validations/management-form.schema";
import type { AppraisalSubmission, Manager } from "@prisma/client";
import { decimalToNumber, type SerializedIncrementSlab } from "@/lib/utils";

interface ManagementDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager };
  slabs: SerializedIncrementSlab[];
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
        <HRFeedbackForm readOnly submission={s} />
      </ChainSection>

      <ChainSection title="Section 3: Manager Form" accent="amber">
        <ManagerRemarksForm submission={s} readOnly />
      </ChainSection>

      <ChainSection title="Section 4: Management Decision Form" accent="purple">
        <ManagementDecisionForm
          slabs={slabs}
          employeeName={s.employeeName}
          currentSalary={s.currentSalary ?? 0}
          defaultValues={mgmtDefaults}
          readOnly={s.stage !== 2}
          onSaveDraft={s.stage === 2 ? (d) => submit(d, true) : undefined}
          onSubmit={s.stage === 2 ? (d) => submit(d, false) : undefined}
        />
      </ChainSection>
    </div>
  );
}
