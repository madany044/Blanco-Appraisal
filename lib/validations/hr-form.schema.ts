import { z } from "zod";

const rating = z.coerce.number().min(0).max(10);

const incrementEntrySchema = z.object({
  percentage: z.coerce.number().min(0).max(100).optional(),
  salaryRise: z.coerce.number().min(0).optional(),
});

export const hrFormSchema = z.object({
  currentSalary: z.coerce.number().min(0, "Please enter a valid salary"),
  previousIncrementPercentage: z.coerce.number().min(0).max(100).optional(),
  additionalIncrements: z.array(incrementEntrySchema).optional().default([]),
  effective_date: z.string().optional(),
  hrCodeOfConduct: rating,
  hrDressCode: rating,
  hrProfessionalism: rating,
  hrLeaveManagement: rating,
  hrLeaveManagementNotes: z.string().max(200).optional(),
  hrTimingManagement: rating,
  hrTimingManagementNotes: z.string().max(200).optional(),
  hrBacklogNotes: z.string().optional(),
  hrAdminSignatureName: z.string().min(1, "Signature required"),
  hrAdminSignatureDate: z.string().optional(),
});

export type HRFormValues = z.infer<typeof hrFormSchema>;
