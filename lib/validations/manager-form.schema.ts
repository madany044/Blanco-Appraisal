import { z } from "zod";

export const managerFormSchema = z
  .object({
    mgrRecommendation: z.enum([
      "STRONGLY_RECOMMEND",
      "CONDITIONALLY_RECOMMEND",
      "NOT_RECOMMENDED",
    ]),
    mgrStrongReasons: z.array(z.string()).default([]),
    mgrConditionalReasons: z.array(z.string()).default([]),
    mgrNotRecommendedReasons: z.array(z.string()).default([]),
    mgrRemarks: z.string().optional(),
    mgrSignatureName: z.string().min(1, "Signature required"),
    mgrSignatureDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.mgrRecommendation === "STRONGLY_RECOMMEND" &&
      data.mgrStrongReasons.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one reason",
        path: ["mgrStrongReasons"],
      });
    }
    if (
      data.mgrRecommendation === "CONDITIONALLY_RECOMMEND" &&
      data.mgrConditionalReasons.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one reason",
        path: ["mgrConditionalReasons"],
      });
    }
    if (
      data.mgrRecommendation === "NOT_RECOMMENDED" &&
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
