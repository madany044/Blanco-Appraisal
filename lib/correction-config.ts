// Build-time flag shared by browser and server. Off means no new-table queries.
export const correctionsEnabled = process.env.NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED === "true";
export const APPRAISAL_YEAR = "2026-27";

export type CorrectionStatus = "NONE" | "RETURNED_TO_HR" | "AWAITING_EMPLOYEE";
export interface CorrectionSummary {
  status: string;
  revision: number;
  version: number;
  reason: string | null;
  instructions: string | null;
}

export const correctionLabel = (status?: string) =>
  status === "RETURNED_TO_HR" ? "Returned to HR — correction required"
    : status === "AWAITING_EMPLOYEE" ? "Awaiting employee correction" : null;

// Set only by the isolated local test launcher; never active in a production build.
export const localCorrectionTest = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_APPRAISAL_LOCAL_TEST === "true";
