import { z } from "zod";
import { SELF_RATING_ITEMS } from "@/lib/form-questions";

const recommendationLevel = z.enum([
  "STRONGLY_RECOMMEND",
  "CONDITIONALLY_RECOMMEND",
  "NOT_RECOMMENDED",
]);

// One optional 0-10 rating field per self-rating item, keyed by mgrKey
// (e.g. mgrRateTeamwork) — the manager's own take on the employee's
// self-ratings. All optional: manager can leave any/all of these blank.
const managerSelfRatingFields = Object.fromEntries(
  SELF_RATING_ITEMS.map((item) => [item.mgrKey, z.coerce.number().min(0).max(10).optional()])
) as Record<(typeof SELF_RATING_ITEMS)[number]["mgrKey"], z.ZodOptional<z.ZodNumber>>;

export const managerFormSchema = z
  .object({
    mgrRecommendation: z.array(recommendationLevel).default([]),
    mgrStrongReasons: z.array(z.string()).default([]),
    mgrConditionalReasons: z.array(z.string()).default([]),
    mgrNotRecommendedReasons: z.array(z.string()).default([]),
    mgrSuggestedIncrementPercentage: z.coerce.number().min(0).max(100).optional(),
    mgrFinalApprovedIncrementPercentage: z.coerce.number().min(0).max(100).optional(),
    incrementAmount: z.coerce.number().min(0).optional(),
    suggestedIncrementAmount: z.coerce.number().min(0).optional(),
    mgrRemarks: z.string().optional(),
    mgrSignatureName: z.string().min(1, "Signature required"),
    mgrSignatureDate: z.string().optional(),
    ...managerSelfRatingFields,
  })
  .superRefine((data, ctx) => {
    if (data.mgrRecommendation.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one recommendation level",
        path: ["mgrRecommendation"],
      });
    }
    if (
      data.mgrRecommendation.includes("STRONGLY_RECOMMEND") &&
      data.mgrStrongReasons.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one reason",
        path: ["mgrStrongReasons"],
      });
    }
    if (
      data.mgrRecommendation.includes("CONDITIONALLY_RECOMMEND") &&
      data.mgrConditionalReasons.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one reason",
        path: ["mgrConditionalReasons"],
      });
    }
    if (
      data.mgrRecommendation.includes("NOT_RECOMMENDED") &&
      data.mgrNotRecommendedReasons.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one reason",
        path: ["mgrNotRecommendedReasons"],
      });
    }
  });

export type ManagerFormValues = z.infer<typeof managerFormSchema>;
