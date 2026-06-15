"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { managerFormSchema, type ManagerFormValues } from "@/lib/validations/manager-form.schema";
import { RecommendationChecklist } from "@/components/forms/RecommendationChecklist";
import { ManagerSubmissionView } from "@/components/forms/SubmissionDetailView";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AppraisalSubmission } from "@prisma/client";
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";

interface ManagerRemarksFormProps {
  managerName?: string;
  employeeName?: string;
  employeeCode?: string;
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

  const { register, handleSubmit } = methods;

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
        <div className="rounded-lg border border-slate-200 bg-[#f8f9fc] p-4 mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Employee Name</p>
            <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">{employeeName ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Employee Code</p>
            <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">{employeeCode ?? "—"}</p>
          </div>
        </div>
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
