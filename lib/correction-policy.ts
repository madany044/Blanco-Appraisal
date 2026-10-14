import type { CorrectionSummary } from "./correction-config";

export class WorkflowConflict extends Error {}

export function assertVersion(correction: CorrectionSummary | null, expected: unknown) {
  if (!Number.isInteger(expected) || expected !== (correction?.version ?? 0)) {
    throw new WorkflowConflict("This appraisal changed after you opened it. Refresh the page before continuing.");
  }
}

export function assertReviewAllowed(stage: number, correction: CorrectionSummary | null, requiredStage: number) {
  if (stage !== requiredStage || (correction && correction.status !== "NONE")) {
    throw new WorkflowConflict("This review is not open. Complete the correction steps first, then refresh the page.");
  }
}
