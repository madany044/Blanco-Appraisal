"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { managerFormSchema, type ManagerFormValues } from "@/lib/validations/manager-form.schema";
import { RecommendationChecklist } from "@/components/forms/RecommendationChecklist";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface ManagerRemarksFormProps {
  defaultValues?: Partial<ManagerFormValues>;
  readOnly?: boolean;
  onSaveDraft?: (data: ManagerFormValues) => Promise<void>;
  onSubmit?: (data: ManagerFormValues) => Promise<void>;
  onReturn?: (data: ManagerFormValues) => Promise<void>;
}

export function ManagerRemarksForm({
  defaultValues,
  readOnly,
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
    },
  });

  const { register, handleSubmit, watch, setValue } = methods;
  const recommendation = watch("mgrRecommendation");

  if (readOnly) {
    const v = defaultValues ?? {};
    const label =
      v.mgrRecommendation === "STRONGLY_RECOMMEND"
        ? "I Strongly recommend this employee"
        : v.mgrRecommendation === "CONDITIONALLY_RECOMMEND"
          ? "I May recommend this employee"
          : v.mgrRecommendation === "NOT_RECOMMENDED"
            ? "I May OR May Not recommend this employee"
            : "—";
    return (
      <div className="space-y-4 text-sm">
        <p><strong>Recommendation:</strong> {label}</p>
        <p><strong>Remarks:</strong> {v.mgrRemarks ?? "—"}</p>
        <p><strong>Signature:</strong> {v.mgrSignatureName ?? "—"}</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <div>
          <Label>Recommendation level *</Label>
          <RadioGroup
            value={recommendation}
            onValueChange={(v) =>
              setValue("mgrRecommendation", v as ManagerFormValues["mgrRecommendation"])
            }
            className="mt-2 space-y-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="STRONGLY_RECOMMEND" id="strong" />
              <Label htmlFor="strong">I Strongly recommend this employee</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="CONDITIONALLY_RECOMMEND" id="conditional" />
              <Label htmlFor="conditional">I May recommend this employee</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="NOT_RECOMMENDED" id="not" />
              <Label htmlFor="not">I May OR May Not recommend this employee</Label>
            </div>
          </RadioGroup>
        </div>
        {recommendation && <RecommendationChecklist recommendation={recommendation} />}
        <div>
          <Label>Additional Remarks</Label>
          <Textarea className="mt-1" {...register("mgrRemarks")} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Team Head Signature (typed name) *</Label>
            <Input {...register("mgrSignatureName")} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} {...register("mgrSignatureDate")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {onSaveDraft && <Button type="button" variant="secondary" onClick={handleSubmit(onSaveDraft)}>Save Draft</Button>}
          {onReturn && <Button type="button" variant="outline" onClick={handleSubmit(onReturn)}>Return to HR</Button>}
          {onSubmit && (
            <Button type="button" variant="success" onClick={handleSubmit(onSubmit)}>
              Attach Remarks and Send to Management
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
