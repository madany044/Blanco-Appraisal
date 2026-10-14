"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReturnCorrectionButton({ id, version }: { id: string; version: number }) {
  const router = useRouter();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function returnForm() {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/submissions/${id}/return`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason, version }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to return appraisal.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="rounded-lg border bg-white p-4 space-y-3">
    {!open ? <Button type="button" variant="outline" onClick={() => setOpen(true)}>Return to HR for correction</Button> : <>
      <label htmlFor={reasonId} className="font-medium">Why does this appraisal need correction?</label>
      <Textarea id={reasonId} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} />
      <p className="text-sm text-muted-foreground">HR will review your reason and open the employee’s existing form. Saved review entries will be retained. Save any unsaved manager edits as a draft first.</p>
      <div className="flex gap-2"><Button type="button" disabled={busy || !reason.trim()} onClick={returnForm}>{busy ? "Returning…" : "Confirm return to HR"}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button></div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </>}
  </section>;
}
