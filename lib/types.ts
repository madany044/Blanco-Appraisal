import type { AppraisalSubmission, Manager } from "@prisma/client";
import type { SerializedIncrementSlab } from "@/lib/utils";

export type SubmissionWithManager = AppraisalSubmission & {
  manager: Manager;
};

export type AppraisalCategory = "GROUP_A" | "GROUP_B" | "GROUP_C" | "QC";

export const OVERALL_RATINGS = [
  "Extraordinary / Extreme performance based on my total working experience",
  "I need to explore more but satisfied based on my current position and working experience",
  "I have some backlog but I can overcome myself to provide better performance this upcoming year",
  "I have some backlog and I seek company support to overcome and ensure better performance",
] as const;

export const ABROAD_OPTIONS = [
  "Excellent skill, accept immediately",
  "Can accept, need more time",
  "Will learn, accept next year",
  "Need to upgrade, not for 3 years",
] as const;

export const STRONG_REASONS = [
  "Vision of career growth with company",
  "Team Leading Capability and Team Motivating",
  "Better work planning and meeting deadlines",
  "Long lasting working relationships",
  "Commitment to professional development",
  "Contribution to innovative ideas",
  "Self-learning Capability",
  "Hardworking",
  "Smart working",
  "Honesty",
  "Best communication",
  "Best leave management",
  "Best time management",
] as const;

export const CONDITIONAL_REASONS = [
  "Improve and speed up working process",
  "Improve self-learning capabilities",
  "Trust build with Team",
  "Must improve work planning and deadlines",
  "Must improve Team Leading Capability",
  "Improve contribution to innovative ideas",
  "Must Improve communication skills",
  "Feel free to ask questions and share knowledge",
  "Improve leave management",
  "Improve time management",
  "Must Improve smart working",
] as const;

export const NOT_RECOMMENDED_REASONS = [
  "No Improvement in working process",
  "No efforts in self-learning",
  "Not Exploring innovative ideas",
  "No involvement in Team building",
  "No Improvement in communication skills",
  "Poor Leave management",
  "Struggling to communicate with customers",
  "Poor time management",
  "Arrogance at workplace",
] as const;

export const STAGE_LABELS = [
  "Submitted",
  "HR Reviewed",
  "Manager Reviewed",
  "Management Decided",
  "Completed",
] as const;

export type IncrementSlabRow = SerializedIncrementSlab;
