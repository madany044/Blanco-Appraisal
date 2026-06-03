import type { AppraisalSubmission } from "@prisma/client";
import { categoryLabel, formatDate } from "@/lib/utils";

interface EmployeeFormReadOnlyProps {
  submission: AppraisalSubmission;
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  const display = value == null ? "—" : String(value);
  return (
    <div className="py-2 border-b border-slate-100">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{display}</p>
    </div>
  );
}

export function EmployeeFormReadOnly({ submission: s }: EmployeeFormReadOnlyProps) {
  const ratings: [string, number | null][] = [
    ["Teamwork", s.rateTeamwork],
    ["Company Relationship", s.rateCompanyRelationship],
    ["PM Relationship", s.ratePmRelationship],
    ["Coworker Communication", s.rateCoworkerComms],
    ["Engineering", s.rateEngineering],
    ["Team Communication", s.rateTeamCommunication],
    ["Verbal/Written", s.rateVerbalWritten],
    ["English", s.rateEnglish],
    ["Self Learning", s.rateSelfLearning],
    ["Quality of Work", s.rateQualityOfWork],
    ["Deadlines", s.rateDeadlines],
    ["Client Comms", s.rateClientComms],
    ["Customer Emails", s.rateCustomerEmails],
    ["RFI Creation", s.rateRfiCreation],
    ["Email Writing", s.rateEmailWriting],
    ["Issue Resolution", s.rateIssueResolution],
    ["Knowledge Sharing", s.rateKnowledgeSharing],
    ["Leadership", s.rateLeadership],
    ["Team Performance", s.rateTeamPerformance],
    ["Team Building", s.rateTeamBuilding],
  ];

  return (
    <div className="space-y-6 text-sm">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Employee Name" value={s.employeeName} />
        <Field label="Employee Code" value={s.employeeCode} />
        <Field label="Category" value={categoryLabel(s.category)} />
        <Field label="Date" value={formatDate(s.dateOfSubmission)} />
        <Field label="Prev Experience" value={s.prevExperienceYears} />
        <Field label="Company Experience" value={s.companyExperienceYears} />
      </div>
      <Field label="Basis of Appraisal" value={s.basisOfAppraisal} />
      <Field label="Support to Company" value={s.supportToCompany} />
      <Field label="Expectations" value={`${s.expectationsYesNo ?? ""} — ${s.expectationsReason ?? ""}`} />
      <Field label="Strengths & Weaknesses" value={s.strengthsWeaknesses} />
      <Field label="Teamwork Examples" value={s.teamworkExamples} />
      <Field label="Goal Challenges" value={s.goalChallenges} />
      <Field label="Upcoming Goal" value={s.upcomingGoal} />
      <Field label="Three Improvements" value={s.threeImprovements} />
      <Field label="Initiative Frequency" value={s.initiativeFrequency} />
      {!s.abroadCapabilityNa && <Field label="Abroad Capability" value={s.abroadCapability} />}
      <Field label="Initiative/Innovation" value={s.initiativeInnovation} />
      <Field label="Learning Commitment" value={s.learningCommitment} />
      <Field label="Professionalism" value={s.professionalismAttitude} />
      <h4 className="font-semibold">Self Ratings</h4>
      <div className="grid md:grid-cols-2 gap-2">
        {ratings.map(([ratingLabel, val]) => (
          <Field key={ratingLabel} label={ratingLabel} value={val != null ? `${val}/10` : undefined} />
        ))}
      </div>
      <Field label="Work Performance" value={s.currentYearPerformance} />
      <Field label="Productivity Improvement" value={s.productivityImprovement} />
      <Field label="Overall Rating" value={s.overallRating} />
      <Field label="Signature" value={s.employeeSignatureName} />
      <Field label="Signature Date" value={formatDate(s.employeeSignatureDate)} />
    </div>
  );
}
