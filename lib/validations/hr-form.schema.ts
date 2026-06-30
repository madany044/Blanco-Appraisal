import { z } from "zod";

const rating = z.coerce.number().min(0).max(10);

export const hrFormSchema = z.object({
  currentSalary: z.coerce.number().min(0, "Please enter a valid salary"),
  previousIncrementPercentage: z.coerce.number().min(0).max(100).optional(),
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
