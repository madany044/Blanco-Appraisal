"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hrFormSchema, type HRFormValues } from "@/lib/validations/hr-form.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RatingPillInput, RatingPillReadOnly } from "@/components/forms/RatingPillInput";
import { HRSubmissionView } from "@/components/forms/SubmissionDetailView";
import type { AppraisalSubmission } from "@prisma/client";

const HR_RATINGS = [
  { name: "hrCodeOfConduct" as const, label: "Adhere to Company Code of Conduct" },
  { name: "hrDressCode" as const, label: "Dress Code Management" },
  { name: "hrProfessionalism" as const, label: "Professionalism Attitude" },
  { name: "hrLeaveManagement" as const, label: "Leave Management" },
  { name: "hrTimingManagement" as const, label: "Timing Management" },
];

interface HRFeedbackFormProps {
  defaultValues?: Partial<HRFormValues>;
  readOnly?: boolean;
  submission?: AppraisalSubmission;
  onSaveDraft?: (data: HRFormValues) => Promise<void>;
  onSubmit?: (data: HRFormValues) => Promise<void>;
}

export function HRFeedbackForm({
  defaultValues,
  readOnly,
  submission,
  onSaveDraft,
  onSubmit,
}: HRFeedbackFormProps) {
  const methods = useForm<HRFormValues>({
    resolver: zodResolver(hrFormSchema),
    defaultValues: {
      hrCodeOfConduct: 5,
      hrDressCode: 5,
      hrProfessionalism: 5,
      hrLeaveManagement: 5,
      hrTimingManagement: 5,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, control } = methods;

  if (readOnly && submission) {
    return <HRSubmissionView submission={submission} />;
  }

  if (readOnly) {
    const v = defaultValues ?? {};
    return (
      <div className="space-y-4">
        {HR_RATINGS.map((r) => (
          <div key={r.name}>
            <p className="mb-2 text-sm font-medium">{r.label}</p>
            <RatingPillReadOnly value={v[r.name]} />
          </div>
        ))}
        <p className="text-sm"><strong>Notes:</strong> {v.hrBacklogNotes ?? "—"}</p>
        <p className="text-sm"><strong>Admin Signature:</strong> {v.hrAdminSignatureName ?? "—"}</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        {HR_RATINGS.map((item) => (
          <div key={item.name} className="rounded-lg border p-4">
            <Controller
              name={item.name}
              control={control}
              render={({ field }) => (
                <RatingPillInput
                  label={`${item.label} /10`}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        ))}
        <div>
          <Label>Notes: backlog, arrogancy, disciplinary issues</Label>
          <Textarea className="mt-1" {...register("hrBacklogNotes")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Admin Head Signature (typed name) *</Label>
            <Input {...register("hrAdminSignatureName")} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} {...register("hrAdminSignatureDate")} />
          </div>
        </div>
        <div className="flex gap-3">
          {onSaveDraft && (
            <Button type="button" variant="secondary" onClick={handleSubmit(onSaveDraft)}>Save Draft</Button>
          )}
          {onSubmit && (
            <Button type="button" variant="success" onClick={handleSubmit(onSubmit)}>
              Submit HR Review and Send to Manager
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
