import { z } from "zod";

export const managementFormSchema = z.object({
  mgmtIncrementPercentage: z.coerce.number().min(0).max(100),
  mgmtApproverName: z.string().min(1, "Approver signature required"),
  mgmtFinalRemarks: z.string().min(1, "Feedback / remarks required"),
  mgmtFeedbackToEmployee: z.string().optional(),
  mgmtInternalNotes: z.string().optional(),
});

export type ManagementFormValues = z.infer<typeof managementFormSchema>;

export const INCREMENT_OPTIONS = Array.from({ length: 36 }, (_, i) => i);
