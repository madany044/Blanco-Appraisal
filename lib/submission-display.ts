import type { AppraisalSubmission } from "@prisma/client";
import { categoryLabel, formatDate } from "@/lib/utils";
import { OVERALL_RATINGS } from "@/lib/types";

export const SELF_RATING_ITEMS = [
  { key: "rateTeamwork", label: "a. Teamwork and Collaboration" },
  { key: "rateCompanyRelationship", label: "b. Relationship with the company" },
  { key: "ratePmRelationship", label: "c. Working Relationship with your PM" },
  { key: "rateCoworkerComms", label: "d. Communication with Co-worker" },
  { key: "rateEngineering", label: "e. Engineering knowledge" },
  { key: "rateTeamCommunication", label: "f. Ability to effectively communicate with team members and superiors" },
  { key: "rateVerbalWritten", label: "g. Clarity on verbal and written communication" },
  { key: "rateEnglish", label: "h. English communication during office premises" },
  { key: "rateSelfLearning", label: "i. Self-learning abilities" },
  { key: "rateQualityOfWork", label: "j. Quality of work and execution" },
  { key: "rateDeadlines", label: "k. Meeting deadlines and completing tasks on time" },
  { key: "rateClientComms", label: "l. Communicating with Client" },
  { key: "rateCustomerEmails", label: "m. Understanding customer e-mails (without help)" },
  { key: "rateRfiCreation", label: "n. Creating RFIs (without help)" },
  { key: "rateEmailWriting", label: "o. Writing back e-mail to customer (without help)" },
  { key: "rateIssueResolution", label: "p. Resolving issues without help of anyone" },
  { key: "rateKnowledgeSharing", label: "q. Sharing knowledge and conducting classes to Juniors" },
  { key: "rateLeadership", label: "r. Professional Leadership quality during office premises" },
  { key: "rateTeamPerformance", label: "s. Your Team performance" },
  { key: "rateTeamBuilding", label: "t. Team build abilities" },
] as const;

export const SHOP_DRAFTING_ITEMS = [
  { key: "prodSimpleBeam", label: "Simple Beam" },
  { key: "prodMediumBeam", label: "Medium Beam" },
  { key: "prodComplexBeam", label: "Complex Beam" },
  { key: "prodStair", label: "Stair" },
  { key: "prodStairRail", label: "Stair Rail" },
  { key: "prodRoofFrame", label: "Roof Frame" },
  { key: "prodSimpleLadder", label: "Simple Ladder" },
  { key: "prodCagedLadder", label: "Caged Ladder" },
  { key: "prodLoosePieces", label: "Loose Pieces" },
  { key: "prodSinglePart", label: "Single Part" },
  { key: "prodCheckAbHours", label: "Check AB Hours" },
  { key: "prodCheckEplanHours", label: "Check E-Plan Hours" },
] as const;

export const E_DRAFTING_ITEMS = [
  { key: "prodDraftAbHours", label: "Draft AB Hours" },
  { key: "prodDraftEplanHours", label: "Draft E-Plan Hours" },
  { key: "prodDraftCagedLadder", label: "Draft Caged Ladder" },
  { key: "prodDraftStairs", label: "Draft Stairs" },
] as const;

export const MODELER_ITEMS = [
  { key: "prodModSimpleConnection", label: "Simple Connection" },
  { key: "prodModDirectWeld", label: "Direct Weld" },
  { key: "prodModMomentPlate", label: "Moment Plate" },
  { key: "prodModWeldedTube", label: "Welded Tube" },
  { key: "prodModBoltedBrace", label: "Bolted Brace" },
  { key: "prodModStairsHours", label: "Stairs Hours" },
  { key: "prodModRfiTime", label: "RFI Time" },
  { key: "prodModMemberPlacingHours", label: "Member Placing Hours" },
] as const;

export const HR_RATING_ITEMS = [
  { key: "hrCodeOfConduct", label: "Code of Conduct" },
  { key: "hrDressCode", label: "Dress Code" },
  { key: "hrProfessionalism", label: "Professionalism" },
  { key: "hrLeaveManagement", label: "Leave Management" },
  { key: "hrTimingManagement", label: "Timing Management" },
] as const;

export const MGR_RECOMMENDATION_LABELS: Record<string, string> = {
  STRONGLY_RECOMMEND: "I Strongly recommend this employee",
  CONDITIONALLY_RECOMMEND: "I May recommend this employee",
  NOT_RECOMMENDED: "I May OR May Not recommend this employee",
};

export function displayValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function getSubmissionField(
  s: AppraisalSubmission,
  key: keyof AppraisalSubmission
): string | number | null | undefined {
  const v = s[key];
  if (v == null) return null;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  return v as string | number;
}

export function formatOverallRating(value: string | null | undefined): string {
  if (!value) return "—";
  return OVERALL_RATINGS.includes(value as (typeof OVERALL_RATINGS)[number]) ? value : value;
}

export function formatSalary(value: number | null | undefined): string {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}
