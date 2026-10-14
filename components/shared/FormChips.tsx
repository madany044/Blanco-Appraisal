import { Badge } from "@/components/ui/badge";
import type { AppraisalSubmission } from "@prisma/client";

interface FormChipsProps {
  submission: AppraisalSubmission & { correction?: { revision: number } | null };
}

export function FormChips({ submission }: FormChipsProps) {
  const hasEmployee = submission.stage >= 0 && submission.basisOfAppraisal;
  const revised = (submission.correction?.revision ?? 0) > 0;
  const hasHR = revised ? submission.stage >= 1 : submission.hrCodeOfConduct != null;
  const hasManager = revised ? submission.stage >= 2 : (submission.mgrRecommendation?.length ?? 0) > 0;
  const hasManagement = submission.mgmtIncrementPercentage != null;

  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant={hasEmployee ? "default" : "outline"}>Employee</Badge>
      <Badge variant={hasHR ? "success" : "outline"}>HR</Badge>
      <Badge variant={hasManager ? "warning" : "outline"}>Manager</Badge>
      <Badge variant={hasManagement ? "purple" : "outline"}>Management</Badge>
    </div>
  );
}
