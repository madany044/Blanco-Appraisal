"use client";

import { pdf } from "@react-pdf/renderer";
import { PDFReport } from "@/components/export/PDFReport";
import type { AppraisalSubmission } from "@prisma/client";
import type { SerializedIncrementSlab } from "@/lib/utils";
import { COMPANY_LOGO_PATH } from "@/lib/brand";

async function resolveLogoSrc(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  const url = `${window.location.origin}${COMPANY_LOGO_PATH}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export async function downloadPDF(submission: AppraisalSubmission) {
  let slabs: SerializedIncrementSlab[] = [];
  try {
    const res = await fetch("/api/slabs");
    if (res.ok) slabs = await res.json();
  } catch {
    /* use empty slabs */
  }

  const logoSrc = await resolveLogoSrc();
  const blob = await pdf(
    <PDFReport submission={submission} slabs={slabs} logoSrc={logoSrc} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Blanco_Appraisal_${submission.employeeCode}_${submission.employeeName.replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
