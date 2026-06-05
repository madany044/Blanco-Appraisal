import { z } from "zod";

const rating = z.coerce.number().min(0).max(10);

export const hrFormSchema = z.object({
  currentSalary: z.coerce.number().min(0, "Please enter a valid salary"),
  hrCodeOfConduct: rating,
  hrDressCode: rating,
  hrProfessionalism: rating,
  hrLeaveManagement: rating,
  hrTimingManagement: rating,
  hrBacklogNotes: z.string().optional(),
  hrAdminSignatureName: z.string().min(1, "Signature required"),
  hrAdminSignatureDate: z.string().optional(),
});

export type HRFormValues = z.infer<typeof hrFormSchema>;
