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
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";

const HR_RATINGS = [
  { name: "hrCodeOfConduct" as const, label: "Rate this Employee - Adhere to Company Code of Conduct" },
  { name: "hrDressCode" as const, label: "Rate this Employee - Dress Code Management" },
  { name: "hrProfessionalism" as const, label: "Rate this Employee - Professionalism Attitude" },
  { name: "hrLeaveManagement" as const, label: "Rate this Employee -Leave Management" },
  { name: "hrTimingManagement" as const, label: "Rate this Employee -Timing Management" },
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

  const { register, handleSubmit, control, formState: { errors } } = methods;

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
        <FormBrandHeader subtitle="HR and Admin Feedback" compact />
        <div className="rounded-lg border p-4">
          <Label htmlFor="currentSalary">Employee Current Monthly Salary (₹) *</Label>
          <Input
            id="currentSalary"
            type="number"
            min={0}
            placeholder="Enter employee's current monthly salary"
            className="mt-1"
            {...register("currentSalary", { valueAsNumber: true })}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            This value is used to calculate increment amounts in the Management decision form.
          </p>
          {errors.currentSalary && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.currentSalary.message)}</p>
          )}
        </div>
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
          <Label>Please Specify If any backlog, Arrogancy, Damaging the company Property, Involving in any illegal activities 
          during the office premises, misleading other employees, etc. </Label>
          <Textarea className="mt-1" {...register("hrBacklogNotes")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Approved By *</Label>
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
