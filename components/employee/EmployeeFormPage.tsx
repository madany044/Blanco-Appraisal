"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UniversalAppraisalForm } from "@/components/forms/UniversalAppraisalForm";
import { FaceLoginGate } from "@/components/employee/FaceLoginGate";
import { categoryLabel } from "@/lib/utils";
import { correctionsEnabled } from "@/lib/correction-config";
import type { EmployeeFormValues } from "@/lib/validations/employee-form.schema";
import type { AppraisalCategory } from "@/lib/types";
import type { Manager } from "@prisma/client";

interface EmployeeFormPageProps {
  category: AppraisalCategory;
  title: string;
}

export function EmployeeFormPage({ category, title }: EmployeeFormPageProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [appraisal, setAppraisal] = useState<{ mode: string; id?: string; version?: number; revision?: number; category?: AppraisalCategory; answers?: Partial<EmployeeFormValues>; instructions?: string } | null>(null);
  const [lookupError, setLookupError] = useState("");
  useEffect(() => {
    if (!verifiedCode || !correctionsEnabled) return;
    let active = true;
    fetch("/api/employee-appraisal", { cache: "no-store" }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to load appraisal.");
      if (active) setAppraisal(data);
    }).catch((error) => { if (active) setLookupError(error.message); });
    return () => { active = false; };
  }, [verifiedCode]);

  useEffect(() => {
    fetch("/api/managers")
      .then((r) => r.json())
      .then((data) => {
        setManagers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/employee" className="inline-flex items-center text-sm text-blanco-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Change category
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading form...</p>
      ) : !verifiedCode ? (
        <FaceLoginGate onVerified={setVerifiedCode} />
      ) : correctionsEnabled && lookupError ? (
        <div role="alert" className="max-w-xl mx-auto rounded-lg border bg-white p-6">{lookupError} <button className="underline" onClick={() => { setLookupError(""); setVerifiedCode(null); }}>Verify again</button></div>
      ) : correctionsEnabled && !appraisal ? (
        <p className="text-center">Checking your existing appraisal…</p>
      ) : correctionsEnabled && appraisal?.mode === "submitted" ? (
        <div className="max-w-xl mx-auto rounded-lg border bg-white p-6"><h2 className="font-semibold">Your appraisal has already been submitted</h2><p className="mt-2">There is no employee correction open at the moment. HR will notify you if changes are needed.</p></div>
      ) : (
        <UniversalAppraisalForm
          category={appraisal?.category ?? category}
          existingAppraisal={appraisal?.mode === "correction" ? { id: appraisal.id!, version: appraisal.version!, revision: appraisal.revision!, instructions: appraisal.instructions ?? "", answers: appraisal.answers ?? {} } : undefined}
          managers={managers}
          brandSubtitle={appraisal?.mode === "correction" && appraisal.category ? `${categoryLabel(appraisal.category)} · Appraisal correction` : title}
          verifiedEmployeeCode={verifiedCode}
        />
      )}
    </div>
  );
}