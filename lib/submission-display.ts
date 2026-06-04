import type { AppraisalSubmission } from "@prisma/client";
import {
  SELF_RATING_ITEMS,
  SHOP_DRAFTING_ITEMS,
  E_DRAFTING_ITEMS,
  MODELER_ITEMS,
  HR_RATING_ITEMS,
  selfRatingLabel,
  normalizeOverallRating,
} from "@/lib/form-questions";

export {
  SELF_RATING_ITEMS,
  SHOP_DRAFTING_ITEMS,
  E_DRAFTING_ITEMS,
  MODELER_ITEMS,
  HR_RATING_ITEMS,
  selfRatingLabel,
};

export const MGR_RECOMMENDATION_LABELS: Record<string, string> = {
  STRONGLY_RECOMMEND: "I Strongly recommend this employee",
  CONDITIONALLY_RECOMMEND: "I May recommend this employee",
  NOT_RECOMMENDED: "I May OR May Not recommend this employee",
};

export function displayValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  return String(value);
}

/** For PDF: empty fields render as blank, not em dash */
export function pdfDisplayValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
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
  return normalizeOverallRating(value) ?? value;
}

export function formatSalary(value: number | null | undefined): string {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}
