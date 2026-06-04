"use client";

import { pdf } from "@react-pdf/renderer";
import { PDFReport } from "@/components/export/PDFReport";
import type { AppraisalSubmission } from "@prisma/client";
import type { SerializedIncrementSlab } from "@/lib/utils";

export async function downloadPDF(submission: AppraisalSubmission) {
  let slabs: SerializedIncrementSlab[] = [];
  try {
    const res = await fetch("/api/slabs");
    if (res.ok) slabs = await res.json();
  } catch {
    /* use empty slabs */
  }

  const blob = await pdf(<PDFReport submission={submission} slabs={slabs} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Blanco_Appraisal_${submission.employeeCode}_${submission.employeeName.replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
