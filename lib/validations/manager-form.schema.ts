import { z } from "zod";

const recommendationLevel = z.enum([
  "STRONGLY_RECOMMEND",
  "CONDITIONALLY_RECOMMEND",
  "NOT_RECOMMENDED",
]);

export const managerFormSchema = z
  .object({
    mgrRecommendation: z.array(recommendationLevel).default([]),
    mgrStrongReasons: z.array(z.string()).default([]),
    mgrConditionalReasons: z.array(z.string()).default([]),
    mgrNotRecommendedReasons: z.array(z.string()).default([]),
    mgrSuggestedIncrementPercentage: z.coerce.number().min(0).max(100).optional(),
    mgrFinalApprovedIncrementPercentage: z.coerce.number().min(0).max(100).optional(),
    incrementAmount: z.coerce.number().min(0).optional(),
    mgrRemarks: z.string().optional(),
    mgrSignatureName: z.string().min(1, "Signature required"),
    mgrSignatureDate: z.string().optional(),
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
