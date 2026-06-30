"use client";

import { useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  managementFormSchema,
  type ManagementFormValues,
} from "@/lib/validations/management-form.schema";
import { CTCSlabDisplay } from "@/components/forms/CTCSlabDisplay";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SerializedIncrementSlab } from "@/lib/utils";
import { getMaxIncrementPct } from "@/lib/workflow";
import { formatSalary } from "@/lib/submission-display";
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";

interface ManagementDecisionFormProps {
  slabs: SerializedIncrementSlab[];
  employeeName: string;
  currentSalary: number;
  defaultValues?: Partial<ManagementFormValues>;
  readOnly?: boolean;
  hideSalarySection?: boolean;
  onSaveDraft?: (data: ManagementFormValues) => Promise<void>;
  onSubmit?: (data: ManagementFormValues) => Promise<void>;
}

export function ManagementDecisionForm({
  slabs,
  employeeName,
  currentSalary,
  defaultValues,
  readOnly,
  hideSalarySection,
  onSaveDraft,
  onSubmit,
}: ManagementDecisionFormProps) {
  const LETTER_INTRO = `Dear ${employeeName},

We are happy to receive your appraisal request and the feedback from your team head. We will be evaluating everything, and your increment letter will be e-mailed to you soon. Kindly note that revised Increment criteria have been already e-mailed to your registered e-mail IDs with the company (also noted below) and the criteria will remain the same, but we will assure you as best as close to the percentage noted below but purely depends on your performance report card.`;

  const currentMonthlySalary = currentSalary;
  const annualCtc = currentMonthlySalary * 12;
  const maxAllowed = getMaxIncrementPct(currentMonthlySalary, slabs);

  const methods = useForm<ManagementFormValues>({
    resolver: zodResolver(managementFormSchema),
    defaultValues: {
      mgmtIncrementPercentage: 0,
      mgmtApproverName: defaultValues?.mgmtApproverName || "Management",
      mgmtFeedbackToEmployee: defaultValues?.mgmtFeedbackToEmployee,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, watch, setValue, getValues } = methods;
  const incrementPct = watch("mgmtIncrementPercentage") ?? 0;
  const feedbackValue = watch("mgmtFeedbackToEmployee");
  const newMonthlySalary = useMemo(
    () => Math.round(currentMonthlySalary * (1 + incrementPct / 100)),
    [currentMonthlySalary, incrementPct]
  );

  const TEMPLATE = `Including speeding up the work process. Effective work, Sharing the knowledge, supervising the team and assigned tasks, Improving English communication with co-workers, improving self-learning capabilities, improving leadership qualities, motivate juniors/coworkers/team and improve team-building activities apart from the individual performance, improving engineering knowledge and exploring to achieve more, as a responsible Drafting Engineer) and the management would be willing to give you the best of a ___% Increment of your current Total CTC.`;
  const generatedFeedback = TEMPLATE.replace('___%', `${incrementPct}%`);

  // Prefill editable statement on mount if not provided
  useEffect(() => {
    const existing = getValues("mgmtFeedbackToEmployee");
    if (!existing) {
      setValue("mgmtFeedbackToEmployee", TEMPLATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When feedback text changes, parse percentage and update mgmtIncrementPercentage
  const feedbackText = watch("mgmtFeedbackToEmployee");
  useEffect(() => {
    if (!feedbackText) return;
    const m = feedbackText.match(/(\d+(?:\.\d+)?)\s*%/);
    if (m) {
      const parsed = parseFloat(m[1]);
      if (!Number.isNaN(parsed) && parsed !== incrementPct) {
        setValue("mgmtIncrementPercentage", parsed, { shouldValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackText]);

  // When numeric percentage changes, replace placeholder or existing number in statement
  useEffect(() => {
    const fb = getValues("mgmtFeedbackToEmployee") || TEMPLATE;
    const pct = incrementPct ?? 0;
    let updated = fb;
    if (/(\d+(?:\.\d+)?)\s*%/.test(fb)) {
      updated = fb.replace(/(\d+(?:\.\d+)?)\s*%/, `${pct}%`);
    } else if (fb.includes("___%")) {
      updated = fb.replace("___%", `${pct}%`);
    }
    if (updated !== fb) setValue("mgmtFeedbackToEmployee", updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incrementPct]);

  async function validateAndSubmit(
    handler?: (data: ManagementFormValues) => Promise<void>
  ) {
    return handleSubmit(async (data) => {
      if (data.mgmtIncrementPercentage > maxAllowed) {
        alert(`Increment cannot exceed slab maximum of ${maxAllowed}%`);
        return;
      }
      if (!data.mgmtFeedbackToEmployee?.trim()) {
        data.mgmtFeedbackToEmployee = generatedFeedback;
      }
      await handler?.(data);
    })();
  }

  const content = (
    <div className="space-y-8">
      <FormBrandHeader subtitle="Management Worksheet & Final Conclusion" compact />
      {/* Letter intro */}
      <div style={{
        background: "#f8f9fc",
        border: "1px solid #e2e6ef",
        borderRadius: 10,
        padding: "16px 20px",
        fontSize: 13,
        lineHeight: 1.7,
        color: "#1e2740",
        whiteSpace: "pre-wrap",
      }}>
        {LETTER_INTRO}
      </div>

      {/* CTC Slab — compact */}
      <CTCSlabDisplay
        slabs={slabs}
        highlightCtc={currentMonthlySalary}
        maxAllowed={maxAllowed}
      />

      {!hideSalarySection && (
        <div style={{
          border: "1px solid #e2e6ef",
          borderRadius: 10,
          padding: "16px 20px",
          background: "#fff",
        }}>
          <p style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1a4b8c",
            marginBottom: 14,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Salary Section
          </p>

          {/* Current salary display */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}>
            <div>
              <p style={{ fontSize: 11, color: "#6b7a99", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Current Monthly Salary
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#1e2740" }}>
                {formatSalary(currentSalary)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#6b7a99", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Current Annual CTC
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#1e2740" }}>
                {formatSalary(annualCtc)}
              </p>
            </div>
          </div>

          {readOnly ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 13 }}>
                <strong>Increment:</strong> {incrementPct}%
              </p>
              <p style={{ fontSize: 13 }}>
                <strong>New Monthly Salary:</strong> {formatSalary(newMonthlySalary)}
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Increment Percentage (from statement)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{incrementPct}%</div>
                  <div style={{ color: '#6b7a99', fontSize: 12 }}>Maximum allowed: {maxAllowed}%</div>
                </div>
                {incrementPct > maxAllowed && (
                  <p style={{ color: "#c0392b", fontSize: 12, marginTop: 8 }}>
                    ⚠ {incrementPct}% exceeds maximum allowed ({maxAllowed}%)
                  </p>
                )}
                {incrementPct >= 0 && incrementPct <= maxAllowed && incrementPct > 0 && (
                  <div style={{
                    marginTop: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#e6f5ee",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1a8c5a",
                  }}>
                    ✓ {incrementPct}% — New salary: {formatSalary(newMonthlySalary)}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="mgmtFeedbackToEmployee">Management Statement for Review & PDF</Label>
                <Textarea
                  id="mgmtFeedbackToEmployee"
                  className="mt-1 min-h-[140px]"
                  {...register("mgmtFeedbackToEmployee")}
                  placeholder={generatedFeedback}
                />
                <p style={{ color: "#6b7a99", fontSize: 12, marginTop: 8 }}>
                  This message is auto-generated from the increment percentage and can be edited.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Letter conclusion */}
      <div style={{
        background: "#e8f0fb",
        border: "1px solid #c5d9f5",
        borderRadius: 10,
        padding: "14px 18px",
        fontSize: 14,
        color: "#1e2740",
        fontStyle: "italic",
      }}>
        Dear <strong style={{ fontStyle: "normal" }}>{employeeName}</strong>,
        You have been obtained{" "}
        <strong style={{ fontStyle: "normal", color: "#1a4b8c" }}>{incrementPct}%</strong>{" "}
        of Increment based on your report card.
      </div>

      {/* Remarks and signature */}
      {readOnly ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13 }}>
            <strong>Feedback / Remarks:</strong>{" "}
            {defaultValues?.mgmtFinalRemarks ?? "—"}
          </p>
          <p style={{ fontSize: 13 }}>
            <strong>Internal Notes:</strong>{" "}
            {defaultValues?.mgmtInternalNotes ?? "—"}
          </p>
          <p style={{ fontSize: 13 }}>
            <strong>Approver:</strong>{" "}
            {defaultValues?.mgmtApproverName ?? "—"}
          </p>
        </div>
      ) : (
        <>
          <div>
            <Label>Additional Feedback / Remarks to Employee *</Label>
            <Textarea
              className="mt-1 min-h-[120px]"
              placeholder="Write feedback, areas of improvement, or any specific message for the employee..."
              {...register("mgmtFinalRemarks")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Approved & Signed By Management:</Label>
              <Input {...register("mgmtApproverName")} />
            </div>
            <div>
              <Label>Approval Date</Label>
              <Input
                value={new Date().toISOString().split("T")[0]}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {onSaveDraft && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => validateAndSubmit(onSaveDraft)}
              >
                Save Draft
              </Button>
            )}
            {onSubmit && (
              <Button
                type="button"
                className="w-full"
                onClick={() => validateAndSubmit(onSubmit)}
              >
               Reviewed and Approved By Management
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (readOnly) return content;
  return <FormProvider {...methods}>{content}</FormProvider>;
}