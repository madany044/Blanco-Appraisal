"use client";

import type { AppraisalSubmission, Manager, Prisma } from "@prisma/client";
import { RatingPillReadOnly } from "@/components/forms/RatingPillInput";
import {
  EMPLOYEE_QUESTIONS,
  SELF_RATING_ITEMS,
  SHOP_DRAFTING_ITEMS,
  E_DRAFTING_ITEMS,
  MODELER_ITEMS,
  HR_RATING_ITEMS,
  HR_BACKLOG_QUESTION,
  MGR_RECOMMENDATION_SECTIONS,
  PRODUCTIVITY_INTRO,
  LEARNING_COMMITMENT_OPTIONS,
  INITIATIVE_FREQUENCY_OPTIONS,
  OVERALL_RATING_OPTIONS,
  selfRatingLabel,
  formatLearningCommitment,
  formatExpectationsAnswer,
  normalizeOverallRating,
} from "@/lib/form-questions";
import {
  displayValue,
  getSubmissionField,
  formatSalary,
} from "@/lib/submission-display";
import { decimalToNumber } from "@/lib/utils";
import { categoryLabel, formatDate, cn } from "@/lib/utils";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
  ABROAD_OPTIONS,
} from "@/lib/types";

type SubmissionWithManager = AppraisalSubmission & { manager?: Manager };
type AppraisalSubmissionWithSuggested = AppraisalSubmission & {
  mgrSuggestedIncrementPercentage?: Prisma.Decimal | null;
};

function QuestionCard({
  label,
  question,
  answer,
  children,
}: {
  label: string;
  question: string;
  answer?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-sm text-gray-600">{question}</p>
      {children ?? (
        <p className="mt-3 text-[15px] font-semibold text-[#1e2740] whitespace-pre-wrap">
          {displayValue(answer)}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-medium text-[#1e2740]">{value}</dd>
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
  return (
    <div className={cn("rounded-b-lg border border-t-0 border-slate-200 bg-slate-50/50 p-4", className)}>
      {children}
    </div>
  );
}

function RatingBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a4b8c] text-sm font-bold text-white">
      {value}
    </span>
  );
}

interface EmployeeSectionProps {
  submission: SubmissionWithManager;
}

export function EmployeeSubmissionView({ submission: s }: EmployeeSectionProps) {
  const selectedOverall = normalizeOverallRating(s.overallRating);

  return (
    <div className="overflow-hidden rounded-lg">
      <SectionHeader title="SECTION 1 — EMPLOYEE SUBMISSION" color="#1a4b8c" />
      <SectionBody>
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-[#1a4b8c]">Employee Info</h3>
          <dl className="grid gap-x-6 md:grid-cols-2">
            <InfoRow label="Employee Name" value={displayValue(s.employeeName)} />
            <InfoRow label="Employee ID" value={displayValue(s.employeeCode)} />
            <InfoRow label="Category" value={categoryLabel(s.category)} />
            <InfoRow label="Manager" value={displayValue(s.manager?.name)} />
            <InfoRow label="Team" value={displayValue(s.team)} />
            <InfoRow label="Designation" value={displayValue(s.designation)} />
            <InfoRow label="Date" value={formatDate(s.dateOfSubmission) || "—"} />
            <InfoRow label="Previous field experience" value={displayValue(s.prevExperienceYears)} />
            <InfoRow label="Company experience" value={displayValue(s.companyExperienceYears)} />
          </dl>
        </div>

        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q1.label}
          question={EMPLOYEE_QUESTIONS.q1.text}
          answer={s.basisOfAppraisal}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q2.label}
          question={EMPLOYEE_QUESTIONS.q2.text}
          answer={s.supportToCompany}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q3.label}
          question={EMPLOYEE_QUESTIONS.q3.text}
          answer={formatExpectationsAnswer(s) || null}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q4.label}
          question={EMPLOYEE_QUESTIONS.q4.text}
          answer={s.strengthsWeaknesses}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q5.label}
          question={EMPLOYEE_QUESTIONS.q5.text}
          answer={s.teamworkExamples}
        />

        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">QUESTION 6</p>
          <p className="mt-2 text-sm font-semibold text-gray-700">{EMPLOYEE_QUESTIONS.q6heading}</p>
        </div>

        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q6a.label}
          question={EMPLOYEE_QUESTIONS.q6a.text}
          answer={s.goalChallenges}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q6b.label}
          question={EMPLOYEE_QUESTIONS.q6b.text}
          answer={s.upcomingGoal}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q6c.label}
          question={EMPLOYEE_QUESTIONS.q6c.text}
          answer={s.threeImprovements}
        />
        <QuestionCard label={EMPLOYEE_QUESTIONS.q6d.label} question={EMPLOYEE_QUESTIONS.q6d.text}>
          <p className="mt-2 text-xs text-gray-500">
            Options: {INITIATIVE_FREQUENCY_OPTIONS.join(" · ")}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-[#1e2740]">
            Selected: {displayValue(s.initiativeFrequency)}
          </p>
        </QuestionCard>
        <QuestionCard label={EMPLOYEE_QUESTIONS.q6e.label} question={EMPLOYEE_QUESTIONS.q6e.text}>
          {s.abroadCapabilityNa ? (
            <p className="mt-3 text-[15px] font-semibold text-[#1e2740]">N/A — Not applicable for this category</p>
          ) : (
            <>
              <p className="mt-2 text-xs text-gray-500">Options: {ABROAD_OPTIONS.join(" · ")}</p>
              <p className="mt-2 text-[15px] font-semibold text-[#1e2740]">
                Selected: {displayValue(s.abroadCapability)}
              </p>
            </>
          )}
        </QuestionCard>

        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q7.label}
          question={EMPLOYEE_QUESTIONS.q7.text}
          answer={s.initiativeInnovation}
        />
        <QuestionCard label={EMPLOYEE_QUESTIONS.q8.label} question={EMPLOYEE_QUESTIONS.q8.text}>
          <p className="mt-2 text-xs text-gray-500">
            Options: {LEARNING_COMMITMENT_OPTIONS.map((o) => o.label).join(" · ")}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-[#1e2740]">
            Selected: {displayValue(formatLearningCommitment(s.learningCommitment) || s.learningCommitment)}
          </p>
        </QuestionCard>
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q9.label}
          question={EMPLOYEE_QUESTIONS.q9.text}
          answer={s.professionalismAttitude}
        />

        <h4 className="mb-3 mt-2 text-sm font-bold text-[#1a4b8c]">Self Performance Ratings</h4>
        <div className="mb-6 space-y-2">
          {SELF_RATING_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <span className="flex-1 text-sm text-[#1e2740]">{selfRatingLabel(item)}</span>
              <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600">
                <RatingBadge value={s[item.key as keyof AppraisalSubmission] as number | null} />
                <span>/ 10</span>
              </div>
            </div>
          ))}
        </div>

        {s.category === "QC" ? (
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm italic text-gray-600">
            <p className="font-medium not-italic text-[#1e2740]">📋 Productivity Section</p>
            <p className="mt-1">Not applicable for QC category employees.</p>
            <p>QC employees describe performance in Questions 11 and 12 (text answers below).</p>
          </div>
        ) : (
          <>
            <h4 className="mb-1 text-sm font-bold text-[#1a4b8c]">10. Productivity and Time Management</h4>
            <p className="mb-4 text-sm text-gray-600">{PRODUCTIVITY_INTRO}</p>

            <h5 className="mb-2 text-sm font-semibold text-[#1e2740]">Shop Drafting and Checker</h5>
            <ul className="mb-6 list-disc space-y-2 pl-5">
              {SHOP_DRAFTING_ITEMS.map((item) => (
                <li key={item.key} className="text-sm text-[#1e2740]">
                  <span>{item.label}: </span>
                  <span className="font-semibold">{displayValue(getSubmissionField(s, item.key))}</span>
                </li>
              ))}
            </ul>

            <h5 className="mb-2 text-sm font-semibold text-[#1e2740]">E-Drafting</h5>
            <ul className="mb-6 list-disc space-y-2 pl-5">
              {E_DRAFTING_ITEMS.map((item) => (
                <li key={item.key} className="text-sm text-[#1e2740]">
                  <span>{item.label}: </span>
                  <span className="font-semibold">{displayValue(getSubmissionField(s, item.key))}</span>
                </li>
              ))}
            </ul>

            <h5 className="mb-2 text-sm font-semibold text-[#1e2740]">Modeler</h5>
            {s.modelerSectionNa ? (
              <p className="mb-6 text-sm font-medium text-muted-foreground">
                Modeler — Not Applicable for this category
              </p>
            ) : (
              <ul className="mb-6 list-disc space-y-2 pl-5">
                {MODELER_ITEMS.map((item) => (
                  <li key={item.key} className="text-sm text-[#1e2740]">
                    <span>{item.label}: </span>
                    <span className="font-semibold">{displayValue(getSubmissionField(s, item.key))}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q11.label}
          question={EMPLOYEE_QUESTIONS.q11.text}
          answer={s.currentYearPerformance}
        />
        <QuestionCard
          label={EMPLOYEE_QUESTIONS.q12.label}
          question={EMPLOYEE_QUESTIONS.q12.text}
          answer={s.productivityImprovement}
        />

        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overall Rating</p>
          <p className="mt-2 text-sm text-gray-600">Rate Yourself of Your Overall Performance:</p>
          <ul className="mt-3 space-y-2">
            {OVERALL_RATING_OPTIONS.map((opt) => {
              const selected = selectedOverall === opt;
              return (
                <li
                  key={opt}
                  className={cn(
                    "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm",
                    selected && "bg-blue-50 font-semibold text-[#1a4b8c]"
                  )}
                >
                  <span className="mt-0.5 shrink-0">{selected ? "☑" : "☐"}</span>
                  <span>{opt}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <dl className="grid gap-x-6 md:grid-cols-3">
          <InfoRow label="Form filled and signed by:" value={displayValue(s.employeeSignatureName)} />
          <InfoRow label="Employee Code" value={displayValue(s.employeeCode)} />
          <InfoRow label="Date" value={formatDate(s.employeeSignatureDate) || formatDate(s.dateOfSubmission) || "—"} />
        </dl>
      </SectionBody>
    </div>
  );
}

export function HRSubmissionView({ submission: s }: { submission: AppraisalSubmission }) {
  return (
    <div className="overflow-hidden rounded-lg">
      <SectionHeader title="SECTION 2 — HR AND ADMIN FEEDBACK" color="#1a8c5a" />
      <SectionBody>
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-gray-600">Employee Current Monthly Salary (₹)</p>
          <p className="mt-1 text-[15px] font-semibold text-[#1e2740]">
            {s.currentSalary != null ? formatSalary(s.currentSalary) : "—"}
          </p>
        </div>
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-gray-600">Previous Increment Percentage (%)</p>
          <p className="mt-1 text-[15px] font-semibold text-[#1e2740]">
            {s.previousIncrementPercentage != null ? `${s.previousIncrementPercentage}%` : "—"}
          </p>
        </div>
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-gray-600">Additional Increments Between Cycles</p>
          {Array.isArray(s.additionalIncrements) && s.additionalIncrements.length > 0 ? (
            <div className="mt-3 space-y-3">
              {(s.additionalIncrements as Array<{ percentage?: number | null; salaryRise?: number | null }>).map((item, index) => (
                <div key={`${item.percentage ?? "-"}-${item.salaryRise ?? "-"}-${index}`} className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Increment %</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">
                      {item.percentage != null ? `${item.percentage}%` : "—"}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Salary Rise (₹)</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">
                      {item.salaryRise != null ? `₹${item.salaryRise}` : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">—</p>
          )}
        </div>
        {HR_RATING_ITEMS.map((item) => (
          <div key={item.key} className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-[#1e2740]">{item.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <RatingPillReadOnly value={s[item.key as keyof AppraisalSubmission] as number | null} />
              <span className="text-sm text-gray-600">
                {s[item.key as keyof AppraisalSubmission] != null
                  ? `${s[item.key as keyof AppraisalSubmission]}/10`
                  : "—"}
              </span>
            </div>
            {item.key === "hrLeaveManagement" && s.hrLeaveManagementNotes ? (
              <p className="mt-2 text-sm italic text-gray-600">{s.hrLeaveManagementNotes}</p>
            ) : null}
            {item.key === "hrTimingManagement" && s.hrTimingManagementNotes ? (
              <p className="mt-2 text-sm italic text-gray-600">{s.hrTimingManagementNotes}</p>
            ) : null}
          </div>
        ))}
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-gray-600">Effective Date</p>
          <p className="mt-1 text-[15px] font-semibold text-[#1e2740]">
            {formatDate(s.mgmtEffectiveDate) || "—"}
          </p>
        </div>
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-gray-600">{HR_BACKLOG_QUESTION}</p>
          <p className="mt-2 whitespace-pre-wrap text-[15px] font-semibold text-[#1e2740]">
            {displayValue(s.hrBacklogNotes)}
          </p>
        </div>
        <dl className="grid gap-x-6 md:grid-cols-2">
          <InfoRow label="Rating , feedback Given By:" value={displayValue(s.hrAdminSignatureName)} />
          <InfoRow label="Date" value={formatDate(s.hrAdminSignatureDate) || "—"} />
        </dl>
      </SectionBody>
    </div>
  );
}

export function ManagerSubmissionView({ submission: s }: { submission: AppraisalSubmission }) {
  const reasonOptions: Record<string, readonly string[]> = {
    mgrStrongReasons: STRONG_REASONS,
    mgrConditionalReasons: CONDITIONAL_REASONS,
    mgrNotRecommendedReasons: NOT_RECOMMENDED_REASONS,
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <SectionHeader title="SECTION 3 — TEAM HEAD FEEDBACK" color="#c97c10" />
      <SectionBody>
        <div className="mb-4 rounded-lg border border-slate-200 bg-[#f8f9fc] p-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Employee Name</p>
            <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">{displayValue(s.employeeName)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Employee Code</p>
            <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">{displayValue(s.employeeCode)}</p>
          </div>
        </div>
        <dl className="mb-4 rounded-lg border border-slate-200 bg-[#f8f9fc] p-4 grid gap-4 gap-x-6 sm:grid-cols-2 md:grid-cols-2">
          {s.mgrSuggestedIncrementPercentage != null ? (
            <InfoRow
              label="Suggested Increment Percentage"
              value={`${decimalToNumber(s.mgrSuggestedIncrementPercentage)}%`}
            />
          ) : null}
        </dl>

        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-[#1e2740]">In-between Increments Recorded by HR</p>
          {Array.isArray(s.additionalIncrements) && s.additionalIncrements.length > 0 ? (
            <div className="mt-3 space-y-3">
              {((s.additionalIncrements as Array<{ percentage?: number | null; salaryRise?: number | null }>)).map((item, index) => (
                <div key={`${item.percentage ?? "-"}-${item.salaryRise ?? "-"}-${index}`} className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Increment %</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">
                      {item.percentage != null ? `${item.percentage}%` : "—"}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Salary Rise (₹)</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#1e2740]">
                      {item.salaryRise != null ? `₹${item.salaryRise}` : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">—</p>
          )}
        </div>

        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = s[section.field] ?? [];
          const options = reasonOptions[section.field];
          const checked = [
            ...options.filter((r) => reasons.includes(r)),
            ...reasons.filter((r) => !options.includes(r)),
          ];

          return (
            <div key={section.level} className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-[#1e2740]">• {section.header}</p>
              {checked.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#1e2740]">
                  {checked.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-gray-400">—</p>
              )}
            </div>
          );
        })}

        {s.mgrRemarks ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Additional Remarks</p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] font-semibold text-[#1e2740]">{s.mgrRemarks}</p>
          </div>
        ) : null}

        <dl className="grid gap-x-6 md:grid-cols-2">
          <InfoRow label="Reviewed & Signed By Reporting Manager:" value={displayValue(s.mgrSignatureName)} />
          <InfoRow label="Date" value={formatDate(s.mgrSignatureDate) || "—"} />
        </dl>
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
