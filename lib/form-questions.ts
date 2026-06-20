import type { AppraisalSubmission } from "@prisma/client";
import { ABROAD_OPTIONS, OVERALL_RATINGS } from "@/lib/types";

export const LEARNING_COMMITMENT_OPTIONS = [
  { value: "A", label: "A. Highly committed" },
  { value: "B", label: "B. Moderately committed" },
  { value: "C", label: "C. Somewhat committed" },
  { value: "D", label: "D. Minimally committed" },
  { value: "E", label: "E. Not committed at all" },
] as const;

export const INITIATIVE_FREQUENCY_OPTIONS = ["Consistently", "Occasionally", "Rarely", "Never"] as const;

export const PRODUCTIVITY_INTRO =
  "What's your capability to produce the maximum number of the following kinds of drawings/connections (Checking, shop drafting, GA drafting and modelling)";

export const EMPLOYEE_QUESTIONS = {
  q1: {
    label: "QUESTION 1",
    text: "Basis of appraisal request: Please describe on what basis we should consider your Salary appraisal request:",
    field: "basisOfAppraisal" as const,
  },
  q2: {
    label: "QUESTION 2",
    text: "Support to the company: Please describe how would you support the company to grow and generate more income as similar as your salary appraisal:",
    field: "supportToCompany" as const,
  },
  q3: {
    label: "QUESTION 3",
    text: "Expectations: Do you think you can expect same amount of appraisal from year to year as your salary grows? (Tell us YES or NO and describe the reason accordingly)",
  },
  q4: {
    label: "QUESTION 4",
    text: "Improvement in yourself: Please describe your strengths and weaknesses and describe what improvement in yourself compared to the previous year:",
    field: "strengthsWeaknesses" as const,
  },
  q5: {
    label: "QUESTION 5",
    text: "Provide examples of instances where you demonstrated strong teamwork:",
    field: "teamworkExamples" as const,
  },
  q6heading: "Achievements, Goal, & Opportunities:",
  q6a: {
    label: "QUESTION 6A",
    text: "If achieved, what are the challenges did you face in achieving your goals, and how did you overcome them?",
    field: "goalChallenges" as const,
  },
  q6b: {
    label: "QUESTION 6B",
    text: "Please notify what is your goal for this upcoming year and explain how that will be beneficial to both of us?",
    field: "upcomingGoal" as const,
  },
  q6c: {
    label: "QUESTION 6C",
    text: "What are the 3 things you would like to improve?",
    field: "threeImprovements" as const,
  },
  q6d: {
    label: "QUESTION 6D",
    text: "Did you demonstrate initiative and contribute innovative ideas to improve processes or solve problems?",
    options: INITIATIVE_FREQUENCY_OPTIONS,
    field: "initiativeFrequency" as const,
  },
  q6e: {
    label: "QUESTION 6E",
    text: "Do you have capability of managing yourself if company gives opportunity to work in abroad:",
    options: ABROAD_OPTIONS,
    field: "abroadCapability" as const,
  },
  q7: {
    label: "QUESTION 7",
    text: "Provide examples of instances where you showed initiative or innovation.",
    field: "initiativeInnovation" as const,
  },
  q8: {
    label: "QUESTION 8",
    text: "Reflect on your commitment to professional development and continuous learning.",
    options: LEARNING_COMMITMENT_OPTIONS.map((o) => o.label),
  },
  q9: {
    label: "QUESTION 9 (G)",
    text: "Professionalism and Attitude: Please describe your professionalism and attitude with your team during office premises (including perspective vision on your career along with your team).",
    field: "professionalismAttitude" as const,
  },
  q11: {
    label: "QUESTION 11",
    text: "11. Work performance and Time Management: Please describe your current year work performance and Time Management",
    field: "currentYearPerformance" as const,
  },
  q12: {
    label: "QUESTION 12",
    text: "12. Please describe how you would perform and improve your productivity for this upcoming performance cycle as similar as your salary grow:",
    field: "productivityImprovement" as const,
  },
} as const;

export const SELF_RATING_ITEMS = [
  { key: "rateTeamwork", letter: "a", topic: "Teamwork and Collaboration" },
  { key: "rateCompanyRelationship", letter: "b", topic: "Relationship with the company" },
  { key: "ratePmRelationship", letter: "c", topic: "Working Relationship with your PM" },
  { key: "rateCoworkerComms", letter: "d", topic: "Communication with Co-worker" },
  { key: "rateEngineering", letter: "e", topic: "Engineering knowledge" },
  { key: "rateTeamCommunication", letter: "f", topic: "Ability to effectively communicate with team members and superiors" },
  { key: "rateVerbalWritten", letter: "g", topic: "Clarity on your own verbal and written communication" },
  { key: "rateEnglish", letter: "h", topic: "English communication during office premises" },
  { key: "rateSelfLearning", letter: "i", topic: "Self-learning abilities" },
  { key: "rateQualityOfWork", letter: "j", topic: "quality of work and execution" },
  { key: "rateDeadlines", letter: "k", topic: "meeting deadlines and completing tasks on time" },
  { key: "rateClientComms", letter: "l", topic: "Communicating with Client" },
  { key: "rateCustomerEmails", letter: "m", topic: "Understanding the customer e-mails (without help of anyone)" },
  { key: "rateRfiCreation", letter: "n", topic: "Creating the RFI's (without help of anyone)" },
  { key: "rateEmailWriting", letter: "o", topic: "Writing back the e-mail to customer (without help of anyone)" },
  { key: "rateIssueResolution", letter: "p", topic: "resolving the issues without help of anyone" },
  { key: "rateKnowledgeSharing", letter: "q", topic: "sharing knowledge and conducting classes to Juniors" },
  { key: "rateLeadership", letter: "r", topic: "Professional Leadership quality during office premises (selfless teaching, happiness with the team, motivating co-workers, achieving together, helping together)" },
  { key: "rateTeamPerformance", letter: "s", topic: "Your Team performance" },
  { key: "rateTeamBuilding", letter: "t", topic: "Team build abilities" },
] as const;

export function selfRatingLabel(item: (typeof SELF_RATING_ITEMS)[number]): string {
  return `${item.letter}. How would you rate yourself on "${item.topic}"`;
}

export const SHOP_DRAFTING_ITEMS = [
  { key: "prodSimpleBeam", label: "Simple beam and simple column drawings per/hour" },
  { key: "prodMediumBeam", label: "Medium beam and medium column drawings per/hour" },
  { key: "prodComplexBeam", label: "Complex beam and complex column drawings per/hour" },
  { key: "prodStair", label: "Standard stair drawings per/hour" },
  { key: "prodStairRail", label: "Standard stair rail drawings per/hour" },
  { key: "prodRoofFrame", label: "Standard roof frame drawings per/hour" },
  { key: "prodSimpleLadder", label: "Simple ladder drawings per/hour" },
  { key: "prodCagedLadder", label: "Caged ladder drawings per/hour" },
  { key: "prodLoosePieces", label: "Loose pieces assembly drawings per/hour" },
  { key: "prodSinglePart", label: "Single part drawings per/hour" },
  { key: "prodCheckAbHours", label: "How many hours to checking Single sheet AB plan and section views" },
  { key: "prodCheckEplanHours", label: "How many hours to checking Single sheet E-plan and section views" },
] as const;

export const E_DRAFTING_ITEMS = [
  { key: "prodDraftAbHours", label: "How many hours to complete drafting of Single sheet AB plan and section views" },
  { key: "prodDraftEplanHours", label: "How many hours to complete drafting of Single sheet E-plan and section views" },
  { key: "prodDraftCagedLadder", label: "How many hours to complete caged ladder E-plan and section views" },
  { key: "prodDraftStairs", label: "How many hours to complete drafting of two flight stairs with landing and applicable rails" },
] as const;

export const MODELER_ITEMS = [
  { key: "prodModSimpleConnection", label: "Simple standard connection (141,142,144,146) per/hour" },
  { key: "prodModDirectWeld", label: "Direct weld Moment connections per/hour" },
  { key: "prodModMomentPlate", label: "Moment plate connections per/hour" },
  { key: "prodModWeldedTube", label: "Welded tube brace connections per hour" },
  { key: "prodModBoltedBrace", label: "Bolted brace connections per hour" },
  { key: "prodModStairsHours", label: "How many hours to complete two flight stairs with landing and applicable rails" },
  { key: "prodModRfiTime", label: "Hours/minutes to Creating simple RFI" },
  { key: "prodModMemberPlacingHours", label: "Specify how many hours to complete only member placing of reference sketch" },
] as const;

export const HR_RATING_ITEMS = [
  { key: "hrCodeOfConduct", label: 'Rate this Employee "Adhere to Company Code of Conduct"' },
  { key: "hrDressCode", label: 'Rate this Employee "Dress Code Managements"' },
  { key: "hrProfessionalism", label: 'Rate this Employee "Professionalism Attitude during the office premises"' },
  { key: "hrLeaveManagement", label: 'Rate this Employee "Leave Managements"' },
  { key: "hrTimingManagement", label: 'Rate this Employee "Timings Managements"' },
] as const;

export const HR_BACKLOG_QUESTION =
  "Please Specify If any backlog, Arrogancy, Damaging the company Property, Involving in any illegal activities during the office premises, misleading other employees, etc.";

export const MGR_RECOMMENDATION_SECTIONS = [
  {
    level: "STRONGLY_RECOMMEND",
    header:
      "I Strongly recommend this employee for appraisal because of the below reason marked with [√]",
    field: "mgrStrongReasons" as const,
  },
  {
    level: "CONDITIONALLY_RECOMMEND",
    header:
      "I May recommend this employee for appraisal with below noted remarking's denotes with [√]",
    field: "mgrConditionalReasons" as const,
  },
  {
    level: "NOT_RECOMMENDED",
    header:
      "I May OR May Not recommend this employee for appraisal because of the below reason marked with [√]",
    field: "mgrNotRecommendedReasons" as const,
  },
] as const;

export const OVERALL_RATING_OPTIONS = [
  "Extraordinary / Extreme performance Based on My Total Working Experience",
  "I Need to Explore More but Satisfied Based on My Current Position and with Current Working Experience",
  "I have Some Backlog But I can Overcome myself to Provide better performance in this upcoming year",
  "I have Some Backlog And I Seek Company support to Overcome and ensure better performance in this upcoming year",
] as const;

/** Map stored overall rating values to display/checkbox labels */
export function normalizeOverallRating(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.includes("extraordinary") || lower.includes("extreme performance")) {
    return OVERALL_RATING_OPTIONS[0];
  }
  if (lower.includes("explore more") || lower.includes("satisfied")) {
    return OVERALL_RATING_OPTIONS[1];
  }
  if (lower.includes("overcome myself") || lower.includes("can overcome")) {
    return OVERALL_RATING_OPTIONS[2];
  }
  if (lower.includes("seek company") || lower.includes("company support")) {
    return OVERALL_RATING_OPTIONS[3];
  }
  const exact = OVERALL_RATINGS.find((o) => o === value);
  if (exact) {
    const idx = OVERALL_RATINGS.indexOf(exact);
    return OVERALL_RATING_OPTIONS[idx] ?? value;
  }
  return value;
}

export function formatLearningCommitment(value: string | null | undefined): string {
  if (!value) return "";
  const opt = LEARNING_COMMITMENT_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value;
}

export function formatExpectationsAnswer(s: AppraisalSubmission): string {
  if (!s.expectationsYesNo) return "";
  const reason = s.expectationsReason?.trim();
  return reason ? `${s.expectationsYesNo} — ${reason}` : s.expectationsYesNo;
}

export const MANAGEMENT_LETTER_INTRO = `We are happy to receive your appraisal request and the feedback from your team head. We will be evaluating everything, and your increment letter will be e-mailed to you soon. Kindly note that revised Increment criteria have been already e-mailed to your registered e-mail IDs with the company (also noted below) and the criteria will remain the same, but we will assure you as best as close to the percentage noted below but purely depends on your performance report card.`;
