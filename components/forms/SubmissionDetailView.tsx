"use client";

import type { AppraisalSubmission, Manager } from "@prisma/client";
import { RatingPillReadOnly } from "@/components/forms/RatingPillInput";
import {
  SELF_RATING_ITEMS,
  SHOP_DRAFTING_ITEMS,
  E_DRAFTING_ITEMS,
  MODELER_ITEMS,
  HR_RATING_ITEMS,
  MGR_RECOMMENDATION_LABELS,
  displayValue,
  getSubmissionField,
  formatOverallRating,
  formatSalary,
} from "@/lib/submission-display";
import { categoryLabel, formatDate } from "@/lib/utils";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type SubmissionWithManager = AppraisalSubmission & { manager?: Manager };

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-[15px] text-[#1e2740] whitespace-pre-wrap">{displayValue(value)}</p>
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div
      className="rounded-t-lg px-4 py-2.5 text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {title}
    </div>
  );
}

function SectionBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-b-lg border border-t-0 border-slate-200 bg-slate-50/50 p-4", className)}>{children}</div>;
}

function RatingBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1a4b8c] text-sm font-bold text-white">
      {value}
    </span>
  );
}

interface EmployeeSectionProps {
  submission: SubmissionWithManager;
}

export function EmployeeSubmissionView({ submission: s }: EmployeeSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg">
      <SectionHeader title="SECTION 1 — EMPLOYEE SUBMISSION" color="#1a4b8c" />
      <SectionBody>
        <div className="grid gap-0 md:grid-cols-2 md:gap-x-4">
          <DetailField label="Employee Name" value={s.employeeName} />
          <DetailField label="Employee ID" value={s.employeeCode} />
          <DetailField label="Category" value={categoryLabel(s.category)} />
          <DetailField label="Manager" value={s.manager?.name} />
          <DetailField label="Team & Designation" value={s.teamDesignation} />
          <DetailField label="Date" value={formatDate(s.dateOfSubmission)} />
          <DetailField label="Previous Field Experience" value={s.prevExperienceYears} />
          <DetailField label="Company Experience" value={s.companyExperienceYears} />
          <DetailField label="Current Monthly Salary (₹)" value={s.currentSalary != null ? formatSalary(s.currentSalary) : null} />
        </div>

        <DetailField label="Question 1: Basis of Appraisal Request" value={s.basisOfAppraisal} />
        <DetailField label="Question 2: Support to the Company" value={s.supportToCompany} />
        <DetailField
          label="Question 3: Expectations"
          value={
            s.expectationsYesNo
              ? `${s.expectationsYesNo}${s.expectationsReason ? ` — ${s.expectationsReason}` : ""}`
              : null
          }
        />
        <DetailField label="Question 4: Strengths & Weaknesses" value={s.strengthsWeaknesses} />
        <DetailField label="Question 5: Teamwork Examples" value={s.teamworkExamples} />
        <DetailField label="Question 6a: Goal Challenges" value={s.goalChallenges} />
        <DetailField label="Question 6b: Upcoming Year Goal" value={s.upcomingGoal} />
        <DetailField label="Question 6c: Three Things to Improve" value={s.threeImprovements} />
        <DetailField label="Question 6d: Initiative Frequency" value={s.initiativeFrequency} />
        <DetailField
          label="Question 6e: Abroad Capability"
          value={s.abroadCapabilityNa ? "N/A" : s.abroadCapability}
        />
        <DetailField label="Question 7: Initiative or Innovation Examples" value={s.initiativeInnovation} />
        <DetailField label="Question 8: Learning Commitment" value={s.learningCommitment} />
        <DetailField label="Question 9: Professionalism and Attitude" value={s.professionalismAttitude} />

        <p className="mb-2 mt-4 text-sm font-bold text-[#1a4b8c]">Self Performance Ratings (/10)</p>
        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {SELF_RATING_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="pr-2 text-sm text-[#1e2740]">{item.label}</span>
              <RatingBadge value={s[item.key as keyof AppraisalSubmission] as number | null} />
            </div>
          ))}
        </div>

        <p className="mb-2 text-sm font-bold text-[#1a4b8c]">Productivity — Shop Drafting</p>
        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {SHOP_DRAFTING_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">{displayValue(getSubmissionField(s, item.key))}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 text-sm font-bold text-[#1a4b8c]">Productivity — E-Drafting</p>
        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {E_DRAFTING_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium">{displayValue(getSubmissionField(s, item.key))}</span>
            </div>
          ))}
        </div>

        <p className="mb-2 text-sm font-bold text-[#1a4b8c]">Productivity — Modeler</p>
        {s.modelerSectionNa ? (
          <p className="mb-4 text-sm text-muted-foreground">N/A for this category</p>
        ) : (
          <div className="mb-4 grid gap-2 md:grid-cols-2">
            {MODELER_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium">{displayValue(getSubmissionField(s, item.key))}</span>
              </div>
            ))}
          </div>
        )}

        <DetailField label="Question 10: Work Performance" value={s.currentYearPerformance} />
        <DetailField label="Question 11: Productivity Improvement" value={s.productivityImprovement} />
        <DetailField label="Overall Rating" value={formatOverallRating(s.overallRating)} />
        <div className="grid md:grid-cols-2 md:gap-x-4">
          <DetailField label="Employee Signature" value={s.employeeSignatureName} />
          <DetailField label="Employee Signature Date" value={formatDate(s.employeeSignatureDate)} />
        </div>
      </SectionBody>
    </div>
  );
}

export function HRSubmissionView({ submission: s }: { submission: AppraisalSubmission }) {
  return (
    <div className="overflow-hidden rounded-lg">
      <SectionHeader title="SECTION 2 — HR AND ADMIN FEEDBACK" color="#1a8c5a" />
      <SectionBody>
        {HR_RATING_ITEMS.map((item) => (
          <div key={item.key} className="mb-4">
            <p className="mb-2 text-sm font-medium">{item.label}</p>
            <RatingPillReadOnly value={s[item.key as keyof AppraisalSubmission] as number | null} />
          </div>
        ))}
        <DetailField label="Backlog Notes" value={s.hrBacklogNotes} />
        <div className="grid md:grid-cols-2 md:gap-x-4">
          <DetailField label="Admin Signature" value={s.hrAdminSignatureName} />
          <DetailField label="Admin Signature Date" value={formatDate(s.hrAdminSignatureDate)} />
        </div>
      </SectionBody>
    </div>
  );
}

export function ManagerSubmissionView({ submission: s }: { submission: AppraisalSubmission }) {
  const levels = s.mgrRecommendation ?? [];
  const groups = [
    { level: "STRONGLY_RECOMMEND", reasons: s.mgrStrongReasons, options: STRONG_REASONS },
    { level: "CONDITIONALLY_RECOMMEND", reasons: s.mgrConditionalReasons, options: CONDITIONAL_REASONS },
    { level: "NOT_RECOMMENDED", reasons: s.mgrNotRecommendedReasons, options: NOT_RECOMMENDED_REASONS },
  ];

  return (
    <div className="overflow-hidden rounded-lg">
      <SectionHeader title="SECTION 3 — TEAM HEAD FEEDBACK" color="#c97c10" />
      <SectionBody>
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <DetailField label="Employee Name" value={s.employeeName} />
          <DetailField label="Employee Code" value={s.employeeCode} />
        </div>
        <DetailField
          label="Recommendation Level(s)"
          value={levels.length ? levels.map((l) => MGR_RECOMMENDATION_LABELS[l] ?? l).join("; ") : null}
        />
        {groups.map((g) =>
          levels.includes(g.level) ? (
            <div key={g.level} className="mb-4">
              <p className="mb-2 text-sm font-semibold">{MGR_RECOMMENDATION_LABELS[g.level]}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {g.options
                  .filter((r) => g.reasons.includes(r))
                  .map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                {g.reasons
                  .filter((r) => !(g.options as readonly string[]).includes(r))
                  .map((r) => (
                    <li key={r}>{r}</li>
                  ))}
              </ul>
            </div>
          ) : null
        )}
        <DetailField label="Manager Remarks" value={s.mgrRemarks} />
        <div className="grid md:grid-cols-2 md:gap-x-4">
          <DetailField label="Team Head Signature" value={s.mgrSignatureName} />
          <DetailField label="Team Head Signature Date" value={formatDate(s.mgrSignatureDate)} />
        </div>
      </SectionBody>
    </div>
  );
}

export function SubmissionDetailView({
  submission,
  sections = ["employee", "hr", "manager"],
}: {
  submission: SubmissionWithManager;
  sections?: ("employee" | "hr" | "manager")[];
}) {
  return (
    <div className="space-y-6">
      {sections.includes("employee") && <EmployeeSubmissionView submission={submission} />}
      {sections.includes("hr") && <HRSubmissionView submission={submission} />}
      {sections.includes("manager") && <ManagerSubmissionView submission={submission} />}
    </div>
  );
}
