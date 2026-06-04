import type { AppraisalSubmission, Manager } from "@prisma/client";
import { EmployeeSubmissionView } from "@/components/forms/SubmissionDetailView";

interface EmployeeFormReadOnlyProps {
  submission: AppraisalSubmission & { manager?: Manager };
}

/** @deprecated Use SubmissionDetailView / EmployeeSubmissionView */
export function EmployeeFormReadOnly({ submission }: EmployeeFormReadOnlyProps) {
  return <EmployeeSubmissionView submission={submission} />;
}
