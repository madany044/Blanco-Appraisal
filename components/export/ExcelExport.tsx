"use client";

import * as XLSX from "xlsx";
import type { AppraisalSubmission } from "@prisma/client";
import { decimalToNumber } from "@/lib/utils";

function submissionToRow(s: AppraisalSubmission): Record<string, string | number> {
  return {
    id: s.id,
    financial_year: s.financialYear,
    category: s.category,
    stage: s.stage,
    employee_name: s.employeeName,
    employee_code: s.employeeCode,
    manager_id: s.managerId,
    basis_of_appraisal: s.basisOfAppraisal ?? "",
    support_to_company: s.supportToCompany ?? "",
    expectations_yes_no: s.expectationsYesNo ?? "",
    rate_teamwork: s.rateTeamwork ?? "",
    rate_quality_of_work: s.rateQualityOfWork ?? "",
    overall_rating: s.overallRating ?? "",
    hr_code_of_conduct: s.hrCodeOfConduct ?? "",
    mgr_recommendation: s.mgrRecommendation ?? "",
    salary_ctc_present: decimalToNumber(s.salaryCtcPresent),
    salary_ctc_proposed: decimalToNumber(s.salaryCtcProposed),
    mgmt_increment_percentage: decimalToNumber(s.mgmtIncrementPercentage),
    mgmt_final_remarks: s.mgmtFinalRemarks ?? "",
    submitted_at: s.submittedAt?.toISOString() ?? "",
    completed_at: s.completedAt?.toISOString() ?? "",
  };
}

export function exportSubmissionExcel(submission: AppraisalSubmission) {
  const ws = XLSX.utils.json_to_sheet([submissionToRow(submission)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Submission");
  XLSX.writeFile(wb, `Blanco_Appraisal_${submission.employeeCode}.xlsx`);
}

export function exportSubmissionsExcel(submissions: AppraisalSubmission[]) {
  const rows = submissions.map(submissionToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "All Submissions");
  XLSX.writeFile(wb, `Blanco_Appraisals_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
}
