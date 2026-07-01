import { z } from "zod";

export const managementFormSchema = z.object({
  mgmtIncrementPercentage: z.coerce.number().min(0).max(100),
  mgmtStatementPercentage: z.coerce.number().min(0).max(100).optional(),
  mgmtApproverName: z.string().min(1, "Approver signature required"),
  mgmtFinalRemarks: z.string().optional(),
  mgmtFeedbackToEmployee: z.string().optional(),
  mgmtInternalNotes: z.string().optional(),
});

export type ManagementFormValues = z.infer<typeof managementFormSchema>;

export const INCREMENT_OPTIONS = Array.from({ length: 36 }, (_, i) => i);
