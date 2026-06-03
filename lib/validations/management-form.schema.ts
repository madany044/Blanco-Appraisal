import { z } from "zod";

const money = z.coerce.number().min(0);

export const managementFormSchema = z.object({
  salaryBasicPresent: money,
  salaryDaPresent: money,
  salaryHraPresent: money,
  salaryCityAllowancePresent: money,
  salaryConveyancePresent: money,
  salaryMedicalPresent: money,
  salaryEducationPresent: money,
  salaryLtaPresent: money,
  salarySpecialPresent: money,
  salaryPfDeduction: money,
  salaryEsicDeduction: money,
  salaryPtDeduction: money,
  salaryEmployerPfPresent: money,
  salaryBonusPresent: money,
  salaryEmployerEsicPresent: money,
  salaryMedicalInsurancePresent: money,
  salaryCityAllowanceProposed: money,
  salarySpecialProposed: money,
  mgmtIncrementPercentage: z.coerce.number().min(0),
  mgmtEffectiveDate: z.string().min(1, "Effective date required"),
  mgmtApproverName: z.string().min(1, "Approver signature required"),
  mgmtFinalRemarks: z.string().min(1, "Final remarks required"),
  mgmtFeedbackToEmployee: z.string().optional(),
  mgmtInternalNotes: z.string().optional(),
});

export type ManagementFormValues = z.infer<typeof managementFormSchema>;
