import type { AppraisalSubmission, Prisma } from "@prisma/client";
import { SELF_RATING_ITEMS } from "./form-questions";

export type EmployeeSelfRatings = Partial<Pick<AppraisalSubmission, (typeof SELF_RATING_ITEMS)[number]["key"]>>;

// Zero is a submitted rating. Only null/undefined means unanswered.
export function restrictManagerRatings(data: Prisma.AppraisalSubmissionUpdateInput, employee: EmployeeSelfRatings): Prisma.AppraisalSubmissionUpdateInput {
  const result = { ...data };
  for (const item of SELF_RATING_ITEMS) {
    if (employee[item.key] == null) result[item.mgrKey] = null;
  }
  return result;
}
