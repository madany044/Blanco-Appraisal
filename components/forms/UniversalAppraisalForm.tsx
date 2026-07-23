"use client";

import { useEffect, useState } from "react";
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
import { FormBrandHeader } from "@/components/shared/FormBrandHeader";
import { CameraCapture } from "@/components/forms/CameraCapture";
import { DisableCopyPaste } from "@/components/shared/DisableCopyPaste";
import { createClient } from "@/lib/supabase/client";

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

const ALL_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const QC_PRODUCTIVITY_NULLS = {
  prodSimpleBeam: null,
  prodMediumBeam: null,
  prodComplexBeam: null,
  prodStair: null,
  prodStairRail: null,
  prodRoofFrame: null,
  prodSimpleLadder: null,
  prodCagedLadder: null,
  prodLoosePieces: null,
  prodSinglePart: null,
  prodCheckAbHours: null,
  prodCheckEplanHours: null,
  prodDraftAbHours: null,
  prodDraftEplanHours: null,
  prodDraftCagedLadder: null,
  prodDraftStairs: null,
  prodModSimpleConnection: null,
  prodModDirectWeld: null,
  prodModMomentPlate: null,
  prodModWeldedTube: null,
  prodModBoltedBrace: null,
  prodModStairsHours: null,
  prodModRfiTime: null,
  prodModMemberPlacingHours: null,
  modelerSectionNa: true,
};

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
  brandSubtitle?: string;
}

export function UniversalAppraisalForm({ category, managers, brandSubtitle }: UniversalAppraisalFormProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [verificationPhoto, setVerificationPhoto] = useState<string | null>(null);
  const router = useRouter();
  
  const showAbroad = category === "GROUP_B" || category === "GROUP_C";
  const isQC = category === "QC";
  const visibleSteps = isQC ? ALL_STEPS.filter((s) => s !== 7 && s !== 8) : [...ALL_STEPS];
  const displayStep = visibleSteps.indexOf(step as (typeof ALL_STEPS)[number]) + 1;
  const totalSteps = visibleSteps.length;
  const lastStep = visibleSteps[visibleSteps.length - 1];

  const methods = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      abroadCapabilityNa: !showAbroad,
      modelerSectionNa: category === "GROUP_B" || category === "GROUP_C" || isQC,
    },
    mode: "onBlur",
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = methods;
  const employeeCode = watch("employeeCode");
  const employeeName = watch("employeeName");
  const employeeSignatureName = watch("employeeSignatureName");

  useEffect(() => {
    const trimmedName = employeeName?.trim();
    if (!trimmedName) return;

    const expectedSignature = trimmedName.toUpperCase();
    if (employeeSignatureName?.trim() !== expectedSignature) {
      setValue("employeeSignatureName", expectedSignature, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [employeeName, employeeSignatureName, setValue]);

  async function uploadVerificationPhoto(dataUrl: string, employeeCode: string): Promise<string | null> {
    try {
      const supabase = createClient();
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `${employeeCode || "unknown"}_${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("verification-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (error) {
        console.error("Photo upload failed:", error);
        return null;
      }

      const { data } = supabase.storage.from("verification-photos").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      console.error("Photo upload error:", e);
      return null;
    }
  }

  async function saveSubmission(data: Partial<EmployeeFormValues>, isDraft: boolean) {
    setSubmitting(true);
    try {
      let verificationPhotoUrl: string | null = null;
      if (!isDraft && verificationPhoto) {
        verificationPhotoUrl = await uploadVerificationPhoto(verificationPhoto, data.employeeCode ?? "unknown");
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...(isQC ? QC_PRODUCTIVITY_NULLS : {}),
          category,
          stage: isDraft ? -1 : 0,
          abroadCapabilityNa: !showAbroad,
          modelerSectionNa: isQC ? true : category === "GROUP_B" || category === "GROUP_C",
          ...(verificationPhotoUrl ? { verificationPhotoUrl } : {}),
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
    if (step === 1 && !verificationPhoto) {
      alert("Please capture your verification photo before proceeding.");
      return;
    }

    const fieldsByStep: Record<number, (keyof EmployeeFormValues)[]> = isQC
      ? {
          1: ["employeeName", "employeeCode", "managerId", "basisOfAppraisal", "supportToCompany"],
          2: ["expectationsYesNo", "expectationsReason", "strengthsWeaknesses"],
          3: ["upcomingGoal", "initiativeFrequency"],
          4: ["learningCommitment"],
          9: ["currentYearPerformance"],
          10: ["productivityImprovement", "overallRating", "employeeSignatureName"],
        }
      : {
          1: ["employeeName", "employeeCode", "managerId", "basisOfAppraisal", "supportToCompany"],
          2: ["expectationsYesNo", "expectationsReason", "strengthsWeaknesses"],
          3: ["upcomingGoal", "initiativeFrequency"],
          4: ["learningCommitment"],
          7: ["currentYearPerformance"],
          10: ["productivityImprovement", "overallRating", "employeeSignatureName"],
        };

    const fields = fieldsByStep[step];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }

    const currentIdx = visibleSteps.indexOf(step as (typeof ALL_STEPS)[number]);
    if (currentIdx < visibleSteps.length - 1) {
      setStep(visibleSteps[currentIdx + 1]);
    }
  }

  function prevStep() {
    const currentIdx = visibleSteps.indexOf(step as (typeof ALL_STEPS)[number]);
    if (currentIdx > 0) {
      setStep(visibleSteps[currentIdx - 1]);
    }
  }

  return (
    <FormProvider {...methods}>
      <DisableCopyPaste />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
        <FormBrandHeader compact subtitle={brandSubtitle} />
        <CameraCapture onCapture={setVerificationPhoto} />
        
        <div className="sticky top-0 z-10 bg-white py-4 border-b shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blanco-primary">Step {displayStep} of {totalSteps}</span>
            <Badge>{category.replace("_", " ")}</Badge>
          </div>
          <Progress value={(displayStep / totalSteps) * 100} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <FormHeader managers={managers} />
            <div>
              <Label>1. Basis of appraisal request *</Label>
              <p className="mt-1 text-sm text-gray-500">
                Please describe on what basis we should consider your salary appraisal request.
              </p>
              <Textarea className="min-h-[120px] mt-1" {...register("basisOfAppraisal")} />
              {errors.basisOfAppraisal && <p className="text-sm text-blanco-danger">{String(errors.basisOfAppraisal.message)}</p>}
            </div>
            <div>
              <Label>2. Support to the company *</Label>
              <p className="mt-1 text-sm text-gray-500">
                Please describe how would you support the company to grow and generate more income as similar as your salary appraisal:
              </p>
              <Textarea className="min-h-[120px] mt-1" {...register("supportToCompany")} />
              {errors.supportToCompany && <p className="text-sm text-blanco-danger">{String(errors.supportToCompany.message)}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>3. Expectations *</Label>
              <p className="mt-1 text-sm text-gray-500">
                Do you think you can expect the same amount of appraisal from year to year as your salary grows?
                <br />
                <br />
                (Tell us "YES" or "NO" and describe the reason accordingly.)
              </p>
              <RadioGroup
                value={watch("expectationsYesNo")}
                onValueChange={(v) => setValue("expectationsYesNo", v as "YES" | "NO")}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="YES" id="yes" />
                  <Label htmlFor="yes">YES</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="NO" id="no" />
                  <Label htmlFor="no">NO</Label>
                </div>
              </RadioGroup>
              <Label className="mt-4 block">Describe the Reason *</Label>
              <Textarea className="mt-1" {...register("expectationsReason")} />
            </div>
            <div>
              <Label>4. Improvement in yourself *</Label>
              <p className="mt-1 text-sm text-gray-500">
                Please describe your strengths and weaknesses and explain what improvements
                you have made in yourself compared to the previous year.
              </p>
              <Textarea className="min-h-[100px] mt-1" {...register("strengthsWeaknesses")} />
            </div>
            <div>
              <Label>5. Provide examples of instances where you demonstrated strong teamwork *</Label>
              <Textarea className="min-h-[100px] mt-1" {...register("teamworkExamples")} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label>6. Achievements, Goal & Opportunities *</Label>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              a. If achieved, what are the challenges did you face in achieving your goals, and how did you overcome them?
            </p>
            <Textarea className="mt-2" {...register("goalChallenges")} />

            <p className="mt-4 text-sm text-gray-500">
              b. Please notify what is your goal for this upcoming year and explain how that will be beneficial to both of us?
            </p>
            <Textarea className="mt-2" {...register("upcomingGoal")} />

            <p className="mt-4 text-sm text-gray-500">
              c. What are the 3 things you would like to improve?
            </p>
            <Textarea className="mt-2" {...register("threeImprovements")} />

            <p className="mt-4 text-sm text-gray-500">
              d. Did you demonstrate initiative and contribute innovative ideas to improve processes or solve problems?
            </p>
            <RadioGroup 
              value={watch("initiativeFrequency")} 
              onValueChange={(v) => setValue("initiativeFrequency", v as EmployeeFormValues["initiativeFrequency"])} 
              className="mt-2 space-y-2"
            >
              {(["Consistently", "Occasionally", "Rarely", "Never"] as const).map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem value={opt} id={opt} />
                  <Label htmlFor={opt}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>

            <p className="mt-4 text-sm text-gray-500">
              e. Do you have capability of managing yourself if company gives opportunity to work in abroad:
            </p>
            <div
              className="mt-2 relative"
              style={
                !showAbroad
                  ? {
                      filter: "blur(1.5px)",
                      opacity: 0.75,
                      pointerEvents: "none",
                      userSelect: "none",
                      position: "relative",
                    }
                  : undefined
              }
            >
              <RadioGroup
                value={watch("abroadCapability")}
                onValueChange={(v) => setValue("abroadCapability", v)}
                className="space-y-2"
                disabled={!showAbroad}
              >
                {ABROAD_OPTIONS.map((opt, i) => (
                  <div key={opt} className="flex items-start gap-2">
                    <RadioGroupItem value={opt} id={`abroad-${i}`} disabled={!showAbroad} />
                    <Label htmlFor={`abroad-${i}`} className="font-normal leading-snug">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
              {!showAbroad && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-8deg)",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#c0392b",
                    opacity: 0.55,
                    border: "2px solid #c0392b",
                    borderRadius: 6,
                    padding: "4px 16px",
                    background: "rgba(255, 255, 255, 0.3)",
                    pointerEvents: "none",
                  }}
                >
                  N/A
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <Label>7. Provide examples of instances where you showed initiative or innovation. *</Label>
              <Textarea className="mt-1" {...register("initiativeInnovation")} />
            </div>
            <div>
              <Label>8. Reflect on your commitment to professional development and continuous learning. *</Label>
              <RadioGroup 
                value={watch("learningCommitment")} 
                onValueChange={(v) => setValue("learningCommitment", v as EmployeeFormValues["learningCommitment"])} 
                className="mt-2 space-y-2"
              >
                {[
                  { v: "A", l: "A — Highly committed" },
                  { v: "B", l: "B — Moderately committed" },
                  { v: "C", l: "C — Somewhat committed" },
                  { v: "D", l: "D — Minimally committed" },
                  { v: "E", l: "E — Not at all committed" },
                ].map(({ v, l }) => (
                  <div key={v} className="flex items-center gap-2">
                    <RadioGroupItem value={v} id={`lc-${v}`} />
                    <Label htmlFor={`lc-${v}`}>{l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>9. Professionalism and attitude</Label>
              <p className="mt-1 text-sm text-gray-500">
                Please describe your professionalism and attitude with your team during office premises (including perspective vision on your career along with your team).
              </p>
              <Textarea className="mt-1" {...register("professionalismAttitude")} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Self Ratings</h3>
            <SelfRatingGrid items={RATINGS_PART1} />
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Self Ratings (Continued)</h3>
            <SelfRatingGrid items={RATINGS_PART2} />
          </div>
        )}

        {(!isQC && step === 7) && (
          <div>
            <Label>10. Work performance and Time Management *</Label>
            <Textarea className="min-h-[150px] mt-1" {...register("currentYearPerformance")} />
          </div>
        )}

        {(!isQC && step === 8) && <ProductivitySection />}
        {(!isQC && step === 9) && <ModelerSection category={category} />}

        {isQC && step === 9 && (
          <div>
            <Label>10. Work performance and Time Management *</Label>
            <Textarea className="min-h-[150px] mt-1" {...register("currentYearPerformance")} />
          </div>
        )}

        {step === 10 && (
          <div className="space-y-6">
            <div>
              <Label>11. Work performance and Time Management: *</Label>
              <p className="mt-1 text-sm text-gray-500">Please describe your current year work performance and Time Management</p>
              <Textarea className="min-h-[120px] mt-1" {...register("productivityImprovement")} />
            </div>
            <div>
              <Label>Rate Yourself of Your Overall Performance: *</Label>
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
                <Label>Form Filled And Signed By *</Label>
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
          <Button type="button" variant="outline" disabled={step === visibleSteps[0]} onClick={prevStep}>
            Previous
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onDraft} disabled={submitting}>
              Save Draft
            </Button>
            {step < lastStep ? (
              <Button type="button" onClick={nextStep}>Next</Button>
            ) : (
              <Button type="submit" variant="success" disabled={submitting || !verificationPhoto}>
                Submit For Review
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}