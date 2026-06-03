"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  managementFormSchema,
  type ManagementFormValues,
} from "@/lib/validations/management-form.schema";
import { CTCSlabDisplay } from "@/components/forms/CTCSlabDisplay";
import { SalaryBreakdownTable } from "@/components/forms/SalaryBreakdownTable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { IncrementSlab } from "@prisma/client";
import { getMaxIncrementPct } from "@/lib/workflow";
interface ManagementDecisionFormProps {
  slabs: IncrementSlab[];
  defaultValues?: Partial<ManagementFormValues>;
  readOnly?: boolean;
  onSaveDraft?: (data: ManagementFormValues) => Promise<void>;
  onSubmit?: (data: ManagementFormValues) => Promise<void>;
}

export function ManagementDecisionForm({
  slabs,
  defaultValues,
  readOnly,
  onSaveDraft,
  onSubmit,
}: ManagementDecisionFormProps) {
  const [ctcPresent, setCtcPresent] = useState(0);
  const maxAllowed = getMaxIncrementPct(ctcPresent, slabs);

  const methods = useForm<ManagementFormValues>({
    resolver: zodResolver(managementFormSchema),
    defaultValues: {
      salaryBasicPresent: 0,
      salaryDaPresent: 0,
      salaryHraPresent: 0,
      salaryCityAllowancePresent: 0,
      salaryConveyancePresent: 0,
      salaryMedicalPresent: 0,
      salaryEducationPresent: 0,
      salaryLtaPresent: 0,
      salarySpecialPresent: 0,
      salaryPfDeduction: 0,
      salaryEsicDeduction: 0,
      salaryPtDeduction: 0,
      salaryEmployerPfPresent: 0,
      salaryBonusPresent: 0,
      salaryEmployerEsicPresent: 0,
      salaryMedicalInsurancePresent: 0,
      salaryCityAllowanceProposed: 0,
      salarySpecialProposed: 0,
      mgmtIncrementPercentage: 0,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, watch, setError, clearErrors } = methods;
  const incrementPct = watch("mgmtIncrementPercentage");

  async function validateAndSubmit(handler?: (data: ManagementFormValues) => Promise<void>) {
    return handleSubmit(async (data) => {
      if (data.mgmtIncrementPercentage > maxAllowed) {
        setError("mgmtIncrementPercentage", {
          message: `Increment cannot exceed slab maximum of ${maxAllowed}%`,
        });
        return;
      }
      clearErrors("mgmtIncrementPercentage");
      await handler?.(data);
    })();
  }

  if (readOnly) {
    return (
      <div className="space-y-6">
        <CTCSlabDisplay slabs={slabs} />
        <SalaryBreakdownTable readOnly />
        <p className="text-sm"><strong>Increment:</strong> {defaultValues?.mgmtIncrementPercentage ?? "—"}%</p>
        <p className="text-sm"><strong>Final Remarks:</strong> {defaultValues?.mgmtFinalRemarks ?? "—"}</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-8">
        <CTCSlabDisplay slabs={slabs} highlightCtc={ctcPresent} maxAllowed={maxAllowed} />
        <SalaryBreakdownTable onTotalsChange={(t) => setCtcPresent(t.ctcPresent)} />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Increment Percentage %</Label>
            <Input
              type="number"
              step="0.01"
              {...register("mgmtIncrementPercentage", { valueAsNumber: true })}
            />
            {incrementPct > maxAllowed && (
              <p className="text-sm text-blanco-danger mt-1">
                Exceeds maximum allowed ({maxAllowed}%)
              </p>
            )}
          </div>
          <div>
            <Label>Effective Date *</Label>
            <Input type="date" {...register("mgmtEffectiveDate")} />
          </div>
          <div>
            <Label>Approver Signature (typed name) *</Label>
            <Input {...register("mgmtApproverName")} />
          </div>
          <div>
            <Label>Approval Date</Label>
            <Input value={new Date().toISOString().split("T")[0]} readOnly disabled className="bg-muted" />
          </div>
        </div>
        <div>
          <Label>Final Remarks *</Label>
          <Textarea className="mt-1" {...register("mgmtFinalRemarks")} />
        </div>
        <div>
          <Label>Feedback to Employee</Label>
          <Textarea className="mt-1" {...register("mgmtFeedbackToEmployee")} />
        </div>
        <div>
          <Label>Internal Management Notes</Label>
          <Textarea className="mt-1" {...register("mgmtInternalNotes")} />
        </div>
        <div className="flex gap-3">
          {onSaveDraft && (
            <Button type="button" variant="secondary" onClick={() => validateAndSubmit(onSaveDraft)}>
              Save Draft
            </Button>
          )}
          {onSubmit && (
            <Button type="button" variant="success" onClick={() => validateAndSubmit(onSubmit)}>
              Attach Decision and Send to HR for Finalization
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
