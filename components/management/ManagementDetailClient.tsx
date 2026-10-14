"use client";

import { CorrectionPanel, type CorrectionEventView } from "@/components/shared/CorrectionPanel";
import { type CorrectionSummary } from "@/lib/correction-config";
import { useState } from "react";
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
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";
import { SuccessToast } from "@/components/shared/SuccessToast";

interface ManagementDetailClientProps {
  submission: AppraisalSubmission & { manager: Manager; correction?: CorrectionSummary | null };
  correctionEvents?: CorrectionEventView[];
  slabs: SerializedIncrementSlab[];
}

export function ManagementDetailClient({ submission: s, correctionEvents, slabs }: ManagementDetailClientProps) {
  const router = useRouter();
  const managementOpen = s.stage >= 2 && (!(s.correction?.revision) || s.stage === 2);
  const [toast, setToast] = useState<string | null>(null);

  async function submit(data: ManagementFormValues, draft = false) {
    const endpoint = s.stage === 2 ? "management-submit" : "management-edit";
    const res = await fetch(`/api/submissions/${s.id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, draft, version: s.correction?.version ?? 0 }),
    });
    if (res.ok) {
      if (!draft && s.stage === 2) {
        router.push("/management/success");
        return;
      }
      setToast(s.stage === 2 ? "✅ Management decision saved as draft." : "✅ Changes saved.");
      router.refresh();
    } else {
      try {
        const err = await res.json();
        const msg = typeof err.error === "string" ? err.error : "Management submission failed. Please check required fields.";
        alert(msg);
      } catch {
        alert("Management submission failed.");
      }
    }
  }

  const mgmtDefaults: Partial<ManagementFormValues> = {
    mgmtIncrementPercentage: decimalToNumber(s.mgmtIncrementPercentage),
    mgmtStatementPercentage: decimalToNumber(s.mgmtStatementPercentage),
    mgmtApproverName: s.mgmtApproverName ?? "Management",
    mgmtFinalRemarks: s.mgmtFinalRemarks ?? "",
    mgmtFeedbackToEmployee: s.mgmtFeedbackToEmployee ?? "",
    mgmtInternalNotes: s.mgmtInternalNotes ?? "",
  };

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
        <p className="text-muted-foreground">{s.employeeCode} · {s.manager.name}</p>
      </div>
      <WorkflowBar currentStage={s.stage} />
      <CorrectionPanel id={s.id} correction={s.correction} events={correctionEvents} role="management" />

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
          mgrSuggestedIncrementPercentage={s.mgrSuggestedIncrementPercentage ? Number(s.mgrSuggestedIncrementPercentage) : undefined}
          mgrFinalApprovedIncrementPercentage={s.mgrFinalApprovedIncrementPercentage ? Number(s.mgrFinalApprovedIncrementPercentage) : undefined}
          defaultValues={mgmtDefaults}
          readOnly={!managementOpen}
          onSaveDraft={managementOpen ? (d) => submit(d, true) : undefined}
          onSubmit={managementOpen ? (d) => submit(d, false) : undefined}
        />
      </ChainSection>
    </div>
  );
}