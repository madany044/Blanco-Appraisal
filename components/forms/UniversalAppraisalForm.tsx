"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormHeader } from "@/components/shared/FormHeader";
import { SelfRatingGrid } from "@/components/forms/SelfRatingGrid";
import { ProductivitySection } from "@/components/forms/ProductivitySection";
import { ModelerSection } from "@/components/forms/ModelerSection";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "@/lib/validations/employee-form.schema";
import { OVERALL_RATINGS, ABROAD_OPTIONS, type AppraisalCategory } from "@/lib/types";
import type { Manager } from "@prisma/client";

const RATINGS_PART1 = [
  { name: "rateTeamwork", label: "a. Teamwork and Collaboration" },
  { name: "rateCompanyRelationship", label: "b. Relationship with the company" },
  { name: "ratePmRelationship", label: "c. Working Relationship with your PM" },
  { name: "rateCoworkerComms", label: "d. Communication with Co-worker" },
  { name: "rateEngineering", label: "e. Engineering knowledge" },
  { name: "rateTeamCommunication", label: "f. Ability to effectively communicate with team members and superiors" },
  { name: "rateVerbalWritten", label: "g. Clarity on verbal and written communication" },
  { name: "rateEnglish", label: "h. English communication during office premises" },
  { name: "rateSelfLearning", label: "i. Self-learning abilities" },
  { name: "rateQualityOfWork", label: "j. Quality of work and execution" },
];

const RATINGS_PART2 = [
  { name: "rateDeadlines", label: "k. Meeting deadlines and completing tasks on time" },
  { name: "rateClientComms", label: "l. Communicating with Client" },
  { name: "rateCustomerEmails", label: "m. Understanding customer e-mails (without help)" },
  { name: "rateRfiCreation", label: "n. Creating RFIs (without help)" },
  { name: "rateEmailWriting", label: "o. Writing back e-mail to customer (without help)" },
  { name: "rateIssueResolution", label: "p. Resolving issues without help of anyone" },
  { name: "rateKnowledgeSharing", label: "q. Sharing knowledge and conducting classes to Juniors" },
  { name: "rateLeadership", label: "r. Professional Leadership quality during office premises" },
  { name: "rateTeamPerformance", label: "s. Your Team performance" },
  { name: "rateTeamBuilding", label: "t. Team build abilities" },
];

interface UniversalAppraisalFormProps {
  category: AppraisalCategory;
  managers: Manager[];
}

export function UniversalAppraisalForm({ category, managers }: UniversalAppraisalFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const showAbroad = category === "GROUP_B" || category === "GROUP_C";

  const methods = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      abroadCapabilityNa: !showAbroad,
      modelerSectionNa: category === "GROUP_B" || category === "GROUP_C",
    },
    mode: "onBlur",
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = methods;
  const employeeCode = watch("employeeCode");

  async function saveSubmission(data: Partial<EmployeeFormValues>, isDraft: boolean) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          category,
          stage: isDraft ? -1 : 0,
          abroadCapabilityNa: !showAbroad,
          modelerSectionNa: category === "GROUP_B" || category === "GROUP_C",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Submission failed");
      }
      if (!isDraft) router.push("/employee/success");
      else alert("Draft saved successfully");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDraft() {
    const data = methods.getValues();
    await saveSubmission(data, true);
  }

  async function onSubmit(data: EmployeeFormValues) {
    await saveSubmission(data, false);
  }

  async function nextStep() {
    const fieldsByStep: Record<number, (keyof EmployeeFormValues)[]> = {
      1: ["employeeName", "employeeCode", "managerId", "currentSalary", "basisOfAppraisal", "supportToCompany"],
      2: ["expectationsYesNo", "expectationsReason", "strengthsWeaknesses"],
      3: ["upcomingGoal", "initiativeFrequency"],
      4: ["learningCommitment"],
      9: ["currentYearPerformance"],
      10: ["productivityImprovement", "overallRating", "employeeSignatureName"],
    };
    const fields = fieldsByStep[step];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 10));
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        <div className="sticky top-0 z-10 bg-white py-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blanco-primary">Step {step} of 10</span>
            <Badge>{category.replace("_", " ")}</Badge>
          </div>
          <Progress value={step * 10} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <FormHeader managers={managers} />
            <div>
              <Label>1. Basis of appraisal request *</Label>
              <Textarea className="min-h-[120px] mt-1" {...register("basisOfAppraisal")} />
              {errors.basisOfAppraisal && <p className="text-sm text-blanco-danger">{String(errors.basisOfAppraisal.message)}</p>}
            </div>
            <div>
              <Label>2. Support to the company *</Label>
              <Textarea className="min-h-[120px] mt-1" {...register("supportToCompany")} />
              {errors.supportToCompany && <p className="text-sm text-blanco-danger">{String(errors.supportToCompany.message)}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>3. Expectations — Are your expectations met? *</Label>
              <RadioGroup
                value={watch("expectationsYesNo")}
                onValueChange={(v) => setValue("expectationsYesNo", v as "YES" | "NO")}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center gap-2"><RadioGroupItem value="YES" id="yes" /><Label htmlFor="yes">YES</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="NO" id="no" /><Label htmlFor="no">NO</Label></div>
              </RadioGroup>
              <Label className="mt-4 block">Reason *</Label>
              <Textarea className="mt-1" {...register("expectationsReason")} />
            </div>
            <div>
              <Label>4. Improvement in yourself — Strengths and weaknesses *</Label>
              <Textarea className="min-h-[100px] mt-1" {...register("strengthsWeaknesses")} />
            </div>
            <div>
              <Label>5. Teamwork examples</Label>
              <Textarea className="min-h-[100px] mt-1" {...register("teamworkExamples")} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div><Label>6a. Goal challenges</Label><Textarea className="mt-1" {...register("goalChallenges")} /></div>
            <div><Label>6b. Upcoming year goal *</Label><Textarea className="mt-1" {...register("upcomingGoal")} /></div>
            <div><Label>6c. Three things to improve</Label><Textarea className="mt-1" {...register("threeImprovements")} /></div>
            <div>
              <Label>6d. Initiative frequency *</Label>
              <RadioGroup value={watch("initiativeFrequency")} onValueChange={(v) => setValue("initiativeFrequency", v as EmployeeFormValues["initiativeFrequency"])} className="mt-2 space-y-2">
                {(["Consistently", "Occasionally", "Rarely", "Never"] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={opt} /><Label htmlFor={opt}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>6e. Abroad capability</Label>
              {showAbroad ? (
                <RadioGroup value={watch("abroadCapability")} onValueChange={(v) => setValue("abroadCapability", v)} className="mt-2 space-y-2">
                  {ABROAD_OPTIONS.map((opt, i) => (
                    <div key={opt} className="flex items-start gap-2">
                      <RadioGroupItem value={opt} id={`abroad-${i}`} />
                      <Label htmlFor={`abroad-${i}`} className="font-normal">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="mt-2 rounded-lg border border-dashed p-4 text-center">
                  <Badge variant="outline">N/A</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Not applicable for your category</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div><Label>7. Initiative or innovation examples</Label><Textarea className="mt-1" {...register("initiativeInnovation")} /></div>
            <div>
              <Label>8. Learning commitment *</Label>
              <RadioGroup value={watch("learningCommitment")} onValueChange={(v) => setValue("learningCommitment", v as EmployeeFormValues["learningCommitment"])} className="mt-2 space-y-2">
                {[
                  { v: "A", l: "A — Highly committed" },
                  { v: "B", l: "B — Moderately committed" },
                  { v: "C", l: "C — Somewhat committed" },
                  { v: "D", l: "D — Minimally committed" },
                  { v: "E", l: "E — Not at all committed" },
                ].map(({ v, l }) => (
                  <div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`lc-${v}`} /><Label htmlFor={`lc-${v}`}>{l}</Label></div>
                ))}
              </RadioGroup>
            </div>
            <div><Label>9. Professionalism and attitude</Label><Textarea className="mt-1" {...register("professionalismAttitude")} /></div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Self Ratings — Part 1 (a to j)</h3>
            <SelfRatingGrid items={RATINGS_PART1} />
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Self Ratings — Part 2 (k to t)</h3>
            <SelfRatingGrid items={RATINGS_PART2} />
          </div>
        )}

        {step === 7 && <ProductivitySection />}
        {step === 8 && <ModelerSection category={category} />}
        {step === 9 && (
          <div>
            <Label>10. Work performance and Time Management *</Label>
            <Textarea className="min-h-[150px] mt-1" {...register("currentYearPerformance")} />
          </div>
        )}

        {step === 10 && (
          <div className="space-y-6">
            <div>
              <Label>11. Productivity improvement description *</Label>
              <Textarea className="min-h-[120px] mt-1" {...register("productivityImprovement")} />
            </div>
            <div>
              <Label>Overall Performance Rating *</Label>
              <RadioGroup value={watch("overallRating")} onValueChange={(v) => setValue("overallRating", v)} className="mt-2 space-y-3">
                {OVERALL_RATINGS.map((opt, i) => (
                  <div key={opt} className="flex items-start gap-2">
                    <RadioGroupItem value={opt} id={`rating-${i}`} />
                    <Label htmlFor={`rating-${i}`} className="font-normal leading-snug">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Employee Signature (typed name) *</Label>
                <Input {...register("employeeSignatureName")} />
              </div>
              <div>
                <Label>Employee Code</Label>
                <Input value={employeeCode ?? ""} readOnly disabled className="bg-muted" />
              </div>
              <div>
                <Label>Date</Label>
                <Input value={new Date().toISOString().split("T")[0]} readOnly disabled className="bg-muted" />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button type="button" variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
            Previous
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onDraft} disabled={submitting}>
              Save Draft
            </Button>
            {step < 10 ? (
              <Button type="button" onClick={nextStep}>Next</Button>
            ) : (
              <Button type="submit" variant="success" disabled={submitting}>
                Submit to HR
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
