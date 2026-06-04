import { Badge } from "@/components/ui/badge";
import type { AppraisalSubmission } from "@prisma/client";

interface FormChipsProps {
  submission: AppraisalSubmission;
}

export function FormChips({ submission }: FormChipsProps) {
  const hasEmployee = submission.stage >= 0 && submission.basisOfAppraisal;
  const hasHR = submission.hrCodeOfConduct != null;
  const hasManager = (submission.mgrRecommendation?.length ?? 0) > 0;
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
