"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hrFormSchema, type HRFormValues } from "@/lib/validations/hr-form.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

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
  onSaveDraft?: (data: HRFormValues) => Promise<void>;
  onSubmit?: (data: HRFormValues) => Promise<void>;
}

export function HRFeedbackForm({ defaultValues, readOnly, onSaveDraft, onSubmit }: HRFeedbackFormProps) {
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

  if (readOnly) {
    const v = defaultValues ?? {};
    return (
      <div className="space-y-4 text-sm">
        {HR_RATINGS.map((r) => (
          <p key={r.name}><strong>{r.label}:</strong> {v[r.name] ?? "—"}/10</p>
        ))}
        <p><strong>Notes:</strong> {v.hrBacklogNotes ?? "—"}</p>
        <p><strong>Admin Signature:</strong> {v.hrAdminSignatureName ?? "—"}</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        {HR_RATINGS.map((item) => (
          <div key={item.name} className="rounded-lg border p-4">
            <Label>{item.label} /10</Label>
            <Controller
              name={item.name}
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-4 mt-2">
                  <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="flex-1" />
                  <Input type="number" min={0} max={10} className="w-16" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                </div>
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
