"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { managerFormSchema, type ManagerFormValues } from "@/lib/validations/manager-form.schema";
import { RecommendationChecklist } from "@/components/forms/RecommendationChecklist";
import { ManagerSubmissionView } from "@/components/forms/SubmissionDetailView";
import { CTCSlabDisplay } from "@/components/forms/CTCSlabDisplay";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AppraisalSubmission } from "@prisma/client";
import type { SerializedIncrementSlab } from "@/lib/utils";
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";
import { getMaxIncrementPct } from "@/lib/workflow";
import { formatSalary } from "@/lib/submission-display";
import { useMemo } from "react";

interface ManagerRemarksFormProps {
  managerName?: string;
  employeeName?: string;
  employeeCode?: string;
  currentSalary?: number;
  slabs?: SerializedIncrementSlab[];
  defaultValues?: Partial<ManagerFormValues>;
  readOnly?: boolean;
  submission?: AppraisalSubmission;
  onSaveDraft?: (data: ManagerFormValues) => Promise<void>;
  onSubmit?: (data: ManagerFormValues) => Promise<void>;
  onReturn?: (data: ManagerFormValues) => Promise<void>;
}

export function ManagerRemarksForm({
  managerName,
  employeeName,
  employeeCode,
  currentSalary = 0,
  slabs = [],
  defaultValues,
  readOnly,
  submission,
  onSaveDraft,
  onSubmit,
  onReturn,
}: ManagerRemarksFormProps) {
  const methods = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      mgrStrongReasons: [],
      mgrConditionalReasons: [],
      mgrNotRecommendedReasons: [],
      ...defaultValues,
      mgrRecommendation: Array.isArray(defaultValues?.mgrRecommendation)
        ? defaultValues.mgrRecommendation
        : [],
      mgrSignatureName: defaultValues?.mgrSignatureName || managerName || "",
    },
  });

  const { register, handleSubmit, watch, setValue } = methods;

  // Calculate values for increment amount
  const currentMonthlySalary = currentSalary;
  const annualCtc = currentMonthlySalary * 12;
  const maxAllowed = getMaxIncrementPct(currentMonthlySalary, slabs);

  // Suggested Increment Amount - converts to percentage
  const suggestedIncrementAmount = watch("suggestedIncrementAmount") ?? 0;
  const calculatedSuggestedPct = useMemo(() => {
    if (!suggestedIncrementAmount || currentMonthlySalary <= 0) return 0;
    return (suggestedIncrementAmount / currentMonthlySalary) * 100;
  }, [suggestedIncrementAmount, currentMonthlySalary]);

  // Update mgrSuggestedIncrementPercentage when calculated percentage changes
  useMemo(() => {
    if (calculatedSuggestedPct > 0) {
      setValue("mgrSuggestedIncrementPercentage", parseFloat(calculatedSuggestedPct.toFixed(2)));
    }
  }, [calculatedSuggestedPct, setValue]);

  // Final Approved Increment Amount - converts to percentage
  const incrementAmount = watch("incrementAmount") ?? 0;
  const calculatedIncrementPct = useMemo(() => {
    if (!incrementAmount || currentMonthlySalary <= 0) return 0;
    return (incrementAmount / currentMonthlySalary) * 100;
  }, [incrementAmount, currentMonthlySalary]);

  const calculatedNewSalary = currentMonthlySalary + (incrementAmount || 0);

  // Update mgrFinalApprovedIncrementPercentage when calculated percentage changes
  useMemo(() => {
    if (calculatedIncrementPct > 0) {
      setValue("mgrFinalApprovedIncrementPercentage", parseFloat(calculatedIncrementPct.toFixed(2)));
    }
  }, [calculatedIncrementPct, setValue]);

  if (readOnly && submission) {
    return <ManagerSubmissionView submission={submission} />;
  }

  if (readOnly) {
    return submission ? <ManagerSubmissionView submission={submission} /> : null;
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <FormBrandHeader subtitle="Team Head Feedback" compact />

        {/* Current Salary Display */}
        {currentSalary > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: "#6b7a99", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  Current Monthly Salary
                </p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#1e2740" }}>
                  {formatSalary(currentSalary)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#6b7a99", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  Current Annual CTC
                </p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#1e2740" }}>
                  {formatSalary(annualCtc)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Increment Amount Section */}
        {currentSalary > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
            <Label>Suggested Increment Amount (₹)</Label>
            <Input
              type="number"
              step="1"
              className="mt-2"
              placeholder="Enter suggested raise amount (e.g. 3000)"
              {...register("suggestedIncrementAmount", { valueAsNumber: true })}
            />
            {suggestedIncrementAmount > 0 && (
              <div style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                background: "#e8f0fb",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#1a4b8c",
              }}>
                ≈ {calculatedSuggestedPct.toFixed(1)}% increment suggested
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Enter the suggested rupee amount. The system will calculate the percentage automatically.
            </p>
          </div>
        )}

        {/* Final Approved Increment Section */}
        {currentSalary > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
            <Label>Increment Amount (₹)</Label>
            <Input
              type="number"
              step="1"
              className="mt-2"
              placeholder="Enter raise amount (e.g. 5000)"
              {...register("incrementAmount", { valueAsNumber: true })}
            />
            {incrementAmount > 0 && (
              <div style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                background: "#e6f5ee",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#1a8c5a",
              }}>
                ✓ This equals approximately {calculatedIncrementPct.toFixed(1)}% increment — New salary: {formatSalary(calculatedNewSalary)}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Enter the raw rupee amount for the raise. The system will calculate the percentage automatically.
            </p>
          </div>
        )}

        {/* CTC Slab Reference Table */}
        {slabs.length > 0 && currentSalary > 0 && (
          <CTCSlabDisplay slabs={slabs} highlightCtc={currentSalary} maxAllowed={maxAllowed} />
        )}

        <div>
          <Label></Label>
          <p className="text-sm text-muted-foreground mb-3">

          </p>
          <RecommendationChecklist />
        </div>
        <div>
          <Label>Additional Remarks (If Return Back To HR)</Label><p className="mt-1 text-sm text-gray-500">
                 Please explain the reason for returning back this employee form to HR.
              </p>
          <Textarea className="mt-1" {...register("mgrRemarks")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Reviewed & Signed By Reporting Manager:</Label>
            <Input {...register("mgrSignatureName")} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} {...register("mgrSignatureDate")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {onSaveDraft && <Button type="button" variant="secondary" onClick={handleSubmit(onSaveDraft)}>Save Draft</Button>}
          {onReturn && <Button type="button" variant="outline" onClick={handleSubmit(onReturn)}>Return Back to HR</Button>}
          {onSubmit && (
            <Button type="button" variant="success" onClick={handleSubmit(onSubmit)}>
              Send to Management
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
