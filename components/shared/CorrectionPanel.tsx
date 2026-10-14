"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { correctionsEnabled, correctionLabel, type CorrectionSummary } from "@/lib/correction-config";

export interface CorrectionEventView {
  id: string; revision: number; action: string; actor: string; note: string | null;
  createdAt: string; createdAtLabel: string; previousAnswers: Record<string, unknown> | null;
}
const actions: Record<string, string> = {
  EMPLOYEE_SUBMITTED: "Employee submitted", RETURNED_TO_HR: "Manager returned to HR",
  EMPLOYEE_CORRECTION_REQUESTED: "HR requested employee correction", EMPLOYEE_RESUBMITTED: "Employee resubmitted",
  HR_SUBMITTED: "HR completed review", MANAGER_SUBMITTED: "Manager completed review", MANAGEMENT_APPROVED: "Management approved",
  HR_DRAFT_SAVED: "HR saved a draft", MANAGER_DRAFT_SAVED: "Manager saved a draft", MANAGEMENT_DRAFT_SAVED: "Management saved a draft",
  MANAGER_EDITED: "Manager updated review", MANAGEMENT_EDITED: "Management updated review", COMPLETED: "HR marked completed",
};
export function CorrectionPanel({ id, correction, events = [], role }: {
  id: string; correction?: CorrectionSummary | null; events?: CorrectionEventView[]; role: "hr" | "manager" | "management";
}) {
  const router = useRouter();
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!correctionsEnabled) return null;
  const active = correction && correction.status !== "NONE";
  async function openCorrection() {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/submissions/${id}/correction`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions, version: correction?.version ?? 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to open corrections.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3">
    {active && <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
      <h3 className="font-semibold">{correctionLabel(correction.status)}</h3>
      <p className="text-sm">Correction round {correction.revision}. This appraisal is still in progress.</p>
      <p className="whitespace-pre-wrap text-sm"><strong>Manager’s reason:</strong> {correction.reason}</p>
      {correction.instructions && <p className="whitespace-pre-wrap text-sm"><strong>Instructions for employee:</strong> {correction.instructions}</p>}
      {role === "hr" && correction.status === "RETURNED_TO_HR" && <div className="space-y-2">
        <label htmlFor="correction-instructions" className="text-sm font-medium">Explain what the employee should update</label>
        <Textarea id="correction-instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={2000} />
        <p className="text-sm">Opening corrections lets the employee edit their saved answers after face verification. Please notify them through your usual channel.</p>
        <Button disabled={busy || !instructions.trim()} onClick={openCorrection}>{busy ? "Opening…" : "Request employee correction"}</Button>
      </div>}
      {correction.status === "AWAITING_EMPLOYEE" && <p className="text-sm">HR review stays locked until the employee resubmits.</p>}
      {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    </section>}
    {events.length > 0 && <details className="rounded-lg border bg-white p-4" open={!!active}>
      <summary className="cursor-pointer font-medium">Appraisal history{correction?.revision ? ` · ${correction.revision} correction round(s)` : ""}</summary>
      <ol className="mt-3 space-y-3">
        {events.map((event) => <li key={event.id} className="border-l-2 pl-3 text-sm">
          <p className="font-medium">{actions[event.action] ?? "Appraisal updated"}</p>
          <p className="text-muted-foreground"><time dateTime={event.createdAt}>{event.createdAtLabel}</time> · {event.actor}</p>
          {event.note && <p className="whitespace-pre-wrap">{event.note}</p>}
          {event.previousAnswers && <details className="mt-1">
            <summary className="cursor-pointer">View previous employee answers</summary>
            <dl className="mt-2 space-y-2">{Object.entries(event.previousAnswers).filter(([key]) => key !== "managerId").map(([key, value]) => <div key={key}>
              <dt className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="whitespace-pre-wrap">{String(value)}</dd>
            </div>)}</dl>
          </details>}
        </li>)}
      </ol>
    </details>}
  </div>;
}
