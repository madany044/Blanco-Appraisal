"use client";

import { pdf } from "@react-pdf/renderer";
import { PDFReport } from "@/components/export/PDFReport";
import type { AppraisalSubmission } from "@prisma/client";

export async function downloadPDF(submission: AppraisalSubmission) {
  const blob = await pdf(<PDFReport submission={submission} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Blanco_Appraisal_${submission.employeeCode}_${submission.employeeName.replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
